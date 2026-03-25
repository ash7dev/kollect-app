'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';
import { useCeoDashboardData } from '@/hooks/dashboard/useCeoDashboardData';
import { DashboardSidebar, type SidebarSection } from '@/components/dashboard/DashboardSidebar';
import { DashboardKpiCards, KpiIcons } from '@/components/dashboard/DashboardKpiCards';
import { DashboardRevenueChart } from '@/components/dashboard/DashboardRevenueChart';
import { DashboardOrdersDonut } from '@/components/dashboard/DashboardOrdersDonut';
import { DashboardTopProducts } from '@/components/dashboard/DashboardTopProducts';
import { DashboardRecentOrders } from '@/components/dashboard/DashboardRecentOrders';
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions';
import { DashboardStockAlert } from '@/components/dashboard/DashboardStockAlert';
import { DashboardAudienceCard } from '@/components/dashboard/DashboardAudienceCard';
import { DashboardGoalTracker } from '@/components/dashboard/DashboardGoalTracker';
import { DashboardActivityFeed, type ActivityEvent } from '@/components/dashboard/DashboardActivityFeed';

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatCfa(v: number) {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(v))} CFA`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function formatDate() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ─── Loading / Error states ───────────────────────────────────────────────────

function FullPageState({ message }: { message: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #F7F8FA 0%, #F0F1F4 100%)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid rgba(0,0,0,0.06)',
          borderTopColor: '#FF3B30',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
          boxShadow: '0 0 0 8px rgba(255,59,48,0.06)',
        }} />
        <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: 13, margin: 0, fontWeight: 500 }}>{message}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export function DashboardShell() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [query, setQuery] = useState('');
  const [activeSection, setActiveSection] = useState<SidebarSection>('overview');
  const { user, signOut, isLoading } = useAuth();
  const { checking } = useOnboardingGuard();
  const {
    period, setPeriod, isLoading: dashboardLoading, hasError,
    brand, stats, salesData, orderStats, recentOrders, topProducts,
    allProducts, productsLoading,
  } = useCeoDashboardData();

  const kpis = useMemo(() => {
    if (!stats || !orderStats) return [];
    return [
      {
        label: 'Chiffre d\'affaires',
        value: formatCfa(stats.totalRevenue),
        hint: 'vs mois dernier',
        trend: stats.revenueChange,
        variant: 'hero' as const,
        icon: KpiIcons.revenue('#FF3B30'),
      },
      {
        label: 'Commandes',
        value: String(stats.totalOrders),
        hint: `vs ${Math.round(stats.totalOrders / (1 + stats.ordersChange / 100))} mois dernier`,
        trend: stats.ordersChange,
        variant: 'standard' as const,
        icon: KpiIcons.orders('rgba(0,0,0,0.45)'),
      },
      {
        label: 'Produits actifs',
        value: String(stats.totalProducts),
        hint: `${stats.viewsThisPeriod} vues ce mois`,
        variant: 'standard' as const,
        icon: KpiIcons.products('rgba(0,0,0,0.45)'),
      },
      {
        label: 'Followers',
        value: String(stats.totalFollowers),
        hint: `${stats.followersChange >= 0 ? '+' : ''}${stats.followersChange}% ce mois`,
        trend: stats.followersChange,
        variant: 'standard' as const,
        icon: KpiIcons.clients('rgba(0,0,0,0.45)'),
      },
      {
        label: 'Conversion',
        value: `${stats.conversionRate.toFixed(1)}%`,
        hint: `objectif 5.0%`,
        trend: stats.conversionRate - 5,
        variant: 'accent' as const,
        icon: KpiIcons.conversion('rgba(255,255,255,0.9)'),
      },
    ];
  }, [stats, orderStats]);

  // Intersection observer pour sync sidebar active
  useEffect(() => {
    const sectionIds: SidebarSection[] = ['overview', 'orders', 'products'];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible?.target?.id as SidebarSection | undefined;
        if (id && sectionIds.includes(id)) setActiveSection(id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.15, 0.35, 0.6] },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Feed d'activité construit depuis les données existantes
  const activityEvents = useMemo((): ActivityEvent[] => {
    const events: ActivityEvent[] = [];
    recentOrders.forEach((o) => events.push({
      type: 'order',
      id: o.id,
      amount: o.total,
      client: o.client ? `${o.client.firstName ?? ''} ${o.client.lastName ?? ''}`.trim() || undefined : undefined,
      createdAt: o.createdAt,
    }));
    topProducts.forEach((p) => {
      if ((p.viewCount ?? 0) > 0) events.push({
        type: 'product', id: p.id, name: p.name, views: p.viewCount, createdAt: new Date().toISOString(),
      });
    });
    return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [recentOrders, topProducts]);

  const pendingCount = recentOrders.filter((o) => o.status === 'EN_ATTENTE').length;
  const firstName = user?.firstName || user?.email?.split('@')[0] || 'CEO';

  // ── Early returns (après tous les hooks) ───────────────────────────────────
  if (checking || isLoading) return <FullPageState message="Chargement du dashboard…" />;

  if (!user?.isCEO) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'linear-gradient(135deg, #F7F8FA 0%, #F0F1F4 100%)' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg, #fff0ef, #ffe4e3)', display: 'grid', placeItems: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(255,59,48,0.15)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 22, color: '#111', fontWeight: 800, letterSpacing: '-0.4px' }}>Accès restreint</h1>
          <p style={{ color: 'rgba(0,0,0,0.45)', margin: '0 0 24px', fontSize: 14 }}>Cette zone est réservée aux comptes CEO.</p>
          <button type="button" onClick={() => router.push('/')}
            style={{ border: 'none', background: 'linear-gradient(135deg, #111, #1a1a1a)', color: '#fff', padding: '11px 22px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', letterSpacing: '0.2px' }}>
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  if (hasError) return <FullPageState message="Impossible de charger les données." />;
  const filteredOrders = query.trim()
    ? recentOrders.filter((o) => (o.orderNumber ?? o.id).toLowerCase().includes(query.trim().toLowerCase()))
    : recentOrders;
  const filteredProducts = query.trim()
    ? topProducts.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    : topProducts;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }

        .dash-layout {
          min-height: 100vh;
          display: grid;
          background:
            radial-gradient(ellipse 80% 50% at 75% -10%, rgba(255,59,48,0.04) 0%, transparent 60%),
            linear-gradient(180deg, #F5F5F7 0%, #EBEBED 100%);
          transition: grid-template-columns 0.22s cubic-bezier(0.4,0,0.2,1);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ── Header ── */
        .dash-header {
          position: sticky;
          top: 0;
          z-index: 40;
          margin-bottom: 20px;
          border-radius: 16px;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow:
            0 1px 0 rgba(0,0,0,0.05),
            0 4px 24px rgba(0,0,0,0.06),
            inset 0 1px 0 rgba(255,255,255,0.9);
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* ── Search ── */
        .dash-search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 11px;
          padding: 0 12px;
          height: 36px;
          min-width: 220px;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        }
        .dash-search-wrap:focus-within {
          border-color: rgba(255,59,48,0.3);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(255,59,48,0.08);
        }
        .dash-search-input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 13px;
          color: #111;
          width: 100%;
          font-family: inherit;
        }
        .dash-search-input::placeholder { color: rgba(0,0,0,0.32); }

        /* ── Period pills ── */
        .dash-period-group {
          display: flex;
          gap: 2px;
          background: rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 11px;
          padding: 3px;
        }
        .dash-period-btn {
          padding: 5px 14px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: rgba(0,0,0,0.45);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, box-shadow 0.15s;
          font-family: inherit;
          letter-spacing: 0.1px;
        }
        .dash-period-btn.active {
          background: #FF3B30;
          color: #fff;
          box-shadow: 0 2px 8px rgba(255,59,48,0.28), 0 0 0 0.5px rgba(255,59,48,0.2);
        }

        /* ── Icon button ── */
        .dash-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(0,0,0,0.5);
          position: relative;
          transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.1s;
          flex-shrink: 0;
        }
        .dash-icon-btn:hover {
          background: #fff;
          color: #111;
          border-color: rgba(0,0,0,0.12);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }

        /* ── Avatar ── */
        .dash-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF3B30 0%, #E0321F 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.95);
          box-shadow: 0 2px 10px rgba(255,59,48,0.3);
          flex-shrink: 0;
          transition: transform 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }
        .dash-avatar:hover {
          transform: translateY(-1px) scale(1.04);
          box-shadow: 0 4px 16px rgba(255,59,48,0.35);
        }

        /* ── CTA ── */
        .dash-cta-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 16px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #111 0%, #1a1a1a 100%);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
          letter-spacing: 0.2px;
          font-family: inherit;
        }
        .dash-cta-btn:hover {
          background: linear-gradient(135deg, #1a1a1a 0%, #222 100%);
          box-shadow: 0 4px 18px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08);
          transform: translateY(-1px);
        }
        .dash-cta-btn:active { transform: scale(0.98); }

        /* ── Sections ── */
        .dash-section { margin-bottom: 16px; }

        .dash-grid-2-1 {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 14px;
        }
        .dash-grid-1-1 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .dash-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
        }

        @media (max-width: 1200px) {
          .dash-grid-3 { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 1100px) {
          .dash-grid-2-1, .dash-grid-1-1 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 860px) {
          .dash-grid-3 { grid-template-columns: 1fr !important; }
          .dash-header { flex-wrap: wrap; }
          .dash-search-wrap { min-width: 160px; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        className="dash-layout"
        style={{ gridTemplateColumns: `${sidebarCollapsed ? 68 : 256}px 1fr` }}
      >
        <DashboardSidebar
          brandName={brand?.name ?? user.brand?.name}
          userInitials={(user.firstName?.[0] ?? user.email?.[0] ?? 'C').toUpperCase()}
          userEmail={user.email}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          active={activeSection}
          onNavigate={(section) => {
            if (section === 'drops') {
              router.push('/dashboard/drops');
              return;
            }
            setActiveSection(section);
            document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          notificationCount={pendingCount}
        />

        <main style={{ padding: '20px 24px', minWidth: 0 }}>

          {/* ══ HEADER ══════════════════════════════════════════════════════ */}
          <header className="dash-header">

            {/* Left — greeting */}
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11.5, color: 'rgba(0,0,0,0.38)', fontWeight: 500, letterSpacing: '0.2px', textTransform: 'capitalize' }}>
                {formatDate()}
              </p>
              <h1 style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {getGreeting()}, {firstName} 👋
              </h1>
            </div>

            {/* Right — controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

              {/* Search */}
              <div className="dash-search-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, color: 'rgba(0,0,0,0.32)' }}>
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  className="dash-search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher…"
                  aria-label="Recherche globale dashboard"
                />
                <kbd style={{ fontSize: 10, color: 'rgba(0,0,0,0.28)', background: 'rgba(0,0,0,0.05)', borderRadius: 5, padding: '2px 5px', fontFamily: 'inherit', flexShrink: 0 }}>
                  ⌘K
                </kbd>
              </div>

              {/* Period pills */}
              <div className="dash-period-group" role="group" aria-label="Période">
                {(['7days', '30days', '90days'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`dash-period-btn${period === p ? ' active' : ''}`}
                  >
                    {p === '7days' ? '7j' : p === '30days' ? '30j' : '90j'}
                  </button>
                ))}
              </div>

              {/* Notifications bell */}
              <button type="button" className="dash-icon-btn" aria-label="Notifications" title="Notifications">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {pendingCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#FF3B30', border: '1.5px solid #fff',
                    boxShadow: '0 0 0 2px rgba(255,59,48,0.2)',
                  }} />
                )}
              </button>

              {/* Add product CTA */}
              <button
                type="button"
                className="dash-cta-btn"
                onClick={() => router.push('/dashboard/drops?new=1')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Créer un drop
              </button>

              {/* Avatar + logout */}
              <button
                type="button"
                className="dash-avatar"
                onClick={signOut}
                title="Déconnexion"
                aria-label="Déconnexion"
              >
                {(user.firstName?.[0] ?? user.email?.[0] ?? 'C').toUpperCase()}
              </button>

            </div>
          </header>

          {/* ══ ROW 1 — KPIs ════════════════════════════════════════════════ */}
          <section className="dash-section" id="overview">
            <DashboardKpiCards cards={dashboardLoading || !stats || !orderStats ? [] : kpis} />
          </section>

          {/* ══ ROW 2 — Revenue (2/3) + Goal Tracker (1/3) ════════════════ */}
          <section className="dash-section dash-grid-2-1" id="orders">
            <DashboardRevenueChart
              data={dashboardLoading ? [] : salesData}
              change={stats?.revenueChange}
            />
            <DashboardGoalTracker
              currentRevenue={stats?.totalRevenue ?? 0}
              period={period}
              isLoading={dashboardLoading}
            />
          </section>

          {/* ══ ROW 3 — Donut (1/3) + Stock (1/3) + Quick Actions (1/3) ══ */}
          <section className="dash-section dash-grid-3">
            <DashboardOrdersDonut orders={dashboardLoading ? null : orderStats} />
            {allProducts.some((p) => p.stock <= 5) ? (
              <DashboardStockAlert
                products={allProducts}
                isLoading={productsLoading}
                threshold={5}
              />
            ) : (
              <DashboardAudienceCard
                stats={stats}
                isLoading={dashboardLoading}
                onShare={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard && brand?.slug) {
                    navigator.clipboard.writeText(`${window.location.origin}/boutiques/${brand.slug}`);
                  }
                }}
              />
            )}
            <DashboardQuickActions
              pendingOrdersCount={pendingCount}
              onCreateDrop={() => {
                setActiveSection('drops');
                document.getElementById('drops')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onAddProduct={() => {
                setActiveSection('products');
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onViewOrders={() => {
                setActiveSection('orders');
                document.getElementById('orders')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onCreatePromo={() => {
                setActiveSection('products');
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onManageBrand={() => router.push('/brands/my-brand')}
              onShareProfile={() => {
                if (brand?.slug) {
                  void navigator.clipboard.writeText(`${window.location.origin}/brands/${brand.slug}`);
                }
              }}
            />
          </section>

          {/* ══ ROW 4 — Top Products (1/2) + Recent Orders (1/2) ══════════ */}
          <section className="dash-section dash-grid-1-1" id="products">
            <DashboardTopProducts products={filteredProducts} isLoading={dashboardLoading} />
            <DashboardRecentOrders orders={filteredOrders} isLoading={dashboardLoading} />
          </section>

          {/* ══ ROW 5 — Activity Feed (full width) ═════════════════════════ */}
          <section className="dash-section">
            <DashboardActivityFeed
              events={activityEvents}
              isLoading={dashboardLoading}
            />
          </section>

        </main>
      </div>
    </>
  );
}
