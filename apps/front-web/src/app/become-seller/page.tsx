'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { FONT_FAMILY_INTER } from '@/styles/typography';

/* ═══════════════════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════════════════ */
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const IconChevron = ({ open }: { open: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 280ms ease' }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════ */
const PERKS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Boutique opérationnelle en 48h',
    desc: 'Tu crées ton compte, tu remplis ton profil de marque, et tu lances ton premier drop. Zéro code, zéro agence, zéro friction.',
    color: '#FF3B30',
    stat: '48h',
    statLabel: 'pour lancer',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: 'Dashboard CEO tout-en-un',
    desc: 'Gère tes commandes, tes stocks, tes analytics et tes échanges clients depuis un seul espace. Tout ce dont une marque a besoin, au même endroit.',
    color: '#FF9500',
    stat: '1',
    statLabel: 'espace, tout dedans',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Audience locale qualifiée',
    desc: "Accède directement à une communauté de passionnés déjà là. Tu n'as pas besoin de construire ton audience depuis zéro — elle t'attend.",
    color: '#34C759',
    stat: '50k+',
    statLabel: 'acheteurs actifs',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: "Encaisse avant d'expédier",
    desc: "Avec le système de drops, tes clients paient avant que tu ne produises. Zéro stock dormant. L'argent est sécurisé et versé directement sur ton compte.",
    color: '#007AFF',
    stat: '0 CFA',
    statLabel: 'de frais fixes',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AF52DE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "L'urgence du drop",
    desc: "Crée l'anticipation avec un teaser vidéo, puis ouvre les ventes à une date précise. L'édition limitée crée la demande que le stock normal ne crée jamais.",
    color: '#AF52DE',
    stat: '∞',
    statLabel: 'hype possible',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A962" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    ),
    title: 'Badge Kollect — crédibilité instantanée',
    desc: "Le badge vérifié Kollect signale la confiance à tes clients avant même qu'ils aient vu tes produits. Une validation que les créateurs indépendants ne peuvent pas acheter ailleurs.",
    color: '#C9A962',
    stat: '✓',
    statLabel: 'Marque vérifiée',
  },
];


const STEPS = [
  {
    n: '01',
    title: 'Crée ton compte créateur',
    desc: 'En 2 minutes. Un compte, une identité de marque. Aucun abonnement ni CB requis pour commencer.',
    color: '#FF3B30',
  },
  {
    n: '02',
    title: 'Configure ta boutique',
    desc: 'Nom, logo, bio, liens sociaux. Ton espace est prêt en moins d\'une heure. Tout est personnalisable depuis ton dashboard.',
    color: '#FF9500',
  },
  {
    n: '03',
    title: 'Lance ton premier drop',
    desc: 'Ajoute tes produits, définis le stock maximum, active le teaser avec une date d\'ouverture. Le compte à rebours fait le reste.',
    color: '#34C759',
  },
  {
    n: '04',
    title: 'Vends & encaisse',
    desc: 'Ta communauté commande, tu prépares et expédies. L\'argent est viré directement. Tu ne cours pas après tes clients.',
    color: '#007AFF',
  },
];

const FAQS = [
  {
    q: 'C\'est payant pour créer ma boutique ?',
    a: 'Non. Créer ta boutique sur Kollect est entièrement gratuit. Kollect prend une commission uniquement sur les ventes réalisées — pas de frais fixes, pas d\'abonnement mensuel.',
  },
  {
    q: 'Combien de temps pour être opérationnel ?',
    a: 'Moins de 48h. Tu crées ton compte, remplis les infos de ta marque, et ton premier drop peut être en ligne le jour même. La validation "badge vérifié" intervient ensuite dans les 24-48h suivantes.',
  },
  {
    q: 'Je peux vendre sans stock avec les drops ?',
    a: 'Oui, c\'est exactement le principe. Tu annonces un drop avec un teaser, les clients réservent et paient en avance, tu produis ou commandes en conséquence. Zéro stock dormant, zéro prise de risque financier.',
  },
  {
    q: 'Comment sont gérés les paiements ?',
    a: 'Les paiements sont encaissés et sécurisés par Kollect à la commande. Tu es viré(e) dès que la commande est confirmée et expédiée. Tu n\'as jamais à courir après tes clients ou gérer les remboursements manuellement.',
  },
  {
    q: 'Est-ce que je garde le contrôle de ma marque ?',
    a: 'Totalement. Kollect est une plateforme, pas un distributeur. Tu gardes ta marque, ton identité visuelle, ta relation client. On est l\'infrastructure qui te permet de vendre — rien de plus.',
  },
  {
    q: 'Puis-je vendre des articles non fabriqués au Sénégal ?',
    a: 'Kollect valorise les créateurs locaux sénégalais. Pour l\'instant, les marques doivent être basées au Sénégal. Les produits peuvent être sourcés localement ou à l\'international.',
  },
];

const STATS = [
  { value: '48h', label: 'Pour être opérationnel' },
  { value: '0 CFA', label: 'Pour créer ta boutique' },
  { value: '50k+', label: 'Acheteurs sur la plateforme' },
  { value: '100%', label: 'Contrôle de ta marque' },
];

const TESTIMONIALS = [
  {
    quote: 'J\'ai lancé ma première collection en 3 jours. Le drop s\'est sold out en moins de 6 heures. Sans Kollect, ça m\'aurait pris 6 mois.',
    name: 'Aminata D.',
    role: 'Fondatrice — Studio AM',
    color: '#FF3B30',
  },
  {
    quote: 'Le dashboard CEO est bluffant. Je vois mes ventes en temps réel, mes clients me laissent des messages — tout au même endroit.',
    name: 'Ibrahima S.',
    role: 'CEO — KeyStreet Dakar',
    color: '#34C759',
  },
  {
    quote: 'Le badge vérifié m\'a donné une crédibilité instantanée. Mes clients me font confiance avant même d\'avoir reçu leur colis.',
    name: 'Fatou N.',
    role: 'Créatrice — Wax & Ride',
    color: '#007AFF',
  },
];

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function PerkCard({ perk }: { perk: typeof PERKS[0] }) {
  return (
    <div className="bcs-perk-card" style={{
      backgroundColor: '#fff',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: '20px',
      padding: '28px 24px',
      display: 'flex', flexDirection: 'column', gap: '20px',
      position: 'relative', overflow: 'hidden',
      transition: 'border-color 300ms ease, transform 300ms ease, box-shadow 300ms ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Stat pill en haut à droite */}
      <div style={{
        position: 'absolute', top: '20px', right: '20px',
        padding: '4px 10px', borderRadius: '999px',
        backgroundColor: `${perk.color}10`, border: `1px solid ${perk.color}20`,
      }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: perk.color, letterSpacing: '0.3px' }}>
          {perk.stat} <span style={{ fontWeight: 500, opacity: 0.7 }}>{perk.statLabel}</span>
        </span>
      </div>
      {/* Icon */}
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px',
        backgroundColor: `${perk.color}10`, border: `1px solid ${perk.color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {perk.icon}
      </div>
      {/* Text */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.3px', margin: '0 0 8px', lineHeight: 1.3 }}>
          {perk.title}
        </h3>
        <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.75, margin: 0 }}>
          {perk.desc}
        </p>
      </div>
    </div>
  );
}

function StepCard({ step, index, total }: { step: typeof STEPS[0]; index: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: '4px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px',
          backgroundColor: `${step.color}10`, border: `1px solid ${step.color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '16px', fontWeight: 900, color: step.color, letterSpacing: '-0.5px', fontFamily: FONT_FAMILY_INTER }}>
            {step.n}
          </span>
        </div>
        {index < total - 1 && (
          <div style={{
            width: '1px', height: '60px', marginTop: '8px',
            background: `linear-gradient(to bottom, ${step.color}40, transparent)`,
          }} />
        )}
      </div>
      <div style={{ paddingBottom: index < total - 1 ? '40px' : '0', flex: 1 }}>
        <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.4px', margin: '0 0 8px', lineHeight: 1.3 }}>
          {step.title}
        </h3>
        <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.75, margin: 0, maxWidth: '360px' }}>
          {step.desc}
        </p>
      </div>
    </div>
  );
}

function FaqItem({ faq }: { faq: typeof FAQS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          gap: '16px', fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: 700, color: open ? '#0A0A0A' : 'rgba(0,0,0,0.65)', letterSpacing: '-0.2px', lineHeight: 1.4, transition: 'color 200ms ease' }}>
          {faq.q}
        </span>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
          backgroundColor: open ? 'rgba(255,59,48,0.08)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${open ? 'rgba(255,59,48,0.2)' : 'rgba(0,0,0,0.08)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: open ? '#FF3B30' : 'rgba(0,0,0,0.35)',
          transition: 'all 200ms ease',
        }}>
          <IconChevron open={open} />
        </div>
      </button>
      <div style={{
        maxHeight: open ? '300px' : '0',
        overflow: 'hidden',
        transition: 'max-height 320ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.5)', lineHeight: 1.85, paddingBottom: '20px', margin: 0 }}>
          {faq.a}
        </p>
      </div>
    </div>
  );
}

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid rgba(0,0,0,0.07)',
      borderRadius: '20px',
      padding: '28px 24px',
      display: 'flex', flexDirection: 'column', gap: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      {/* Stars */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {[0,1,2,3,4].map(i => (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FF9500" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        ))}
      </div>
      <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.65)', lineHeight: 1.8, margin: 0, fontStyle: 'italic' }}>
        "{t.quote}"
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          backgroundColor: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 800, color: '#fff', flexShrink: 0,
        }}>
          {t.name.charAt(0)}
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#0A0A0A', margin: '0 0 2px' }}>{t.name}</p>
          <p style={{ fontSize: '11px', color: 'rgba(0,0,0,0.4)', margin: 0 }}>{t.role}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function BecomeSellerPage() {
  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', fontFamily: FONT_FAMILY_INTER, color: '#0A0A0A' }}>
      {/* Réutilise exactement la même Navbar que la landing */}
      <Navbar />

      <main>
        {/* ═══════════════════════════════
            HERO
            ═══════════════════════════════ */}
        <section aria-label="Créez votre marque sur Kollect" style={{
          position: 'relative', overflow: 'hidden',
          padding: 'clamp(80px, 12vw, 140px) clamp(20px, 4vw, 48px) clamp(60px, 8vw, 100px)',
          backgroundColor: '#fff',
        }}>
          {/* Subtle grid background */}
          <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
          {/* Red radial glow — subtil */}
          <div aria-hidden style={{ position: 'absolute', top: '-10%', right: '-5%', width: '700px', height: '700px', background: 'radial-gradient(ellipse, rgba(255,59,48,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            <div className="bcs-hero-inner" style={{ display: 'flex', alignItems: 'center', gap: '80px', flexWrap: 'wrap' }}>

              {/* Left */}
              <div className="bcs-hero-left" style={{ flex: '0 0 auto', width: 'min(560px, 100%)' }}>
                {/* Badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '6px 16px 6px 10px', borderRadius: '999px', marginBottom: '28px',
                  backgroundColor: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.18)',
                }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#FF3B30', flexShrink: 0, boxShadow: '0 0 10px rgba(255,59,48,0.6)', animation: 'bcsHeroPulse 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF3B30', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    Programme créateurs · Gratuit
                  </span>
                </div>

                {/* H1 */}
                <h1 style={{
                  fontSize: 'clamp(2.4rem, 4.5vw, 5rem)',
                  fontWeight: 900, letterSpacing: '-3px', lineHeight: 1.02, margin: '0 0 24px', color: '#0A0A0A',
                }}>
                  Ta marque mérite{' '}
                  <span style={{
                    background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B6B 40%, #FF9500 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    une vitrine.
                  </span>
                </h1>

                <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.15rem)', color: 'rgba(0,0,0,0.5)', lineHeight: 1.8, margin: '0 0 32px', maxWidth: '480px' }}>
                  Kollect est la plateforme streetwear du Sénégal. Lance ta boutique, organise des drops en édition limitée, et vends à une audience de 50 000+ passionnés — sans friction, sans frais fixes.
                </p>

                {/* Value props */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
                  {[
                    'Boutique gratuite — commission uniquement sur les ventes',
                    'Drops en avant-première avec countdown et teaser vidéo',
                    'Dashboard analytics + gestion commandes inclus dès le départ',
                  ].map((v) => (
                    <div key={v} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '6px', backgroundColor: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#34C759' }}>
                        <IconCheck />
                      </div>
                      <span style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link href="/onboarding" className="bcs-hero-cta" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '16px 32px', borderRadius: '14px', fontSize: '16px', fontWeight: 800,
                    color: '#fff', textDecoration: 'none', backgroundColor: '#FF3B30',
                    boxShadow: '0 8px 40px rgba(255,59,48,0.35)', transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                    Créer ma boutique — C&apos;est gratuit
                    <IconArrow />
                  </Link>
                  <Link href="#comment-ca-marche" className="bcs-hero-ghost" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '16px 24px', borderRadius: '14px', fontSize: '15px', fontWeight: 600,
                    color: 'rgba(0,0,0,0.5)', textDecoration: 'none',
                    border: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'transparent',
                    transition: 'all 220ms ease',
                  }}>
                    Voir comment ça marche
                  </Link>
                </div>

                {/* Trust strip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '28px', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                  <div style={{ display: 'flex' }}>
                    {['#FF3B30', '#FF9500', '#34C759', '#007AFF', '#AF52DE'].map((c, i) => (
                      <div key={i} style={{
                        width: '28px', height: '28px', borderRadius: '50%', backgroundColor: c,
                        border: '2px solid #fff', marginLeft: i === 0 ? '0' : '-8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: 700, color: '#fff',
                      }}>
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.35)', margin: 0 }}>
                    Rejoins les créateurs déjà sur la plateforme
                  </p>
                </div>
              </div>

              {/* Right — Dashboard mock premium */}
              <div className="bcs-hero-right" style={{ flex: 1, minWidth: '280px', maxWidth: '460px' }}>
                <div style={{
                  borderRadius: '24px',
                  backgroundColor: '#0A0A0A',
                  border: '1px solid rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                  boxShadow: '0 40px 100px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.08)',
                }}>
                  {/* Mock header */}
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c }} />)}
                    </div>
                    <div style={{ flex: 1, height: '18px', borderRadius: '5px', backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: '8px' }} />
                    <div style={{ padding: '3px 10px', borderRadius: '6px', backgroundColor: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.25)' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#FF3B30', letterSpacing: '0.5px', textTransform: 'uppercase' }}>CEO Dashboard</span>
                    </div>
                  </div>
                  {/* Mock KPIs */}
                  <div style={{ padding: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { label: 'Ventes totales', value: '1 420 000', unit: 'CFA', color: '#FF3B30' },
                      { label: 'Commandes', value: '47', unit: 'ce mois', color: '#34C759' },
                      { label: 'Taux conversion', value: '12.4', unit: '%', color: '#FF9500' },
                      { label: 'Nouveaux clients', value: '124', unit: 'abonnés', color: '#007AFF' },
                    ].map((kpi) => (
                      <div key={kpi.label} style={{
                        padding: '14px 16px', borderRadius: '14px',
                        backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.07)',
                      }}>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: '0 0 6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {kpi.label}
                        </p>
                        <p style={{ fontSize: '18px', fontWeight: 900, color: kpi.color, margin: '0 0 2px', letterSpacing: '-0.5px' }}>
                          {kpi.value}
                        </p>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>{kpi.unit}</p>
                      </div>
                    ))}
                  </div>
                  {/* Active drop */}
                  <div style={{ margin: '0 18px 18px', padding: '16px', borderRadius: '14px', backgroundColor: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.18)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#FF3B30', display: 'inline-block', boxShadow: '0 0 8px rgba(255,59,48,0.8)', animation: 'bcsHeroPulse 1.5s ease-in-out infinite' }} />
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#FF3B30', letterSpacing: '1px', textTransform: 'uppercase' }}>Drop actif</span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Clôt dans 2j 4h</span>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.3px' }}>Collection Été — Édition Limitée</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: '0 0 10px' }}>32/50 exemplaires vendus</p>
                    <div style={{ height: '4px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ height: '100%', width: '64%', borderRadius: '999px', backgroundColor: '#FF3B30', boxShadow: '0 0 8px rgba(255,59,48,0.5)' }} />
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: '6px 0 0', textAlign: 'right' }}>64% sold</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════
            STATS BAR
            ═══════════════════════════════ */}
        <div style={{ padding: '0 clamp(20px, 4vw, 48px)', backgroundColor: '#fff' }}>
          <div style={{
            maxWidth: '1200px', margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            borderRadius: '20px', border: '1px solid rgba(0,0,0,0.07)',
            overflow: 'hidden', backgroundColor: '#FAFAFA',
          }} className="bcs-stats-grid">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="bcs-stat-cell" style={{
                padding: '28px 20px', textAlign: 'center',
                borderRight: i < STATS.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
              }}>
                <p style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 900, color: '#FF3B30', letterSpacing: '-2px', lineHeight: 1, margin: '0 0 6px' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)', fontWeight: 500, margin: 0 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════
            PERKS — Pourquoi Kollect
            ═══════════════════════════════ */}
        <section aria-label="Avantages créateurs" style={{ padding: 'clamp(80px, 10vw, 120px) clamp(20px, 4vw, 48px)', backgroundColor: '#fff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '999px', backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.38)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Pourquoi Kollect</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 900, color: '#0A0A0A', letterSpacing: '-1.5px', lineHeight: 1.1, margin: 0, maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
                Tout ce dont tu as besoin pour vendre.{' '}
                <span style={{ color: 'rgba(0,0,0,0.25)' }}>Rien de superflu.</span>
              </h2>
            </div>
            {/* Grid */}
            <div className="bcs-perks-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {PERKS.map((perk) => (
                <PerkCard key={perk.title} perk={perk} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════
            HOW IT WORKS
            ═══════════════════════════════ */}
        <section id="comment-ca-marche" aria-label="Processus de lancement" style={{
          padding: 'clamp(80px, 10vw, 120px) clamp(20px, 4vw, 48px)',
          backgroundColor: '#0A0A0A',
          position: 'relative', overflow: 'hidden',
          borderRadius: '32px',
          margin: '0 12px',
        }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', display: 'flex', gap: '80px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Left */}
            <div className="bcs-hiw-left" style={{ flex: '0 0 auto', width: 'min(380px, 100%)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Processus</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1, margin: '0 0 20px' }}>
                De zéro à ta{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #FF3B30 0%, #FF9500 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  première vente.
                </span>
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, margin: '0 0 32px' }}>
                Pas de jargon, pas de frais cachés. Juste les étapes pour lancer et encaisser — 4 étapes, quelques heures.
              </p>
              <Link href="/onboarding" className="bcs-hiw-cta" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 800,
                color: '#fff', textDecoration: 'none', backgroundColor: '#FF3B30',
                boxShadow: '0 8px 32px rgba(255,59,48,0.4)', transition: 'all 220ms ease',
              }}>
                Démarrer maintenant
                <IconArrow />
              </Link>
            </div>
            {/* Right: Steps */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              {STEPS.map((step, i) => (
                <StepCard key={step.n} step={step} index={i} total={STEPS.length} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════
            TESTIMONIALS
            ═══════════════════════════════ */}
        <section aria-label="Témoignages créateurs" style={{ padding: 'clamp(80px, 10vw, 120px) clamp(20px, 4vw, 48px)', backgroundColor: '#FAFAFA' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '52px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '999px', backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.38)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Ils l&apos;ont fait</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, color: '#0A0A0A', letterSpacing: '-1.2px', lineHeight: 1.15, margin: 0 }}>
                Les créateurs parlent.
              </h2>
            </div>
            <div className="bcs-testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {TESTIMONIALS.map((t) => (
                <TestimonialCard key={t.name} t={t} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════
            FAQ
            ═══════════════════════════════ */}
        <section aria-label="Questions fréquentes" style={{ padding: 'clamp(80px, 10vw, 120px) clamp(20px, 4vw, 48px)', backgroundColor: '#fff' }}>
          <div style={{ maxWidth: '740px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '52px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '999px', backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.38)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>FAQ</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, color: '#0A0A0A', letterSpacing: '-1.2px', lineHeight: 1.15, margin: 0 }}>
                Tu as des questions.{' '}
                <span style={{ color: 'rgba(0,0,0,0.25)' }}>On a les réponses.</span>
              </h2>
            </div>
            <div>
              {FAQS.map((faq, i) => (
                <FaqItem key={i} faq={faq} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════
            BOTTOM CTA
            ═══════════════════════════════ */}
        <section aria-label="Appel à l'action final" style={{
          padding: 'clamp(80px, 10vw, 120px) clamp(20px, 4vw, 48px)',
          margin: '0 12px 32px',
          borderRadius: '32px',
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #1a0000 0%, #0d0005 50%, #0a0000 100%)',
          border: '1px solid rgba(255,59,48,0.15)',
        }}>
          <div aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(255,59,48,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px 6px 12px', borderRadius: '999px', marginBottom: '28px',
              backgroundColor: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.28)',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#FF3B30', flexShrink: 0, boxShadow: '0 0 10px rgba(255,59,48,0.8)', animation: 'bcsHeroPulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#FF3B30', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                Gratuit pour toujours
              </span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.8rem)', fontWeight: 900, color: '#fff', letterSpacing: '-2.5px', lineHeight: 1.05, margin: '0 0 20px' }}>
              Prêt à lancer ta marque ?
            </h2>
            <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.1rem)', color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, margin: '0 0 40px', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
              Des créateurs sénégalais vendent déjà sur Kollect. Ta boutique peut être en ligne aujourd&apos;hui. Tes premières ventes sont à quelques clics.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/onboarding" className="bcs-final-cta" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '17px 36px', borderRadius: '14px', fontSize: '16px', fontWeight: 900,
                color: '#fff', textDecoration: 'none', backgroundColor: '#FF3B30',
                boxShadow: '0 10px 48px rgba(255,59,48,0.45)',
                transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)', letterSpacing: '0.2px',
              }}>
                Créer ma boutique — C&apos;est gratuit
                <IconArrow />
              </Link>
              <Link href="/" className="bcs-final-ghost" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '17px 28px', borderRadius: '14px', fontSize: '15px', fontWeight: 600,
                color: 'rgba(255,255,255,0.45)', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)',
                transition: 'all 220ms ease',
              }}>
                Voir les collections
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Réutilise exactement le même Footer que la landing */}
      <Footer />

      {/* ─── Styles ─── */}
      <style suppressHydrationWarning>{`
        @keyframes bcsHeroPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        .bcs-hero-cta:hover { transform: translateY(-3px) scale(1.01) !important; box-shadow: 0 16px 56px rgba(255,59,48,0.5) !important; background-color: #e0342a !important; }
        .bcs-hero-ghost:hover { color: #0A0A0A !important; border-color: rgba(0,0,0,0.2) !important; background-color: rgba(0,0,0,0.04) !important; }
        .bcs-hiw-cta:hover { transform: translateY(-2px) !important; box-shadow: 0 14px 40px rgba(255,59,48,0.55) !important; background-color: #e0342a !important; }
        .bcs-final-cta:hover { transform: translateY(-3px) scale(1.01) !important; box-shadow: 0 18px 60px rgba(255,59,48,0.6) !important; }
        .bcs-final-ghost:hover { color: rgba(255,255,255,0.75) !important; border-color: rgba(255,255,255,0.25) !important; }
        .bcs-perk-card:hover { border-color: rgba(0,0,0,0.14) !important; transform: translateY(-4px) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.08) !important; }
        @media (max-width: 960px) {
          .bcs-hero-inner { flex-direction: column !important; gap: 48px !important; }
          .bcs-hero-left { width: 100% !important; }
          .bcs-hero-right { max-width: 100% !important; width: 100% !important; }
          .bcs-perks-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bcs-testimonials-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bcs-hiw-left { width: 100% !important; }
          .bcs-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bcs-stats-grid > div:nth-child(2) { border-right: none !important; }
          .bcs-stats-grid > div:nth-child(1), .bcs-stats-grid > div:nth-child(2) { border-bottom: 1px solid rgba(0,0,0,0.06) !important; }
        }
        @media (max-width: 600px) {
          .bcs-perks-grid { grid-template-columns: 1fr !important; }
          .bcs-testimonials-grid { grid-template-columns: 1fr !important; }
          .bcs-stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
