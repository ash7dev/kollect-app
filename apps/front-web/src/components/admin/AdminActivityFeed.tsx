'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/adminApi';
import { COLORS, UsersIcon, StoreIcon, CheckIcon, TrashIcon } from './AdminIcons';

interface ActivityItem {
  id: string;
  type: 'sale' | 'user' | 'brand' | 'product' | 'system';
  title: string;
  subtitle: string;
  time: string;
  amount?: string;
}

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  const palette = {
    sale:    { bg: 'rgba(16,185,129,0.1)', fg: COLORS.success, icon: <CheckIcon size={16} color={COLORS.success} /> },
    user:    { bg: 'rgba(0,122,255,0.1)',   fg: '#0A84FF', icon: <UsersIcon size={16} color="#0A84FF" /> },
    brand:   { bg: 'rgba(255,107,53,0.1)',  fg: COLORS.primary, icon: <StoreIcon size={16} color={COLORS.primary} /> },
    product: { bg: 'rgba(168,85,247,0.1)',  fg: '#A855F7', icon: <StoreIcon size={16} color="#A855F7" /> }, // Reuse Store for product for now
    system:  { bg: 'rgba(156,163,175,0.1)', fg: COLORS.gray, icon: <TrashIcon size={16} color={COLORS.gray} /> },
  };

  const { bg, fg, icon } = palette[type];
  return (
    <div style={{ 
      width: 40, height: 40, borderRadius: 12, 
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', 
      flexShrink: 0, border: `1px solid ${fg}20` 
    }}>
      {icon}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  return `Il y a ${Math.floor(hrs / 24)}j`;
}

export function AdminActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [ordersRes, brandsRes, usersRes] = await Promise.all([
          adminApi.getAllOrders({ limit: 4 }),
          adminApi.getBrands({ limit: 4 }),
          adminApi.getUsers({ limit: 4 }),
        ]);

        const raw: (ActivityItem & { _d: Date })[] = [];
        
        // Fix mappings: res.data.data contains the actual array now
        if (ordersRes.data?.data) {
          ordersRes.data.data.forEach((o: any) => {
            raw.push({
              _d: new Date(o.createdAt),
              id: o.id, type: 'sale',
              title: `Nouvelle commande ${o.orderNumber}`,
              subtitle: o.client?.name || 'Vente enregistrée',
              time: o.createdAt,
              amount: `${(o.total || 0).toLocaleString('fr-SN')} FCFA`
            });
          });
        }

        if (brandsRes.data?.data) {
          brandsRes.data.data.forEach((b: any) => {
            raw.push({
              _d: new Date(b.createdAt),
              id: b.id, type: 'brand',
              title: `Boutique inscrite: ${b.name}`,
              subtitle: b.user?.name || 'Nouveau vendeur',
              time: b.createdAt
            });
          });
        }

        if (usersRes.data?.data) {
          usersRes.data.data.forEach((u: any) => {
            raw.push({
              _d: new Date(u.createdAt),
              id: u.id, type: 'user',
              title: `Nouvel utilisateur: ${u.firstName || ''} ${u.lastName || ''}`,
              subtitle: u.email,
              time: u.createdAt
            });
          });
        }

        // Trier par date décroissante
        raw.sort((a, b) => b._d.getTime() - a._d.getTime());
        setActivities(raw.slice(0, 10));
      } catch (err) {
        console.error('Erreur feed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 24,
      border: '1px solid rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%',
    }}>
      <div style={{ 
        padding: '24px', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
          Activité Récente
        </h3>
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6, 
          fontSize: 12, 
          fontWeight: 700, 
          color: COLORS.success,
          padding: '4px 10px',
          background: 'rgba(16,185,129,0.1)',
          borderRadius: 20,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <span style={{ 
            width: 6, 
            height: 6, 
            borderRadius: '50%', 
            background: COLORS.success,
            boxShadow: `0 0 8px ${COLORS.success}`
          }} />
          Live
        </span>
      </div>

      <div style={{ padding: '8px 24px 24px', flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ 
              width: 24, height: 24, border: '2px solid rgba(255,255,255,0.1)', 
              borderTopColor: COLORS.primary, borderRadius: '50%', 
              margin: '0 auto 12px',
              animation: 'spin 0.8s linear infinite'
            }} />
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Chargement des activités...</div>
          </div>
        ) : activities.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <UsersIcon size={40} color="rgba(255,255,255,0.1)" />
            <div style={{ color: 'rgba(255,255,255,0.3)', marginTop: 12, fontSize: 14 }}>
              Aucune activité récente pour le moment.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes spin { to { transform: rotate(360deg); } }
              .activity-item { 
                padding: 16px 0; 
                border-bottom: 1px solid rgba(255,255,255,0.03); 
                transition: all 0.2s ease;
              }
              .activity-item:last-child { border-bottom: none; }
              .activity-item:hover { transform: translateX(4px); }
            `}} />
            {activities.map((item, i) => (
              <div key={item.id + i} className="activity-item" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ActivityIcon type={item.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <h4 style={{ 
                      margin: 0, fontSize: 14, fontWeight: 600, color: '#fff', 
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
                    }}>
                      {item.title}
                    </h4>
                    {item.amount && (
                      <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.success, marginLeft: 8 }}>
                        {item.amount}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{item.subtitle}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>{timeAgo(item.time)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
