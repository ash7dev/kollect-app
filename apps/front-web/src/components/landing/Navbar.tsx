'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

const NAV_LINKS = [
  { label: 'Marques', href: '/brands' },
  { label: 'Collections', href: '/collections' },
  { label: 'Drops', href: '/drops' },
  { label: 'Explorer', href: '/explorer' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const postLoginHref = useMemo(() => {
    if (!user) return null;
    if (user.isCEO || user.isAdmin) return '/dashboard';
    if (!user.has_seen_creator_prompt) return '/onboarding';
    return '/';
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileOpen]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <nav
        aria-label="Navigation principale"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: scrolled ? 'rgba(255,255,255,0.88)' : 'transparent',
          backgroundImage: scrolled ? 'none' : 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)',
          backdropFilter: scrolled ? 'blur(24px) saturate(200%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(200%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.07)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.07)' : 'none',
        }}
      >
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 28px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}>

          {/* ══ Logo (gauche) ══ */}
          <Link
            href="/"
            aria-label="Kollect — Accueil"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              flexShrink: 0,
              zIndex: 1,
            }}
          >
            <span style={{
              fontSize: '28px',
              fontWeight: 600,
              color: scrolled ? '#000' : '#fff',
              letterSpacing: '-0.5px',
              fontStyle: 'italic',
              fontFamily: "'Snell Roundhand', 'Dancing Script', 'Brush Script MT', cursive",
              transition: 'color 350ms ease',
              lineHeight: 1,
            }}>
              Kollect
            </span>
          </Link>

          {/* ══ Nav links — desktop (centré absolument) ══ */}
          <div
            className="nav-links-desktop"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              background: scrolled ? 'transparent' : 'rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '4px',
              backdropFilter: scrolled ? 'none' : 'blur(8px)',
              border: scrolled ? 'none' : '1px solid rgba(255,255,255,0.12)',
              transition: 'all 350ms ease',
            }}
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: isActive ? 700 : 500,
                    color: scrolled
                      ? (isActive ? '#000' : '#4D4D4D')
                      : (isActive ? '#fff' : 'rgba(255,255,255,0.72)'),
                    textDecoration: 'none',
                    transition: 'all 200ms ease',
                    backgroundColor: isActive
                      ? (scrolled ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.14)')
                      : 'transparent',
                    whiteSpace: 'nowrap',
                  }}
                  className={scrolled ? 'nav-link-scrolled' : 'nav-link-top'}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* ══ Spacer ══ */}
          <div style={{ flex: 1 }} />

          {/* ══ CTA actions — desktop (droite) ══ */}
          <div
            className="nav-cta-desktop"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, zIndex: 1 }}
          >
            <Link
              href={postLoginHref ?? "/auth/login"}
              className="nav-btn-ghost"
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                color: scrolled ? '#000' : 'rgba(255,255,255,0.85)',
                textDecoration: 'none',
                border: scrolled ? '1.5px solid rgba(0,0,0,0.15)' : '1.5px solid rgba(255,255,255,0.25)',
                transition: 'all 200ms ease',
                backgroundColor: 'transparent',
              }}
            >
              {user ? 'Continuer' : 'Connexion'}
            </Link>

            <Link
              href={postLoginHref ?? "/auth/register"}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '9px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#fff',
                textDecoration: 'none',
                backgroundColor: '#FF3B30',
                boxShadow: '0 2px 16px rgba(255,59,48,0.35)',
                transition: 'all 200ms ease',
                letterSpacing: '0.1px',
              }}
              className="nav-btn-cta"
            >
              {user ? 'Mon espace' : 'Commencer'}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* ══ Burger — mobile ══ */}
          <button
            className="nav-burger"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(v => !v)}
            style={{
              display: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: scrolled ? '1.5px solid rgba(0,0,0,0.12)' : '1.5px solid rgba(255,255,255,0.2)',
              backgroundColor: scrolled ? 'transparent' : 'rgba(255,255,255,0.08)',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '5px',
              cursor: 'pointer',
              padding: '0',
              flexShrink: 0,
              zIndex: 1,
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block',
                width: '18px',
                height: '2px',
                backgroundColor: scrolled ? '#000' : '#fff',
                borderRadius: '2px',
                transition: 'all 250ms ease',
                transformOrigin: 'center',
                transform:
                  i === 0 && mobileOpen ? 'translateY(7px) rotate(45deg)' :
                    i === 1 && mobileOpen ? 'scaleX(0)' :
                      i === 2 && mobileOpen ? 'translateY(-7px) rotate(-45deg)' :
                        'none',
                opacity: i === 1 && mobileOpen ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* ══ Overlay fond mobile ══ */}
      {mobileOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(6px)',
        }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ══ Menu mobile drawer ══ */}
      <div
        ref={menuRef}
        role="dialog"
        aria-label="Menu mobile"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '300px',
          zIndex: 1001,
          backgroundColor: '#fff',
          boxShadow: '-8px 0 60px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 24px',
          gap: '6px',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <span style={{
            fontSize: '24px',
            fontWeight: 600,
            fontStyle: 'italic',
            letterSpacing: '-0.5px',
            fontFamily: "'Snell Roundhand', 'Dancing Script', cursive",
          }}>
            Kollect
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer"
            style={{
              width: '36px', height: '36px',
              borderRadius: '8px',
              border: '1.5px solid rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: 'transparent',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '13px 16px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : '#000',
                textDecoration: 'none',
                backgroundColor: isActive ? '#000' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 200ms ease',
              }}
            >
              {link.label}
              {isActive && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              )}
            </Link>
          );
        })}

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            href={postLoginHref ?? "/auth/login"}
            style={{
              padding: '14px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              color: '#000',
              textDecoration: 'none',
              border: '1.5px solid rgba(0,0,0,0.15)',
              textAlign: 'center',
            }}
          >
            {user ? 'Continuer' : 'Connexion'}
          </Link>
          <Link
            href={postLoginHref ?? "/auth/register"}
            style={{
              padding: '14px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              color: '#fff',
              textDecoration: 'none',
              backgroundColor: '#FF3B30',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(255,59,48,0.3)',
            }}
          >
            {user ? 'Mon espace' : 'Commencer gratuitement'}
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-cta-desktop { display: none !important; }
          .nav-burger { display: flex !important; }
        }
        .nav-link-top:hover {
          color: #fff !important;
          background-color: rgba(255,255,255,0.14) !important;
        }
        .nav-link-scrolled:hover {
          color: #000 !important;
          background-color: rgba(0,0,0,0.06) !important;
        }
        .nav-btn-ghost:hover {
          border-color: currentColor !important;
          opacity: 0.8;
        }
        .nav-btn-cta:hover {
          background-color: #e0342a !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(255,59,48,0.45) !important;
        }
      `}</style>
    </>
  );
}
