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
import { Promotion, PaginatedResponse } from '@/types/api';
import { DropIcon, DROP_ICONS, DROP_COLORS, FONT, formatDropDate } from '@/components/dashboard/drops/drop-shared';
import { SkeletonCard, PromoBadge } from './PromoCard';
import { EditPromoModal } from './EditPromoModal';
import styles from './PromotionsPage.module.css';

const PROMO_ICONS = {
  ...DROP_ICONS,
  tag: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
  users: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8'],
  power: 'M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10',
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
};

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'all' | 'auto' | 'codes' | 'inactive';

// ─── Components ───────────────────────────────────────────────────────────────

function FullPageSpinner({ message }: { message: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: DROP_COLORS.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, margin: '0 auto 16px',
          border: '2px solid #F0F0F0', borderTopColor: DROP_COLORS.red,
          borderRadius: '50%', animation: 'pp-spin 0.75s linear infinite',
        }} />
        <p style={{ color: DROP_COLORS.muted, fontSize: 13, margin: 0, fontWeight: 500 }}>{message}</p>
      </div>
      <style>{`@keyframes pp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export function PromotionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { checking } = useOnboardingGuard();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['dashboard', 'promotions', 'ceo'],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<Promotion>>(
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(API_ENDPOINTS.PROMOTIONS.DELETE(id)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['dashboard', 'promotions', 'ceo'] });
      toast.success('Promotion supprimée définitivement');
      setDeletingId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Promotion> }) =>
      apiClient.patch(API_ENDPOINTS.PROMOTIONS.UPDATE(id), data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['dashboard', 'promotions', 'ceo'] });
      toast.success('Promotion mise à jour');
      setEditingPromo(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'auto': return promos.filter((p: Promotion) => p.isAutoApplied && p.isActive);
      case 'codes': return promos.filter((p: Promotion) => !p.isAutoApplied && p.isActive);
      case 'inactive': return promos.filter((p: Promotion) => !p.isActive);
      default: return promos;
    }
  }, [promos, activeTab]);

  if (checking || authLoading) return <FullPageSpinner message="Chargement…" />;
  if (!user?.isCEO) return <FullPageSpinner message="Accès réservé aux CEOs." />;

  return (
    <>
      
      <div 
        className={styles.ppLayout}
        style={{ gridTemplateColumns: `${sidebarCollapsed ? 68 : 256}px 1fr`, transition: 'grid-template-columns 0.25s cubic-bezier(0.4,0,0.2,1)' }}
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

        <main className={styles.layout} style={{ minWidth: 0 }}>
          <header className={styles.hero}>
            <div className={styles.heroLabel}>Growth & Marketing</div>
            <h1 className={styles.heroTitle}>Tes Promotions</h1>
            <p className={styles.heroSub}>Active des réductions automatiques ou crée des codes promos exclusifs pour ta communauté.</p>

            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.ppMobileBurger}
                onClick={() => setMobileSidebarOpen(true)}
              >
                <DropIcon d={DROP_ICONS.rocket} size={18} stroke="#111" />
              </button>
              <button className={styles.btnPrimary} onClick={() => router.push('/dashboard/promotions/create')}>
                <DropIcon d={DROP_ICONS.plus} size={18} sw={2.5} />
                Nouvelle promotion
              </button>
            </div>
          </header>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div className={styles.tabs}>
              {(['all', 'auto', 'codes', 'inactive'] as const).map(t => (
                <button 
                  key={t} 
                  className={styles.tab} 
                  data-active={activeTab === t} 
                  onClick={() => setActiveTab(t)}
                >
                  {t === 'all' && 'Toutes'}
                  {t === 'auto' && 'Automatiques'}
                  {t === 'codes' && 'Codes Promo'}
                  {t === 'inactive' && 'Archives'}
                </button>
              ))}
            </div>
          </div>

          {query.isLoading ? (
            <div className={styles.grid}>
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap}>
                <DropIcon d={PROMO_ICONS.tag} size={40} stroke={DROP_COLORS.muted} sw={1.2} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#111', marginBottom: 12 }}>Rien à signaler ici</h3>
              <p style={{ fontSize: 15, color: DROP_COLORS.muted, maxWidth: 360, margin: '0 auto 32px' }}>
                Tu n&apos;as pas encore de promotions configurées dans cette catégorie. C&apos;est le moment de booster tes ventes !
              </p>
              <button className={styles.btnPrimary} onClick={() => router.push('/dashboard/promotions/create')}>
                Lancer un Drop avec Promo
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map(p => {
                 const isValuePerc = p.discountType === 'PERCENTAGE';
                 const valueStr = p.discountValue.toString();
                 const scopeStr = p.scope === 'BRAND' ? 'Toute la boutique' : (p.collection?.name || 'Collection dédiée');
                 
                 return (
                   <div key={p.id} className={styles.card} style={{ opacity: p.isActive ? 1 : 0.7 }}>
                     {/* ACTIONS SURVOL */}
                     <div className={styles.cardActions}>
                        <button className={styles.miniBtn} title="Modifier" onClick={() => setEditingPromo(p)}>
                          <DropIcon d={PROMO_ICONS.edit} size={14} sw={2} />
                        </button>
                        <button 
                          className={`${styles.miniBtn} ${styles.danger}`} 
                          title="Supprimer" 
                          onClick={() => setDeletingId(p.id)}
                        >
                          <DropIcon d={DROP_ICONS.trash} size={14} sw={2} />
                        </button>
                     </div>

                     <div className={styles.cardContent}>
                       <div style={{ marginBottom: 16 }}>
                         <PromoBadge type={p.isAutoApplied ? 'auto' : 'code'} inactive={!p.isActive} />
                       </div>
                       
                       <div className={styles.cardValue}>
                         {valueStr}
                         <span>{isValuePerc ? '%' : 'CFA'}</span>
                       </div>
                       
                       <div className={styles.cardName}>
                         {p.isAutoApplied ? scopeStr : p.code}
                       </div>
                       
                       {p.description && <div className={styles.cardDesc}>{p.description}</div>}
                     </div>

                     <div className={styles.cardFooter}>
                        <div className={styles.cardMeta} title="Utilisé sur">
                           <div className={styles.cardMetaIcon}><DropIcon d={DROP_ICONS.cube} size={12} /></div>
                           {scopeStr}
                        </div>
                        <div className={styles.cardMeta} title="Période">
                           <div className={styles.cardMetaIcon}><DropIcon d={DROP_ICONS.clock} size={12} /></div>
                           Du {formatDropDate(p.startsAt)} {p.expiresAt ? `au ${formatDropDate(p.expiresAt)}` : ' (Permanent)'}
                        </div>
                        
                        {!p.isAutoApplied && (
                          <div className={styles.cardMeta} title="Performance">
                             <div className={styles.cardMetaIcon}><DropIcon d={PROMO_ICONS.users} size={12} /></div>
                             Usage : <strong style={{color: '#111', marginLeft: 4}}>{p.usageCount}</strong> {p.usageLimit ? `/ ${p.usageLimit}` : ' (Illimité)'}
                          </div>
                        )}
                     </div>

                     <div className={styles.toggleBar}>
                       <button 
                         className={`${styles.toggleOpt} ${styles.inactive}`} 
                         data-active={!p.isActive}
                         onClick={() => !toggleMutation.isPending && p.isActive && toggleMutation.mutate({ id: p.id, isActive: p.isActive })}
                       >
                         <DropIcon d={PROMO_ICONS.power} size={12} /> Off
                       </button>
                       <button 
                         className={`${styles.toggleOpt} ${styles.active}`} 
                         data-active={p.isActive}
                         onClick={() => !toggleMutation.isPending && !p.isActive && toggleMutation.mutate({ id: p.id, isActive: p.isActive })}
                       >
                         <DropIcon d={PROMO_ICONS.zap} size={12} /> En ligne
                       </button>
                     </div>
                   </div>
                 )
              })}
            </div>
          )}
        </main>
      </div>

      {/* CONFIRMATION SUPPRESSION */}
      {deletingId && (
        <div className={styles.modalOverlay}>
           <div className={styles.modalCard}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: DROP_COLORS.red, marginBottom: 24 }}>
                <DropIcon d={DROP_ICONS.alertTriangle} size={32} sw={2} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111', marginBottom: 12, letterSpacing: '-0.5px' }}>Supprimer ?</h2>
              <p style={{ fontSize: 15, color: DROP_COLORS.muted, lineHeight: 1.6, marginBottom: 32 }}>
                Tu es sur le point de supprimer cette promotion. Cette action est irréversible et les clients ne pourront plus l&apos;utiliser.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button 
                  className={styles.miniBtn} 
                  style={{ width: 'auto', height: 48, fontWeight: 700 }}
                  onClick={() => setDeletingId(null)}
                >
                  Annuler
                </button>
                <button 
                  className={styles.btnPrimary} 
                  style={{ height: 48, boxShadow: 'none' }}
                  onClick={() => deleteMutation.mutate(deletingId)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? '...' : 'Supprimer'}
                </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL ÉDITION */}
      {editingPromo && (
        <EditPromoModal
          promotion={editingPromo}
          isOpen={true}
          onClose={() => setEditingPromo(null)}
          onSave={(id, data) => updateMutation.mutate({ id, data })}
          isSaving={updateMutation.isPending}
        />
      )}
    </>
  );
}
