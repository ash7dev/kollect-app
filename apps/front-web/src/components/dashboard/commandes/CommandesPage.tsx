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

type OrderStatus = 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE';

type CeoOrder = {
  id: string;
  orderNumber: string;
  customer: string;
  amount: number;
  status: OrderStatus;
  date: string;
  itemsCount: number;
  phone: string;
  address: string;
};

type OrderStats = {
  total: number;
  enAttente: number;
  confirmees: number;
  annulees: number;
  revenueTotal: number;
};

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string;
  notes?: string | null;
  client: { firstName: string; lastName: string; phone: string };
  items: {
    id: string;
    productName: string;
    price: number;
    quantity: number;
    size: string | null;
    color: string | null;
    product: { images: string[] } | null;
  }[];
  statusHistory: { status: OrderStatus; details: string; createdAt: string }[];
};

type TabId = 'all' | OrderStatus;

// ─── Icons ────────────────────────────────────────────────────────────────────

function Ic({ d, size = 16, stroke = 'currentColor', sw = 1.5, fill = 'none' }: {
  d: string | string[]; size?: number; stroke?: string; sw?: number; fill?: string;
}) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

const IC = {
  plus:        ['M12 5v14', 'M5 12h14'],
  order:       ['M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2', 'M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z'],
  check:       'M20 6L9 17l-5-5',
  x:           ['M18 6L6 18', 'M6 6l12 12'],
  clock:       ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 6v6l4 2'],
  phone:       'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.11 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.11 6.11l.27-.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  map:         ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  bag:         ['M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'],
  arrow_right: 'M5 12h14M12 5l7 7-7 7',
  close:       ['M18 6L6 18', 'M6 6l12 12'],
  receipt:     ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8'],
  user:        ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  layers:      ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  eye:         ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0'],
  tag:         'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
  trending:    'M23 6l-9.5 9.5-5-5L1 18',
  fcfa:        ['M12 2v20', 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', 'M3 10h18', 'M3 14h18'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' F';
}

function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Date(iso).toLocaleDateString('fr-FR', opts);
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'À l\'instant';
  if (m < 60) return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
}

function statusMeta(s: OrderStatus) {
  switch (s) {
    case 'EN_ATTENTE': return { label: 'En attente',  color: '#92400E', bg: '#FEF3C7', dot: '#F59E0B', icon: IC.clock };
    case 'CONFIRMEE':  return { label: 'Confirmée',   color: '#065F46', bg: '#D1FAE5', dot: '#10B981', icon: IC.check };
    case 'ANNULEE':    return { label: 'Annulée',     color: '#991B1B', bg: '#FEE2E2', dot: '#EF4444', icon: IC.x };
  }
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function FullPageSpinner({ message }: { message: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#FAFAFA' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, margin: '0 auto 16px', border: '2px solid #F0F0F0', borderTopColor: '#E63329', borderRadius: '50%', animation: 'cmd-spin 0.75s linear infinite' }} />
        <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0, fontFamily: 'inherit', fontWeight: 500 }}>{message}</p>
      </div>
      <style>{`@keyframes cmd-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ label, value, accent, sub, pulse }: {
  label: string; value: string | number; accent: string; sub?: string; pulse?: boolean;
}) {
  return (
    <div className="cmd-kpi">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#9CA3AF' }}>
          {label}
        </span>
        {pulse && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F59E0B', animation: 'cmd-pulse 1.4s ease-in-out infinite' }} />}
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: accent, letterSpacing: '-1.5px', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Status Pill ─────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: OrderStatus }) {
  const m = statusMeta(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.4px',
      padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase',
      color: m.color, background: m.bg,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="cmd-row" style={{ pointerEvents: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
        <div className="cmd-shimmer" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="cmd-shimmer" style={{ height: 13, width: '45%', borderRadius: 4, marginBottom: 7 }} />
          <div className="cmd-shimmer" style={{ height: 11, width: '30%', borderRadius: 4 }} />
        </div>
      </div>
      <div className="cmd-shimmer" style={{ height: 24, width: 80, borderRadius: 99 }} />
      <div className="cmd-shimmer" style={{ height: 13, width: 70, borderRadius: 4 }} />
      <div className="cmd-shimmer" style={{ height: 13, width: 60, borderRadius: 4 }} />
      <div className="cmd-shimmer" style={{ height: 34, width: 110, borderRadius: 10 }} />
    </div>
  );
}

// ─── Order Row ────────────────────────────────────────────────────────────────

function OrderRow({ order, index, onView, onConfirm, onCancel, confirming, cancelling }: {
  order: CeoOrder;
  index: number;
  onView: (id: string) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  confirming: boolean;
  cancelling: boolean;
}) {
  const initials = order.customer.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'];
  const avatarColor = colors[order.customer.charCodeAt(0) % colors.length];

  return (
    <div className="cmd-row" style={{ animationDelay: `${index * 0.04}s` }}>

      {/* Avatar + info */}
      <div className="cmd-row-info">
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: avatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: '#fff',
          boxShadow: `0 4px 12px ${avatarColor}44`,
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {order.customer}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
            <code style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.3px' }}>
              #{order.orderNumber}
            </code>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#D1D5DB', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{timeAgo(order.date)}</span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="cmd-row-status">
        <StatusPill status={order.status} />
      </div>

      {/* Items */}
      <div className="cmd-row-items">
        <p style={{ margin: 0, fontSize: 12, color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap' }}>
          {order.itemsCount} article{order.itemsCount > 1 ? 's' : ''}
        </p>
      </div>

      {/* Amount */}
      <div className="cmd-row-amount">
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
          {fmtPrice(order.amount)}
        </p>
      </div>

      {/* Actions */}
      <div className="cmd-row-actions">
        {order.status === 'EN_ATTENTE' && (
          <>
            <button
              type="button"
              className="cmd-btn-confirm"
              onClick={() => onConfirm(order.id)}
              disabled={confirming}
              title="Confirmer"
            >
              <Ic d={IC.check} size={13} stroke="#fff" sw={2.5} />
              Confirmer
            </button>
            <button
              type="button"
              className="cmd-btn-icon cmd-btn-cancel"
              onClick={() => onCancel(order.id)}
              disabled={cancelling}
              title="Annuler"
            >
              <Ic d={IC.x} size={13} />
            </button>
          </>
        )}
        <button
          type="button"
          className="cmd-btn-detail"
          onClick={() => onView(order.id)}
        >
          <Ic d={IC.eye} size={13} />
          Voir détail
        </button>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: TabId }) {
  const m: Record<TabId, { title: string; sub: string }> = {
    all:        { title: 'Aucune commande', sub: 'Les commandes de ta boutique apparaîtront ici.' },
    EN_ATTENTE: { title: 'Aucune commande en attente', sub: 'Super — tout est traité !' },
    CONFIRMEE:  { title: 'Aucune commande confirmée', sub: 'Les commandes confirmées apparaîtront ici.' },
    ANNULEE:    { title: 'Aucune commande annulée', sub: 'Aucune commande n\'a été annulée.' },
  };
  const msg = m[tab];
  return (
    <div style={{ padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{
        width: 96, height: 96, borderRadius: 26, background: '#0A0A0A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28, position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(230,51,41,0.3) 0%, transparent 60%)' }} />
        <Ic d={IC.order} size={36} stroke="rgba(255,255,255,0.6)" sw={1} />
      </div>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '3px', color: '#E63329', textTransform: 'uppercase', marginBottom: 12 }}>Vide</p>
      <h3 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.4px' }}>{msg.title}</h3>
      <p style={{ margin: 0, fontSize: 14, color: '#9CA3AF', maxWidth: 260, lineHeight: 1.65 }}>{msg.sub}</p>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({ orderId, onClose, onConfirm, onCancel, confirming, cancelling }: {
  orderId: string;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  confirming: boolean;
  cancelling: boolean;
}) {
  const detailQuery = useQuery({
    queryKey: ['commande', orderId],
    queryFn: async () => {
      const res = await apiClient.get<OrderDetail>(API_ENDPOINTS.COMMANDES.DETAIL(orderId));
      return res.data;
    },
  });

  const order = detailQuery.data;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(4px)', zIndex: 100,
          animation: 'cmd-fade 0.2s ease',
        }}
      />

      {/* Drawer */}
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 480, maxWidth: '95vw',
        background: '#fff',
        boxShadow: '-8px 0 48px rgba(0,0,0,0.14)',
        zIndex: 101, display: 'flex', flexDirection: 'column',
        animation: 'cmd-slideIn 0.28s cubic-bezier(0.4,0,0.2,1)',
        overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{
          padding: '24px 28px 20px', borderBottom: '1px solid #F0F0F0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#E63329', marginBottom: 4 }}>
              Détail commande
            </p>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.5px' }}>
              #{order?.orderNumber ?? '…'}
            </h2>
          </div>
          <button type="button" className="cmd-close-btn" onClick={onClose}>
            <Ic d={IC.close} size={18} />
          </button>
        </div>

        {detailQuery.isLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 36, height: 36, border: '2px solid #F0F0F0', borderTopColor: '#E63329', borderRadius: '50%', animation: 'cmd-spin 0.75s linear infinite' }} />
          </div>
        ) : !order ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
            Commande introuvable
          </div>
        ) : (
          <div style={{ flex: 1, padding: '0 28px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Status + date */}
            <div style={{ paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <StatusPill status={order.status} />
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{fmtDate(order.createdAt, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Client info */}
            <div style={{ background: '#F9FAFB', borderRadius: 16, padding: '20px 22px' }}>
              <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#9CA3AF' }}>
                Client
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ic d={IC.user} size={16} stroke="rgba(255,255,255,0.8)" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>
                      {order.shippingName || `${order.client.firstName} ${order.client.lastName}`.trim() || 'Client anonyme'}
                    </p>
                    {order.shippingName && order.shippingName !== `${order.client.firstName} ${order.client.lastName}`.trim() && (
                      <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#9CA3AF' }}>
                        Compte: {`${order.client.firstName} ${order.client.lastName}`.trim() || 'Client anonyme'}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 46 }}>
                  <Ic d={IC.phone} size={13} stroke="#9CA3AF" />
                  <span style={{ fontSize: 13, color: '#6B7280' }}>{order.shippingPhone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingLeft: 46 }}>
                  <Ic d={IC.map} size={13} stroke="#9CA3AF" />
                  <span style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
                    {order.shippingAddress}, {order.shippingCity}
                  </span>
                </div>
              </div>
            </div>

            {order.notes && (
              <div style={{ background: '#F9FAFB', borderRadius: 16, padding: '20px 22px' }}>
                <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#9CA3AF' }}>
                  Note client
                </p>
                <p style={{ margin: 0, fontSize: 13, color: '#6B7280', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                  {order.notes}
                </p>
              </div>
            )}

            {/* Items */}
            <div>
              <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#9CA3AF' }}>
                Articles ({order.items.reduce((s, i) => s + i.quantity, 0)})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {order.items.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    background: '#F9FAFB', borderRadius: 14,
                    border: '1px solid #F0F0F0',
                  }}>
                    {/* Thumbnail */}
                    <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#0A0A0A' }}>
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Ic d={IC.bag} size={20} stroke="rgba(255,255,255,0.2)" sw={1} />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0A0A0A', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {item.productName}
                      </p>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                        {item.size && <span style={{ fontSize: 10.5, background: '#E5E7EB', color: '#374151', padding: '2px 7px', borderRadius: 6, fontWeight: 600 }}>{item.size}</span>}
                        {item.color && <span style={{ fontSize: 10.5, background: '#E5E7EB', color: '#374151', padding: '2px 7px', borderRadius: 6, fontWeight: 600 }}>{item.color}</span>}
                        <span style={{ fontSize: 10.5, color: '#9CA3AF' }}>× {item.quantity}</span>
                      </div>
                    </div>
                    {/* Price */}
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0A0A0A', flexShrink: 0, letterSpacing: '-0.3px' }}>
                      {fmtPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total breakdown */}
            <div style={{ background: '#0A0A0A', borderRadius: 16, padding: '20px 22px' }}>
              <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                Récapitulatif
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Sous-total', value: order.subtotal },
                  { label: 'Livraison', value: order.shippingFee },
                  ...(order.discount > 0 ? [{ label: 'Réduction', value: -order.discount }] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
                      {row.value === 0 ? 'Gratuit' : fmtPrice(row.value)}
                    </span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: '#E63329', letterSpacing: '-0.5px' }}>{fmtPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {order.statusHistory?.length > 0 && (
              <div>
                <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#9CA3AF' }}>
                  Historique
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {order.statusHistory.map((h, i) => {
                    const m = statusMeta(h.status);
                    return (
                      <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i < order.statusHistory.length - 1 ? 16 : 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.dot }} />
                          </div>
                          {i < order.statusHistory.length - 1 && (
                            <div style={{ width: 1, flex: 1, background: '#F0F0F0', margin: '4px 0' }} />
                          )}
                        </div>
                        <div style={{ paddingTop: 4, paddingBottom: 4 }}>
                          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: m.color }}>{m.label}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#9CA3AF' }}>{h.details}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 10.5, color: '#D1D5DB' }}>{fmtDate(h.createdAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            {order.status === 'EN_ATTENTE' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="cmd-drawer-confirm"
                  onClick={() => onConfirm(order.id)}
                  disabled={confirming}
                  style={{ flex: 1 }}
                >
                  <Ic d={IC.check} size={14} stroke="#fff" sw={2.5} />
                  {confirming ? 'Confirmation…' : 'Confirmer la commande'}
                </button>
                <button
                  type="button"
                  className="cmd-drawer-cancel"
                  onClick={() => onCancel(order.id)}
                  disabled={cancelling}
                >
                  <Ic d={IC.x} size={14} />
                  {cancelling ? '…' : 'Annuler'}
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: 'all',        label: 'Toutes' },
  { id: 'EN_ATTENTE', label: 'En attente' },
  { id: 'CONFIRMEE',  label: 'Confirmées' },
  { id: 'ANNULEE',    label: 'Annulées' },
];

export function CommandesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { checking } = useOnboardingGuard();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const qc = useQueryClient();

  // ── Fetch orders ──
  const ordersQuery = useQuery({
    queryKey: ['dashboard', 'commandes', activeTab],
    queryFn: async () => {
      const status = activeTab === 'all' ? undefined : activeTab;
      const res = await apiClient.get<{ data: CeoOrder[]; meta: { total: number } }>(
        API_ENDPOINTS.COMMANDES.BOUTIQUE_LIST(1, 50, status),
      );
      return res.data;
    },
    enabled: !!user?.isCEO,
    staleTime: 20_000,
    refetchInterval: 60_000,
  });

  // ── Fetch stats ──
  const statsQuery = useQuery({
    queryKey: ['dashboard', 'commandes', 'stats'],
    queryFn: async () => {
      const res = await apiClient.get<OrderStats>(API_ENDPOINTS.COMMANDES.BOUTIQUE_STATS);
      return res.data;
    },
    enabled: !!user?.isCEO,
    staleTime: 30_000,
  });

  const orders: CeoOrder[] = ordersQuery.data?.data ?? [];
  const stats = statsQuery.data;

  // ── Confirm ──
  const confirmMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(API_ENDPOINTS.COMMANDES.CONFIRMER(id), {}),
    onMutate: (id) => { setActionId(id); toast.loading('Confirmation…', { id: 'cmd-action' }); },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['dashboard', 'commandes'] });
      if (selectedOrderId) await qc.invalidateQueries({ queryKey: ['commande', selectedOrderId] });
      toast.success('Commande confirmée !', { id: 'cmd-action' });
    },
    onError: () => toast.error('Erreur lors de la confirmation', { id: 'cmd-action' }),
    onSettled: () => setActionId(null),
  });

  // ── Cancel ──
  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(API_ENDPOINTS.COMMANDES.ANNULER(id), {}),
    onMutate: (id) => { setActionId(id); toast.loading('Annulation…', { id: 'cmd-action' }); },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['dashboard', 'commandes'] });
      if (selectedOrderId) await qc.invalidateQueries({ queryKey: ['commande', selectedOrderId] });
      toast.success('Commande annulée', { id: 'cmd-action' });
      // Garder le drawer ouvert pour voir le changement de statut
    },
    onError: () => toast.error('Erreur lors de l\'annulation', { id: 'cmd-action' }),
    onSettled: () => setActionId(null),
  });

  const handleConfirm = useCallback((id: string) => confirmMutation.mutate(id), [confirmMutation]);
  const handleCancel  = useCallback((id: string) => cancelMutation.mutate(id),  [cancelMutation]);

  // ── Tab indicator ──
  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    const activeEl = container.querySelector<HTMLButtonElement>('[data-active="true"]');
    if (!activeEl) return;
    const cr = container.getBoundingClientRect();
    const ar = activeEl.getBoundingClientRect();
    setIndicator({ left: ar.left - cr.left, width: ar.width });
  }, [activeTab, ordersQuery.isLoading]);

  if (checking || authLoading) return <FullPageSpinner message="Chargement…" />;
  if (!user?.isCEO) return <FullPageSpinner message="Accès réservé aux comptes CEO." />;

  const tabCounts: Record<TabId, number> = {
    all:        stats?.total        ?? 0,
    EN_ATTENTE: stats?.enAttente    ?? 0,
    CONFIRMEE:  stats?.confirmees   ?? 0,
    ANNULEE:    stats?.annulees     ?? 0,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cmd-layout {
          min-height: 100vh; display: grid; background: #FAFAFA;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .cmd-main { padding: 28px 32px 60px; min-width: 0; }

        /* ── Hero ── */
        .cmd-hero {
          margin-bottom: 32px; padding: 32px 36px;
          border-radius: 20px; background: #0A0A0A;
          position: relative; overflow: hidden;
        }
        .cmd-hero::before {
          content: ''; position: absolute;
          top: -60px; right: -60px; width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(circle, rgba(230,51,41,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .cmd-hero::after {
          content: 'COMMANDES'; position: absolute;
          right: 36px; bottom: -18px; font-family: inherit;
          font-size: 96px; font-weight: 900;
          color: rgba(255,255,255,0.03); letter-spacing: -4px;
          pointer-events: none; user-select: none; line-height: 1;
        }
        .cmd-hero-label { font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #E63329; margin-bottom: 10px; }
        .cmd-hero-title { font-size: 34px; font-weight: 800; color: #fff; letter-spacing: -0.8px; line-height: 1.1; margin-bottom: 8px; }
        .cmd-hero-sub   { font-size: 13px; color: rgba(255,255,255,0.4); }
        .cmd-hero-live  {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 24px; padding: 8px 16px; border-radius: 99px;
          background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.2);
          font-size: 12px; font-weight: 700; color: #10B981; letter-spacing: '0.2px';
        }
        .cmd-live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #10B981;
          animation: cmd-pulse 1.4s ease-in-out infinite;
        }

        /* ── KPIs ── */
        .cmd-kpi-row { display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
        .cmd-kpi {
          flex: 1; min-width: 110px;
          padding: 20px 22px; background: #fff;
          border: 1px solid #F0F0F0; border-radius: 18px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .cmd-kpi:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }

        /* ── Tabs ── */
        .cmd-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
        .cmd-tabs-wrap {
          display: inline-flex; padding: 3px;
          background: #fff; border: 1px solid #EBEBEB;
          border-radius: 12px; position: relative; gap: 2px;
        }
        .cmd-tab-indicator {
          position: absolute; top: 3px; bottom: 3px; border-radius: 9px;
          background: #0A0A0A;
          transition: left 0.22s cubic-bezier(0.4,0,0.2,1), width 0.22s cubic-bezier(0.4,0,0.2,1);
          pointer-events: none;
        }
        .cmd-tab {
          position: relative; z-index: 1;
          padding: 8px 16px; border: none; background: transparent;
          cursor: pointer; font-family: inherit;
          font-size: 12.5px; font-weight: 600;
          color: #9CA3AF; border-radius: 9px;
          transition: color 0.15s; white-space: nowrap;
        }
        .cmd-tab[data-active="true"] { color: #fff; }
        .cmd-tab-count {
          display: inline-flex; align-items: center; justify-content: center;
          margin-left: 5px; min-width: 18px; height: 18px;
          padding: 0 5px; border-radius: 99px;
          font-size: 10px; font-weight: 800;
          background: rgba(0,0,0,0.06); color: #6B7280;
        }
        .cmd-tab[data-active="true"] .cmd-tab-count { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.8); }

        /* ── Table header ── */
        .cmd-table-head {
          display: flex; align-items: center; gap: 16px;
          padding: 10px 20px; margin-bottom: 6px;
          border-bottom: 1px solid #F0F0F0;
        }
        .cmd-th {
          font-size: 10px; font-weight: 700; letter-spacing: '1.5px';
          text-transform: uppercase; color: #9CA3AF;
        }

        /* ── Order row ── */
        .cmd-row {
          display: flex; align-items: center; gap: 16px;
          padding: 14px 20px; background: #fff;
          border: 1px solid #F0F0F0; border-radius: 16px;
          margin-bottom: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
          transition: transform 0.18s, box-shadow 0.18s;
          animation: cmd-rise 0.45s cubic-bezier(0.4,0,0.2,1) both;
        }
        .cmd-row:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.07), 0 12px 32px rgba(0,0,0,0.07); }

        /* ── Buttons ── */
        .cmd-btn-confirm {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 8px 14px; border-radius: 10px;
          background: #059669; color: #fff; border: none;
          font-family: inherit; font-size: 12px; font-weight: 700;
          cursor: pointer; transition: background 0.15s; white-space: nowrap;
        }
        .cmd-btn-confirm:hover:not(:disabled) { background: #047857; }
        .cmd-btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
        .cmd-btn-icon {
          width: 34px; height: 34px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; transition: all 0.15s; flex-shrink: 0;
        }
        .cmd-btn-cancel { background: #FEE2E2; color: #EF4444; }
        .cmd-btn-cancel:hover:not(:disabled) { background: #FECACA; }
        .cmd-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
        .cmd-btn-detail {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          background: #F3F4F6; color: #374151; border: none;
          font-family: inherit; font-size: 12.5px; font-weight: 700;
          cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .cmd-btn-detail:hover { background: #0A0A0A; color: #fff; }

        /* ── Drawer ── */
        .cmd-close-btn {
          width: 36px; height: 36px; border-radius: 10px;
          background: #F3F4F6; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #6B7280; transition: all 0.15s;
        }
        .cmd-close-btn:hover { background: #E5E7EB; color: #111; }
        .cmd-drawer-confirm {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px; border-radius: 12px;
          background: #059669; color: #fff; border: none;
          font-family: inherit; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: background 0.15s;
        }
        .cmd-drawer-confirm:hover:not(:disabled) { background: #047857; }
        .cmd-drawer-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
        .cmd-drawer-cancel {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 14px 20px; border-radius: 12px;
          background: #FEE2E2; color: #EF4444; border: none;
          font-family: inherit; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: background 0.15s;
        }
        .cmd-drawer-cancel:hover:not(:disabled) { background: #FECACA; }
        .cmd-drawer-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Shimmer ── */
        @keyframes cmd-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .cmd-shimmer {
          background: linear-gradient(90deg, #F3F4F6 25%, #E9EAEC 50%, #F3F4F6 75%);
          background-size: 800px 100%; animation: cmd-shimmer 1.5s infinite;
        }

        /* ── Animations ── */
        @keyframes cmd-rise    { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cmd-fade    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cmd-slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes cmd-spin    { to { transform: rotate(360deg); } }
        @keyframes cmd-pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        /* ── Row inner classes (desktop) ── */
        .cmd-row-info {
          display: flex; align-items: center; gap: 14px;
          flex: 1; min-width: 0;
        }
        .cmd-row-status { flex-shrink: 0; }
        .cmd-row-items  { text-align: right; flex-shrink: 0; min-width: 70px; }
        .cmd-row-amount { text-align: right; flex-shrink: 0; min-width: 90px; }
        .cmd-row-actions { display: flex; gap: 6px; flex-shrink: 0; }

        /* ── Mobile burger ── */
        .cmd-mobile-burger {
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
        .cmd-mobile-burger:hover { background: rgba(255,255,255,0.2); color: #fff; }
        .cmd-hero-actions { display: flex; align-items: center; gap: 10px; margin-top: 24px; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .cmd-table-head { display: none; }
        }
        @media (max-width: 768px) {
          .cmd-layout { grid-template-columns: 1fr !important; }
          .cmd-main { padding: 0 14px 40px !important; }
          .cmd-mobile-burger { display: flex !important; }
          .cmd-hero { padding: 20px 18px; margin-bottom: 20px; }
          .cmd-hero-title { font-size: 24px; }

          /* KPIs : grille 2 colonnes */
          .cmd-kpi-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .cmd-kpi { min-width: 0; padding: 14px 16px; }

          /* Tabs */
          .cmd-toolbar { flex-wrap: wrap; gap: 8px; }
          .cmd-tabs-wrap { overflow-x: auto; max-width: 100%; }

          /* Order rows : 2 lignes */
          .cmd-row {
            flex-wrap: wrap;
            gap: 10px;
            padding: 14px;
          }
          .cmd-row-info {
            width: 100%;
            flex: unset;
          }
          .cmd-row-items { display: none; }
          .cmd-row-status { order: 2; }
          .cmd-row-amount { order: 3; margin-left: auto; min-width: 0; }
          .cmd-row-actions { order: 4; }
          .cmd-btn-confirm { padding: 7px 12px; font-size: 12px; }
          .cmd-btn-detail  { padding: 7px 12px; font-size: 12px; }
        }
        @media (max-width: 480px) {
          .cmd-hero-title { font-size: 20px; }
          .cmd-row-actions { width: 100%; order: 5; justify-content: flex-end; }
          .cmd-btn-detail { flex: 1; justify-content: center; }
        }
      `}</style>

      <div
        className="cmd-layout"
        style={{ gridTemplateColumns: `${sidebarCollapsed ? 68 : 256}px 1fr`, transition: 'grid-template-columns 0.22s cubic-bezier(0.4,0,0.2,1)' }}
      >
        <DashboardSidebar
          brandName={user?.brand?.name ?? undefined}
          userInitials={((user?.firstName ?? user?.email ?? 'C')[0]).toUpperCase()}
          userEmail={user?.email ?? undefined}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          active="orders"
          onNavigate={(section: SidebarSection) => {
            if (section === 'overview')       router.push('/dashboard');
            else if (section === 'drops')     router.push('/dashboard/drops');
            else if (section === 'products')  router.push('/dashboard/produits');
            else if (section === 'orders')    router.push('/dashboard/commandes');
            else router.push('/dashboard');
          }}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <main className="cmd-main">

          {/* ── Hero ── */}
          <div className="cmd-hero">
            <p className="cmd-hero-label">Boutique</p>
            <h1 className="cmd-hero-title">Commandes</h1>
            <p className="cmd-hero-sub">
              {stats ? `${stats.total} commande${stats.total !== 1 ? 's' : ''} au total · ${fmtPrice(stats.revenueTotal)} de CA confirmé` : 'Chargement…'}
            </p>
            <div className="cmd-hero-actions">
              <button
                type="button"
                className="cmd-mobile-burger"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>
              {(stats?.enAttente ?? 0) > 0 && (
                <div className="cmd-hero-live">
                  <span className="cmd-live-dot" />
                  {stats!.enAttente} en attente de traitement
                </div>
              )}
            </div>
          </div>

          {/* ── KPIs ── */}
          <div className="cmd-kpi-row">
            <KpiCard label="Total"       value={stats?.total ?? '—'}      accent="#0A0A0A" />
            <KpiCard label="En attente"  value={stats?.enAttente ?? '—'}  accent="#F59E0B" pulse={(stats?.enAttente ?? 0) > 0} />
            <KpiCard label="Confirmées"  value={stats?.confirmees ?? '—'} accent="#10B981" />
            <KpiCard label="Annulées"    value={stats?.annulees ?? '—'}   accent="#EF4444" />
            <KpiCard label="CA confirmé" value={stats ? fmtPrice(stats.revenueTotal) : '—'} accent="#6366F1" sub="FCFA" />
          </div>

          {/* ── Toolbar ── */}
          <div className="cmd-toolbar">
            <div ref={tabsRef} className="cmd-tabs-wrap">
              <div className="cmd-tab-indicator" style={{ left: indicator.left, width: indicator.width }} />
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className="cmd-tab"
                  data-active={activeTab === tab.id ? 'true' : 'false'}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  <span className="cmd-tab-count">{tabCounts[tab.id]}</span>
                </button>
              ))}
            </div>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              {orders.length} résultat{orders.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Content ── */}
          {ordersQuery.isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : orders.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            orders.map((order, i) => (
              <OrderRow
                key={order.id}
                order={order}
                index={i}
                onView={setSelectedOrderId}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                confirming={actionId === order.id && confirmMutation.isPending}
                cancelling={actionId === order.id && cancelMutation.isPending}
              />
            ))
          )}
        </main>
      </div>

      {/* ── Detail Drawer ── */}
      {selectedOrderId && (
        <DetailDrawer
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          confirming={actionId === selectedOrderId && confirmMutation.isPending}
          cancelling={actionId === selectedOrderId && cancelMutation.isPending}
        />
      )}
    </>
  );
}
