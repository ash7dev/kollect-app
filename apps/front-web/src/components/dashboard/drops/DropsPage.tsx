'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';
import { useCeoCollections } from '@/hooks/dashboard/useCeoCollections';
import { DashboardSidebar, type SidebarSection } from '@/components/dashboard/DashboardSidebar';
import type { CeoCollection, CollectionStatus } from '@/types/drops';
import { DropsWizardModal } from './DropsWizardModal';

// ─── Icons ─────────────────────────────────────────────────────────────────────

function Ic({ d, size = 16, stroke = 'currentColor', sw = 1.6 }: {
  d: string | string[]; size?: number; stroke?: string; sw?: number;
}) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

const ICONS = {
  plus: ['M12 5v14', 'M5 12h14'],
  drop: ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  eye: ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0'],
  rocket: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  clock: ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 6v6l4 2'],
  cube: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  play: 'M5 3l14 9-14 9V3z',
  check: 'M20 6L9 17l-5-5',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  image: ['M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h4l2 3h3a2 2 0 0 1 2 2z', 'M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0'],
  video: ['M23 7l-7 5 7 5V7z', 'M1 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5z'],
  arrow_right: 'M5 12h14M12 5l7 7-7 7',
  layers: ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getStatusMeta(status: CollectionStatus) {
  switch (status) {
    case 'TEASER':     return { label: 'Teaser',      color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',    border: 'rgba(245,158,11,0.25)' };
    case 'DISPONIBLE': return { label: 'Live',         color: '#10B981', bg: 'rgba(16,185,129,0.12)',   border: 'rgba(16,185,129,0.25)' };
    case 'EPUISEE':    return { label: 'Épuisée',      color: '#EF4444', bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.25)' };
    case 'TERMINE':    return { label: 'Terminée',     color: 'rgba(0,0,0,0.4)', bg: 'rgba(0,0,0,0.06)', border: 'rgba(0,0,0,0.12)' };
    default:           return { label: 'Brouillon',   color: 'rgba(0,0,0,0.4)', bg: 'rgba(0,0,0,0.05)', border: 'rgba(0,0,0,0.1)' };
  }
}

function calcCountdown(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Loader Placeholder ────────────────────────────────────────────────────────

function FullPageSpinner({ message }: { message: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#F7F8FA 0%,#F0F1F4 100%)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2.5px solid rgba(0,0,0,0.06)', borderTopColor: '#FF3B30', animation: 'dp-spin 0.8s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ color: 'rgba(0,0,0,0.38)', fontSize: 13, margin: 0, fontWeight: 500 }}>{message}</p>
      </div>
      <style>{`@keyframes dp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="dp-card dp-skeleton-card">
      <div className="dp-card-img dp-shimmer" />
      <div className="dp-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="dp-shimmer" style={{ height: 14, width: '55%', borderRadius: 6 }} />
          <div className="dp-shimmer" style={{ height: 22, width: 64, borderRadius: 99 }} />
        </div>
        <div className="dp-shimmer" style={{ height: 12, width: '80%', borderRadius: 6, marginBottom: 8 }} />
        <div className="dp-shimmer" style={{ height: 12, width: '40%', borderRadius: 6, marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="dp-shimmer" style={{ height: 32, flex: 1, borderRadius: 9 }} />
          <div className="dp-shimmer" style={{ height: 32, width: 36, borderRadius: 9 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Status Pill ───────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: CollectionStatus }) {
  const m = getStatusMeta(status);
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.3px',
      padding: '4px 9px', borderRadius: 99,
      color: m.color, background: m.bg, border: `1px solid ${m.border}`,
    }}>
      {m.label}
    </span>
  );
}

// ─── Live Countdown ────────────────────────────────────────────────────────────

function CountdownBadge({ target }: { target: string }) {
  const [cd, setCd] = useState(() => calcCountdown(target));
  useEffect(() => {
    const t = setInterval(() => setCd(calcCountdown(target)), 1000);
    return () => clearInterval(t);
  }, [target]);
  if (!cd) return null;
  const parts = cd.d > 0
    ? [`${cd.d}j`, `${cd.h}h`, `${cd.m}m`]
    : cd.h > 0
      ? [`${cd.h}h`, `${cd.m}m`, `${cd.s}s`]
      : [`${cd.m}m`, `${cd.s}s`];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Ic d={ICONS.clock} size={12} stroke="#F59E0B" />
      <div style={{ display: 'flex', gap: 4 }}>
        {parts.map((p, i) => (
          <span key={i} style={{
            fontSize: 11, fontWeight: 800,
            background: 'rgba(245,158,11,0.12)', color: '#B45309',
            padding: '2px 6px', borderRadius: 6, letterSpacing: '0.2px',
          }}>{p}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Drop Card ─────────────────────────────────────────────────────────────────

function DropCard({ item, onNewDrop }: { item: CeoCollection; onNewDrop?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const meta = getStatusMeta(item.status);
  const isVideo = !!item.teaserVideo;
  const hasMedia = isVideo || !!item.coverImage;
  const productCount = item._count?.products ?? 0;

  return (
    <article className="dp-card">
      {/* Media area */}
      <div className="dp-card-img" style={{ position: 'relative', overflow: 'hidden', background: '#0A0A0A' }}>
        {isVideo ? (
          <>
            <video
              ref={videoRef}
              src={item.teaserVideo!}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }}
              muted playsInline preload="metadata"
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Ic d={ICONS.video} size={16} stroke="#fff" sw={1.8} />
              </div>
            </div>
          </>
        ) : item.coverImage ? (
          <img src={item.coverImage} alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <Ic d={ICONS.drop} size={32} stroke="rgba(255,255,255,0.2)" sw={1.2} />
            <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Aucun média
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 55%)',
        }} />

        {/* Featured badge */}
        {item.isFeatured && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 8,
            background: 'rgba(255,59,48,0.92)', backdropFilter: 'blur(8px)',
          }}>
            <Ic d={ICONS.star} size={10} stroke="#fff" sw={2} />
            <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '0.3px' }}>Featured</span>
          </div>
        )}

        {/* Status pill in image */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <StatusPill status={item.status} />
        </div>

        {/* Collection name on image */}
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.25, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            {item.name}
          </div>
          {item.status === 'TEASER' && item.launchDate && (
            <div style={{ marginTop: 6 }}>
              <CountdownBadge target={item.launchDate} />
            </div>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="dp-card-body">
        {item.description && (
          <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'rgba(0,0,0,0.5)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {item.description}
          </p>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Ic d={ICONS.cube} size={13} stroke="rgba(0,0,0,0.35)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.5)' }}>
              {productCount} produit{productCount !== 1 ? 's' : ''}
            </span>
          </div>
          {item.launchDate && item.status !== 'TEASER' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Ic d={ICONS.clock} size={13} stroke="rgba(0,0,0,0.35)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.5)' }}>
                {fmtDate(item.launchDate)}
              </span>
            </div>
          )}
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', gap: 8 }}>
          {item.status === 'TEASER' ? (
            <button type="button" className="dp-action-primary" style={{ flex: 1 }}>
              <Ic d={ICONS.rocket} size={13} stroke="#fff" sw={2} />
              Lancer le drop
            </button>
          ) : item.status === 'DISPONIBLE' ? (
            <button type="button" className="dp-action-success" style={{ flex: 1 }}>
              <Ic d={ICONS.check} size={13} stroke="#fff" sw={2.5} />
              Actif
            </button>
          ) : (
            <button type="button" className="dp-action-ghost" style={{ flex: 1 }}>
              <Ic d={ICONS.eye} size={13} stroke="rgba(0,0,0,0.5)" />
              Voir les détails
            </button>
          )}
          <button type="button" className="dp-icon-btn" title="Voir">
            <Ic d={ICONS.arrow_right} size={14} stroke="rgba(0,0,0,0.5)" />
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onNewDrop }: { onNewDrop: () => void }) {
  return (
    <div style={{
      gridColumn: '1/-1',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: 88, height: 88, borderRadius: 26,
        background: 'linear-gradient(135deg, rgba(255,59,48,0.06), rgba(255,59,48,0.12))',
        border: '1px solid rgba(255,59,48,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24, boxShadow: '0 16px 40px rgba(255,59,48,0.08)',
      }}>
        <Ic d={ICONS.drop} size={36} stroke="rgba(255,59,48,0.5)" sw={1.2} />
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>
        Aucun drop pour l&apos;instant
      </h3>
      <p style={{ margin: '0 0 28px', fontSize: 14, color: 'rgba(0,0,0,0.45)', maxWidth: 320, lineHeight: 1.6 }}>
        Crée ton premier drop pour générer du hype autour de ta marque.
      </p>
      <button type="button" className="dp-fab-btn" onClick={onNewDrop}>
        <Ic d={ICONS.plus} size={14} stroke="#fff" sw={2.5} />
        Créer un drop
      </button>
    </div>
  );
}

// ─── KPI Chip ──────────────────────────────────────────────────────────────────

function KpiChip({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 13px', borderRadius: 12,
      background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)',
    }}>
      <span style={{ fontSize: 18, fontWeight: 900, color, letterSpacing: '-0.5px' }}>{value}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.1px' }}>{label}</span>
    </div>
  );
}

// ─── TABS ──────────────────────────────────────────────────────────────────────

type TabId = 'all' | CollectionStatus;
const TABS: { id: TabId; label: string }[] = [
  { id: 'all',         label: 'Toutes' },
  { id: 'TEASER',      label: 'Teaser' },
  { id: 'DISPONIBLE',  label: 'Live' },
  { id: 'TERMINE',     label: 'Terminées' },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function DropsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startNew = searchParams.get('new') === '1';

  const { user, isLoading } = useAuth();
  const { checking } = useOnboardingGuard();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const collectionsQuery = useCeoCollections();
  const collections = useMemo(() => collectionsQuery.data?.data ?? [], [collectionsQuery.data]);

  const filtered = useMemo(() =>
    activeTab === 'all' ? collections : collections.filter(c => c.status === activeTab),
  [collections, activeTab]);

  const kpis = useMemo(() => ({
    total: collections.length,
    live: collections.filter(c => c.status === 'DISPONIBLE').length,
    teaser: collections.filter(c => c.status === 'TEASER').length,
  }), [collections]);

  useEffect(() => { if (startNew) setWizardOpen(true); }, [startNew]);

  // Animate tab indicator
  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    const activeEl = container.querySelector<HTMLButtonElement>('[data-active="true"]');
    if (!activeEl) return;
    const cr = container.getBoundingClientRect();
    const ar = activeEl.getBoundingClientRect();
    setIndicatorStyle({ left: ar.left - cr.left, width: ar.width });
  }, [activeTab]);

  if (checking || isLoading) return <FullPageSpinner message="Chargement du dashboard..." />;
  if (!user?.isCEO) return <FullPageSpinner message="Accès réservé aux comptes CEO." />;

  const isLoading_ = collectionsQuery.isLoading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .dp-layout {
          min-height: 100vh;
          display: grid;
          background:
            radial-gradient(ellipse 70% 40% at 80% -5%, rgba(255,59,48,0.05) 0%, transparent 60%),
            linear-gradient(180deg, #F5F6F8 0%, #ECEEF1 100%);
          transition: grid-template-columns 0.22s cubic-bezier(0.4,0,0.2,1);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .dp-main { padding: 22px 28px; min-width: 0; }

        /* ─── Header ─── */
        .dp-header {
          position: sticky; top: 0; z-index: 50;
          margin-bottom: 24px;
          padding: 13px 18px;
          border-radius: 18px;
          background: rgba(255,255,255,0.84);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 6px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9);
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .dp-header-left { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .dp-header-title { margin: 0; font-size: 17px; font-weight: 900; color: #0A0A0A; letter-spacing: -0.5px; }
        .dp-header-sub { margin: 0; font-size: 12px; color: rgba(0,0,0,0.4); font-weight: 500; }
        .dp-header-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

        /* ─── KPI chips ─── */
        .dp-kpi-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 22px; }

        /* ─── Tabs ─── */
        .dp-tabs-wrap {
          margin-bottom: 22px;
          padding: 4px 4px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 13px;
          display: inline-flex;
          position: relative;
          gap: 2px;
        }
        .dp-tab-indicator {
          position: absolute;
          top: 4px; bottom: 4px;
          border-radius: 9px;
          background: #fff;
          box-shadow: 0 1px 6px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.06);
          transition: left 0.22s cubic-bezier(0.4,0,0.2,1), width 0.22s cubic-bezier(0.4,0,0.2,1);
          pointer-events: none;
        }
        .dp-tab {
          position: relative; z-index: 1;
          padding: 7px 16px; border: none; background: transparent; cursor: pointer;
          font-size: 13px; font-weight: 600; border-radius: 9px; color: rgba(0,0,0,0.45);
          transition: color 0.18s; white-space: nowrap; font-family: inherit;
        }
        .dp-tab[data-active="true"] { color: #111; font-weight: 700; }
        .dp-tab-badge {
          display: inline-flex; align-items: center; justify-content: center;
          margin-left: 5px; width: 18px; height: 18px; border-radius: 99px;
          background: rgba(0,0,0,0.06); color: rgba(0,0,0,0.4);
          font-size: 10px; font-weight: 800;
        }
        .dp-tab[data-active="true"] .dp-tab-badge {
          background: rgba(255,59,48,0.1); color: #FF3B30;
        }

        /* ─── Cards grid ─── */
        .dp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 18px;
        }
        @media (min-width: 1400px) { .dp-grid { grid-template-columns: repeat(3, 1fr); } }


        /* ─── Card ─── */
        .dp-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 8px 28px rgba(0,0,0,0.06);
          transition: transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .dp-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.1);
        }
        .dp-card-img {
          width: 100%; height: 220px;
          background: #f5f5f5;
        }
        .dp-card-body { padding: 16px; }

        /* ─── Skeleton ─── */
        .dp-skeleton-card .dp-card-img { height: 220px; }
        @keyframes dp-shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .dp-shimmer {
          background: linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.08) 37%, rgba(0,0,0,0.05) 63%);
          background-size: 800px 100%;
          animation: dp-shimmer 1.4s infinite;
          border-radius: 8px;
        }

        /* ─── Buttons ─── */
        .dp-new-btn {
          display: inline-flex; align-items: center; gap: 7px;
          height: 36px; padding: 0 16px; border: none; border-radius: 11px;
          background: linear-gradient(135deg, #FF3B30 0%, #E0321F 100%);
          color: #fff; font-size: 13px; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 16px rgba(255,59,48,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
          transition: transform 0.12s, box-shadow 0.15s; letter-spacing: -0.1px; font-family: inherit;
        }
        .dp-new-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(255,59,48,0.35), inset 0 1px 0 rgba(255,255,255,0.15); }
        .dp-new-btn:active { transform: scale(0.98); }

        .dp-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          height: 36px; padding: 0 14px; border: 1px solid rgba(0,0,0,0.1);
          border-radius: 11px; background: rgba(255,255,255,0.8);
          color: rgba(0,0,0,0.65); font-size: 13px; font-weight: 600; cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s; font-family: inherit;
        }
        .dp-back-btn:hover { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

        .dp-action-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          padding: 8px 14px; border: none; border-radius: 10px; cursor: pointer;
          background: linear-gradient(135deg, #FF3B30 0%, #E0321F 100%);
          color: #fff; font-size: 12.5px; font-weight: 700;
          box-shadow: 0 4px 14px rgba(255,59,48,0.28);
          transition: transform 0.12s, box-shadow 0.15s; font-family: inherit;
        }
        .dp-action-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(255,59,48,0.35); }

        .dp-action-success {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          padding: 8px 14px; border: 1px solid rgba(16,185,129,0.3); border-radius: 10px; cursor: pointer;
          background: rgba(16,185,129,0.08); color: #047857;
          font-size: 12.5px; font-weight: 700; font-family: inherit;
        }

        .dp-action-ghost {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          padding: 8px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; cursor: pointer;
          background: rgba(0,0,0,0.03); color: rgba(0,0,0,0.6);
          font-size: 12.5px; font-weight: 600; font-family: inherit;
          transition: background 0.15s;
        }
        .dp-action-ghost:hover { background: rgba(0,0,0,0.06); }

        .dp-icon-btn {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          border: 1px solid rgba(0,0,0,0.1); background: rgba(0,0,0,0.03);
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: background 0.15s;
        }
        .dp-icon-btn:hover { background: rgba(0,0,0,0.07); }

        /* ─── FAB ─── */
        .dp-fab {
          position: fixed; bottom: 28px; right: 28px; z-index: 100;
        }
        .dp-fab-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 0 22px; height: 48px; border: none; border-radius: 24px;
          background: linear-gradient(135deg, #FF3B30 0%, #D93025 100%);
          color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
          box-shadow: 0 6px 24px rgba(255,59,48,0.38), 0 2px 8px rgba(0,0,0,0.15);
          transition: transform 0.15s, box-shadow 0.15s; letter-spacing: -0.1px; font-family: inherit;
        }
        .dp-fab-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(255,59,48,0.45), 0 4px 12px rgba(0,0,0,0.18); }
        .dp-fab-btn:active { transform: scale(0.97); }

        @keyframes dp-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="dp-layout" style={{ gridTemplateColumns: `${sidebarCollapsed ? 68 : 256}px 1fr` }}>
        <DashboardSidebar
          brandName={user.brand?.name}
          userInitials={(user.firstName?.[0] ?? user.email?.[0] ?? 'C').toUpperCase()}
          userEmail={user.email}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          active="drops"
          onNavigate={(section: SidebarSection) => {
            if (section === 'overview') router.push('/dashboard');
            else if (section === 'drops') router.push('/dashboard/drops');
            else router.push('/dashboard');
          }}
          notificationCount={0}
        />

        <main className="dp-main">
          {/* ── Header ── */}
          <header className="dp-header">
            <div className="dp-header-left">
              <h1 className="dp-header-title">Drops</h1>
              <p className="dp-header-sub">Crée et gère tes collections — teaser, lancement, produits</p>
            </div>
            <div className="dp-header-right">
              {!isLoading_ && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <KpiChip label="Total" value={kpis.total} color="#111" />
                  <KpiChip label="Live" value={kpis.live} color="#10B981" />
                  <KpiChip label="Teaser" value={kpis.teaser} color="#F59E0B" />
                </div>
              )}
              <button type="button" className="dp-back-btn" onClick={() => router.push('/dashboard')}>
                Dashboard
              </button>
              <button type="button" className="dp-new-btn" onClick={() => setWizardOpen(true)}>
                <Ic d={ICONS.plus} size={13} stroke="#fff" sw={2.5} />
                Nouveau drop
              </button>
            </div>
          </header>

          {/* ── Tabs ── */}
          {!isLoading_ && (
            <div ref={tabsRef} className="dp-tabs-wrap">
              <div className="dp-tab-indicator" style={{ left: indicatorStyle.left, width: indicatorStyle.width }} />
              {TABS.map(tab => {
                const count = tab.id === 'all' ? collections.length : collections.filter(c => c.status === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className="dp-tab"
                    data-active={activeTab === tab.id ? 'true' : 'false'}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                    {count > 0 && <span className="dp-tab-badge">{count}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Cards Grid ── */}
          <div className="dp-grid">
            {isLoading_ ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filtered.length === 0 ? (
              <EmptyState onNewDrop={() => setWizardOpen(true)} />
            ) : (
              filtered.map(item => <DropCard key={item.id} item={item} onNewDrop={() => setWizardOpen(true)} />)
            )}
          </div>

          {/* ── FAB ── */}
          {!isLoading_ && filtered.length > 0 && (
            <div className="dp-fab">
              <button type="button" className="dp-fab-btn" onClick={() => setWizardOpen(true)}>
                <Ic d={ICONS.plus} size={15} stroke="#fff" sw={2.5} />
                Nouveau drop
              </button>
            </div>
          )}
        </main>
      </div>

      <DropsWizardModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreated={() => {
          setWizardOpen(false);
          collectionsQuery.refetch();
        }}
      />
    </>
  );
}
