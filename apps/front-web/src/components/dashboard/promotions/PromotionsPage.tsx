'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';
import { DashboardSidebar, type SidebarSection } from '@/components/dashboard/DashboardSidebar';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Promotion = {
  id: string;
  code: string;
  description: string | null;
  scope: 'BRAND' | 'COLLECTION';
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string;
  expiresAt: string | null;
  isActive: boolean;
  isAutoApplied: boolean;
  collection: { name: string } | null;
  createdAt: string;
};

type TabId = 'all' | 'auto' | 'codes' | 'inactive';

// ─── Icons ───────────────────────────────────────────────────────────────────

function Ic({ d, size = 16, stroke = 'currentColor', sw = 1.5 }: {
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
  tag: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
  calendar: ['M3 4v4h18V4z', 'M3 8v12h18V8z', 'M8 2v4', 'M16 2v4'],
  users: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8'],
  power: 'M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10',
  gift: ['M20 12v10H4V12', 'M2 7h20v5H2z', 'M12 22V7', 'M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z', 'M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z'],
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  off: 'M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10'
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtFCFA(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' CFA';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function FullPageSpinner({ message }: { message: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#FAFAFA' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, margin: '0 auto 16px',
          border: '2px solid #F0F0F0', borderTopColor: '#FF3B30',
          borderRadius: '50%', animation: 'pp-spin 0.75s linear infinite',
        }} />
        <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0, fontWeight: 500 }}>{message}</p>
      </div>
      <style>{`@keyframes pp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PromotionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { checking } = useOnboardingGuard();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['dashboard', 'promotions', 'ceo'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Promotion[]; meta: { total: number } }>(
        API_ENDPOINTS.PROMOTIONS.CEO_LIST({ limit: 100 })
      );
      return res.data;
    },
    enabled: !!user?.isCEO,
    staleTime: 30_000,
  });

  const promos = useMemo(() => query.data?.data ?? [], [query.data?.data]);

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch(API_ENDPOINTS.PROMOTIONS.TOGGLE(id), { isActive: !isActive }),
    onSuccess: async (_, { isActive }) => {
      await qc.invalidateQueries({ queryKey: ['dashboard', 'promotions', 'ceo'] });
      toast.success(isActive ? 'Promotion suspendue' : 'Promotion activée');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Erreur lors de la modification');
    },
  });

  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'auto': return promos.filter(p => p.isAutoApplied && p.isActive);
      case 'codes': return promos.filter(p => !p.isAutoApplied && p.isActive);
      case 'inactive': return promos.filter(p => !p.isActive);
      default: return promos;
    }
  }, [promos, activeTab]);

  if (checking || authLoading) return <FullPageSpinner message="Chargement…" />;
  if (!user?.isCEO) return <FullPageSpinner message="Accès réservé aux CEOs." />;

  return (
    <>
      <style>{`
        .promo-layout { min-height: 100vh; background: #FAFAFA; padding: 28px 32px 60px; font-family: 'Inter', sans-serif; }
        .promo-hero {
          margin-bottom: 32px; padding: 32px 36px; border-radius: 20px;
          background: #0A0A0A; position: relative; overflow: hidden;
        }
        .promo-hero::before {
          content: ''; position: absolute; top: -60px; right: -60px; width: 280px; height: 280px;
          border-radius: 50%; background: radial-gradient(circle, rgba(230,51,41,0.25) 0%, transparent 70%); pointer-events: none;
        }
        .promo-hero::after {
          content: 'PROMOS'; position: absolute; right: 36px; bottom: -18px;
          font-size: 96px; font-weight: 900; color: rgba(255,255,255,0.03); letter-spacing: -4px; pointer-events: none;
        }
        .promo-hero-label { font-size: 10px; font-weight: 700; letter-spacing: 3px; color: #FF3B30; text-transform: uppercase; margin-bottom: 10px; }
        .promo-hero-title { font-size: 34px; font-weight: 800; color: #FFF; letter-spacing: -0.8px; margin-bottom: 8px; }
        .promo-hero-sub { font-size: 13px; color: rgba(255,255,255,0.4); }

        .promo-tabs { display: inline-flex; padding: 3px; background: #fff; border: 1px solid #EBEBEB; border-radius: 12px; gap: 2px; margin-bottom: 24px; }
        .promo-tab { padding: 8px 16px; border: none; background: transparent; cursor: pointer; font-size: 12.5px; font-weight: 600; color: #9CA3AF; border-radius: 9px; transition: 0.15s; }
        .promo-tab[data-active="true"] { background: #0A0A0A; color: #fff; }

        .promo-btn-primary {
          display: inline-flex; align-items: center; gap: 7px; padding: 10px 20px; border-radius: 11px;
          background: #FF3B30; color: #fff; border: none; font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.15s;
        }
        .promo-btn-primary:hover { background: #E0321F; transform: translateY(-1px); }

        .promo-card { 
          background: #fff; border: 1px solid #F0F0F0; border-radius: 16px; padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: 0.15s; position: relative;
        }
        .promo-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .promo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }

        .promo-tag {
          position: absolute; top: 16px; right: 16px; font-size: 10px; font-weight: 700;
          padding: 4px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .promo-tag.auto { background: #FEF2F2; color: #EF4444; }
        .promo-tag.code { background: #F3F4F6; color: #4B5563; }
        .promo-tag.inactive { background: #F3F4F6; color: #9CA3AF; text-decoration: line-through; }

        .promo-value { font-size: 32px; font-weight: 900; color: #111; letter-spacing: -1px; margin-bottom: 4px; }
        .promo-name { font-size: 14px; font-weight: 600; color: #4B5563; margin-bottom: 12px; }
        .promo-desc { font-size: 12px; color: #9CA3AF; line-height: 1.5; margin-bottom: 16px; }

        .promo-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #6B7280; font-weight: 500; margin-bottom: 6px; }
        .promo-toggle { 
          margin-top: 16px; width: 100%; border: 1px solid #E5E7EB; background: #fff; color: #111;
          padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .promo-toggle:hover { background: #F9FAFB; border-color: #D1D5DB; }
        .promo-toggle.stop { color: #EF4444; }
        .promo-toggle.start { color: #10B981; }

        .pp-layout {
          display: grid;
          min-height: 100vh;
          background-color: #FAFAFA;
        }
        .pp-mobile-burger {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid #EBEBEB;
          background: #fff;
          color: #111;
          cursor: pointer;
        }
        @media (max-width: 1024px) {
          .pp-layout { grid-template-columns: 1fr !important; }
          .pp-mobile-burger { display: flex; }
        }
      `}</style>
      
      <div 
        className="pp-layout"
        style={{ gridTemplateColumns: `${sidebarCollapsed ? 68 : 256}px 1fr`, transition: 'grid-template-columns 0.22s cubic-bezier(0.4,0,0.2,1)' }}
      >
        <DashboardSidebar
          brandName={user?.brand?.name ?? undefined}
          userInitials={((user?.firstName ?? user?.email ?? 'C')[0]).toUpperCase()}
          userEmail={user?.email ?? undefined}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          active="promotions"
          onNavigate={(section: SidebarSection) => {
            if (section === 'overview')  router.push('/dashboard');
            else if (section === 'drops')    router.push('/dashboard/drops');
            else if (section === 'products') router.push('/dashboard/produits');
            else if (section === 'promotions') router.push('/dashboard/promotions');
            else router.push('/dashboard');
          }}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <main className="promo-layout" style={{ minWidth: 0 }}>
          <header className="promo-hero">
            <div className="promo-hero-label">Marketing</div>
            <h1 className="promo-hero-title">Promotions</h1>
            <p className="promo-hero-sub">Gère tes codes promos ou tes réductions automatiques de façon granulaire.</p>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                type="button"
                className="pp-mobile-burger"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>
              <button className="promo-btn-primary" onClick={() => router.push('/dashboard/promotions/create')}>
                <Ic d={ICONS.plus} size={16} sw={2.5} />
                Créer une promotion
              </button>
            </div>
          </header>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="promo-tabs">
            {(['all', 'auto', 'codes', 'inactive'] as const).map(t => (
              <button key={t} className="promo-tab" data-active={activeTab === t} onClick={() => setActiveTab(t)}>
                {t === 'all' && 'Toutes'}
                {t === 'auto' && 'Automatiques'}
                {t === 'codes' && 'Codes Promo'}
                {t === 'inactive' && 'Inactives'}
              </button>
            ))}
          </div>
        </div>

        {query.isLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#9CA3AF' }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '80px 24px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Ic d={ICONS.tag} size={32} stroke="#9CA3AF" sw={1} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 8 }}>Aucune promotion</h3>
            <p style={{ fontSize: 14, color: '#6B7280' }}>Tu n'as pas de promotions actives dans cette catégorie.</p>
          </div>
        ) : (
          <div className="promo-grid">
            {filtered.map(p => {
               const valueStr = p.discountType === 'PERCENTAGE' ? `-${p.discountValue}%` : `-${fmtFCFA(p.discountValue)}`;
               const scopeStr = p.scope === 'BRAND' ? 'Toute la boutique' : (p.collection?.name || 'Collection spécifique');
               
               return (
                 <div key={p.id} className="promo-card" style={{ opacity: p.isActive ? 1 : 0.6 }}>
                   <div className={`promo-tag ${!p.isActive ? 'inactive' : p.isAutoApplied ? 'auto' : 'code'}`}>
                     {p.isAutoApplied ? 'Automatique' : 'Code Manuel'}
                   </div>
                   
                   <div className="promo-value">{valueStr}</div>
                   <div className="promo-name">{p.isAutoApplied ? scopeStr : `Code : ${p.code}`}</div>
                   
                   {p.description && <div className="promo-desc">{p.description}</div>}

                   <div className="promo-meta">
                     <Ic d={ICONS.tag} size={13} />
                     S'applique sur : {scopeStr}
                   </div>
                   <div className="promo-meta">
                     <Ic d={ICONS.calendar} size={13} />
                     Du {formatDate(p.startsAt)} {p.expiresAt ? `au ${formatDate(p.expiresAt)}` : ' (Sans fin)'}
                   </div>
                   {!p.isAutoApplied && p.usageLimit && (
                     <div className="promo-meta">
                       <Ic d={ICONS.users} size={13} />
                       Utilisations : {p.usageCount} / {p.usageLimit}
                     </div>
                   )}

                   <button 
                     className={`promo-toggle ${p.isActive ? 'stop' : 'start'}`}
                     onClick={() => toggleMutation.mutate({ id: p.id, isActive: p.isActive })}
                     disabled={toggleMutation.isPending}
                   >
                     {p.isActive ? (
                       <><Ic d={ICONS.power} size={14} /> Suspendre</>
                     ) : (
                       <><Ic d={ICONS.zap} size={14} /> Réactiver</>
                     )}
                   </button>
                 </div>
               )
            })}
          </div>
        )}
        </main>
      </div>
    </>
  );
}
