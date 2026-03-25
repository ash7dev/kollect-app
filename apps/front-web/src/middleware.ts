import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes qui nécessitent d'être authentifié
const PROTECTED_ROUTES = ['/onboarding', '/dashboard'];

// Routes accessibles uniquement si non authentifié
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

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

  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Non authentifié → accès à une route protégée → login
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Authentifié → accès aux pages auth → redirige vers /
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // NOTE : la vérification de has_seen_creator_prompt ne peut pas se faire ici
  // car elle nécessite un appel au backend (pas dans le JWT Supabase).
  // Elle est gérée côté client dans le hook useOnboardingGuard (voir ci-dessous).

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
