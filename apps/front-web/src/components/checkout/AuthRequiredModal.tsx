'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FONT_FAMILY_INTER } from '@/styles/typography';

type Props = {
  onClose: () => void;
  redirectAfter?: string;
};

export function AuthRequiredModal({ onClose, redirectAfter }: Props) {
  // Fermer sur Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const loginHref = redirectAfter
    ? `/auth/login?redirect=${encodeURIComponent(redirectAfter)}`
    : '/auth/login';

  return (
    <>
      <style>{`
        @keyframes arm-backdrop { from { opacity: 0; } to { opacity: 1; } }
        @keyframes arm-pop {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        .arm-login-btn:hover  { background: #CC2920 !important; }
        .arm-signup-btn:hover { background: rgba(0,0,0,0.06) !important; }
        .arm-close-btn:hover  { background: rgba(0,0,0,0.06) !important; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 3000,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
          animation: 'arm-backdrop 0.18s ease',
        }}
      >
        {/* Modal */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: '36px 32px 28px',
            maxWidth: 380,
            width: '100%',
            boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.05)',
            animation: 'arm-pop 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            position: 'relative',
            fontFamily: FONT_FAMILY_INTER,
          }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="arm-close-btn"
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 32, height: 32, borderRadius: 10,
              border: 'none', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(0,0,0,0.4)',
              transition: 'background 0.15s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Icon */}
          <div style={{
            width: 56, height: 56,
            borderRadius: 18,
            background: 'linear-gradient(135deg, #0a0a0a 0%, #2a2a2a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>

          {/* Text */}
          <h2 style={{
            margin: '0 0 8px',
            fontSize: 20,
            fontWeight: 900,
            color: '#0a0a0a',
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
          }}>
            Connexion requise
          </h2>
          <p style={{
            margin: '0 0 28px',
            fontSize: 14,
            color: 'rgba(0,0,0,0.5)',
            lineHeight: 1.65,
          }}>
            Crée un compte ou connecte-toi pour passer ta commande. C&apos;est rapide et gratuit.
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link
              href={loginHref}
              className="arm-login-btn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px',
                borderRadius: 14,
                background: '#E63329',
                color: '#fff',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: '-0.1px',
                transition: 'background 0.15s',
              }}
            >
              Se connecter
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>

            <Link
              href={`/auth/register${redirectAfter ? `?redirect=${encodeURIComponent(redirectAfter)}` : ''}`}
              className="arm-signup-btn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '14px',
                borderRadius: 14,
                background: 'transparent',
                border: '1.5px solid rgba(0,0,0,0.1)',
                color: '#0a0a0a',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 700,
                transition: 'background 0.15s',
              }}
            >
              Créer un compte
            </Link>
          </div>

          <p style={{
            marginTop: 20, marginBottom: 0,
            fontSize: 11,
            color: 'rgba(0,0,0,0.3)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}>
            Ton panier sera conservé après la connexion.
          </p>
        </div>
      </div>
    </>
  );
}
