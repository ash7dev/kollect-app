'use client';

import { FONT_FAMILY_INTER } from '@/styles/typography';

const TESTIMONIALS = [
  {
    name: 'Aminata D.',
    role: 'Cliente depuis 2023',
    city: 'Dakar',
    avatar: 'A',
    color: '#FF3B30',
    rating: 5,
    text: 'Je dépensais des heures à chercher des pièces streetwear de qualité au Sénégal. Depuis Kollect, je reçois tout chez moi en 48h. Les marques sont vraiment vérifiées, aucune mauvaise surprise.',
  },
  {
    name: 'Moussa K.',
    role: 'Créateur — Galsen Streetwear',
    city: 'Dakar',
    avatar: 'M',
    color: '#FF9500',
    rating: 5,
    text: 'En tant que créateur, Kollect m\'a permis de toucher 10x plus de clients qu\'avant. Le dashboard est clair, les paiements rapides, et l\'équipe est très réactive. Je recommande à 100%.',
  },
  {
    name: 'Fatou B.',
    role: 'Cliente depuis 2024',
    city: 'Saint-Louis',
    avatar: 'F',
    color: '#34C759',
    rating: 5,
    text: 'Les drops exclusifs sont ce que j\'aime le plus. J\'ai pu avoir des pièces que je n\'aurais jamais trouvées ailleurs. La communauté est incroyable et très engagée. Merci Kollect !',
  },
  {
    name: 'Ibrahim S.',
    role: 'Créateur — Urban Nomad',
    city: 'Thiès',
    avatar: 'I',
    color: '#007AFF',
    rating: 5,
    text: 'J\'ai lancé ma marque Urban Nomad sur Kollect il y a 6 mois. Aujourd\'hui j\'ai plus de 800 abonnés et des ventes régulières. La plateforme est vraiment pensée pour les créateurs locaux.',
  },
  {
    name: 'Aïssatou N.',
    role: 'Cliente depuis 2023',
    city: 'Ziguinchor',
    avatar: 'A',
    color: '#AF52DE',
    rating: 5,
    text: 'La livraison est rapide même depuis Ziguinchor ! Je pensais que ça prendrait des semaines, mais j\'ai reçu ma commande en 3 jours. Emballage soigné, produits conformes. Parfait.',
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < rating ? '#FF9500' : 'rgba(0,0,0,0.15)'}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ))}
  </div>
);

export function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-label="Avis clients"
      style={{
        padding: '120px 24px',
        backgroundColor: '#fff',
        overflow: 'hidden',
        margin: '0 12px',
        borderRadius: 'var(--radius-xxxl)',
        border: '1px solid rgba(0,0,0,0.06)',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div className="testimonials-header" style={{ textAlign: 'center', marginBottom: '72px' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, color: '#FF3B30',
            letterSpacing: '2.5px', textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            Ce qu&apos;ils disent
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: 900, color: '#000',
            letterSpacing: '-1.5px', lineHeight: 1.1, margin: 0,
          }}>
            La communauté parle{' '}
            <span style={{ color: '#FF3B30' }}>d&apos;elle-même.</span>
          </h2>
        </div>

        {/* Cards grid */}
        <div className="testimonials-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}>
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name + i}
              className="testimonial-card"
              style={{
                padding: '28px 24px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: i === 1 ? '#000' : '#F7F7F7',
                border: i === 1 ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                gridColumn: i === 3 || i === 4 ? 'span 1' : 'span 1',
                transition: 'transform 220ms ease, box-shadow 220ms ease',
              }}
            >
              {/* Quote mark */}
              <div style={{
                fontSize: '48px',
                lineHeight: 1,
                color: i === 1 ? 'rgba(255,59,48,0.3)' : 'rgba(0,0,0,0.08)',
                fontFamily: 'Georgia, serif',
                marginTop: '-8px',
                marginBottom: '-12px',
              }}>
                &ldquo;
              </div>

              <StarRating rating={t.rating} />

              <p style={{
                fontSize: '14px', lineHeight: 1.75,
                color: i === 1 ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                margin: 0,
                flexGrow: 1,
              }}>
                {t.text}
              </p>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '50%',
                  backgroundColor: t.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px', fontWeight: 800, color: '#fff',
                  flexShrink: 0,
                }}>
                  {t.avatar}
                </div>
                <div>
                  <p style={{
                    fontSize: '14px', fontWeight: 700,
                    color: i === 1 ? '#fff' : '#000',
                    margin: 0, lineHeight: 1.3,
                  }}>
                    {t.name}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: i === 1 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                    margin: 0, lineHeight: 1.3,
                  }}>
                    {t.role} · {t.city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom aggregate */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '48px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: '3px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#FF9500">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#000', margin: 0 }}>
            4.9 / 5
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.4)', margin: 0 }}>
            basé sur +2 400 avis
          </p>
        </div>
      </div>

      <style suppressHydrationWarning>{`
        .testimonial-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 20px 48px rgba(0,0,0,0.07) !important;
        }
        @media (max-width: 960px) {
          .testimonials-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          #testimonials { padding: 64px 16px !important; margin: 0 6px !important; }
          .testimonials-header { margin-bottom: 40px !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .testimonial-card { padding: 24px 20px !important; }
          .testimonials-grid > *:nth-child(n+4) { display: none !important; }
        }
      `}</style>
    </section>
  );
}
