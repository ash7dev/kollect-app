'use client';

import Link from 'next/link';
import Image from 'next/image';

const IconArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const IconPlay = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 3l14 9-14 9V3z"/>
  </svg>
);

const STATS = [
  { value: '500+', label: 'Créateurs actifs' },
  { value: '10k+', label: 'Produits en ligne' },
  { value: '50k+', label: 'Clients satisfaits' },
  { value: '100%', label: 'Made in Sénégal' },
];

const AVATAR_COLORS = ['#FF3B30', '#FF9500', '#34C759', '#007AFF', '#AF52DE'];

export function Hero() {
  return (
    <section
      id="hero"
      aria-label="Hero"
      style={{
        minHeight: '100svh',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '0 0 32px 32px',
      }}
    >
      {/* Background effects */}
      <div aria-hidden style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '700px',
        height: '700px',
        background: 'radial-gradient(ellipse at center, rgba(255,59,48,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-5%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(ellipse at center, rgba(255,59,48,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      {/* Grid texture */}
      <div aria-hidden style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '72px 72px',
        pointerEvents: 'none',
      }} />
      {/* Vertical gradient fade bottom */}
      <div aria-hidden style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: 'linear-gradient(to top, #000, transparent)',
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      {/* ══ Main content split layout ══ */}
      <div
        className="hero-inner"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '140px 28px 80px',
          gap: '80px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* ── Left : Text ── */}
        <div className="hero-text" style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '580px' }}>

          {/* Eyebrow pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 16px 6px 10px',
            borderRadius: '999px',
            border: '1px solid rgba(255,59,48,0.3)',
            backgroundColor: 'rgba(255,59,48,0.07)',
            width: 'fit-content',
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#FF3B30',
              display: 'inline-block',
              boxShadow: '0 0 10px rgba(255,59,48,0.9)',
              animation: 'heroPulse 2s ease-in-out infinite',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#FF3B30', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              Plateforme N°1 du streetwear sénégalais
            </span>
          </div>

          {/* H1 */}
          <h1 style={{
            fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.02,
            letterSpacing: '-3px',
            margin: 0,
          }}>
            Collectionnez{' '}
            <span style={{
              background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B6B 50%, #FF9500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              l&apos;âme
            </span>
            <br />du streetwear local
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
            color: 'rgba(255,255,255,0.48)',
            lineHeight: 1.75,
            maxWidth: '480px',
            margin: 0,
          }}>
            Marques vérifiées, drops exclusifs et communauté sénégalaise.
            Tout ce dont tu as besoin pour rester au niveau.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="#download"
              className="hero-btn-primary"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px',
                borderRadius: '12px',
                fontSize: '15px', fontWeight: 800,
                color: '#fff', textDecoration: 'none',
                backgroundColor: '#FF3B30',
                boxShadow: '0 8px 32px rgba(255,59,48,0.4)',
                letterSpacing: '0.2px',
                transition: 'all 220ms ease',
              }}
            >
              Commencer gratuitement
              <IconArrowRight size={15} />
            </Link>

            <Link
              href="/explorer"
              className="hero-btn-secondary"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 24px',
                borderRadius: '12px',
                fontSize: '15px', fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.14)',
                backgroundColor: 'rgba(255,255,255,0.04)',
                letterSpacing: '0.2px',
                transition: 'all 220ms ease',
              }}
            >
              <IconPlay size={13} />
              Explorer les drops
            </Link>
          </div>

          {/* Social proof avatars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
            <div style={{ display: 'flex' }}>
              {AVATAR_COLORS.map((color, i) => (
                <div key={i} style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: '2px solid #000',
                  marginLeft: i === 0 ? '0' : '-10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#fff',
                }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Rejoint par{' '}
              <strong style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>+50 000 passionnés</strong>
            </p>
          </div>
        </div>

        {/* ── Right : Mockup 3D ── */}
        <div
          className="hero-visual"
          style={{
            flex: '1 1 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            minHeight: '500px',
          }}
        >
          {/* Glow behind mockup */}
          <div aria-hidden style={{
            position: 'absolute',
            inset: '10%',
            background: 'radial-gradient(ellipse at center, rgba(255,59,48,0.18) 0%, transparent 70%)',
            filter: 'blur(40px)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }} />

          {/* Decorative ring */}
          <div aria-hidden style={{
            position: 'absolute',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.04)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'heroSpin 20s linear infinite',
            pointerEvents: 'none',
          }} />
          <div aria-hidden style={{
            position: 'absolute',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.025)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'heroSpin 32s linear infinite reverse',
            pointerEvents: 'none',
          }} />

          {/* Mockup image */}
          <div
            className="hero-mockup-float"
            style={{
              position: 'relative',
              zIndex: 1,
              filter: 'drop-shadow(0 40px 80px rgba(255,59,48,0.25)) drop-shadow(0 0 40px rgba(0,0,0,0.6))',
            }}
          >
            <Image
              src="/mockup.png"
              alt="Application mobile Kollect — Streetwear sénégalais"
              width={520}
              height={520}
              priority
              style={{ objectFit: 'contain', width: '100%', height: 'auto', maxWidth: '480px' }}
            />
          </div>

          {/* Floating badge — "Drop Live" */}
          <div className="hero-badge-drop" style={{
            position: 'absolute',
            top: '14%',
            right: '2%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'heroFloat 3s ease-in-out infinite',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: '#34C759',
              boxShadow: '0 0 8px rgba(52,199,89,0.8)',
              animation: 'heroPulse 1.5s ease-in-out infinite',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Drop en cours</span>
          </div>

          {/* Floating badge — "Marque vérifiée" */}
          <div className="hero-badge-verified" style={{
            position: 'absolute',
            bottom: '18%',
            left: '2%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'heroFloat 3.5s ease-in-out infinite 0.5s',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF3B30">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1 }}>Marque vérifiée</p>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.4 }}>500+ créateurs</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Stats bar ══ */}
      <div
        className="hero-stats"
        style={{
          position: 'relative',
          zIndex: 3,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '0 28px 80px',
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.07)',
          overflow: 'hidden',
          backgroundColor: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(8px)',
        }}
        className="stats-grid"
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} style={{
              padding: '28px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              transition: 'background 200ms ease',
            }}
            className="stat-cell"
            >
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1 }}>
                {stat.value}
              </span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 500, letterSpacing: '0.3px', textAlign: 'center' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes heroPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes heroSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .hero-btn-primary:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 40px rgba(255,59,48,0.55) !important;
          background-color: #e0342a !important;
        }
        .hero-btn-secondary:hover {
          color: #fff !important;
          border-color: rgba(255,255,255,0.28) !important;
          background-color: rgba(255,255,255,0.08) !important;
        }
        .stat-cell:hover {
          background-color: rgba(255,255,255,0.04) !important;
        }
        .hero-mockup-float {
          animation: heroFloat 4s ease-in-out infinite;
        }
        @media (max-width: 900px) {
          .hero-inner { flex-direction: column !important; padding: 120px 20px 60px !important; gap: 48px !important; }
          .hero-text { max-width: 100% !important; align-items: center; text-align: center; }
          .hero-text > div:first-child { align-self: center; }
          .hero-visual { min-height: 320px !important; width: 100%; }
          .hero-badge-drop, .hero-badge-verified { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stat-cell:nth-child(2) { border-right: none !important; }
          .stat-cell:nth-child(1), .stat-cell:nth-child(2) { border-bottom: 1px solid rgba(255,255,255,0.07); }
        }
        @media (max-width: 480px) {
          .hero-stats { padding: 0 16px 60px !important; }
        }
      `}</style>
    </section>
  );
}
