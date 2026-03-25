'use client';

type Props = {
  stats: {
    totalFollowers: number;
    followersChange: number;
    viewsThisPeriod: number;
  } | null;
  isLoading: boolean;
  onShare: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(v: number) {
  if (v >= 1000) return (v / 1000).toFixed(1) + 'k';
  return String(v);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardAudienceCard({ stats, isLoading, onShare }: Props) {
  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (isLoading || !stats) {
    return (
      <article style={cardStyle}>
        <style>{ANIM}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ width: 100, height: 13, borderRadius: 6, background: 'rgba(0,0,0,0.08)', animation: 'dacPulse 1.3s ease-in-out infinite' }} />
            <div style={{ width: 140, height: 10, borderRadius: 6, background: 'rgba(0,0,0,0.05)', animation: 'dacPulse 1.3s ease-in-out infinite' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[1,2].map((i) => (
            <div key={i} style={{ height: 60, borderRadius: 14, background: 'rgba(0,0,0,0.04)', animation: 'dacPulse 1.3s ease-in-out infinite' }} />
          ))}
        </div>
        <div style={{ height: 44, borderRadius: 12, background: 'rgba(0,0,0,0.06)', animation: 'dacPulse 1.3s ease-in-out infinite' }} />
      </article>
    );
  }

  // ── Content ───────────────────────────────────────────────────────────────
  const { totalFollowers, followersChange, viewsThisPeriod } = stats;

  return (
    <article style={cardStyle}>
      <style dangerouslySetInnerHTML={{ __html: STYLES + ANIM }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
           <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 6 }}>
              Audience
              <span style={{ padding: '2px 6px', background: '#FF3B30', color: '#fff', borderRadius: 6, fontSize: 9, fontWeight: 900, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                 Live
              </span>
           </h3>
           <p style={{ margin: '2px 0 0', fontSize: 13, color: 'rgba(0,0,0,0.4)' }}>
              Acquisition de la boutique
           </p>
        </div>
      </div>

      {/* Cards array */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
         {/* Followers card */}
         <div className="dac-stat-box" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(236,72,153,0.02) 100%)', borderColor: 'rgba(236,72,153,0.15)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#EC4899', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: 6 }}>
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
               Followers
            </span>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
               <span style={{ fontSize: 24, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-1px', lineHeight: 1 }}>
                  {fmtNum(totalFollowers)}
               </span>
               {followersChange !== 0 && (
                 <span style={{ fontSize: 11, fontWeight: 700, color: followersChange > 0 ? '#10B981' : '#FF3B30', background: followersChange > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(255,59,48,0.1)', padding: '2px 6px', borderRadius: 6, marginBottom: 2 }}>
                    {followersChange > 0 ? '+' : ''}{followersChange}%
                 </span>
               )}
            </div>
         </div>

         {/* Views card */}
         <div className="dac-stat-box" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.02) 100%)', borderColor: 'rgba(59,130,246,0.15)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: 6 }}>
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
               Vues
            </span>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
               <span style={{ fontSize: 24, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-1px', lineHeight: 1 }}>
                  {fmtNum(viewsThisPeriod)}
               </span>
               <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.4)', marginBottom: 2 }}>
                  ce mois
               </span>
            </div>
         </div>
      </div>

      {/* Share action */}
      <button type="button" onClick={onShare} className="dac-share-btn">
         Partager ma boutique
         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
      </button>

    </article>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: 20,
  border: '1px solid rgba(0,0,0,0.07)',
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  padding: '24px 24px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column',
};

const STYLES = `
  .dac-stat-box {
    padding: 16px 14px;
    border-radius: 14px;
    border: 1px solid transparent;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .dac-stat-box:hover {
    transform: translateY(-2px);
  }

  .dac-share-btn {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.1);
    background: linear-gradient(180deg, #fff 0%, #FAFAFA 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: '#0A0A0A';
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    transition: all 0.15s;
    font-family: inherit;
  }
  .dac-share-btn:hover {
    background: #fff;
    border-color: rgba(0,0,0,0.15);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    transform: translateY(-1px);
  }
  .dac-share-btn:active {
    transform: scale(0.98);
  }
`;

const ANIM = `@keyframes dacPulse{0%,100%{opacity:1}50%{opacity:.5}}`;
