import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? null;

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

      try {
        // Sync avec le backend pour obtenir les rôles et poser le cookie JWT
        const syncRes = await fetch(`${apiUrl}/auth/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supabaseAccessToken: data.session.access_token }),
        });

        if (syncRes.ok) {
          const syncData = await syncRes.json() as {
            user: { isCEO: boolean; isAdmin: boolean; has_seen_creator_prompt: boolean };
            access_token: string;
          };

          const { user } = syncData;

          // Redirection directe selon le rôle — aucun passage par la landing
          let destination: string;
          const isSafeNext = !!next && next.startsWith('/');

          if (user.isAdmin) {
            destination = isSafeNext && !next.startsWith('/dashboard') && !next.startsWith('/onboarding')
              ? next
              : '/admin';
          } else if (isSafeNext && next) {
            destination = next;
          } else if (user.isCEO) {
            destination = '/dashboard';
          } else if (!user.has_seen_creator_prompt) {
            destination = '/onboarding';
          } else {
            destination = '/';
          }

          // Pose le cookie JWT backend sur la réponse Next.js
          const redirectResponse = NextResponse.redirect(`${origin}${destination}`);
          const setCookieHeader = syncRes.headers.get('set-cookie');
          if (setCookieHeader) {
            redirectResponse.headers.set('set-cookie', setCookieHeader);
          }

          return redirectResponse;
        }
      } catch {
        // Si le sync backend échoue, on redirige quand même (AuthProvider retentera)
      }

      // Fallback : sync échoué mais session Supabase ok → homepage, AuthProvider prend le relais
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(
    `${origin}/auth/login?error=Une+erreur+est+survenue+lors+de+la+connexion+Google.`,
  );
}
