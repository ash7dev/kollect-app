import Link from 'next/link';
import { useState } from 'react';
import { FONT_FAMILY_INTER } from '@/styles/typography';
import { Logo } from '@/components/ui/Logo';

const FOOTER_LINKS = {
  Plateforme: [
    { label: 'Explorer', href: '/explorer' },
    { label: 'Collections', href: '/collections' },
    { label: 'Marques', href: '/brands' },
    { label: 'Drops à venir', href: '/collections' },
  ],
  Créateurs: [
    { label: 'Devenir vendeur', href: '/creators' },
    { label: 'Dashboard CEO', href: '/dashboard' },
    { label: 'Comment ça marche', href: '/how-it-works' },
    { label: 'Ressources', href: '/resources' },
  ],
  Support: [
    { label: 'Centre d\'aide', href: '/help' },
    { label: 'Contact', href: '/contact' },
    { label: 'Conditions d\'utilisation', href: '/terms' },
    { label: 'Politique de confidentialité', href: '/privacy' },
  ],
};

const SOCIALS = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/kollect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com/@kollect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.17a8.16 8.16 0 0 0 4.77 1.52V7.25a4.85 4.85 0 0 1-1-.56z"/>
      </svg>
    ),
  },
  {
    name: 'Twitter / X',
    href: 'https://x.com/kollect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      aria-label="Pied de page"
      style={{
        backgroundColor: '#000',
        color: '#fff',
        paddingTop: '80px',
        paddingBottom: '32px',
        borderRadius: '0 0 var(--radius-xxxl) var(--radius-xxxl)',
        margin: '0 12px',
        fontFamily: FONT_FAMILY_INTER,
        marginTop: '28px',
      }}
    >
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
      }}>

        {/* ══ Top section : Brand + Nav columns ══ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '48px',
          paddingBottom: '64px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
        className="footer-grid"
        >

          {/* ── Brand column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Logo */}
            <Logo />

            {/* Tagline */}
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '240px',
            }}>
              La plateforme des créateurs streetwear sénégalais. Découvrez, collectionnez, portez.
            </p>

            {/* App badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                Disponible sur
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* App Store badge */}
                <Link
                  href="#download"
                  className="footer-app-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    textDecoration: 'none',
                    transition: 'border-color 200ms ease, background 200ms ease',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div>
                    <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', lineHeight: 1, letterSpacing: '0.5px' }}>Télécharger sur</p>
                    <p style={{ fontSize: '13px', color: '#fff', fontWeight: 600, lineHeight: 1.3 }}>App Store</p>
                  </div>
                </Link>

                {/* Play Store badge */}
                <Link
                  href="#download"
                  className="footer-app-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    textDecoration: 'none',
                    transition: 'border-color 200ms ease, background 200ms ease',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 20.5v-17a.5.5 0 0 1 .752-.43l14.5 8.5a.5.5 0 0 1 0 .86l-14.5 8.5A.5.5 0 0 1 3 20.5z" fill="#34C759"/>
                    <path d="M3 3.5l8.5 8.5L3 20.5V3.5z" fill="#FF3B30" opacity="0.7"/>
                  </svg>
                  <div>
                    <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', lineHeight: 1, letterSpacing: '0.5px' }}>Disponible sur</p>
                    <p style={{ fontSize: '13px', color: '#fff', fontWeight: 600, lineHeight: 1.3 }}>Google Play</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Nav columns ── */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}>
                {category}
              </p>
              <nav aria-label={category}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="footer-link"
                        style={{
                          fontSize: '14px',
                          color: 'rgba(255,255,255,0.55)',
                          textDecoration: 'none',
                          transition: 'color 200ms ease',
                          display: 'inline-block',
                        }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>

        {/* ══ Bottom bar : copyright + socials ══ */}
        <div style={{
          paddingTop: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          {/* Copyright */}
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
            © {currentYear} Kollect. Tous droits réservés.
          </p>

          {/* Social icons */}
          <div role="list" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {SOCIALS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                role="listitem"
                className="footer-social-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  color: 'rgba(255,255,255,0.45)',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 200ms ease',
                }}
              >
                {social.icon}
              </a>
            ))}
          </div>

          {/* Badge Made in Sénégal */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.04)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Made in Sénégal</span>
          </div>
        </div>
      </div>

      {/* Styles (CSS pur pour éviter les event handlers) */}
      <style>{`
        .footer-app-btn:hover {
          border-color: rgba(255,255,255,0.35) !important;
          background-color: rgba(255,255,255,0.05) !important;
        }
        .footer-link:hover {
          color: #ffffff !important;
        }
        .footer-social-btn:hover {
          color: #ffffff !important;
          border-color: rgba(255,255,255,0.25) !important;
          background-color: rgba(255,255,255,0.06) !important;
        }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
