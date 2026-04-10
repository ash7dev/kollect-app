'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

type Props = {
  brandName: string;
  brandSlug: string;
  brandLogo?: string | null;
  onClose: () => void;
};

export function DashboardShareModal({ brandName, brandSlug, brandLogo, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shopUrl = `https://kollect.ma/brand/${brandSlug}`;

  // Bloquer le scroll derrière le modal
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shopUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `Découvrez ma boutique : ${brandName}`,
          text: 'Retrouvez toutes mes collections exclusives sur Kollect !',
          url: shopUrl,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    }
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current || isDownloading) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3, // HD export
        cacheBust: true,
        style: {
           transform: 'none',
           borderRadius: '0', 
           boxShadow: 'none'
        }
      });
      // Créer un lien pour forcer le téléchargement
      const link = document.createElement('a');
      link.download = `StoreCard_${brandSlug}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      fontFamily: 'Inter, sans-serif',
    }} onClick={onClose} aria-modal="true" role="dialog">
      
      {/* Container principal du pop-up, on annule le onClick pour ne pas fermer quand on clique dedans */}
      <div style={{
        width: '100%',
        maxWidth: '840px',
        background: '#0A0A0A',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }} onClick={(e) => e.stopPropagation()}>
         
        {/* Header (Top bar) */}
        <div style={{
           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
           padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
           <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
              Partager ma boutique
           </h2>
           <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
              border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.2s'
           }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                 <path d="M18 6L6 18M6 6l12 12" />
              </svg>
           </button>
        </div>

        {/* Content Area (2 cols on desktop) */}
        <div className="dsm-content">
           <style>{`
             .dsm-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0;
             }
             .dsm-left { padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at center, #1a1a1a 0%, #0A0A0A 100%); }
             .dsm-right { padding: 40px; display: flex; flex-direction: column; justify-content: center; border-left: 1px solid rgba(255,255,255,0.08); background: #111; }
             
             @media (max-width: 800px) {
                .dsm-content { grid-template-columns: 1fr; }
                .dsm-right { border-left: none; border-top: 1px solid rgba(255,255,255,0.08); padding: 32px 24px; }
                .dsm-left { padding: 32px 24px; }
             }
             
             .btn-hover:hover { filter: brightness(1.1); transform: translateY(-1px); }
             .btn-hover:active { transform: scale(0.98); }
             .btn-hover { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
           `}</style>

           {/* ── PARTIE GAUCHE : La Store Card ── */}
           <div className="dsm-left">
              <div 
                 ref={cardRef}
                 style={{
                    width: '280px',
                    aspectRatio: '9/16',
                    background: 'linear-gradient(145deg, #1A1A1A 0%, #050505 100%)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    padding: '32px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                 }}
              >
                  {/* Decorative glow in card */}
                  <div style={{ position: 'absolute', top: -50, left: -50, width: 150, height: 150, background: '#FF3B30', filter: 'blur(80px)', opacity: 0.15 }} />
                  <div style={{ position: 'absolute', bottom: -50, right: -50, width: 150, height: 150, background: '#EC4899', filter: 'blur(80px)', opacity: 0.15 }} />

                  {/* Header marque */}
                  <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'linear-gradient(135deg, #FF3B30 0%, #E0321F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 8px 24px rgba(255,59,48,0.3)', border: '2px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                     {brandLogo ? (
                       <img src={brandLogo} alt={brandName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                       <span style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>{brandName.charAt(0).toUpperCase()}</span>
                     )}
                  </div>
                  <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', textAlign: 'center', lineHeight: 1.1 }}>{brandName}</h3>
                  <p style={{ margin: '8px 0 32px', fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500, letterSpacing: '0.2px', textAlign: 'center' }}>Scanne pour découvrir<br/>mes collections exclusives</p>

                  {/* Le QR Code */}
                  <div style={{ padding: '12px', background: '#fff', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                     <QRCodeSVG 
                        value={shopUrl} 
                        size={140} 
                        level="Q" 
                        fgColor="#000000" 
                        bgColor="#ffffff" 
                     />
                  </div>

                  {/* Footer Card */}
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                     <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>kollect.ma/brand/{brandSlug}</span>
                  </div>
              </div>
           </div>

           {/* ── PARTIE DROITE : Actions Utiles ── */}
           <div className="dsm-right">
              <h4 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Développe ton audience</h4>
              <p style={{ margin: '0 0 32px', fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                 Exporte ta Store Card pour tes stories Instagram, ou copie directement ton lien pour tes bios réseaux sociaux.
              </p>

              {/* Champ Lien avec copie rapide */}
              <div style={{ marginBottom: 32 }}>
                 <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Ton lien unique</label>
                 <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{
                       flex: 1, padding: '0 16px', height: 48, borderRadius: '12px',
                       background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                       display: 'flex', alignItems: 'center', fontSize: 14, color: '#fff',
                       whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                       userSelect: 'all'
                    }}>
                       {shopUrl}
                    </div>
                    <button 
                       className="btn-hover"
                       onClick={handleCopyLink}
                       style={{
                          height: 48, padding: '0 20px', borderRadius: '12px',
                          background: copied ? '#10B981' : '#fff', color: copied ? '#fff' : '#000',
                          border: 'none', fontSize: 14, fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: 6,
                       }}
                    >
                       {copied ? (
                         <>
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                           Copié !
                         </>
                       ) : (
                         <>
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                           Copier
                         </>
                       )}
                    </button>
                 </div>
              </div>

              {/* Boutons d'action rapides */}
              <div style={{ display: 'grid', gap: 12 }}>
                 <button 
                    className="btn-hover"
                    onClick={handleDownloadCard}
                    disabled={isDownloading}
                    style={{
                       width: '100%', height: 52, borderRadius: '14px',
                       background: 'linear-gradient(135deg, #FF3B30 0%, #E0321F 100%)', color: '#fff',
                       border: 'none', fontSize: 15, fontWeight: 700,
                       display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                       boxShadow: '0 8px 24px rgba(255,59,48,0.25)',
                       opacity: isDownloading ? 0.7 : 1
                    }}
                 >
                    {isDownloading ? (
                      <span style={{ opacity: 0.8 }}>Téléchargement en cours...</span>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Télécharger la Store Card
                      </>
                    )}
                 </button>
                 
                 {/* Ce bouton ne s'affiche vraiment bien que si l'API navigator.share est disponible (souvent sur mobile/Safari) */}
                 {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <button 
                       className="btn-hover"
                       onClick={handleNativeShare}
                       style={{
                          width: '100%', height: 52, borderRadius: '14px',
                          background: 'rgba(255,255,255,0.08)', color: '#fff',
                          border: '1px solid rgba(255,255,255,0.1)', fontSize: 15, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                       }}
                    >
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                       Partager l'application
                    </button>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
