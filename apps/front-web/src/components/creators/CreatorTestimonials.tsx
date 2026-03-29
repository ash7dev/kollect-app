'use client';

import { FONT_FAMILY_INTER } from '@/styles/typography';

const TESTIMONIALS = [
  {
    name: 'Moussa K.',
    brand: 'Galsen Streetwear',
    city: 'Dakar',
    avatar: 'M',
    color: '#FF9500',
    revenue: '+300%',
    text: 'En 3 mois sur Kollect, j&apos;ai multiplié mon CA par 3. Les push notifications c&apos;est dingue — 80% de conversion vs WhatsApp (20%). Enfin une plateforme qui vaut le coup.',
  },
  {
    name: 'Aïssatou N.',
    brand: 'Niakaar Designs',
    city: 'Dakar',
    avatar: 'A',
    color: '#FF3B30',
    revenue: '+450%',
    text: 'Kollect m&apos;a changé la vie. Avant, je vendais 10-20 pièces par drop sur Insta. Maintenant, 200-300. Le dashboard me montre exactement ce que mes clients veulent. Je plan mes prochains drops avec ça.',
  },
  {
    name: 'Cheikh T.',
    brand: 'Dakar Urban',
    city: 'Saint-Louis',
    avatar: 'C',
    color: '#34C759',
    revenue: '+600%',
    text: 'Y avait pas d&apos;alternative crédible avant. Shopify coûte trop cher, WhatsApp c&apos;est amateur. Kollect c&apos;est l&apos;infrastructure pro que j&apos;attendais. Équipe réactive, paiements rapides, clients heureux.',
  },
];

export function CreatorTestimonials() {
  return (
    <section
      style={{
        padding: '120px 24px',
        backgroundColor: '#000000',
        color: '#FFFFFF',
        fontFamily: FONT_FAMILY_INTER,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
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
            Témoignages
          </p>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 800,
              marginBottom: '20px',
              lineHeight: 1.2,
            }}
          >
            Les créateurs qui ont transformé leur business
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
          }}
        >
          {TESTIMONIALS.map((testimonial, idx) => (
            <div
              key={idx}
              style={{
                padding: '40px',
                backgroundColor: '#0A0A0A',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255,59,48,0.1)',
                  borderRadius: '6px',
                  borderLeft: '3px solid #FF3B30',
                }}
              >
                <p
                  style={{
                    fontSize: '13px',
                    color: '#FF6B6B',
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  Croissance: {testimonial.revenue}
                </p>
              </div>

              <p
                style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.8)',
                  fontStyle: 'italic',
                  margin: 0,
                }}
              >
                &quot;{testimonial.text}&quot;
              </p>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: testimonial.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      margin: '0 0 2px 0',
                    }}
                  >
                    {testimonial.name}
                  </p>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.5)',
                      margin: 0,
                    }}
                  >
                    {testimonial.brand} • {testimonial.city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
