import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ─── Définition des zones de l'application ────────────────────────────────────

/** Routes qui nécessitent d'être connecté (rôle quelconque) */
const PROTECTED_ROUTES    = ['/onboarding'];
/** Routes réservées au rôle CEO */
const DASHBOARD_ROUTES    = ['/dashboard'];
/** Routes réservées au rôle Admin */
const ADMIN_ROUTES        = ['/admin'];
/** Routes accessibles uniquement si NON connecté */
const AUTH_ROUTES         = ['/auth/login', '/auth/register'];

// ─── Type du payload de notre JWT backend ─────────────────────────────────────

interface KollectJwtPayload {
  isAdmin: boolean;
  isCEO: boolean;
  isClient: boolean;
  has_seen_creator_prompt: boolean;
  exp?: number;
}

// ─── Décodage JWT (Edge Runtime natif — pas de librairie externe) ─────────────

function decodeKollectJwt(token: string): KollectJwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(json) as KollectJwtPayload;
    
    // Vérifier l'expiration si présente
    if (payload.exp && (payload.exp * 1000) < Date.now()) {
      return null; // Token expiré
    }
    
    return payload;
  } catch {
    return null;
  }
}

// ─── Résolution de la destination post-login ─────────────────────────────────

function resolveHome(payload: KollectJwtPayload): string {
  if (payload.isAdmin)                      return '/admin';
  if (!payload.has_seen_creator_prompt)     return '/onboarding';
  if (payload.isCEO)                        return '/dashboard';
  return '/';
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  // 1. Rafraîchissement du cookie de session Supabase (obligatoire avec @supabase/ssr)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  // 2. Notre JWT backend = la source de vérité absolue
  const kollectJwt = request.cookies.get('kollect_jwt')?.value;
  const payload    = kollectJwt ? decodeKollectJwt(kollectJwt) : null;
  
  // Le JWT backend est la source de vérité pour les routes protégées.
  // La session Supabase reste utile pour le refresh / la continuité auth,
  // mais on ne doit pas bloquer l'accès si seul le cookie backend est présent.
  const hasSupabaseSession = !!supabaseUser;
  const hasValidPayload = !!payload;
  const canAccessPrivateRoutes = hasValidPayload;
  const isFullyConnected = hasSupabaseSession && hasValidPayload;

  // ── Flags de route ──
  const isProtected     = PROTECTED_ROUTES.some((r)  => pathname.startsWith(r));
  const isDashboardRoute= DASHBOARD_ROUTES.some((r)  => pathname.startsWith(r));
  const isAdminRoute    = ADMIN_ROUTES.some((r)       => pathname.startsWith(r));
  const isAuthRoute     = AUTH_ROUTES.some((r)        => pathname.startsWith(r));

  // ── Règle A : Zone privée sans session complète → Login ───────────
  if (!canAccessPrivateRoutes && (isProtected || isDashboardRoute || isAdminRoute)) {
    // Si on a un bout de session mais pas l'autre, on nettoie en redirigeant vers login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Règle B : JWT valide → interdire Login/Register ───────────────────────
  if (canAccessPrivateRoutes && isAuthRoute) {
    const destination = resolveHome(payload!); // payload est non-null vu canAccessPrivateRoutes
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // ── Règles basées sur les rôles ─────────────
  if (hasValidPayload) {
    const { isAdmin, isCEO, has_seen_creator_prompt } = payload;

    // Règle C : /admin → réservé aux Admins
    if (isAdminRoute && !isAdmin) {
      const destination = isCEO ? '/dashboard' : '/';
      return NextResponse.redirect(new URL(destination, request.url));
    }

    // Les Admins passent librement partout
    if (isAdmin) return response;

    // Règle D : Onboarding non terminé → bloquer dashboard
    if (!has_seen_creator_prompt && isDashboardRoute) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // Règle E : /dashboard → réservé aux CEOs
    if (isDashboardRoute && !isCEO) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|api|trpc|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
