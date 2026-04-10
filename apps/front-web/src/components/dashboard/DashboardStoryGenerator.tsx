'use client';

import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import saveAs from 'file-saver';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

import { ThemeOverview } from './story-themes/ThemeOverview';
import { ThemeSoldOut } from './story-themes/ThemeSoldOut';
import { ThemeProduct } from './story-themes/ThemeProduct';
import { ThemePromo } from './story-themes/ThemePromo';
import { StoryData, Icons, StoryTheme } from './story-themes/StoryShared';


interface DashboardStoryGeneratorProps {
  data: StoryData;
  onClose: () => void;
}

export function DashboardStoryGenerator({ data, onClose }: DashboardStoryGeneratorProps) {
  const storyRef = useRef<HTMLDivElement>(null);
  
  // Decide default theme based on context
  const initialTheme = data.product ? 'PRODUCT_LAUNCH' : 'OVERVIEW';
  const [theme, setTheme] = useState<StoryTheme>(initialTheme);
  const [variant, setVariant] = useState<'RED' | 'BLACK'>('RED');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF3B30', '#000', '#fff']
    });
  }, []);

  const handleExport = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const dataUrl = await toPng(storyRef.current, {
        quality: 1, pixelRatio: 2, width: 1080, height: 1920,
      });
      const filename = data.product 
        ? `story-${data.product.slug}-${theme.toLowerCase()}.png`
        : `story-${data.brandSlug}-${theme.toLowerCase()}.png`;
      saveAs(dataUrl, filename);
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#FF3B30', '#E63329'] });
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const globalThemes: StoryTheme[] = ['OVERVIEW', 'SOLD_OUT', 'TOP_SELLER', 'LAST_CHANCE'];
  const productThemes: StoryTheme[] = ['PRODUCT_LAUNCH', 'PRODUCT_RESTOCK', 'PRODUCT_PROMO'];
  const activeThemes = data.product ? productThemes : globalThemes;

  // ─── Responsive Scaling Logic ──────────────────────────────────────────
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const handleResize = () => {
      const availableHeight = window.innerHeight - 80;
      const targetHeight = 1920;
      const newScale = Math.min(availableHeight / targetHeight, 0.8);
      setScale(newScale);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)',
      padding: '20px', overflowY: 'auto', gap: window.innerWidth < 1100 ? '20px' : '60px',
      flexDirection: window.innerWidth < 1100 ? 'column' : 'row'
    }}>
      {/* Sidebar Controls */}
      <div style={{
        maxWidth: '360px', width: '100%',
        color: 'white', fontFamily: 'Inter, sans-serif',
        display: 'flex', flexDirection: 'column', gap: '24px',
        background: 'rgba(255,255,255,0.03)', padding: '24px',
        borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ color: '#FF3B30', marginTop: '6px' }}><Icons.Success /></div>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.8px' }}>
              Creative Studio
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', lineHeight: 1.5 }}>
              {data.product 
                ? `Préparez le lancement de ${data.product.name}`
                : "Générez un visuel premium prêt pour vos réseaux sociaux."
              }
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#FF3B30' }}>
            Choisir un thème
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeThemes.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                disabled={(t === 'LAST_CHANCE' && !data.lowStockProduct) || (t === 'PRODUCT_PROMO' && !data.product?.oldPrice)}
                style={{
                  width: '100%', padding: '18px', borderRadius: '16px',
                  background: theme === t ? '#fff' : 'rgba(255,255,255,0.05)',
                  color: theme === t ? '#000' : '#fff',
                  border: theme === t ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.25s',
                  opacity: ((t === 'LAST_CHANCE' && !data.lowStockProduct) || (t === 'PRODUCT_PROMO' && !data.product?.oldPrice)) ? 0.3 : 1,
                  display: 'flex', alignItems: 'center', gap: '14px'
                }}
              >
                {t === 'OVERVIEW' && <><Icons.Overview /> Bilan Global</>}
                {t === 'SOLD_OUT' && <><Icons.SoldOut /> Rupture de Stock</>}
                {t === 'TOP_SELLER' && <><Icons.TopSeller /> Champion des Ventes</>}
                {t === 'LAST_CHANCE' && <><Icons.LastChance /> Dernière Chance</>}
                {t === 'PRODUCT_LAUNCH' && <><Icons.Rocket /> Nouveau Drop</>}
                {t === 'PRODUCT_RESTOCK' && <><Icons.LastChance /> Réassort</>}
                {t === 'PRODUCT_PROMO' && <><Icons.Tag /> Promotion</>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#FF3B30' }}>
            Style & ADN
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={() => setVariant('RED')}
              style={{
                padding: '14px', borderRadius: '12px',
                background: variant === 'RED' ? '#FF3B30' : 'rgba(255,255,255,0.05)',
                color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700
              }}
            >
              🔥 Red Zone
            </button>
            <button
              onClick={() => setVariant('BLACK')}
              style={{
                padding: '14px', borderRadius: '12px',
                background: variant === 'BLACK' ? '#fff' : 'rgba(255,255,255,0.05)',
                color: variant === 'BLACK' ? '#000' : '#fff', 
                border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700
              }}
            >
              💎 Luxe Dark
            </button>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <button
            onClick={handleExport}
            disabled={isGenerating}
            style={{
              width: '100%', padding: '20px', borderRadius: '18px',
              background: '#FF3B30', color: 'white', border: 'none',
              fontSize: '16px', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(255,59,48,0.3)',
              opacity: isGenerating ? 0.7 : 1, transition: 'transform 0.1s'
            }}
          >
            {isGenerating ? 'Calcul du rendu...' : 'Exporter la Story'}
          </button>
          <button onClick={onClose} style={{
            width: '100%', padding: '16px', borderRadius: '18px',
            background: 'transparent', color: 'rgba(255,255,255,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer'
          }}>
            Annuler
          </button>
        </div>
      </div>

      {/* Preview Area with Scale */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', minHeight: window.innerWidth < 1100 ? '600px' : 'auto'
      }}>
        <div style={{
          width: 1080 * scale,
          height: 1920 * scale,
          position: 'relative',
          boxShadow: '0 50px 100px rgba(0,0,0,0.5)',
          borderRadius: 40 * scale,
          overflow: 'hidden',
          flexShrink: 0,
          border: `${10 * scale}px solid #000`
        }}>
          <div style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: 1080,
            height: 1920,
            position: 'absolute',
            top: 0,
            left: 0
          }}>
            <div ref={storyRef}>
              <StoryContent data={data} theme={theme} variant={variant} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        @keyframes pulse { 0% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 0.5; } }
      `}</style>
    </div>
  );
}

function StoryContent({ data, theme, variant }: { data: StoryData, theme: StoryTheme, variant: 'RED' | 'BLACK' }) {
  const isRed = variant === 'RED';
  const primaryColor = isRed ? '#FF3B30' : '#fff';
  const bgColor = isRed ? 'radial-gradient(circle at top right, #250505 0%, #000 70%)' : '#000';

  const fmt = (v: number) => new Intl.NumberFormat('fr-FR').format(v);
  
  // Decide current product for the layout
  const product = data.product;
  const globalProduct = theme === 'LAST_CHANCE' ? data.lowStockProduct : data.topProduct;
  
  // Final product to display (priority to specific product, then fallback to global)
  const displayProduct = product || globalProduct;

  const qrValue = product 
    ? `https://kollect.app/product/${product.slug}`
    : `https://kollect.app/brand/${data.brandSlug}`;

  return (
    <div style={{
      width: '1080px', height: '1920px', background: bgColor,
      fontFamily: 'Inter, sans-serif', color: 'white',
      padding: '100px 80px', display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden', boxSizing: 'border-box'
    }}>
      {/* Background patterns */}
      {isRed && (
        <>
          <div style={{ position: 'absolute', top: -150, right: -150, width: 800, height: 800, background: 'radial-gradient(circle, rgba(255,59,48,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: -100, left: -100, width: 500, height: 500, background: 'radial-gradient(circle, rgba(230,51,41,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '140px', position: 'relative', zIndex: 10 }}>
        <div>
          <p style={{ margin: 0, fontSize: '32px', color: primaryColor, fontWeight: 900, letterSpacing: '6px', textTransform: 'uppercase' }}>
            {data.brandName}
          </p>
          <div style={{ width: '50px', height: '5px', background: primaryColor, marginTop: '12px' }} />
        </div>
        <div style={{ opacity: 0.8 }}><Icons.Success /></div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
        {(() => {
          switch (theme) {
            case 'OVERVIEW':
              return <ThemeOverview data={data} primaryColor={primaryColor} isRed={isRed} />;
            case 'SOLD_OUT':
              return <ThemeSoldOut data={data} primaryColor={primaryColor} isRed={isRed} />;
            case 'PRODUCT_LAUNCH':
            case 'PRODUCT_RESTOCK':
            case 'TOP_SELLER':
            case 'LAST_CHANCE':
              return <ThemeProduct data={data} theme={theme} primaryColor={primaryColor} isRed={isRed} />;
            case 'PRODUCT_PROMO':
              return <ThemePromo data={data} primaryColor={primaryColor} isRed={isRed} />;
            default:
              return null;
          }
        })()}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '600px' }}>
          <p style={{ margin: 0, fontSize: '30px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>
            {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}
          </p>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 600, opacity: 0.6 }}>Official Partner</p>
          <p style={{ margin: 0, fontSize: '62px', fontWeight: 900, letterSpacing: '-3px', color: primaryColor }}>
            {data.brandName.toUpperCase()}
          </p>
        </div>
        <div style={{ padding: '28px', background: 'white', borderRadius: '36px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: isRed ? 'none' : '5px solid #fff' }}>
          <QRCodeSVG value={qrValue} size={180} />
        </div>
      </div>
    </div>
  );
}


