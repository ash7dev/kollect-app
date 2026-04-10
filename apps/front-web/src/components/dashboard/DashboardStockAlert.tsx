'use client';

type Product = {
  id:    string;
  name:  string;
  stock: number;
};

type Props = {
  products:   Product[];
  isLoading:  boolean;
  threshold?: number;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardStockAlert({ products, isLoading, threshold = 5 }: Props) {
  // Only keep those under threshold
  const lowStock = products.filter((p) => p.stock <= threshold).sort((a,b) => a.stock - b.stock);
  const visible  = lowStock.slice(0, 3);

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <article style={cardStyle}>
        <style>{ANIM}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ width: 140, height: 13, borderRadius: 6, background: 'rgba(255,255,255,0.2)', animation: 'dsaPulse 1.3s ease-in-out infinite' }} />
            <div style={{ width: 100, height: 10, borderRadius: 6, background: 'rgba(255,255,255,0.1)', animation: 'dsaPulse 1.3s ease-in-out infinite' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map((i) => (
             <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ width: '60%', height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.1)', animation: 'dsaPulse 1.3s ease-in-out infinite' }} />
                <div style={{ width: 40, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.15)' }} />
             </div>
          ))}
        </div>
      </article>
    );
  }

  // ── Empty state — no alerts ───────────────────────────────────────────────
  if (lowStock.length === 0) {
    return (
      <article style={cardStyle}>
        <style dangerouslySetInnerHTML={{ __html: STYLES + ANIM }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 8 }}>
              Stocks
              <span style={{
                padding: '2px 8px', borderRadius: 99,
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.5px'
              }}>OK</span>
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>Aucun produit en alerte</p>
          </div>
        </div>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
          padding: '16px 0'
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff', textAlign: 'center' }}>Tous vos stocks sont sains</p>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.5 }}>
            Aucun produit n&apos;est sous le seuil de {threshold} unités.
          </p>
        </div>
      </article>
    );
  }

  return (
    <article style={cardStyle}>
      <style dangerouslySetInnerHTML={{ __html: STYLES + ANIM }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
           <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 6 }}>
              Alerte Stocks
              <span className="dsa-ping">
                 <span className="dsa-ping-dot" />
                 <span className="dsa-ping-ring" />
              </span>
           </h3>
           <p style={{ margin: '2px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              Produits bientôt épuisés
           </p>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 99,
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
          fontSize: 11, fontWeight: 700, color: '#fff',
        }}>
          {lowStock.length} alertes
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
         {visible.map((p) => {
            const isZero = p.stock === 0;

            return (
               <div key={p.id} className="dsa-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                     <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                     </p>
                     <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: isZero ? '#FCA5A5' : 'rgba(255,255,255,0.5)' }}>
                        {isZero ? 'Rupture de stock totale' : `Il ne reste plus que ${p.stock} exemplaires`}
                     </p>
                  </div>
                  <div style={{
                     padding: '4px 8px', borderRadius: 8,
                     background: isZero ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                     color: '#fff', fontSize: 13, fontWeight: 900, flexShrink: 0,
                  }}>
                     {p.stock}
                  </div>
               </div>
            );
         })}
      </div>

      {lowStock.length > 3 && (
         <div style={{ marginTop: 12, textAlign: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
               + {lowStock.length - 3} autres produits en alerte
            </span>
         </div>
      )}
    </article>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: 20,
  border: '1px solid rgba(255,59,48,0.3)',
  background: 'linear-gradient(135deg, #FF3B30 0%, #E0321F 60%, #cc2d23 100%)',
  padding: '24px 24px',
  boxShadow: '0 8px 32px rgba(255,59,48,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
};

const STYLES = `
  .dsa-ping {
    position: relative;
    width: 8px; height: 8px;
    display: inline-block;
  }
  .dsa-ping-dot {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 8px #fff;
  }
  .dsa-ping-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid #fff;
    animation: dsaPing 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
  @keyframes dsaPing {
    75%, 100% { transform: scale(3.5); opacity: 0; }
  }

  .dsa-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 12px;
    background: rgba(0,0,0,0.15);
    border: 1px solid rgba(0,0,0,0.1);
    transition: background 0.2s, transform 0.2s;
  }
  .dsa-row:hover {
    background: rgba(0,0,0,0.25);
    transform: translateX(2px);
  }
`;

const ANIM = `@keyframes dsaPulse{0%,100%{opacity:1}50%{opacity:.5}}`;
