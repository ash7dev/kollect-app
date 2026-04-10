'use client';

import { useState, type FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/providers/AuthProvider';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOtp, resendOtp, isLoading: authLoading, user } = useAuth();
  
  const emailParam = searchParams.get('email');
  
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Rediriger si on est déjà connecté
  useEffect(() => {
    if (user) {
      router.replace('/onboarding');
    }
  }, [user, router]);

  // Gérer le compte à rebours pour le renvoi
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (token.length !== 6) {
      setError('Le code doit contenir 6 chiffres.');
      return;
    }
    if (!emailParam) {
      setError('Erreur: Aucun email associé à la requête.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({ email: emailParam, token });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code invalide ou expiré.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || !emailParam) return;
    
    setError(null);
    setSuccess(null);
    try {
      await resendOtp(emailParam);
      setSuccess("Un nouveau code vous a été envoyé.");
      setResendTimer(60); // Attendre 60 secondes avant de re-pouvoir cliquer
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du renvoi.");
    }
  };

  const busy = loading || authLoading;

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', marginBottom: 8 }}>
          Vérifiez votre Email
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
          Nous avons envoyé un code à 6 chiffres à<br/>
          <strong style={{ color: '#111' }}>{emailParam || 'votre adresse email'}</strong>.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', background: '#fff5f4', border: '1.5px solid #ffd5d2',
          borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#c0392b',
          display: 'flex', alignItems: 'flex-start', gap: 8,
          animation: 'fadeIn 0.3s ease'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px 16px', background: '#f0fdf4', border: '1.5px solid #bcf0da',
          borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#166534',
          display: 'flex', alignItems: 'flex-start', gap: 8,
          animation: 'fadeIn 0.3s ease'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }} htmlFor="otp">
            Code de sécurité
          </label>
          <input
            type="text"
            id="otp"
            style={{
              width: '100%', padding: '14px', background: '#fff', border: '1.5px solid #e5e7eb',
              borderRadius: 10, color: '#111', fontSize: 24, outline: 'none',
              textAlign: 'center', fontWeight: 600, letterSpacing: '8px',
              fontFamily: 'inherit'
            }}
            placeholder="000000"
            maxLength={6}
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))} // Que des chiffres
            disabled={busy}
            required
            autoComplete="one-time-code"
          />
        </div>

        <button 
          type="submit" 
          disabled={busy || token.length < 6}
          style={{
            width: '100%', padding: '14px', background: '#FF3B30', color: '#fff',
            fontSize: 15, fontWeight: 600, borderRadius: 10, border: 'none',
            cursor: busy || token.length < 6 ? 'not-allowed' : 'pointer',
            opacity: busy || token.length < 6 ? 0.7 : 1,
            transition: 'background 0.15s, opacity 0.15s',
            marginTop: 8
          }}
        >
          {loading ? 'Vérification...' : 'Confirmer et continuer'}
        </button>
      </form>

      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 24, textAlign: 'center' }}>
        Vous n&apos;avez rien reçu ?{' '}
        <span 
          onClick={handleResend}
          style={{ 
            color: resendTimer > 0 ? '#9ca3af' : '#FF3B30', 
            fontWeight: 600, 
            cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
            textDecoration: resendTimer > 0 ? 'none' : 'underline'
          }}
        >
          {resendTimer > 0 ? `Renvoyer (${resendTimer}s)` : 'Renvoyer le code'}
        </span>
      </p>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// Composant Page en mode FullScreen simple
export default function VerifyEmailPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f9f9f9', fontFamily: "var(--font-inter), sans-serif" }}>
      <header style={{ padding: '24px 32px' }}>
        <Logo />
      </header>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px 48px' }}>
        <Suspense fallback={<div style={{ textAlign: 'center' }}>Chargement...</div>}>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </main>
  );
}
