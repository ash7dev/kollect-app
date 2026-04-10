'use client';

import { useRef, useEffect, useState } from 'react';
import { FONT_FAMILY_INTER } from '@/styles/typography';

const FAQS = [
  {
    question: 'Comment passer ma première commande ?',
    answer: 'Parcours les collections ou active tes alertes de drops. Quand tu trouves une pièce, ajoute-la au panier, choisis ta taille et procède au paiement sécurisé. Tu reçois une confirmation immédiate par email.',
  },
  {
    question: 'Quels sont les délais de livraison ?',
    answer: '2 à 5 jours ouvrés pour Dakar, 3 à 7 jours pour les autres régions du Sénégal. Chaque commande est suivie en temps réel depuis l\'application.',
  },
  {
    question: 'Comment retourner un article ?',
    answer: 'Tu as 14 jours après réception pour demander un retour si l\'article est défectueux ou ne correspond pas à la description. Contacte-nous via ce formulaire ou à hello@kollect.sn.',
  },
  {
    question: 'C\'est quoi un Drop Kollect ?',
    answer: 'Un Drop est une vente à durée et quantité limitées organisée par un créateur. Active les alertes de ta marque favorite pour être notifié dès l\'ouverture — les pièces partent vite.',
  },
  {
    question: 'Comment ouvrir ma boutique en tant que créateur ?',
    answer: 'Inscription gratuite, 48h de mise en ligne. Rends-toi sur la page "Devenir vendeur" et suis les étapes. Notre équipe te contacte pour valider ton profil et t\'accompagner.',
  },
  {
    question: 'Les paiements sont-ils sécurisés ?',
    answer: 'Oui. Toutes les transactions sont chiffrées (HTTPS). Tes données bancaires ne sont jamais stockées sur nos serveurs — elles transitent via des prestataires certifiés.',
  },
];

export function ContactFAQ() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

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
        backgroundColor: '#F7F7F7',
        padding: '80px 40px 100px',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      <style>{`
        @keyframes cfaqUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .cfaq-in { animation: cfaqUp 0.65s ease-out both; }
        .cfaq-row { border-bottom: 1.5px solid rgba(0,0,0,0.07); transition: background 200ms ease; }
        .cfaq-toggle {
          background: none; border: none; cursor: pointer;
          width: 100%; text-align: left;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 26px 0;
        }
        .cfaq-answer { overflow: hidden; transition: max-height 350ms cubic-bezier(0.4,0,0.2,1), opacity 250ms ease; }
      `}</style>

      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Header */}
        <div
          className={visible ? 'cfaq-in' : ''}
          style={{ opacity: visible ? 1 : 0, marginBottom: 56 }}
        >
          <p style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '3px',
            textTransform: 'uppercase', color: '#FF3B30', margin: '0 0 16px',
          }}>
            FAQ
          </p>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
            fontWeight: 900, letterSpacing: '-1.5px',
            color: '#0a0a0a', margin: 0,
            textTransform: 'uppercase', lineHeight: 1.05,
          }}>
            Questions fréquentes.
          </h2>
        </div>

        {/* Accordion */}
        <div
          className={visible ? 'cfaq-in' : ''}
          style={{
            opacity: visible ? 1 : 0,
            animationDelay: '0.1s',
            borderTop: '1.5px solid rgba(0,0,0,0.07)',
          }}
        >
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="cfaq-row">
                <button
                  className="cfaq-toggle"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span style={{
                    fontSize: '1rem', fontWeight: 700,
                    color: isOpen ? '#FF3B30' : '#0a0a0a',
                    letterSpacing: '-0.2px', lineHeight: 1.4,
                    transition: 'color 200ms ease',
                    textAlign: 'left',
                  }}>
                    {faq.question}
                  </span>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                    backgroundColor: isOpen ? '#FF3B30' : 'rgba(0,0,0,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 250ms ease',
                  }}>
                    <svg
                      width="13" height="13" viewBox="0 0 24 24"
                      fill="none" stroke={isOpen ? '#fff' : '#0a0a0a'}
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 250ms ease' }}
                    >
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>
                </button>
                <div
                  className="cfaq-answer"
                  style={{
                    maxHeight: isOpen ? 240 : 0,
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
      </div>
    </section>
  );
}
