'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';
import { useCeoCollection } from '@/hooks/dashboard/useCeoCollection';
import { DashboardSidebar, type SidebarSection } from '@/components/dashboard/DashboardSidebar';
import { deleteCollection, updateCollection, updateCollectionCover, removeCollectionCover } from '@/services/api/collections';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { CollectionTopBar } from './CollectionTopBar';
import { CollectionHero } from './CollectionHero';
import { CollectionMeta } from './CollectionMeta';
import { CollectionContextBlock } from './CollectionContextBlock';
import { ProductsSection } from './ProductsSection';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EditCollectionModal, type EditCollectionFields } from './EditCollectionModal';
import { DETAIL_STYLES } from './detail-styles';

// ─── Loading / Error states ──────────────────────────────────────────────────

function FullPageSpinner({ message = 'Chargement…' }: { message?: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F5F6F8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '2.5px solid rgba(0,0,0,0.06)', borderTopColor: '#FF3B30',
          animation: 'cd-spin 0.8s linear infinite', margin: '0 auto 14px',
        }} />
        <p style={{ color: 'rgba(0,0,0,0.38)', fontSize: 13, margin: 0, fontWeight: 500 }}>{message}</p>
      </div>
      <style>{`@keyframes cd-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="cd-shimmer" style={{ height: 360, borderRadius: 20 }} />
    </div>
  );
}

function MetaSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="cd-shimmer" style={{ height: 40, width: 140, borderRadius: 13 }} />
      ))}
    </div>
  );
}

function CollectionError({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', textAlign: 'center', gap: 12,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none"
          stroke="rgba(239,68,68,0.5)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'rgba(0,0,0,0.55)' }}>Collection introuvable</p>
      <p style={{ margin: 0, fontSize: 13, color: 'rgba(0,0,0,0.35)', lineHeight: 1.5, maxWidth: 280 }}>
        Cette collection n&apos;existe pas ou tu n&apos;y as pas accès.
      </p>
      <button type="button" className="cd-btn-ghost" onClick={onBack} style={{ marginTop: 8 }}>
        ← Retour aux drops
      </button>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function CollectionDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { checking } = useOnboardingGuard();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);

  const { data: collection, isLoading, isError } = useCeoCollection(id);
  const qc = useQueryClient();

  // ── Launch ──
  const launchMutation = useMutation({
    mutationFn: () => apiClient.post(API_ENDPOINTS.COLLECTIONS.LAUNCH(id)),
    onMutate:   () => toast.loading('Lancement en cours…', { id: 'launch' }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['dashboard', 'collections', 'ceo'] });
      await qc.invalidateQueries({ queryKey: ['dashboard', 'collections', 'ceo', id] });
      toast.success('Collection lancée avec succès !', { id: 'launch' });
    },
    onError: () => toast.error('Erreur lors du lancement', { id: 'launch' }),
  });

  // ── Delete ──
  const deleteMutation = useMutation({
    mutationFn: () => deleteCollection(id),
    onMutate:   () => toast.loading('Suppression…', { id: 'delete' }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['dashboard', 'collections', 'ceo'] });
      toast.success('Collection supprimée.', { id: 'delete' });
      router.push('/dashboard/drops');
    },
    onError: () => toast.error('Erreur lors de la suppression', { id: 'delete' }),
  });

  // ── Edit ──
  const editMutation = useMutation({
    mutationFn: async (fields: EditCollectionFields) => {
      await updateCollection(id, {
        name:        fields.name,
        description: fields.description || undefined,
        isFeatured:  fields.isFeatured,
        launchDate:  fields.launchDate
          ? new Date(fields.launchDate).toISOString()
          : undefined,
      });
      if (fields.coverFile === null) await removeCollectionCover(id);
      else if (fields.coverFile instanceof File) await updateCollectionCover(id, fields.coverFile);
    },
    onMutate:   () => toast.loading('Enregistrement…', { id: 'edit' }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['dashboard', 'collections', 'ceo', id] });
      toast.success('Collection mise à jour.', { id: 'edit' });
      setShowEditModal(false);
    },
    onError: () => toast.error('Erreur lors de la mise à jour', { id: 'edit' }),
  });

  const handleNavigate = (section: SidebarSection) => {
    const ROUTES: Partial<Record<SidebarSection, string>> = {
      overview: '/dashboard',
      drops:    '/dashboard/drops',
    };
    router.push(ROUTES[section] ?? '/dashboard');
  };

  if (checking || authLoading) return <FullPageSpinner />;
  if (!user?.isCEO) return <FullPageSpinner message="Accès réservé aux comptes CEO." />;

  return (
    <>
      <style>{DETAIL_STYLES}</style>

      <div
        className="cd-layout"
        style={{ gridTemplateColumns: `${sidebarCollapsed ? 68 : 256}px 1fr` }}
      >
        <DashboardSidebar
          brandName={user.brand?.name}
          userInitials={(user.firstName?.[0] ?? user.email?.[0] ?? 'C').toUpperCase()}
          userEmail={user.email}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          active="drops"
          onNavigate={handleNavigate}
          notificationCount={0}
        />

        <main className="cd-main">
          <CollectionTopBar
            collection={collection ?? null}
            onBack={()   => router.push('/dashboard/drops')}
            onLaunch={()  => launchMutation.mutate()}
            onEdit={()    => setShowEditModal(true)}
            onDelete={()  => setShowDeleteModal(true)}
            launchPending={launchMutation.isPending}
          />



          {isError ? (
            <CollectionError onBack={() => router.push('/dashboard/drops')} />
          ) : isLoading ? (
            <>
              <HeroSkeleton />
              <MetaSkeleton />
              <ProductsSection products={[]} isLoading />
            </>
          ) : collection ? (
            <>
              <CollectionHero collection={collection} />
              <CollectionMeta collection={collection} />
              <CollectionContextBlock status={collection.status} />
              <ProductsSection
                products={collection.products}
                isLoading={false}
                onAddProduct={() => router.push(`/dashboard/produits/new?collectionId=${id}`)}
              />
            </>
          ) : null}
        </main>
      </div>

      {/* ── Modals ── */}
      {showDeleteModal && collection && (
        <DeleteConfirmModal
          collectionName={collection.name}
          isPending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {showEditModal && collection && (
        <EditCollectionModal
          collection={collection}
          isPending={editMutation.isPending}
          onSave={fields => editMutation.mutate(fields)}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
