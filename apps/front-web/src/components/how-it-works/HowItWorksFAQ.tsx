'use client';

import { useRef, useEffect, useState } from 'react';
import { FONT_FAMILY_INTER } from '@/styles/typography';

const FAQS = [
  {
    question: 'Comment être sûr que les marques sont authentiques ?',
    answer: 'Chaque marque passe par un processus de vérification avant d\'être publiée sur Kollect. Nous validons l\'identité du créateur, les produits et les conditions de livraison. Un badge "Vérifié" est attribué à chaque boutique approuvée.',
  },
  {
    question: 'Quels sont les délais de livraison ?',
    answer: 'Les délais varient selon le créateur et ta localisation. En général, comptez 2 à 5 jours ouvrés pour Dakar et 3 à 7 jours pour les autres régions du Sénégal. Chaque commande inclut un suivi en temps réel via l\'application.',
  },
  {
    question: 'Puis-je retourner un article ?',
    answer: 'Oui. Tu as 14 jours après réception pour effectuer un retour si l\'article est défectueux ou ne correspond pas à la description. Contacte le support via l\'app ou écris-nous à hello@kollect.sn.',
  },
  {
    question: 'Comment fonctionne le système de Drop ?',
    answer: 'Un Drop est une vente à durée limitée organisée par un créateur. Tu peux activer les alertes de ta marque favorite pour recevoir une notification push dès l\'ouverture. Les quantités sont limitées : sois réactif.',
  },
  {
    question: 'C\'est gratuit d\'ouvrir une boutique en tant que créateur ?',
    answer: 'Oui, l\'inscription est totalement gratuite. Kollect prélève une commission mesurée uniquement sur les ventes réalisées, sans frais fixes ni abonnement caché.',
  },
  {
    question: 'Les paiements sont-ils sécurisés ?',
    answer: 'Toutes les transactions sont chiffrées et traitées via des prestataires de paiement certifiés. Tes données bancaires ne sont jamais stockées sur nos serveurs.',
  },
];

export function HowItWorksFAQ() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: '#fff',
        padding: '100px 40px 120px',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      <style>{`
        @keyframes hiwFaqUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hiw-faq-in { animation: hiwFaqUp 0.65s ease-out both; }
        .hiw-faq-row {
          border-bottom: 1.5px solid rgba(0,0,0,0.07);
          transition: background 200ms ease;
        }
        .hiw-faq-row:hover { background: rgba(0,0,0,0.015) !important; }
        .hiw-faq-toggle {
          background: none; border: none; cursor: pointer;
          width: 100%; text-align: left;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 28px 0;
        }
        .hiw-faq-answer {
          overflow: hidden;
          transition: max-height 350ms cubic-bezier(0.4,0,0.2,1), opacity 250ms ease;
        }
      `}</style>

      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div
          className={visible ? 'hiw-faq-in' : ''}
          style={{ opacity: visible ? 1 : 0, textAlign: 'center', marginBottom: 72 }}
        >
          <p style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '3px',
            textTransform: 'uppercase', color: '#FF3B30', margin: '0 0 16px',
          }}>
            FAQ
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: 900,
            letterSpacing: '-1.5px',
            color: '#0a0a0a',
            margin: '0 0 16px',
            textTransform: 'uppercase',
            lineHeight: 1.05,
          }}>
            Questions fréquentes.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.45)', lineHeight: 1.7, margin: '0 auto', maxWidth: 480 }}>
            Tout ce que tu dois savoir avant de commander ou d&apos;ouvrir ta boutique.
          </p>
        </div>

        {/* Accordion */}
        <div
          className={visible ? 'hiw-faq-in' : ''}
          style={{
            opacity: visible ? 1 : 0,
            animationDelay: '0.1s',
            borderTop: '1.5px solid rgba(0,0,0,0.07)',
          }}
        >
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="hiw-faq-row" style={{ borderRadius: isOpen ? 0 : 0 }}>
                <button
                  className="hiw-faq-toggle"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span style={{
                    fontSize: '1.05rem', fontWeight: 700,
                    color: isOpen ? '#FF3B30' : '#0a0a0a',
                    letterSpacing: '-0.3px', lineHeight: 1.3,
                    transition: 'color 200ms ease',
                  }}>
                    {faq.question}
                  </span>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    backgroundColor: isOpen ? '#FF3B30' : 'rgba(0,0,0,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 250ms ease',
                  }}>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke={isOpen ? '#fff' : '#0a0a0a'}
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 250ms ease' }}
                    >
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>
                </button>

                <div
                  className="hiw-faq-answer"
                  style={{
                    maxHeight: isOpen ? 300 : 0,
                    opacity: isOpen ? 1 : 0,
                    paddingBottom: isOpen ? 24 : 0,
                  }}
                >
                  <p style={{
                    fontSize: 15, lineHeight: 1.75,
                    color: 'rgba(0,0,0,0.55)', margin: 0,
                  }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div
          className={visible ? 'hiw-faq-in' : ''}
          style={{
            opacity: visible ? 1 : 0,
            animationDelay: '0.2s',
            marginTop: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '20px 32px',
            backgroundColor: '#FAFAFA',
            border: '1.5px solid rgba(0,0,0,0.06)',
            borderRadius: 16,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>
            Une autre question ?{' '}
            <a
              href="mailto:hello@kollect.sn"
              style={{ color: '#FF3B30', fontWeight: 700, textDecoration: 'none' }}
            >
              hello@kollect.sn
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}
