/* eslint-disable react/no-unescaped-entities */
'use client';

import { Suspense, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/providers/AuthProvider';

function resolvePostLoginDestination(user: {
  isCEO: boolean;
  isAdmin: boolean;
  has_seen_creator_prompt: boolean;
}) {
  if (user.isCEO || user.isAdmin) return '/dashboard';
  if (!user.has_seen_creator_prompt) return '/onboarding';
  return '/';
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const errorParam = searchParams.get('error');

  const { signInWithEmail, signInWithGoogle, user, isLoading, isInitialized } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = submitting || isLoading;

  const destination = useMemo(() => {
    if (nextParam) return nextParam;
    if (user) return resolvePostLoginDestination(user);
    return null;
  }, [nextParam, user]);

  useEffect(() => {
    // Si déjà connecté (ex: refresh), on ne doit pas rester sur /auth/login.
    if (!isInitialized) return;
    if (!user) return;
    if (!destination) return;
    router.replace(destination);
  }, [destination, isInitialized, router, user]);

  useEffect(() => {
    if (errorParam) setError(errorParam.split('+').join(' '));
  }, [errorParam]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmail({ email, password });
      // La redirection se fait via l'effet dès que le user backend est synché.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion.');
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      // OAuth → redirection externe; pas besoin de remettre submitting à false ici.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion Google.');
      setSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#fff', fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" }} className="auth-root">
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1024px) {
          .auth-root { grid-template-columns: 1fr !important; }
          .auth-left { display: none !important; }
          .auth-mobile-logo { display: flex !important; }
        }
        .auth-input {
          width: 100%;
          padding: 12px 16px;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          color: #111;
          font-size: 15px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .auth-input::placeholder { color: #b0b0b0; }
        .auth-input:focus {
          border-color: #FF3B30;
          box-shadow: 0 0 0 3px rgba(255,59,48,0.08);
        }
        .auth-btn-primary {
          width: 100%;
          padding: 13px;
          background: #FF3B30;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s, transform 0.1s;
          font-family: inherit;
          box-shadow: 0 4px 14px rgba(255,59,48,0.3);
        }
        .auth-btn-primary:hover { background: #e02920; }
        .auth-btn-primary:active { transform: scale(0.99); }
        .auth-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .auth-btn-google {
          width: 100%;
          padding: 12px;
          background: #fff;
          color: #374151;
          font-size: 14px;
          font-weight: 500;
          border-radius: 10px;
          border: 1.5px solid #e5e7eb;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.15s, border-color 0.15s;
          font-family: inherit;
        }
        .auth-btn-google:hover { background: #f9fafb; border-color: #d1d5db; }
        .auth-btn-google:disabled { opacity: 0.7; cursor: not-allowed; }
        .auth-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }
        .auth-divider span {
          color: #9ca3af;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }
        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          background: #fff5f4;
          border: 1px solid #ffd5d2;
        }
        .feature-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .feature-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
      `}} />

      {/* ── LEFT PANEL ── */}
      <div className="auth-left" style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        background: '#F9F9F9',
        overflow: 'hidden',
        borderRight: '1px solid #f0f0f0',
      }}>
        {/* Subtle top-right decoration */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,59,48,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo />
        </div>

        {/* Main pitch */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="badge-pill" style={{ marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF3B30', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#FF3B30' }}>Bienvenue sur Kollect</span>
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 2.6vw, 42px)', fontWeight: 800, color: '#111', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
            Content de vous<br />
            <span style={{ color: '#FF3B30' }}>revoir.</span>
          </h1>

          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, maxWidth: 340, marginBottom: 36 }}>
            Des nouveaux drops vous attendent. Reconnectez-vous et ne ratez aucune pièce exclusive.
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 0 }}>
            {[
              { value: '2 400+', label: 'Créateurs' },
              { value: '18K+', label: 'Membres' },
              { value: '340+', label: 'Drops lancés' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 14, padding: '18px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', marginBottom: 2 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div style={{ position: 'relative', zIndex: 1, padding: '20px 22px', background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FF3B30"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ))}
          </div>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.65, marginBottom: 14 }}>
            &ldquo;J&apos;ai vendu ma première collection en 48h. Kollect m&apos;a donné une vraie vitrine professionnelle.&rdquo;
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #FF3B30, #FF6B6B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>A</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Aminata K.</p>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>Designer, Abidjan</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 40px',
        background: '#fff',
        position: 'relative',
      }}>
        <div className="auth-mobile-logo" style={{ display: 'none', position: 'absolute', top: 32, left: 32 }}>
          <Logo />
        </div>

        <div style={{ width: '100%', maxWidth: 360 }}>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', marginBottom: 6 }}>
              Bon retour 👋
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              Pas encore de compte ?{' '}
              <Link href="/auth/register" style={{ color: '#FF3B30', fontWeight: 600, textDecoration: 'none' }}>
                S&apos;inscrire gratuitement
              </Link>
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#fff5f4',
              border: '1.5px solid #ffd5d2',
              borderRadius: 10,
              marginBottom: 18,
              fontSize: 13,
              color: '#c0392b',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label className="auth-label" htmlFor="email">Adresse email</label>
              <input
                type="email"
                id="email"
                className="auth-input"
                placeholder="nom@exemple.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="auth-label" htmlFor="password" style={{ marginBottom: 0 }}>Mot de passe</label>
                <Link href="#" style={{ fontSize: 13, color: '#FF3B30', fontWeight: 500, textDecoration: 'none' }}>
                  Oublié ?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                className="auth-input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
              />
            </div>

            <button type="submit" className="auth-btn-primary" style={{ marginTop: 4 }} disabled={busy}>
              {submitting ? <span className="spinner" /> : null}
              {submitting ? 'Connexion…' : 'Se connecter'}
            </button>

            <div className="auth-divider"><span>ou</span></div>

            <button type="button" className="auth-btn-google" onClick={handleGoogle} disabled={busy}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M23.04 12.2614C23.04 11.4459 22.9668 10.6627 22.8309 9.91138H12V14.3577H18.1891C17.9223 15.7945 17.1118 17.0223 15.8945 17.8382V20.7141H19.6105C21.785 18.7118 23.04 15.7573 23.04 12.2614Z" fill="#4285F4"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M12 23.4998C15.105 23.4998 17.7082 22.4707 19.6105 20.7139L15.8945 17.838C14.865 18.5273 13.545 18.9355 12 18.9355C9.00455 18.9355 6.46909 16.9118 5.56545 14.185H1.72318V17.1643C3.61545 20.9302 7.50273 23.4998 12 23.4998Z" fill="#34A853"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M5.565 14.1852C5.33455 13.4961 5.20455 12.76 5.20455 12.0002C5.20455 11.2404 5.33455 10.5043 5.565 9.81523V6.83594H1.72273C0.943636 8.38821 0.5 10.1457 0.5 12.0002C0.5 13.8548 0.943636 15.6123 1.72273 17.1645L5.565 14.1852Z" fill="#FBBC05"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M12 5.06455C13.6936 5.06455 15.215 5.64727 16.4114 6.79091L19.6936 3.50864C17.7027 1.65409 15.0995 0.5 12 0.5C7.50273 0.5 3.61545 3.06955 1.72318 6.83591L5.56545 9.8152C6.46909 7.08864 9.00455 5.06455 12 5.06455Z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </button>

          </form>

          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 28, lineHeight: 1.6, textAlign: 'center' }}>
            En continuant vous acceptez nos{' '}
            <Link href="#" style={{ color: '#6b7280', textDecoration: 'underline', textUnderlineOffset: 2 }}>CGU</Link>
            {' '}et notre{' '}
            <Link href="#" style={{ color: '#6b7280', textDecoration: 'underline', textUnderlineOffset: 2 }}>Politique de confidentialité</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
