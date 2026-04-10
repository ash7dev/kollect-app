'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { adminApi } from '@/services/adminApi';

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  trackingNumber?: string | null;
  createdAt: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  client?: {
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
  };
  brand?: {
    name?: string;
  };
  items?: Array<{
    id: string;
    quantity: number;
    price?: number;
    product?: { name?: string | null };
    variant?: { size?: string | null; color?: string | null };
  }>;
  statusHistory?: Array<{
    id: string;
    status: string;
    details?: string | null;
    createdAt: string;
    changedBy?: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string;
    } | null;
  }>;
};

function fmtDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-SN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtFcfa(value?: number) {
  if (value == null) return '—';
  return `${value.toLocaleString('fr-SN')} FCFA`;
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getOrderById(params.id);
        setOrder(res.data as unknown as OrderDetail);
      } catch (error) {
        console.error('Error fetching admin order detail:', error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) void load();
  }, [params.id]);

  if (loading) {
    return <div style={{ padding: 24 }}>Chargement de la commande…</div>;
  }

  if (!order) {
    return <div style={{ padding: 24 }}>Commande introuvable.</div>;
  }

  const clientName = `${order.client?.firstName ?? ''} ${order.client?.lastName ?? ''}`.trim() || order.client?.email || 'Client';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#111' }}>{order.orderNumber}</h2>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(0,0,0,0.5)' }}>{clientName}</p>
        </div>
        <Link href="/admin/orders" style={{ textDecoration: 'none', color: '#FF3B30', fontWeight: 700, fontSize: 14 }}>
          ← Retour aux commandes
        </Link>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        {[
          { label: 'Statut commande', value: order.status },
          { label: 'Statut paiement', value: order.paymentStatus },
          { label: 'Total', value: fmtFcfa(order.total) },
          { label: 'Mode de paiement', value: order.paymentMethod },
          { label: 'Marque', value: order.brand?.name || '—' },
          { label: 'Tracking', value: order.trackingNumber || '—' },
        ].map((item) => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(0,0,0,0.42)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {item.label}
            </div>
            <div style={{ marginTop: 10, fontSize: 18, fontWeight: 800, color: '#111' }}>{item.value}</div>
          </div>
        ))}
      </section>

      <section style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111' }}>Chronologie</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>Créée le: {fmtDate(order.createdAt)}</div>
          <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>Confirmée le: {fmtDate(order.confirmedAt)}</div>
          <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>Annulée le: {fmtDate(order.cancelledAt)}</div>
        </div>
      </section>

      <section style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111' }}>Articles</h3>
        {!order.items?.length ? (
          <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>Aucun article.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {order.items.map((item) => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{item.product?.name || 'Produit'}</div>
                <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.62)' }}>Qté: {item.quantity}</div>
                <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.62)' }}>
                  {item.variant?.size || item.variant?.color ? `${item.variant?.size || '—'} / ${item.variant?.color || '—'}` : '—'}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.62)' }}>{fmtFcfa(item.price)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111' }}>Historique de statuts</h3>
        {!order.statusHistory?.length ? (
          <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>Aucun historique enregistré.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {order.statusHistory.map((entry) => (
              <div key={entry.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>{entry.status}</div>
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.58)' }}>
                  {entry.details || 'Sans détail'} · {fmtDate(entry.createdAt)}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.42)' }}>
                  Par: {`${entry.changedBy?.firstName ?? ''} ${entry.changedBy?.lastName ?? ''}`.trim() || entry.changedBy?.email || 'Système'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
