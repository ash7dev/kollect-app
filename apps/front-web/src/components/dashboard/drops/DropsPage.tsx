/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';
import { useCeoCollections } from '@/hooks/dashboard/useCeoCollections';
import { DashboardSidebar, type SidebarSection } from '@/components/dashboard/DashboardSidebar';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { CeoStatCard } from '../CeoStatCard';
import type { CeoCollection, CollectionStatus } from '@/types/drops';
import {
  DropIcon as Ic,
  DROP_ICONS as ICONS,
  DROP_COLORS,
  getDropStatusMeta,
  formatDropDate as fmtDate,
} from './drop-shared';


// ─── Helpers ─────────────────────────────────────────────────────────────────────

function calcCountdown(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}


// ─── Full Page Spinner ────────────────────────────────────────────────────────

function FullPageSpinner({ message }: { message: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#FAFAFA' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, margin: '0 auto 16px',
          border: '2px solid #F0F0F0', borderTopColor: '#E63329',
          borderRadius: '50%', animation: 'dp-spin 0.75s linear infinite',
        }} />
        <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0, fontFamily: 'inherit', fontWeight: 500, letterSpacing: '0.02em' }}>{message}</p>
      </div>
      <style>{`@keyframes dp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="dp-card" style={{ overflow: 'hidden' }}>
      <div style={{ height: 240, background: '#0A0A0A' }} />
      <div style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="dp-shimmer" style={{ height: 13, width: '50%', borderRadius: 4 }} />
          <div className="dp-shimmer" style={{ height: 22, width: 58, borderRadius: 99 }} />
        </div>
        <div className="dp-shimmer" style={{ height: 11, width: '85%', borderRadius: 4, marginBottom: 7 }} />
        <div className="dp-shimmer" style={{ height: 11, width: '60%', borderRadius: 4, marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="dp-shimmer" style={{ height: 38, flex: 1, borderRadius: 10 }} />
          <div className="dp-shimmer" style={{ height: 38, width: 38, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Status Pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: CollectionStatus }) {
  const m = getDropStatusMeta(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.5px',
      padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase',
      color: m.color, background: m.bg, fontFamily: 'inherit',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function CountdownBadge({ target }: { target: string }) {
  const [cd, setCd] = useState(() => calcCountdown(target));
  useEffect(() => {
    const t = setInterval(() => setCd(calcCountdown(target)), 1000);
    return () => clearInterval(t);
  }, [target]);
  if (!cd) return null;
  const parts = cd.d > 0
    ? [`${cd.d}j`, `${cd.h}h`, `${cd.m}m`]
    : cd.h > 0 ? [`${cd.h}h`, `${cd.m}m`, `${cd.s}s`]
    : [`${cd.m}m`, `${cd.s}s`];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Ic d={ICONS.clock} size={11} stroke="rgba(255,255,255,0.7)" />
      <div style={{ display: 'flex', gap: 3 }}>
        {parts.map((p, i) => (
          <span key={i} style={{
            fontSize: 11, fontWeight: 800, fontFamily: 'inherit',
            background: 'rgba(255,255,255,0.15)', color: '#FFF',
            padding: '2px 6px', borderRadius: 4, letterSpacing: '0.5px',
          }}>{p}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Drop Card ────────────────────────────────────────────────────────────────

function DropCard({ item, onLaunch, onView, index }: {
  item: CeoCollection;
  onLaunch?: (id: string) => void;
  onView?: (id: string) => void;
  index: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const meta = getDropStatusMeta(item.status);
  const isVideo = !!item.teaserVideo;
  const productCount = item._count?.products ?? 0;

  return (
    <article
      className="dp-card"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* ── Media zone — always dark ── */}
      <div className="dp-card-media">
        {isVideo ? (
          <video
            ref={videoRef}
            src={item.teaserVideo!}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            muted playsInline preload="metadata"
          />
        ) : item.coverImage ? (
          <img src={item.coverImage} alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="dp-card-media-empty">
            <Ic d={ICONS.drop} size={40} stroke="rgba(255,255,255,0.12)" sw={1} />
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.15)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 10 }}>
              No media
            </span>
          </div>
        )}

        {/* Gradient scrim */}
        <div className="dp-card-media-scrim" />

        {/* Featured ribbon */}
        {item.isFeatured && (
          <div className="dp-featured-badge">
            <Ic d={ICONS.star} size={9} stroke="#fff" sw={2.5} />
            <span>Featured</span>
          </div>
        )}

        {/* Status top-right */}
        <div style={{ position: 'absolute', top: 14, right: 14 }}>
          <StatusPill status={item.status} />
        </div>

        {/* Title + countdown at bottom of image */}
        <div className="dp-card-media-footer">
          <h3 className="dp-card-title">{item.name}</h3>
          {item.status === 'TEASER' && item.launchDate && (
            <div style={{ marginTop: 8 }}>
              <CountdownBadge target={item.launchDate} />
            </div>
          )}
        </div>
      </div>

      {/* ── Card body — white ── */}
      <div className="dp-card-body">
        {item.description && (
          <p className="dp-card-desc">{item.description}</p>
        )}

        {/* Meta row */}
        <div className="dp-card-meta">
          <span className="dp-meta-chip">
            <Ic d={ICONS.cube} size={11} stroke="#9CA3AF" />
            {productCount} produit{productCount !== 1 ? 's' : ''}
          </span>
          {item.launchDate && item.status !== 'TEASER' && (
            <span className="dp-meta-chip">
              <Ic d={ICONS.clock} size={11} stroke="#9CA3AF" />
              {fmtDate(item.launchDate)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="dp-card-actions">
          {item.status === 'TEASER' ? (
            <button type="button" className="dp-btn-primary" style={{ flex: 1 }}
              onClick={() => onLaunch?.(item.id)}>
              <Ic d={ICONS.rocket} size={12} stroke="#fff" sw={2} />
              Lancer le drop
            </button>
          ) : item.status === 'DISPONIBLE' ? (
            <button type="button" className="dp-btn-live" style={{ flex: 1 }}
              onClick={() => onView?.(item.id)}>
              <span className="dp-live-dot" />
              Actif
            </button>
          ) : (
            <button type="button" className="dp-btn-ghost" style={{ flex: 1 }}
              onClick={() => onView?.(item.id)}>
              <Ic d={ICONS.eye} size={12} stroke="currentColor" />
              Voir les détails
            </button>
          )}
          <button type="button" className="dp-btn-icon" onClick={() => onView?.(item.id)}>
            <Ic d={ICONS.arrowDiag} size={13} stroke="currentColor" />
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onNewDrop }: { onNewDrop: () => void }) {
  return (
    <div style={{
      gridColumn: '1/-1',
      padding: '100px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    }}>
      {/* Large editorial illustration block */}
      <div style={{
        width: 120, height: 120, borderRadius: 32,
        background: '#0A0A0A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 32,
        boxShadow: '0 32px 64px rgba(0,0,0,0.18)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 30% 30%, rgba(230,51,41,0.3) 0%, transparent 60%)',
        }} />
        <Ic d={ICONS.drop} size={44} stroke="rgba(255,255,255,0.6)" sw={1} />
      </div>

      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '3px',
        color: '#E63329', textTransform: 'uppercase',
        marginBottom: 14, fontFamily: 'inherit',
      }}>
        Aucune collection
      </div>

      <h3 style={{
        margin: '0 0 12px',
        fontFamily: 'inherit',
        fontSize: 30, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.5px',
        lineHeight: 1.2,
      }}>
        Ton premier drop t&apos;attend
      </h3>

      <p style={{
        margin: '0 0 36px', fontSize: 14.5,
        color: '#9CA3AF', maxWidth: 300, lineHeight: 1.65,
        fontFamily: 'inherit',
      }}>
        Crée une collection, génère du hype, et lance ton drop quand tu es prêt.
      </p>

      <button type="button" className="dp-btn-primary dp-btn-large" onClick={onNewDrop}>
        <Ic d={ICONS.plus} size={15} stroke="#fff" sw={2.5} />
        Créer un drop
      </button>
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

type TabId = 'all' | CollectionStatus;
const TABS: { id: TabId; label: string }[] = [
  { id: 'all',        label: 'Toutes' },
  { id: 'TEASER',     label: 'Teaser' },
  { id: 'DISPONIBLE', label: 'Live' },
  { id: 'TERMINE',    label: 'Terminées' },
];

// ─── Alert Banner ────────────────────────────────────────────────────────────

function AlertBanner({ urgentTeasers, kpis }: {
  urgentTeasers: CeoCollection[];
  kpis: { total: number; live: number; teaser: number };
}) {
  if (urgentTeasers.length > 0) {
    return (
      <div className="dp-alert dp-alert-urgent">
        <div className="dp-alert-icon" style={{ background: '#0A0A0A' }}>
          <Ic d={ICONS.clock} size={16} stroke="#F59E0B" />
        </div>
        <div>
          <div className="dp-alert-title">
            {urgentTeasers.length === 1
              ? `"${urgentTeasers[0].name}" lance dans moins de 48h`
              : `${urgentTeasers.length} teasers lancent bientôt`}
          </div>
          <div className="dp-alert-sub">Lance maintenant ou assure-toi que tout est prêt.</div>
        </div>
        <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', flexShrink: 0, animation: 'dp-pulse 1.5s ease-in-out infinite' }} />
      </div>
    );
  }
  if (kpis.live > 0) {
    return (
      <div className="dp-context-block">
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#10B981', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
          {kpis.live} collection{kpis.live > 1 ? 's' : ''} en ligne
        </p>
        <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
          Ton catalogue est{' '}
          <span style={{ color: '#FF3B30' }}>vivant.</span>
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(0,0,0,0.45)', lineHeight: 1.6, maxWidth: 520 }}>
          Chaque collection active est une vitrine ouverte — continue à créer pour garder ta communauté engagée et faire revenir les acheteurs.
        </p>
      </div>
    );
  }
  if (kpis.teaser > 0) {
    return (
      <div className="dp-alert dp-alert-default">
        <div className="dp-alert-icon" style={{ background: '#0A0A0A' }}>
          <Ic d={ICONS.rocket} size={16} stroke="#E63329" />
        </div>
        <div>
          <div className="dp-alert-title">{kpis.teaser} collection{kpis.teaser > 1 ? 's' : ''} en mode teaser</div>
          <div className="dp-alert-sub">Ta communauté attend — lance-les quand tu es prêt.</div>
        </div>
      </div>
    );
  }
  return null;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DropsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { checking } = useOnboardingGuard();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const collectionsQuery = useCeoCollections();
  const collections = useMemo(() => collectionsQuery.data?.data ?? [], [collectionsQuery.data]);

  const qc = useQueryClient();
  const launchMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(API_ENDPOINTS.COLLECTIONS.LAUNCH(id)),
    onMutate: () => toast.loading('Lancement en cours…', { id: 'launch' }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['dashboard', 'collections', 'ceo'] });
      toast.success('Collection lancée avec succès !', { id: 'launch' });
    },
    onError: () => toast.error('Erreur lors du lancement', { id: 'launch' }),
  });

  const handleLaunch = (id: string) => launchMutation.mutate(id);
  const handleView = (id: string) => router.push(`/dashboard/drops/${id}`);

  const urgentTeasers = useMemo(() =>
    collections.filter(c => {
      if (c.status !== 'TEASER' || !c.launchDate) return false;
      const diff = new Date(c.launchDate).getTime() - Date.now();
      return diff > 0 && diff < 48 * 3600 * 1000;
    }),
  [collections]);

  const filtered = useMemo(() => {
    const base = activeTab === 'all' ? collections : collections.filter(c => c.status === activeTab);
    return [...base].sort((a, b) => {
      const aU = urgentTeasers.some(u => u.id === a.id) ? -1 : 0;
      const bU = urgentTeasers.some(u => u.id === b.id) ? -1 : 0;
      return aU - bU;
    });
  }, [collections, activeTab, urgentTeasers]);

  const kpis = useMemo(() => ({
    total: collections.length,
    live: collections.filter(c => c.status === 'DISPONIBLE').length,
    teaser: collections.filter(c => c.status === 'TEASER').length,
  }), [collections]);

  // Tab indicator
  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    const activeEl = container.querySelector<HTMLButtonElement>('[data-active="true"]');
    if (!activeEl) return;
    const cr = container.getBoundingClientRect();
    const ar = activeEl.getBoundingClientRect();
    setIndicator({ left: ar.left - cr.left, width: ar.width });
  }, [activeTab, collectionsQuery.isLoading]);

  if (checking || isLoading) return <FullPageSpinner message="Chargement…" />;
  if (!user?.isCEO) return <FullPageSpinner message="Accès réservé aux comptes CEO." />;

  const isLoading_ = collectionsQuery.isLoading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Layout ── */
        .dp-layout {
          min-height: 100vh;
          display: grid;
          background: #FAFAFA;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          transition: grid-template-columns 0.22s cubic-bezier(0.4,0,0.2,1);
        }
        .dp-main {
          padding: 28px 32px 60px;
          min-width: 0;
          background: #FAFAFA;
        }

        /* ── Page header — editorial block ── */
        .dp-page-hero {
          margin-bottom: 32px;
          padding: 32px 36px;
          border-radius: 20px;
          background: #0A0A0A;
          position: relative;
          overflow: hidden;
        }
        .dp-page-hero::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(230,51,41,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .dp-page-hero::after {
          content: 'DROPS';
          position: absolute;
          right: 36px; bottom: -18px;
          font-family: inherit;
          font-size: 96px; font-weight: 900;
          color: rgba(255,255,255,0.03);
          letter-spacing: -4px;
          pointer-events: none;
          user-select: none;
          line-height: 1;
        }
        .dp-hero-label {
          font-size: 10px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase;
          color: #E63329; margin-bottom: 10px;
        }
        .dp-hero-title {
          font-family: inherit;
          font-size: 34px; font-weight: 800;
          color: #FFFFFF; letter-spacing: -0.8px;
          line-height: 1.1; margin-bottom: 8px;
        }
        .dp-hero-sub {
          font-size: 13px; color: rgba(255,255,255,0.4);
          font-weight: 400; letter-spacing: 0.1px;
        }
        .dp-hero-actions {
          display: flex; align-items: center; gap: 10px;
          margin-top: 28px;
        }

        /* ── KPI row ── */
        .dp-kpi-row {
          display: flex; gap: 12px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .dp-kpi-card {
          flex: 1; min-width: 100px;
          padding: 18px 20px;
          background: #fff;
          border: 1px solid #F0F0F0;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .dp-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }

        /* ── Tabs ── */
        .dp-tabs-row {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 20px; gap: 16px;
        }
        .dp-tabs-wrap {
          display: inline-flex;
          padding: 3px;
          background: #fff;
          border: 1px solid #EBEBEB;
          border-radius: 12px;
          position: relative;
          gap: 2px;
        }
        .dp-tab-indicator {
          position: absolute;
          top: 3px; bottom: 3px;
          border-radius: 9px;
          background: #0A0A0A;
          transition: left 0.22s cubic-bezier(0.4,0,0.2,1), width 0.22s cubic-bezier(0.4,0,0.2,1);
          pointer-events: none;
        }
        .dp-tab {
          position: relative; z-index: 1;
          padding: 8px 18px; border: none; background: transparent;
          cursor: pointer; font-family: inherit;
          font-size: 12.5px; font-weight: 600;
          color: #9CA3AF; border-radius: 9px;
          transition: color 0.15s; white-space: nowrap;
        }
        .dp-tab[data-active="true"] { color: #fff; }
        .dp-tab-count {
          display: inline-flex; align-items: center; justify-content: center;
          margin-left: 5px; min-width: 18px; height: 18px;
          padding: 0 5px; border-radius: 99px;
          font-size: 10px; font-weight: 800;
          background: rgba(0,0,0,0.06); color: #6B7280;
        }
        .dp-tab[data-active="true"] .dp-tab-count {
          background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.8);
        }
        .dp-tabs-count-label {
          font-size: 12px; color: #9CA3AF; font-weight: 500;
        }

        /* ── Context block (editorial, like wizard steps) ── */
        .dp-context-block {
          margin-bottom: 22px;
          padding: 20px 24px;
          border-radius: 16px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(0,0,0,0.06);
        }

        /* ── Alert banner ── */
        .dp-alert {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 18px; border-radius: 14px;
          margin-bottom: 22px;
          animation: dp-fadein 0.4s ease both;
        }
        .dp-alert-urgent {
          background: #FFFBEB;
          border: 1px solid #FDE68A;
        }
        .dp-alert-success {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
        }
        .dp-alert-default {
          background: #FFF5F5;
          border: 1px solid #FECACA;
        }
        .dp-alert-icon {
          width: 36px; height: 36px;
          border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .dp-alert-title {
          font-size: 13px; font-weight: 700; color: #111;
        }
        .dp-alert-sub {
          font-size: 11.5px; color: #9CA3AF; margin-top: 2px;
        }

        /* ── Cards Grid ── */
        .dp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
          gap: 20px;
        }
        @media (min-width: 1400px) {
          .dp-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* ── Card ── */
        .dp-card {
          background: #fff;
          border: 1px solid #F0F0F0;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05);
          transition: transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s cubic-bezier(0.4,0,0.2,1);
          animation: dp-cardrise 0.5s cubic-bezier(0.4,0,0.2,1) both;
          display: flex; flex-direction: column; height: 100%;
        }
        .dp-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.1);
        }

        .dp-card-media {
          width: 100%; height: 240px;
          background: #0A0A0A;
          position: relative; overflow: hidden;
        }
        .dp-card-media-empty {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%);
        }
        .dp-card-media-scrim {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 50%);
        }
        .dp-card-media-footer {
          position: absolute; bottom: 14px; left: 16px; right: 16px;
        }
        .dp-card-title {
          font-family: inherit;
          font-size: 17px; font-weight: 700;
          color: #fff; letter-spacing: -0.3px;
          line-height: 1.25;
          text-shadow: 0 1px 6px rgba(0,0,0,0.4);
        }
        .dp-featured-badge {
          position: absolute; top: 14px; left: 14px;
          display: flex; align-items: center; gap: 5px;
          padding: '4px 9px'; border-radius: 8px;
          background: #E63329;
          padding: 4px 9px;
        }
        .dp-featured-badge span {
          font-size: 10px; font-weight: 800; color: #fff; letter-spacing: '0.4px';
        }
        .dp-card-body {
          padding: 18px 20px 20px;
          display: flex; flex-direction: column; flex: 1;
        }
        .dp-card-desc {
          font-size: 12.5px; color: #9CA3AF;
          line-height: 1.55; margin-bottom: 14px;
          overflow: hidden; display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          min-height: 38px;
        }
        .dp-card-meta {
          display: flex; gap: 12px;
          margin-bottom: 16px; flex-wrap: wrap;
        }
        .dp-meta-chip {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11.5px; font-weight: 600; color: #9CA3AF;
        }
        .dp-card-actions {
          display: flex; gap: 8px;
          margin-top: auto;
        }

        /* ── Urgent card outline ── */
        .dp-card-urgent .dp-card {
          border-color: #FDE68A;
          box-shadow: 0 0 0 2px rgba(245,158,11,0.12), 0 8px 24px rgba(0,0,0,0.07);
        }

        /* ── Buttons ── */
        .dp-btn-hero {
          display: inline-flex; align-items: center; gap: 8px;
          height: 42px; padding: 0 22px; border: none; border-radius: 12px;
          background: #E63329; color: #fff;
          font-size: 13.5px; font-weight: 700;
          font-family: inherit; cursor: pointer;
          box-shadow: 0 4px 20px rgba(230,51,41,0.4);
          letter-spacing: -0.1px;
          transition: transform 0.12s, box-shadow 0.15s;
        }
        .dp-btn-hero:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(230,51,41,0.45);
        }
        .dp-btn-hero:active { transform: scale(0.98); }

        .dp-btn-hero-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          height: 42px; padding: 0 18px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.65);
          font-size: 13px; font-weight: 600;
          font-family: inherit; cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .dp-btn-hero-ghost:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.25);
        }

        .dp-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px 16px; border: none; border-radius: 10px; cursor: pointer;
          background: #0A0A0A; color: #fff;
          font-size: 12.5px; font-weight: 700;
          font-family: inherit;
          transition: background 0.15s, transform 0.12s;
          letter-spacing: -0.1px;
        }
        .dp-btn-primary:hover { background: #222; transform: translateY(-1px); }
        .dp-btn-primary:active { transform: scale(0.98); }
        .dp-btn-primary.dp-btn-large {
          height: 48px; padding: 0 28px; font-size: 14px;
          border-radius: 13px;
        }

        .dp-btn-live {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px 16px; border-radius: 10px; cursor: pointer;
          border: 1.5px solid #BBF7D0;
          background: #F0FDF4; color: #065F46;
          font-size: 12.5px; font-weight: 700;
          font-family: inherit;
        }
        .dp-live-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #10B981;
          animation: dp-pulse 1.5s ease-in-out infinite;
          flex-shrink: 0;
        }

        .dp-btn-ghost {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px 16px; border-radius: 10px; cursor: pointer;
          border: 1px solid #E5E7EB;
          background: #F9FAFB; color: #374151;
          font-size: 12.5px; font-weight: 600;
          font-family: inherit;
          transition: background 0.15s, border-color 0.15s;
        }
        .dp-btn-ghost:hover { background: #F3F4F6; border-color: #D1D5DB; }

        .dp-btn-icon {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          border: 1px solid #E5E7EB; background: #F9FAFB;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #6B7280;
          transition: background 0.15s, color 0.15s;
        }
        .dp-btn-icon:hover { background: #0A0A0A; color: #fff; border-color: #0A0A0A; }

        /* ── Skeleton ── */
        @keyframes dp-shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .dp-shimmer {
          background: linear-gradient(90deg, #F3F4F6 25%, #E9EAEC 50%, #F3F4F6 75%);
          background-size: 1200px 100%;
          animation: dp-shimmer 1.6s infinite;
        }

        /* ── Animations ── */
        @keyframes dp-spin { to { transform: rotate(360deg); } }
        @keyframes dp-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes dp-cardrise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dp-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }

        /* ── Divider ── */
        .dp-section-divider {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 20px;
        }
        .dp-section-divider-line {
          flex: 1; height: 1px; background: #F0F0F0;
        }
        .dp-section-divider-label {
          font-size: 10px; font-weight: 700; letter-spacing: 2px;
          color: #D1D5DB; text-transform: uppercase;
          font-family: inherit;
        }

        /* ── Mobile burger ── */
        .dp-mobile-burger {
          display: none;
          width: 38px; height: 38px;
          border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.12);
          align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.8);
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }
        .dp-mobile-burger:hover { background: rgba(255,255,255,0.2); color: #fff; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .dp-layout { grid-template-columns: 1fr !important; }
          .dp-main { padding: 0 14px 40px !important; }
          .dp-mobile-burger { display: flex !important; }
          .dp-page-hero { padding: 20px 18px; margin-bottom: 20px; }
          .dp-hero-title { font-size: 24px; }
          .dp-hero-actions { margin-top: 18px; gap: 8px; flex-wrap: wrap; }
          .dp-btn-hero { height: 38px; padding: 0 16px; font-size: 13px; }
          .dp-kpi-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .dp-kpi-card { padding: 14px 16px; min-width: 80px; }
          .dp-tabs-row { flex-wrap: wrap; gap: 10px; }
          .dp-tabs-wrap { overflow-x: auto; }
          .dp-grid { grid-template-columns: 1fr !important; gap: 14px; }
        }
        @media (max-width: 480px) {
          .dp-grid { grid-template-columns: 1fr !important; }
          .dp-hero-title { font-size: 20px; }
        }
      `}</style>

      <div
        className="dp-layout"
        style={{ gridTemplateColumns: `${sidebarCollapsed ? 68 : 256}px 1fr` }}
      >
        <DashboardSidebar
          brandName={user.brand?.name}
          userInitials={(user.firstName?.[0] ?? user.email?.[0] ?? 'C').toUpperCase()}
          userEmail={user.email}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          active="drops"
          onNavigate={(section: SidebarSection) => {
            if (section === 'overview')       router.push('/dashboard');
            else if (section === 'drops')     router.push('/dashboard/drops');
            else if (section === 'products')  router.push('/dashboard/produits');
            else router.push('/dashboard');
          }}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <main className="dp-main">

          {/* ── Hero Header ── */}
          <div className="dp-page-hero">
            <div className="dp-hero-label">Dashboard · Collections</div>
            <h1 className="dp-hero-title">Tes Drops</h1>
            <p className="dp-hero-sub">Crée, teaser, et lance tes collections — tout en un.</p>
            <div className="dp-hero-actions">
              <button
                type="button"
                className="dp-mobile-burger"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>
              <button type="button" className="dp-btn-hero"
                onClick={() => router.push('/dashboard/drops/new')}>
                <Ic d={ICONS.plus} size={14} stroke="#fff" sw={2.5} />
                Nouveau drop
              </button>
            </div>
          </div>

          {/* ── KPIs ── */}
          {!isLoading_ && kpis.total > 0 && (
            <div className="dp-kpi-row" style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
              <CeoStatCard 
                label="Total Collections" 
                value={kpis.total} 
                color="#0A0A0A"
                subLabel="Toute période confondue"
              />
              <CeoStatCard 
                label="Drops Actifs" 
                value={kpis.live} 
                color="#10B981"
                pulse={kpis.live > 0}
                subLabel="Actuellement en ligne"
              />
              <CeoStatCard 
                label="Teasers" 
                value={kpis.teaser} 
                color="#F59E0B"
                subLabel="Hype en cours"
              />
              <CeoStatCard 
                label="Total Produits" 
                value={collections.reduce((s, c) => s + (c._count?.products ?? 0), 0)}
                color="#E63329"
                subLabel="Stock global"
              />
            </div>
          )}

          {/* ── Alert ── */}
          {!isLoading_ && kpis.total > 0 && (
            <AlertBanner urgentTeasers={urgentTeasers} kpis={kpis} />
          )}

          {/* ── Tabs + count ── */}
          {!isLoading_ && (
            <div className="dp-tabs-row">
              <div ref={tabsRef} className="dp-tabs-wrap">
                <div
                  className="dp-tab-indicator"
                  style={{ left: indicator.left, width: indicator.width }}
                />
                {TABS.map(tab => {
                  const count =
                    tab.id === 'all'
                      ? collections.length
                      : collections.filter(c => c.status === tab.id).length;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      className="dp-tab"
                      data-active={activeTab === tab.id ? 'true' : 'false'}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                      {count > 0 && (
                        <span className="dp-tab-count">{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <span className="dp-tabs-count-label">
                {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* ── Section divider ── */}
          {!isLoading_ && filtered.length > 0 && (
            <div className="dp-section-divider">
              <div className="dp-section-divider-line" />
              <span className="dp-section-divider-label">Collections</span>
              <div className="dp-section-divider-line" />
            </div>
          )}

          {/* ── Grid ── */}
          <div className="dp-grid">
            {isLoading_ ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filtered.length === 0 ? (
              <EmptyState onNewDrop={() => router.push('/dashboard/drops/new')} />
            ) : (
              filtered.map((item, i) => (
                <div
                  key={item.id}
                  className={urgentTeasers.some(u => u.id === item.id) ? 'dp-card-urgent' : ''}
                  style={{ height: '100%' }}
                >
                  <DropCard item={item} onLaunch={handleLaunch} onView={handleView} index={i} />
                </div>
              ))
            )}
          </div>

        </main>
      </div>
    </>
  );
}