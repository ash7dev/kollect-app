'use client';

import { useState } from 'react';
import { FONT_FAMILY_INTER } from '@/styles/typography';

const FAQS = [
  {
    question: 'Combien ça coûte pour commencer?',
    answer: 'Rien. Zéro. Gratuit. Tu paies juste la commission sur les ventes (5-8% selon le plan). Pas de setup fee, pas d&apos;engagement minimum. Tu peux tester avec une seule collection.',
  },
  {
    question: 'Comment fonctionne la commission?',
    answer: 'Tier Starter: 8% de commission. Tier Pro: 5%. Enterprise: négociable. La commission couvre: infrastructure, support, paiements, livraison. Tu récupères le reste en H+24.',
  },
  {
    question: 'Je peux importer mes clients existants?',
    answer: 'Oui. Upload ta liste d&apos;emails et on les ajoute automatiquement à tes followers Kollect. Ils recevront les push notifications de tes futurs drops.',
  },
  {
    question: 'Quel est le volume minimum?',
    answer: 'Aucun. Une marque peut vendre 1 pièce ou 10k. On s&apos;adapte à ta taille. Mais honnêtement, le ROI est meilleur à partir de 50+ pièces par drop.',
  },
  {
    question: 'Comment gérer les retours/remboursements?',
    answer: 'Dashboard dédié. Si un client demande un remboursement dans les 14j, tu acceptes en 1 clic. On déduit de ton compte. C&apos;est aussi simple que ça.',
  },
  {
    question: 'Je peux vendre sur d&apos;autres plateformes en même temps?',
    answer: 'Bien sûr. Mais on te recommande la stratégie &quot;Drops exclusives sur Kollect&quot;. Ça crée l&apos;urgence. Les marques les plus réussies font leurs lancements d&apos;abord sur Kollect.',
  },
  {
    question: 'Comment fonctionnent les push notifications?',
    answer: 'Quand tu crées un drop, on envoie une notif à 100% de tes followers au moment exact du lancement. Taux de conversion moyen: 40-60% vs email 15%. C&apos;est LE super pouvoir.',
  },
  {
    question: 'Vous prenez une commission sur la livraison?',
    answer: 'Non. La livraison est payée par le client. Nous, on prend juste la commission sur le prix du produit. La livraison tu gardes ce que tu dois payer au courrier.',
  },
];

export function CreatorFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section
      style={{
        padding: '120px 24px',
        backgroundColor: '#FFFFFF',
        fontFamily: FONT_FAMILY_INTER,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#FF3B30',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '16px',
            }}
          >
            FAQ
          </p>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 800,
              marginBottom: '20px',
              lineHeight: 1.2,
            }}
          >
            Questions fréquentes
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                transition: 'all 300ms ease-in-out',
              }}
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: openIdx === idx ? 'rgba(255,59,48,0.05)' : '#F8F8F8',
                  border: 'none',
                  textAlign: 'left',
                  fontFamily: FONT_FAMILY_INTER,
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 300ms ease-in-out',
                }}
                onMouseEnter={(e) => {
                  if (openIdx !== idx) e.currentTarget.style.backgroundColor = 'rgba(255,59,48,0.03)';
                }}
                onMouseLeave={(e) => {
                  if (openIdx !== idx) e.currentTarget.style.backgroundColor = '#F8F8F8';
                }}
              >
                <span>{faq.question}</span>
                <span
                  style={{
                    fontSize: '18px',
                    transition: 'transform 300ms ease-in-out',
                    transform: openIdx === idx ? 'rotate(180deg)' : 'rotate(0)',
                  }}
                >
                  ▼
                </span>
              </button>

              {openIdx === idx && (
                <div style={{ padding: '0 20px 20px 20px', backgroundColor: '#FFFFFF', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#4D4D4D',
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <p style={{ fontSize: '14px', color: '#4D4D4D', marginBottom: '16px' }}>
            Pas trouvé la réponse? Parle directement à l&apos;équipe.
          </p>
          <a
            href="/contact"
            style={{
              padding: '12px 24px',
              backgroundColor: '#FF3B30',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              display: 'inline-block',
              transition: 'all 300ms ease-in-out',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#CC0000')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF3B30')}
          >
            Contacter le support
          </a>
        </div>
      </div>
    </section>
  );
}
