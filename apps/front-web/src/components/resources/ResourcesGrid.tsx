'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { FONT_FAMILY_INTER } from '@/styles/typography';

const BUYER_RESOURCES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    title: 'Comment trouver les meilleurs drops',
    desc: 'Utilise les filtres, active les alertes et suis tes marques favorites pour ne jamais rater un lancement.',
    tag: 'Guide',
    href: '/how-it-works',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    title: 'Suivi de commande & livraison',
    desc: 'Tout savoir sur le suivi de ta commande, les délais de livraison et la procédure de retour.',
    tag: 'Aide',
    href: '/contact',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    title: 'Activer les alertes de drops',
    desc: 'Ne rate plus jamais un lancement. Configure tes notifications par marque ou par catégorie.',
    tag: 'Astuce',
    href: '/how-it-works',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: 'Gérer tes favoris',
    desc: 'Sauvegarde tes pièces coup de cœur et retrouve-les facilement depuis ton profil.',
    tag: 'Astuce',
    href: '/favorites',
  },
];

const CREATOR_RESOURCES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
      </svg>
    ),
    title: 'Créer ta première boutique',
    desc: 'Guide complet pour ouvrir ta boutique Kollect : inscription, configuration de la charte et mise en ligne.',
    tag: 'Guide',
    href: '/become-seller',
    featured: true,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: 'Organiser un Drop réussi',
    desc: 'Les meilleures pratiques pour planifier, teaser et lancer un drop qui génère de l\'engagement.',
    tag: 'Guide',
    href: '/how-it-works',
    featured: true,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
      </svg>
    ),
    title: 'Comprendre tes statistiques',
    desc: 'Comment lire et utiliser les données de ton dashboard pour optimiser tes ventes et tes drops.',
    tag: 'Guide',
    href: '/dashboard',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    title: 'Commissions & paiements',
    desc: 'Tout comprendre sur la structure des commissions, les délais de paiement et la fiscalité.',
    tag: 'Finance',
    href: '/contact',
  },
];

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Guide: { bg: 'rgba(255,59,48,0.08)', text: '#FF3B30' },
  Aide: { bg: 'rgba(0,122,255,0.08)', text: '#007AFF' },
  Astuce: { bg: 'rgba(52,199,89,0.08)', text: '#34C759' },
  Finance: { bg: 'rgba(194,146,59,0.1)', text: '#C2923B' },
};

function ResourceCard({
  icon, title, desc, tag, href, featured = false, delay = 0, visible,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tag: string;
  href: string;
  featured?: boolean;
  delay?: number;
  visible: boolean;
}) {
  const tc = TAG_COLORS[tag] ?? TAG_COLORS.Guide;

  return (
    <Link
      href={href}
      className="res-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '32px 28px',
        borderRadius: 24,
        border: featured ? '1.5px solid rgba(255,59,48,0.2)' : '1.5px solid rgba(0,0,0,0.07)',
        backgroundColor: featured ? 'rgba(255,59,48,0.03)' : '#FAFAFA',
        textDecoration: 'none',
        opacity: visible ? 1 : 0,
        animation: visible ? `resCardUp 0.6s ease-out ${delay}s both` : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {featured && (
        <span style={{
          position: 'absolute', top: 16, right: 16,
          fontSize: 9, fontWeight: 900, color: '#FF3B30',
          letterSpacing: '1.5px', textTransform: 'uppercase',
          padding: '3px 8px', borderRadius: 6,
          backgroundColor: 'rgba(255,59,48,0.12)',
          border: '1px solid rgba(255,59,48,0.2)',
        }}>
          Populaire
        </span>
      )}

      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        backgroundColor: featured ? 'rgba(255,59,48,0.1)' : 'rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: featured ? '#FF3B30' : 'rgba(0,0,0,0.5)',
      }}>
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{
          fontSize: '1rem', fontWeight: 800,
          color: '#0a0a0a', letterSpacing: '-0.3px',
          lineHeight: 1.3, margin: '0 0 8px',
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: 14, lineHeight: 1.7,
          color: 'rgba(0,0,0,0.48)', margin: 0,
        }}>
          {desc}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '4px 10px', borderRadius: 999,
          backgroundColor: tc.bg, color: tc.text,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.5px',
        }}>
          {tag}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </Link>
  );
}

export function ResourcesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.05 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: '#fff',
        padding: '80px 40px 120px',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      <style>{`
        @keyframes resCardUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .res-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 24px 56px rgba(0,0,0,0.08) !important;
          border-color: rgba(0,0,0,0.14) !important;
        }
        .res-card { transition: transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease; }
        @keyframes resTitleUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .res-title-in { animation: resTitleUp 0.65s ease-out both; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* ── Acheteurs ── */}
        <div style={{ marginBottom: 80 }}>
          <div
            className={visible ? 'res-title-in' : ''}
            style={{ opacity: visible ? 1 : 0, marginBottom: 40 }}
          >
            <p style={{
              fontSize: 11, fontWeight: 900, letterSpacing: '3px',
              textTransform: 'uppercase', color: '#FF3B30', margin: '0 0 12px',
            }}>
              Pour les acheteurs
            </p>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
              fontWeight: 900, letterSpacing: '-1px',
              color: '#0a0a0a', margin: 0, lineHeight: 1.15,
              textTransform: 'uppercase',
            }}>
              Maîtrise la plateforme.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
            }}
            className="res-grid"
          >
            {BUYER_RESOURCES.map((r, i) => (
              <ResourceCard key={r.title} {...r} delay={0.1 + i * 0.08} visible={visible} />
            ))}
          </div>
        </div>

        {/* ── Créateurs ── */}
        <div>
          <div
            className={visible ? 'res-title-in' : ''}
            style={{ opacity: visible ? 1 : 0, animationDelay: '0.15s', marginBottom: 40 }}
          >
            <p style={{
              fontSize: 11, fontWeight: 900, letterSpacing: '3px',
              textTransform: 'uppercase', color: '#C2923B', margin: '0 0 12px',
            }}>
              Pour les créateurs
            </p>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
              fontWeight: 900, letterSpacing: '-1px',
              color: '#0a0a0a', margin: 0, lineHeight: 1.15,
              textTransform: 'uppercase',
            }}>
              Développe ta marque.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
            }}
            className="res-grid"
          >
            {CREATOR_RESOURCES.map((r, i) => (
              <ResourceCard key={r.title} {...r} delay={0.25 + i * 0.08} visible={visible} />
            ))}
          </div>
        </div>

        {/* CTA contact */}
        <div
          style={{
            marginTop: 72,
            padding: '40px',
            backgroundColor: '#0a0a0a',
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
            opacity: visible ? 1 : 0,
            animation: visible ? 'resCardUp 0.7s ease-out 0.6s both' : 'none',
          }}
        >
          <div>
            <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: '#C2923B', margin: '0 0 8px' }}>
              Besoin d&apos;aide ?
            </p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', margin: 0, lineHeight: 1.2 }}>
              On répond à toutes tes questions.
            </h3>
          </div>
          <Link
            href="/contact"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 14,
              backgroundColor: '#FF3B30', color: '#fff',
              fontSize: 15, fontWeight: 800, textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(255,59,48,0.3)',
              flexShrink: 0,
              transition: 'all 220ms ease',
            }}
            className="res-contact-cta"
          >
            Nous contacter
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>

      <style>{`
        .res-contact-cta:hover {
          background-color: #e0342a !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 14px 40px rgba(255,59,48,0.45) !important;
        }
        @media (max-width: 1100px) {
          .res-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .res-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
