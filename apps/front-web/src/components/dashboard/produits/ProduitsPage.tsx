/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';
import { DashboardSidebar, type SidebarSection } from '@/components/dashboard/DashboardSidebar';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

// ─── Types ────────────────────────────────────────────────────────────────────

type CeoProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  stock: number;
  isVisible: boolean;
  isFeatured: boolean;
  collection: { id: string; name: string } | null;
  createdAt: string;
  sizes: string[];
  colors: string[];
};

type TabId = 'all' | 'visible' | 'out_of_stock' | 'hidden';
type ViewMode = 'flat' | 'grouped';

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
  box: ['M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z', 'M3.27 6.96L12 12.01l8.73-5.05', 'M12 22.08V12'],
  eye: ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0'],
  eyeOff: ['M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24', 'M1 1l22 22'],
  tag: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
  layers: ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  grid: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M3 14h7v7H3z', 'M14 14h7v7h-7z'],
  list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  alert: ['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01'],
  check: 'M20 6L9 17l-5-5',
  arrow_right: 'M5 12h14M12 5l7 7-7 7',
  bag: ['M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'],
  diagonal: 'M7 17L17 7M7 7h10v10',
  img: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
  pencil: ['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'],
  trash: ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
}

function stockMeta(stock: number) {
  if (stock === 0) return { label: 'Épuisé',      color: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' };
  if (stock <= 5)  return { label: `${stock} restant${stock > 1 ? 's' : ''}`, color: '#92400E', bg: '#FEF3C7', dot: '#F59E0B' };
  return             { label: `${stock} en stock`, color: '#065F46', bg: '#D1FAE5', dot: '#10B981' };
}

// ─── Full Page Spinner ────────────────────────────────────────────────────────

function FullPageSpinner({ message }: { message: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#FAFAFA' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, margin: '0 auto 16px',
          border: '2px solid #F0F0F0', borderTopColor: '#E63329',
          borderRadius: '50%', animation: 'pp-spin 0.75s linear infinite',
        }} />
        <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0, fontFamily: 'inherit', fontWeight: 500 }}>{message}</p>
      </div>
      <style>{`@keyframes pp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ label, value, accent, sub }: {
  label: string; value: number | string; accent: string; sub?: string;
}) {
  return (
    <div className="pp-kpi-card">
      <div style={{ fontSize: 28, fontWeight: 800, color: accent, letterSpacing: '-1px', fontFamily: 'inherit', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginTop: 4, fontFamily: 'inherit', letterSpacing: '0.3px' }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 10, color: '#D1D5DB', marginTop: 2, fontFamily: 'inherit' }}>{sub}</div>}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="pp-product-card" style={{ gap: 0 }}>
      <div className="pp-shimmer" style={{ width: 100, minWidth: 100, height: 100, borderRadius: '12px 0 0 12px' }} />
      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="pp-shimmer" style={{ height: 14, width: '60%', borderRadius: 4 }} />
        <div className="pp-shimmer" style={{ height: 11, width: '40%', borderRadius: 4 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div className="pp-shimmer" style={{ height: 22, width: 70, borderRadius: 99 }} />
          <div className="pp-shimmer" style={{ height: 22, width: 90, borderRadius: 99 }} />
        </div>
      </div>
      <div style={{ padding: '16px 16px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="pp-shimmer" style={{ height: 34, width: 34, borderRadius: 10 }} />
        <div className="pp-shimmer" style={{ height: 34, width: 34, borderRadius: 10 }} />
      </div>
    </div>
  );
}

// ─── Stock Badge ─────────────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
  const m = stockMeta(stock);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.4px',
      padding: '3px 9px', borderRadius: 99, textTransform: 'uppercase',
      color: m.color, background: m.bg,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, index, onToggleVisibility, toggling, onEdit, onDelete }: {
  product: CeoProduct;
  index: number;
  onToggleVisibility: (id: string, current: boolean) => void;
  toggling: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const img = product.images?.[0];
  const isOutOfStock = product.stock === 0;

  return (
    <article
      className="pp-product-card"
      style={{
        animationDelay: `${index * 0.04}s`,
        opacity: product.isVisible ? 1 : 0.6,
        borderLeft: isOutOfStock ? '3px solid #EF4444' : product.isFeatured ? '3px solid #E63329' : '1px solid #F0F0F0',
      }}
    >
      {/* Image */}
      <div className="pp-card-img">
        {img ? (
          <img src={img} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ic d={ICONS.bag} size={28} stroke="rgba(255,255,255,0.15)" sw={1} />
          </div>
        )}
        {product.isFeatured && (
          <div style={{
            position: 'absolute', top: 6, left: 6,
            background: '#E63329', borderRadius: 6,
            padding: '2px 5px', display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <Ic d={ICONS.star} size={8} stroke="#fff" sw={2.5} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pp-card-info">
        <div className="pp-card-name-row">
          <h3 style={{
            margin: 0, fontSize: 14, fontWeight: 700,
            color: '#0A0A0A', letterSpacing: '-0.2px', lineHeight: 1.3,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {product.name}
          </h3>
          <span className="pp-card-price">
            {fmtPrice(product.price)}
          </span>
        </div>

        {/* Collection badge */}
        {product.collection && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 10.5, fontWeight: 600, color: '#6B7280',
            marginBottom: 10,
          }}>
            <Ic d={ICONS.layers} size={10} stroke="#9CA3AF" />
            {product.collection.name}
          </span>
        )}

        {/* Chips row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <StockBadge stock={product.stock} />

          {!product.isVisible && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10.5, fontWeight: 700, padding: '3px 9px',
              borderRadius: 99, background: '#F3F4F6', color: '#6B7280',
            }}>
              <Ic d={ICONS.eyeOff} size={9} stroke="#9CA3AF" sw={2} />
              Masqué
            </span>
          )}

          {product.sizes?.length > 0 && (
            <span style={{ fontSize: 10.5, color: '#9CA3AF', fontWeight: 500 }}>
              {product.sizes.join(' · ')}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="pp-card-actions">
        <button
          type="button"
          title={product.isVisible ? 'Masquer' : 'Afficher'}
          onClick={() => onToggleVisibility(product.id, product.isVisible)}
          disabled={toggling}
          className={`pp-btn-icon ${product.isVisible ? 'pp-btn-visibility-on' : 'pp-btn-visibility-off'}`}
        >
          <Ic d={product.isVisible ? ICONS.eye : ICONS.eyeOff} size={15} />
        </button>
        <button
          type="button"
          title="Modifier"
          className="pp-btn-icon pp-btn-edit"
          onClick={() => onEdit(product.id)}
        >
          <Ic d={ICONS.pencil} size={14} />
        </button>
        <button
          type="button"
          title="Voir le produit"
          className="pp-btn-icon pp-btn-view"
          onClick={() => window.open(`/product/${product.slug}`, '_blank')}
        >
          <Ic d={ICONS.diagonal} size={14} />
        </button>
        <button
          type="button"
          title="Supprimer"
          className="pp-btn-icon pp-btn-danger"
          onClick={() => onDelete(product.id, product.name)}
        >
          <Ic d={ICONS.trash} size={14} />
        </button>
      </div>
    </article>
  );
}

// ─── Collection Group ─────────────────────────────────────────────────────────

function CollectionGroup({ name, products, onToggleVisibility, toggling, startIndex, onEdit, onDelete }: {
  name: string;
  products: CeoProduct[];
  onToggleVisibility: (id: string, current: boolean) => void;
  toggling: boolean;
  startIndex: number;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const outOfStock = products.filter(p => p.stock === 0).length;

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Group header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 12, paddingBottom: 10,
        borderBottom: '1px solid #F0F0F0',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: '#0A0A0A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Ic d={ICONS.layers} size={13} stroke="rgba(255,255,255,0.7)" sw={1.5} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.2px' }}>
          {name}
        </span>
        <span style={{
          fontSize: 10.5, fontWeight: 700, padding: '2px 8px',
          borderRadius: 99, background: '#F3F4F6', color: '#6B7280',
        }}>
          {products.length} produit{products.length > 1 ? 's' : ''}
        </span>
        {outOfStock > 0 && (
          <span style={{
            fontSize: 10.5, fontWeight: 700, padding: '2px 8px',
            borderRadius: 99, background: '#FEE2E2', color: '#991B1B',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <Ic d={ICONS.alert} size={9} stroke="#EF4444" sw={2.5} />
            {outOfStock} épuisé{outOfStock > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="pp-list">
        {products.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            index={startIndex + i}
            onToggleVisibility={onToggleVisibility}
            toggling={toggling}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: TabId }) {
  const messages: Record<TabId, { title: string; sub: string }> = {
    all:          { title: 'Aucun produit pour l\'instant', sub: 'Crée un drop et ajoute-y des produits pour qu\'ils apparaissent ici.' },
    visible:      { title: 'Aucun produit visible', sub: 'Tous tes produits sont masqués ou tu n\'en as pas encore.' },
    out_of_stock: { title: 'Aucun produit épuisé', sub: 'Bonne nouvelle — tous tes produits ont encore du stock !' },
    hidden:       { title: 'Aucun produit masqué', sub: 'Tous tes produits sont actuellement visibles.' },
  };
  const m = messages[tab];

  return (
    <div style={{
      padding: '80px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    }}>
      <div style={{
        width: 100, height: 100, borderRadius: 28,
        background: '#0A0A0A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28,
        boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 30% 30%, rgba(230,51,41,0.3) 0%, transparent 60%)',
        }} />
        <Ic d={ICONS.box} size={38} stroke="rgba(255,255,255,0.6)" sw={1} />
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '3px', color: '#E63329', textTransform: 'uppercase', marginBottom: 12 }}>
        {tab === 'out_of_stock' ? 'Stock OK' : 'Vide'}
      </div>
      <h3 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
        {m.title}
      </h3>
      <p style={{ margin: 0, fontSize: 14, color: '#9CA3AF', maxWidth: 280, lineHeight: 1.65 }}>
        {m.sub}
      </p>
    </div>
  );
}

// ─── Alert Banner ─────────────────────────────────────────────────────────────

function AlertBanner({ outOfStock, hidden }: { outOfStock: number; hidden: number }) {
  if (outOfStock > 0) {
    return (
      <div className="pp-alert pp-alert-urgent">
        <div className="pp-alert-icon" style={{ background: '#0A0A0A' }}>
          <Ic d={ICONS.alert} size={16} stroke="#F59E0B" />
        </div>
        <div>
          <div className="pp-alert-title">
            {outOfStock} produit{outOfStock > 1 ? 's' : ''} épuisé{outOfStock > 1 ? 's' : ''}
          </div>
          <div className="pp-alert-sub">Pense à recharger ton stock ou à masquer ces produits.</div>
        </div>
        <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', flexShrink: 0, animation: 'pp-pulse 1.5s ease-in-out infinite' }} />
      </div>
    );
  }
  if (hidden > 0) {
    return (
      <div className="pp-alert pp-alert-default">
        <div className="pp-alert-icon" style={{ background: '#0A0A0A' }}>
          <Ic d={ICONS.eyeOff} size={16} stroke="#E63329" />
        </div>
        <div>
          <div className="pp-alert-title">{hidden} produit{hidden > 1 ? 's' : ''} masqué{hidden > 1 ? 's' : ''}</div>
          <div className="pp-alert-sub">Ces produits ne sont pas visibles par les acheteurs.</div>
        </div>
      </div>
    );
  }
  return null;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: 'all',          label: 'Tous' },
  { id: 'visible',      label: 'Visibles' },
  { id: 'out_of_stock', label: 'Épuisés' },
  { id: 'hidden',       label: 'Masqués' },
];

export function ProduitsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { checking } = useOnboardingGuard();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('flat');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const qc = useQueryClient();

  // ── Fetch ──
  const productsQuery = useQuery({
    queryKey: ['dashboard', 'produits', 'ceo'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: CeoProduct[]; meta: { total: number } }>(
        API_ENDPOINTS.PRODUITS.CEO_LIST({ limit: 100 }),
      );
      return res.data;
    },
    enabled: !!user?.isCEO,
    staleTime: 30_000,
  });

  const allProducts = useMemo<CeoProduct[]>(
    () => productsQuery.data?.data ?? [],
    [productsQuery.data?.data],
  );

  // ── Toggle visibility ──
  const toggleMutation = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      apiClient.patch(API_ENDPOINTS.PRODUITS.UPDATE(id), { isVisible: !isVisible }),
    onMutate: ({ id }) => { setTogglingId(id); },
    onSuccess: async (_, { isVisible }) => {
      await qc.invalidateQueries({ queryKey: ['dashboard', 'produits', 'ceo'] });
      toast.success(isVisible ? 'Produit masqué' : 'Produit visible');
    },
    onError: () => toast.error('Impossible de modifier la visibilité'),
    onSettled: () => setTogglingId(null),
  });

  const handleToggle = useCallback((id: string, current: boolean) => {
    toggleMutation.mutate({ id, isVisible: current });
  }, [toggleMutation]);

  // ── Delete ──
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(API_ENDPOINTS.PRODUITS.DELETE(id)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['dashboard', 'produits', 'ceo'] });
      toast.success('Produit supprimé');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Impossible de supprimer le produit'),
  });

  const handleEdit = useCallback((id: string) => {
    router.push(`/dashboard/produits/${id}/edit`);
  }, [router]);

  const handleDeleteRequest = useCallback((id: string, name: string) => {
    setDeleteTarget({ id, name });
  }, []);

  // ── Filtered list ──
  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'visible':      return allProducts.filter(p => p.isVisible);
      case 'out_of_stock': return allProducts.filter(p => p.stock === 0);
      case 'hidden':       return allProducts.filter(p => !p.isVisible);
      default:             return allProducts;
    }
  }, [allProducts, activeTab]);

  // ── KPIs ──
  const kpis = useMemo(() => ({
    total:       allProducts.length,
    visible:     allProducts.filter(p => p.isVisible).length,
    outOfStock:  allProducts.filter(p => p.stock === 0).length,
    hidden:      allProducts.filter(p => !p.isVisible).length,
    stockTotal:  allProducts.reduce((s, p) => s + (p.stock || 0), 0),
  }), [allProducts]);

  // ── Grouped view ──
  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; products: CeoProduct[] }>();
    filtered.forEach(p => {
      const key = p.collection?.id ?? '__none__';
      const name = p.collection?.name ?? 'Sans collection';
      if (!map.has(key)) map.set(key, { name, products: [] });
      map.get(key)!.products.push(p);
    });
    return Array.from(map.values());
  }, [filtered]);

  // ── Tab indicator ──
  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    const activeEl = container.querySelector<HTMLButtonElement>('[data-active="true"]');
    if (!activeEl) return;
    const cr = container.getBoundingClientRect();
    const ar = activeEl.getBoundingClientRect();
    setIndicator({ left: ar.left - cr.left, width: ar.width });
  }, [activeTab, productsQuery.isLoading]);

  if (checking || authLoading) return <FullPageSpinner message="Chargement…" />;
  if (!user?.isCEO) return <FullPageSpinner message="Accès réservé aux comptes CEO." />;

  const isLoading = productsQuery.isLoading;

  const tabCounts: Record<TabId, number> = {
    all:          allProducts.length,
    visible:      kpis.visible,
    out_of_stock: kpis.outOfStock,
    hidden:       kpis.hidden,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pp-layout {
          min-height: 100vh;
          display: grid;
          background: #FAFAFA;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .pp-main {
          padding: 28px 32px 60px;
          min-width: 0;
          background: #FAFAFA;
        }

        /* ── Hero header ── */
        .pp-page-hero {
          margin-bottom: 32px;
          padding: 32px 36px;
          border-radius: 20px;
          background: #0A0A0A;
          position: relative;
          overflow: hidden;
        }
        .pp-page-hero::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(230,51,41,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .pp-page-hero::after {
          content: 'PRODUITS';
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
        .pp-hero-label {
          font-size: 10px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase;
          color: #E63329; margin-bottom: 10px;
        }
        .pp-hero-title {
          font-size: 34px; font-weight: 800;
          color: #FFFFFF; letter-spacing: -0.8px;
          line-height: 1.1; margin-bottom: 8px;
        }
        .pp-hero-sub {
          font-size: 13px; color: rgba(255,255,255,0.4);
          font-weight: 400;
        }
        .pp-hero-actions {
          display: flex; align-items: center; gap: 10px;
          margin-top: 28px;
        }

        /* ── KPI row ── */
        .pp-kpi-row {
          display: flex; gap: 12px;
          margin-bottom: 28px; flex-wrap: wrap;
        }
        .pp-kpi-card {
          flex: 1; min-width: 100px;
          padding: 18px 20px;
          background: #fff;
          border: 1px solid #F0F0F0;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .pp-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }

        /* ── Toolbar ── */
        .pp-toolbar {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 20px; gap: 16px; flex-wrap: wrap;
        }
        .pp-tabs-wrap {
          display: inline-flex;
          padding: 3px;
          background: #fff;
          border: 1px solid #EBEBEB;
          border-radius: 12px;
          position: relative; gap: 2px;
        }
        .pp-tab-indicator {
          position: absolute;
          top: 3px; bottom: 3px;
          border-radius: 9px;
          background: #0A0A0A;
          transition: left 0.22s cubic-bezier(0.4,0,0.2,1), width 0.22s cubic-bezier(0.4,0,0.2,1);
          pointer-events: none;
        }
        .pp-tab {
          position: relative; z-index: 1;
          padding: 8px 16px; border: none; background: transparent;
          cursor: pointer; font-family: inherit;
          font-size: 12.5px; font-weight: 600;
          color: #9CA3AF; border-radius: 9px;
          transition: color 0.15s; white-space: nowrap;
        }
        .pp-tab[data-active="true"] { color: #fff; }
        .pp-tab-count {
          display: inline-flex; align-items: center; justify-content: center;
          margin-left: 5px; min-width: 18px; height: 18px;
          padding: 0 5px; border-radius: 99px;
          font-size: 10px; font-weight: 800;
          background: rgba(0,0,0,0.06); color: #6B7280;
        }
        .pp-tab[data-active="true"] .pp-tab-count {
          background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.8);
        }

        /* ── View toggle ── */
        .pp-view-toggle {
          display: inline-flex; padding: 3px;
          background: #fff; border: 1px solid #EBEBEB;
          border-radius: 10px; gap: 2px;
        }
        .pp-view-btn {
          padding: 7px 10px; border: none; border-radius: 7px;
          cursor: pointer; font-family: inherit;
          background: transparent; color: #9CA3AF;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .pp-view-btn[data-active="true"] {
          background: #0A0A0A; color: #fff;
        }

        /* ── Alerts ── */
        .pp-alert {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 18px; border-radius: 14px;
          margin-bottom: 22px;
        }
        .pp-alert-urgent { background: #FFFBEB; border: 1px solid #FDE68A; }
        .pp-alert-default { background: #FFF5F5; border: 1px solid #FECACA; }
        .pp-alert-icon {
          width: 36px; height: 36px; border-radius: 10px;
          flex-shrink: 0; display: flex; align-items: center; justify-content: center;
        }
        .pp-alert-title { font-size: 13px; font-weight: 700; color: #111; }
        .pp-alert-sub { font-size: 11.5px; color: #9CA3AF; margin-top: 2px; }

        /* ── Product list ── */
        .pp-list {
          display: flex; flex-direction: column; gap: 8px;
        }
        .pp-product-card {
          display: flex; align-items: stretch;
          background: #fff;
          border: 1px solid #F0F0F0;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04);
          transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s cubic-bezier(0.4,0,0.2,1);
          animation: pp-cardrise 0.45s cubic-bezier(0.4,0,0.2,1) both;
          min-height: 100px;
        }
        .pp-product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.07), 0 12px 32px rgba(0,0,0,0.08);
        }

        /* ── Buttons ── */
        .pp-btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 11px;
          background: #E63329; color: #fff; border: none;
          font-family: inherit; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: background 0.15s;
          letter-spacing: -0.1px;
        }
        .pp-btn-primary:hover { background: #CC2920; }
        .pp-btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 18px; border-radius: 11px;
          background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.12);
          font-family: inherit; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
        }
        .pp-btn-ghost:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .pp-btn-icon {
          width: 38px; height: 38px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; flex-shrink: 0;
          transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
          font-weight: 700;
        }
        .pp-btn-icon:hover { transform: translateY(-2px); }
        .pp-btn-icon:active { transform: scale(0.95); }
        .pp-btn-icon:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

        .pp-btn-visibility-on {
          background: #ECFDF5; color: #059669;
          box-shadow: 0 2px 8px rgba(5,150,105,0.15);
        }
        .pp-btn-visibility-on:hover { background: #D1FAE5; box-shadow: 0 4px 12px rgba(5,150,105,0.25); }

        .pp-btn-visibility-off {
          background: #FFF1F0; color: #E63329;
          box-shadow: 0 2px 8px rgba(230,51,41,0.15);
        }
        .pp-btn-visibility-off:hover { background: #FFE4E1; box-shadow: 0 4px 12px rgba(230,51,41,0.25); }

        .pp-btn-edit {
          background: #0A0A0A; color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .pp-btn-edit:hover { background: #222; box-shadow: 0 4px 14px rgba(0,0,0,0.3); }

        .pp-btn-view {
          background: #EEF2FF; color: #6366F1;
          box-shadow: 0 2px 8px rgba(99,102,241,0.15);
        }
        .pp-btn-view:hover { background: #E0E7FF; box-shadow: 0 4px 12px rgba(99,102,241,0.25); }

        .pp-btn-danger {
          background: #FEF2F2; color: #EF4444;
          box-shadow: 0 2px 8px rgba(239,68,68,0.15);
        }
        .pp-btn-danger:hover { background: #FEE2E2; box-shadow: 0 4px 12px rgba(239,68,68,0.25); }

        /* ── Shimmer ── */
        @keyframes pp-shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .pp-shimmer {
          background: linear-gradient(90deg, #F3F4F6 25%, #E9EAEC 50%, #F3F4F6 75%);
          background-size: 800px 100%;
          animation: pp-shimmer 1.5s infinite;
        }

        /* ── Animations ── */
        @keyframes pp-cardrise {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pp-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes pp-modal-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pp-modal-slide {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pp-spin {
          to { transform: rotate(360deg); }
        }

        /* ── Card inner classes (desktop) ── */
        .pp-card-img {
          width: 100px; min-width: 100px; height: 100px;
          background: #0A0A0A;
          position: relative; overflow: hidden;
          border-radius: 12px 0 0 12px;
          flex-shrink: 0;
        }
        .pp-card-info {
          flex: 1; padding: 14px 16px; min-width: 0;
        }
        .pp-card-name-row {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 8px; margin-bottom: 6px;
        }
        .pp-card-price {
          font-size: 14px; font-weight: 800; color: #0A0A0A;
          white-space: nowrap; flex-shrink: 0; letter-spacing: -0.3px;
        }
        .pp-card-actions {
          padding: 0 14px; display: flex; align-items: center;
          gap: 6px; flex-shrink: 0;
        }

        /* ── Mobile burger ── */
        .pp-mobile-burger {
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
        .pp-mobile-burger:hover { background: rgba(255,255,255,0.2); color: #fff; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .pp-layout { grid-template-columns: 1fr !important; }
          .pp-main { padding: 0 14px 40px !important; }
          .pp-mobile-burger { display: flex !important; }
          .pp-page-hero { padding: 20px 18px; margin-bottom: 20px; }
          .pp-hero-title { font-size: 24px; }
          .pp-hero-actions { margin-top: 18px; gap: 8px; flex-wrap: wrap; }

          /* KPIs : 2 colonnes */
          .pp-kpi-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .pp-kpi-card { min-width: 0; padding: 14px 16px; }

          /* Tabs */
          .pp-toolbar { flex-wrap: wrap; gap: 8px; }
          .pp-tabs-wrap { overflow-x: auto; max-width: 100%; }

          /* Product cards : image en haut, infos en dessous */
          .pp-product-card { flex-direction: column; min-height: unset; }
          .pp-card-img {
            width: 100%; min-width: 0; height: 160px;
            border-radius: 12px 12px 0 0;
          }
          .pp-card-info { padding: 12px 14px 8px; }
          .pp-card-name-row { flex-direction: column; gap: 4px; }
          .pp-card-price { font-size: 15px; }

          /* Actions : boutons grands, pleine largeur, avec labels */
          .pp-card-actions {
            padding: 10px 12px 14px;
            border-top: 1px solid #F3F4F6;
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 8px;
          }
          .pp-btn-icon {
            width: 100% !important;
            height: 42px !important;
            border-radius: 12px !important;
            font-size: 13px !important;
          }
        }
        @media (max-width: 480px) {
          .pp-hero-title { font-size: 20px; }
        }
      `}</style>

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 4000,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
            animation: 'pp-modal-in 0.18s ease',
          }}
          onMouseDown={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
        >
          <div style={{
            background: '#fff', borderRadius: 24,
            padding: '32px 28px 28px', maxWidth: 420, width: '100%',
            boxShadow: '0 40px 100px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.12)',
            animation: 'pp-modal-slide 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            {/* Icon */}
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: '#FEF2F2', border: '1.5px solid #FECACA',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 22,
            }}>
              <Ic d={ICONS.trash} size={24} stroke="#EF4444" sw={1.8} />
            </div>

            {/* Title */}
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.4px', margin: '0 0 10px' }}>
              Supprimer ce produit ?
            </h2>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: '0 0 8px' }}>
              Tu es sur le point de supprimer&nbsp;:
            </p>
            <div style={{
              padding: '12px 16px', borderRadius: 12,
              background: '#F9FAFB', border: '1.5px solid #F0F0F0',
              fontSize: 14, fontWeight: 700, color: '#0A0A0A',
              margin: '0 0 20px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {deleteTarget.name}
            </div>
            <p style={{ fontSize: 12.5, color: '#9CA3AF', lineHeight: 1.65, margin: '0 0 28px' }}>
              Cette action est irréversible. Le produit sera retiré de la boutique et ne pourra pas être récupéré.
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
                style={{
                  flex: 1, padding: '13px', borderRadius: 14,
                  border: '1.5px solid #E5E7EB', background: '#fff',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#374151',
                  fontFamily: 'inherit', transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                style={{
                  flex: 1, padding: '13px', borderRadius: 14, border: 'none',
                  background: deleteMutation.isPending ? '#F3F4F6' : '#EF4444',
                  color: deleteMutation.isPending ? '#9CA3AF' : '#fff',
                  fontSize: 14, fontWeight: 800, cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!deleteMutation.isPending) (e.currentTarget as HTMLButtonElement).style.background = '#DC2626'; }}
                onMouseLeave={e => { if (!deleteMutation.isPending) (e.currentTarget as HTMLButtonElement).style.background = '#EF4444'; }}
              >
                {deleteMutation.isPending ? (
                  <>
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#9CA3AF',
                      animation: 'pp-spin 0.7s linear infinite', flexShrink: 0,
                    }} />
                    Suppression…
                  </>
                ) : (
                  <>
                    <Ic d={ICONS.trash} size={14} stroke="#fff" sw={2} />
                    Supprimer définitivement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
          active="products"
          onNavigate={(section: SidebarSection) => {
            if (section === 'overview')  router.push('/dashboard');
            else if (section === 'drops')    router.push('/dashboard/drops');
            else if (section === 'products') router.push('/dashboard/produits');
            else router.push('/dashboard');
          }}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <main className="pp-main">

          {/* ── Hero header ── */}
          <div className="pp-page-hero">
            <p className="pp-hero-label">Catalogue</p>
            <h1 className="pp-hero-title">Tes Produits</h1>
            <p className="pp-hero-sub">
              {isLoading ? 'Chargement…' : `${kpis.total} produit${kpis.total !== 1 ? 's' : ''} dans ta boutique`}
            </p>
            <div className="pp-hero-actions">
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
              <button
                type="button"
                className="pp-btn-primary"
                onClick={() => router.push('/dashboard/produits/new')}
              >
                <Ic d={ICONS.plus} size={14} stroke="#fff" sw={2.5} />
                Ajouter un produit
              </button>
              <button
                type="button"
                className="pp-btn-ghost"
                onClick={() => router.push('/dashboard/drops')}
              >
                <Ic d={ICONS.layers} size={13} stroke="currentColor" />
                Gérer les drops
              </button>
            </div>
          </div>

          {/* ── KPI row ── */}
          <div className="pp-kpi-row">
            <KpiCard label="Total produits"   value={kpis.total}      accent="#0A0A0A" />
            <KpiCard label="Visibles"         value={kpis.visible}    accent="#10B981" />
            <KpiCard label="Épuisés"          value={kpis.outOfStock} accent={kpis.outOfStock > 0 ? '#EF4444' : '#10B981'} />
            <KpiCard label="Stock total"      value={kpis.stockTotal} accent="#6366F1" sub="unités" />
            <KpiCard label="Masqués"          value={kpis.hidden}     accent={kpis.hidden > 0 ? '#F59E0B' : '#9CA3AF'} />
          </div>

          {/* ── Alert ── */}
          {!isLoading && <AlertBanner outOfStock={kpis.outOfStock} hidden={kpis.hidden} />}

          {/* ── Toolbar: tabs + view toggle ── */}
          <div className="pp-toolbar">
            {/* Tabs */}
            <div ref={tabsRef} className="pp-tabs-wrap">
              <div className="pp-tab-indicator" style={{ left: indicator.left, width: indicator.width }} />
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className="pp-tab"
                  data-active={activeTab === tab.id ? 'true' : 'false'}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  <span className="pp-tab-count">{tabCounts[tab.id]}</span>
                </button>
              ))}
            </div>

            {/* View mode */}
            <div className="pp-view-toggle">
              <button
                type="button"
                className="pp-view-btn"
                data-active={viewMode === 'flat' ? 'true' : 'false'}
                onClick={() => setViewMode('flat')}
                title="Vue liste"
              >
                <Ic d={ICONS.list} size={14} />
              </button>
              <button
                type="button"
                className="pp-view-btn"
                data-active={viewMode === 'grouped' ? 'true' : 'false'}
                onClick={() => setViewMode('grouped')}
                title="Grouper par drop"
              >
                <Ic d={ICONS.grid} size={14} />
              </button>
            </div>
          </div>

          {/* ── Content ── */}
          {isLoading ? (
            <div className="pp-list">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : viewMode === 'grouped' ? (
            grouped.map((group, gi) => {
              const startIndex = grouped.slice(0, gi).reduce((acc, g) => acc + g.products.length, 0);
              return (
                <CollectionGroup
                  key={group.name}
                  name={group.name}
                  products={group.products}
                  onToggleVisibility={handleToggle}
                  toggling={!!togglingId}
                  startIndex={startIndex}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                />
              );
            })
          ) : (
            <div className="pp-list">
              {filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  onToggleVisibility={handleToggle}
                  toggling={togglingId === p.id}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
