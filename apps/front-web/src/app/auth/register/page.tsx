'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/providers/AuthProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle, isLoading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail({ email, password, firstName, lastName });
      // Après inscription, le AuthProvider sync avec le backend via onAuthStateChange.
      // L'utilisateur n'a pas encore choisi son rôle → le middleware + useOnboardingGuard
      // le redirigera vers /onboarding automatiquement.
      router.replace('/onboarding');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'inscription.";
      // Si c'est le message de confirmation d'email (levé intentionnellement par signUpWithEmail)
      if (errorMessage.includes('Un email de confirmation vous a été envoyé')) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion Google.');
    }
  };

  const busy = loading || authLoading;

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
        .auth-input:disabled { opacity: 0.6; cursor: not-allowed; }
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
          transition: background 0.15s, transform 0.1s, opacity 0.15s;
          font-family: inherit;
          box-shadow: 0 4px 14px rgba(255,59,48,0.3);
        }
        .auth-btn-primary:hover:not(:disabled) { background: #e02920; }
        .auth-btn-primary:active:not(:disabled) { transform: scale(0.99); }
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
          transition: background 0.15s, border-color 0.15s, opacity 0.15s;
          font-family: inherit;
        }
        .auth-btn-google:hover:not(:disabled) { background: #f9fafb; border-color: #d1d5db; }
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
        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          background: #fff5f4;
          border: 1px solid #ffd5d2;
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
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,59,48,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="badge-pill" style={{ marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF3B30', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#FF3B30' }}>Accès anticipé · Gratuit</span>
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 2.6vw, 42px)', fontWeight: 800, color: '#111', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
            Lancez votre marque.<br />
            <span style={{ color: '#FF3B30' }}>Trouvez votre audience.</span>
          </h1>

          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, maxWidth: 340, marginBottom: 36 }}>
            Kollect est la première plateforme dédiée aux créateurs streetwear d&apos;Afrique. Drops, boutique, communauté — tout en un.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                ),
                bg: '#fff5f4',
                title: 'Drops exclusifs en 2 minutes',
                desc: 'Créez une page de drop, limitez les stocks, encaissez en avance.',
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                ),
                bg: '#f5f3ff',
                title: 'Communauté de 18 000+ membres',
                desc: 'Vos acheteurs sont déjà là. Il ne reste qu&apos;à publier.',
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                ),
                bg: '#f0fdf4',
                title: 'Créateurs vérifiés, paiements sécurisés',
                desc: '100% des transactions sont protégées. Zéro risque.',
              },
            ].map((f, i) => (
              <div key={i} className="feature-row">
                <div className="feature-icon" style={{ background: f.bg }}>
                  {f.icon}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 2 }}>{f.title}</p>
                  <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: f.desc }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex' }}>
            {['#FF3B30', '#7c3aed', '#059669', '#f59e0b'].map((c, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid #F9F9F9', marginLeft: i > 0 ? -8 : 0 }} />
            ))}
          </div>
          <p style={{ fontSize: 13, color: '#6b7280' }}>
            <strong style={{ color: '#111' }}>2 400+ créateurs</strong> nous font déjà confiance
          </p>
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
        overflowY: 'auto',
      }}>
        <div className="auth-mobile-logo" style={{ display: 'none', position: 'absolute', top: 32, left: 32 }}>
          <Logo />
        </div>

        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', marginBottom: 6 }}>
              Créer un compte
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              Déjà inscrit ?{' '}
              <Link href="/auth/login" style={{ color: '#FF3B30', fontWeight: 600, textDecoration: 'none' }}>
                Se connecter
              </Link>
            </p>
          </div>

          {/* Bannière d'erreur */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#fff5f4',
              border: '1.5px solid #ffd5d2',
              borderRadius: 10,
              marginBottom: 20,
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="auth-label" htmlFor="firstName">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  className="auth-input"
                  placeholder="Moussa"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={busy}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="auth-label" htmlFor="lastName">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  className="auth-input"
                  placeholder="Diop"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={busy}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label className="auth-label" htmlFor="email">Adresse email</label>
              <input
                type="email"
                id="email"
                className="auth-input"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="auth-label" htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                className="auth-input"
                placeholder="Minimum 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '4px 0' }}>
              <input type="checkbox" id="terms" required style={{ width: 16, height: 16, marginTop: 2, accentColor: '#FF3B30', cursor: 'pointer', flexShrink: 0 }} />
              <label htmlFor="terms" style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, cursor: 'pointer' }}>
                J&apos;accepte les{' '}
                <Link href="#" style={{ color: '#111', textDecoration: 'underline', textUnderlineOffset: 2 }}>CGU</Link>
                {' '}et la{' '}
                <Link href="#" style={{ color: '#111', textDecoration: 'underline', textUnderlineOffset: 2 }}>Politique de confidentialité</Link>
              </label>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={busy} style={{ marginTop: 4 }}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Création du compte…' : 'Créer mon compte gratuitement'}
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

          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 24, lineHeight: 1.6, textAlign: 'center' }}>
            Kollect — La marketplace streetwear d&apos;Afrique de l&apos;Ouest 🌍
          </p>
        </div>
      </div>
    </main>
  );
}
