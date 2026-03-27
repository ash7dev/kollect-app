/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { FONT_FAMILY_INTER } from '@/styles/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'LIVREE';

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  productName: string;
  size: string | null;
  color: string | null;
  product: { name: string; images: string[] } | null;
};

type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  address: string;
  city: string;
  phone: string;
  notes?: string | null;
  items: OrderItem[];
  brand: { name: string; logo: string | null; slug: string };
};

type OrdersResponse = {
  data: Order[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(n: any) {
  const num = Number(n);
  if (isNaN(num) || !isFinite(num)) return '0 CFA';
  return new Intl.NumberFormat('fr-FR').format(Math.round(num)) + ' CFA';
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(iso));
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; dot: string }> = {
  EN_ATTENTE: { label: 'En attente',  color: '#B45309', bg: '#FEF3C7', dot: '#F59E0B' },
  CONFIRMEE:  { label: 'Confirmée',   color: '#065F46', bg: '#D1FAE5', dot: '#10B981' },
  ANNULEE:    { label: 'Annulée',     color: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' },
  LIVREE:     { label: 'Livrée',      color: '#1E3A5F', bg: '#DBEAFE', dot: '#3B82F6' },
};

const FILTER_TABS: { key: string; label: string }[] = [
  { key: 'all',        label: 'Toutes' },
  { key: 'EN_ATTENTE', label: 'En attente' },
  { key: 'CONFIRMEE',  label: 'Confirmées' },
  { key: 'ANNULEE',    label: 'Annulées' },
];

// ─── Skeleton ────────────────────────────────────────────────────────────────

function OrderSkeleton() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      border: '1.5px solid rgba(0,0,0,0.07)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="op-sk" style={{ width: 40, height: 40, borderRadius: 12 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="op-sk" style={{ width: 120, height: 13, borderRadius: 6 }} />
            <div className="op-sk" style={{ width: 80, height: 11, borderRadius: 6 }} />
          </div>
        </div>
        <div className="op-sk" style={{ width: 90, height: 26, borderRadius: 20 }} />
      </div>
      {/* Items */}
      <div style={{ padding: '14px 20px', display: 'flex', gap: 10 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="op-sk" style={{ width: 60, height: 60, borderRadius: 12, flexShrink: 0 }} />
        ))}
      </div>
      {/* Footer */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div className="op-sk" style={{ width: 100, height: 13, borderRadius: 6 }} />
        <div className="op-sk" style={{ width: 130, height: 36, borderRadius: 12 }} />
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ animationDelay: `${i * 0.1}s` }}>
          <OrderSkeleton />
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyOrders({ filtered }: { filtered: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '80px 24px', textAlign: 'center', gap: 20,
    }}>
      <div style={{
        width: 88, height: 88, borderRadius: 28,
        background: 'linear-gradient(145deg, #F3F4F6, #E9EAEC)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
          stroke="rgba(0,0,0,0.22)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      </div>
      <div>
        <p style={{ fontSize: 17, fontWeight: 900, margin: '0 0 8px', color: '#0A0A0A', letterSpacing: '-0.4px' }}>
          {filtered ? 'Aucune commande ici' : 'Aucune commande'}
        </p>
        <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.42)', margin: 0, lineHeight: 1.65, maxWidth: 260 }}>
          {filtered
            ? 'Aucune commande ne correspond à ce filtre.'
            : 'Tes commandes apparaîtront ici dès que tu passeras une commande.'}
        </p>
      </div>
      {!filtered && (
        <Link
          href="/explorer"
          style={{
            marginTop: 4, padding: '12px 28px', borderRadius: 14,
            background: '#0A0A0A', color: '#fff', fontSize: 13, fontWeight: 800,
            textDecoration: 'none', letterSpacing: '-0.2px',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
        >
          Explorer les drops
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.EN_ATTENTE;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 700, letterSpacing: '0.1px', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({ order, onCancel, cancelPending }: {
  order: Order;
  onCancel: (id: string) => void;
  cancelPending: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const previewItems = order.items.slice(0, 4);
  const extras = order.items.length - 4;

  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      border: '1.5px solid rgba(0,0,0,0.07)',
      overflow: 'hidden',
      boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.2s',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {/* Brand logo */}
          <Link href={`/brand/${order.brand.slug}`} style={{ display: 'block', flexShrink: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: '#F3F4F6', overflow: 'hidden',
              border: '1.5px solid rgba(0,0,0,0.07)',
            }}>
              {order.brand.logo ? (
                <img src={order.brand.logo} alt={order.brand.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 900, color: 'rgba(0,0,0,0.3)',
                }}>
                  {order.brand.name[0]}
                </div>
              )}
            </div>
          </Link>

          <div style={{ minWidth: 0 }}>
            <Link href={`/brand/${order.brand.slug}`} style={{ textDecoration: 'none' }}>
              <p style={{
                margin: 0, fontSize: 14, fontWeight: 800, color: '#0A0A0A',
                letterSpacing: '-0.2px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {order.brand.name}
              </p>
            </Link>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
              #{order.orderNumber} · {fmtDate(order.createdAt)}
            </p>
          </div>
        </div>

        <StatusBadge status={order.status} />
      </div>

      {/* ── Items preview ── */}
      <div style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {previewItems.map((item, i) => {
            const img = item.product?.images?.[0] ?? null;
            return (
              <div key={item.id} style={{
                width: 60, height: 60, borderRadius: 12, flexShrink: 0,
                background: '#F3F4F6', overflow: 'hidden',
                border: '1.5px solid rgba(0,0,0,0.06)',
                position: 'relative',
              }}>
                {img ? (
                  <img src={img} alt={item.productName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg,#F3F4F6,#E9EAEC)' }} />
                )}
                {item.quantity > 1 && (
                  <span style={{
                    position: 'absolute', bottom: 3, right: 3,
                    background: 'rgba(0,0,0,0.7)', color: '#fff',
                    fontSize: 9, fontWeight: 800, borderRadius: 4,
                    padding: '1px 4px', lineHeight: 1.4,
                  }}>×{item.quantity}</span>
                )}
              </div>
            );
          })}
          {extras > 0 && (
            <div style={{
              width: 60, height: 60, borderRadius: 12, flexShrink: 0,
              background: '#F3F4F6', border: '1.5px solid rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: 'rgba(0,0,0,0.45)',
            }}>
              +{extras}
            </div>
          )}
        </div>

        {/* Expanded details */}
        {expanded && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {order.items.map(item => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: 12,
                background: '#F9FAFB', border: '1px solid rgba(0,0,0,0.05)',
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0A0A0A' }}>
                    {item.productName}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
                    Qté {item.quantity}
                    {item.size && ` · ${item.size}`}
                    {item.color && ` · ${item.color}`}
                  </p>
                </div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#0A0A0A' }}>
                  {fmtPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}

            {/* Delivery info */}
            <div style={{
              marginTop: 4, padding: '12px 14px', borderRadius: 12,
              background: '#F9FAFB', border: '1px solid rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                Livraison
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#0A0A0A', fontWeight: 500 }}>
                {order.address}, {order.city}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{order.phone}</p>
              {order.notes && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(0,0,0,0.45)', fontStyle: 'italic' }}>
                  &ldquo;{order.notes}&rdquo;
                </p>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          style={{
            marginTop: 10, background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 700, color: 'rgba(0,0,0,0.4)',
            padding: '4px 0', display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: 'inherit', transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#0A0A0A')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.4)')}
        >
          {expanded ? 'Masquer les détails' : 'Voir les détails'}
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.38)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Total
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.6px' }}>
            {fmtPrice(order.total)}
          </p>
        </div>

        {order.status === 'EN_ATTENTE' && (
          <button
            type="button"
            disabled={cancelPending}
            onClick={() => onCancel(order.id)}
            style={{
              padding: '10px 18px', borderRadius: 12,
              border: '1.5px solid rgba(239,68,68,0.3)',
              background: cancelPending ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.06)',
              color: '#EF4444',
              fontSize: 13, fontWeight: 700, cursor: cancelPending ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              opacity: cancelPending ? 0.6 : 1,
              transition: 'background 0.15s, border-color 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { if (!cancelPending) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)'; }}
          >
            {cancelPending ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                style={{ animation: 'op-spin 0.75s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            )}
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const qc = useQueryClient();

  const statusParam = activeFilter === 'all' ? undefined : activeFilter;

  const { data, isLoading, isError } = useQuery<OrdersResponse>({
    queryKey: ['my-orders', statusParam],
    queryFn: async () => {
      const res = await apiClient.get<OrdersResponse>(
        API_ENDPOINTS.COMMANDES.MY_ORDERS(1, 20, statusParam),
      );
      return res.data;
    },
    enabled: !!user,
  });

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) =>
      apiClient.patch(API_ENDPOINTS.COMMANDES.ANNULER(orderId)),
    onMutate: (orderId) => {
      setCancellingId(orderId);
      toast.loading('Annulation en cours…', { id: 'cancel-order' });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Commande annulée.', { id: 'cancel-order' });
    },
    onError: () => {
      toast.error('Impossible d\'annuler cette commande.', { id: 'cancel-order' });
    },
    onSettled: () => setCancellingId(null),
  });

  const orders = data?.data ?? [];
  const total  = data?.meta.total ?? 0;

  return (
    <>
      <style>{`
        @keyframes op-sk {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        @keyframes op-spin { to { transform: rotate(360deg); } }
        .op-sk {
          background: rgba(0,0,0,0.07);
          animation: op-sk 1.4s ease-in-out infinite;
        }
        .op-tab-btn { transition: all 0.18s ease; }
        .op-tab-btn:hover { background: rgba(0,0,0,0.06) !important; }
      `}</style>
      
      <div style={{ fontFamily: FONT_FAMILY_INTER }}>
        {/* Header avec compteur */}
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          gap: 16, marginBottom: 32, flexWrap: 'wrap' 
        }}>
          <div>
            <h2 style={{
              margin: 0, fontSize: 24, fontWeight: 900,
              color: '#0A0A0A', letterSpacing: '-0.8px', lineHeight: 1.2,
            }}>
              Mes commandes
            </h2>
            <p style={{
              margin: '4px 0 0', fontSize: 14, color: 'rgba(0,0,0,0.5)',
              fontWeight: 500,
            }}>
              Suivi de tes achats et livraisons
            </p>
          </div>
          {!isLoading && total > 0 && (
            <span style={{
              padding: '6px 16px', borderRadius: 20,
              background: '#0A0A0A', color: '#fff',
              fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px',
            }}>
              {total} commande{total > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28,
        }}>
          {FILTER_TABS.map(tab => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                className="op-tab-btn"
                onClick={() => setActiveFilter(tab.key)}
                style={{
                  padding: '9px 18px', borderRadius: 12,
                  border: isActive ? 'none' : '1.5px solid rgba(0,0,0,0.09)',
                  background: isActive ? '#0A0A0A' : '#fff',
                  color: isActive ? '#fff' : 'rgba(0,0,0,0.55)',
                  fontSize: 13, fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer', letterSpacing: '-0.1px',
                  fontFamily: 'inherit',
                  boxShadow: isActive ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* List */}
        {authLoading || isLoading ? (
          <SkeletonList />
        ) : isError ? (
          <div style={{
            padding: '48px 24px', textAlign: 'center',
            background: '#fff', borderRadius: 20, border: '1.5px solid rgba(0,0,0,0.07)',
          }}>
            <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#0A0A0A' }}>
              Impossible de charger vos commandes
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(0,0,0,0.42)' }}>
              Vérifiez votre connexion et réessayez.
            </p>
          </div>
        ) : orders.length === 0 ? (
          <EmptyOrders filtered={activeFilter !== 'all'} />
        ) : (
            <div style={{ fontFamily: FONT_FAMILY_INTER, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={(id) => cancelMutation.mutate(id)}
                cancelPending={cancellingId === order.id && cancelMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
