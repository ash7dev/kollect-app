'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApi, type User, type UserStats } from '@/services/adminApi';
import { 
  COLORS, 
  CheckIcon, 
  UsersIcon, 
  SearchIcon, 
  EyeIcon, 
  FilterIcon, 
  StoreIcon, 
  ShieldIcon,
  TrashIcon
} from './AdminIcons';

export function AdminUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'ceo' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // On convertit 'ceo' en 'isCEO' (uppercase) pour correspondre au schéma Prisma
        const roleParam = roleFilter === 'all' 
          ? undefined 
          : roleFilter === 'ceo' 
            ? 'isCEO' 
            : `is${roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}`;

        const [usersResponse, statsResponse] = await Promise.all([
          adminApi.getUsers({
            search,
            role: roleParam as any,
            status: statusFilter === 'all' ? undefined : statusFilter,
            limit: 50,
          }),
          adminApi.getStats('30days'),
        ]);
        
        setUsers(usersResponse.data.data);
        setStats({
          total: statsResponse.data.users.total,
          clients: statsResponse.data.users.total, // Approximé pour le moment
          ceos: statsResponse.data.brands.total,
          admins: 0,
          active: statsResponse.data.users.active,
          inactive: statsResponse.data.users.total - statsResponse.data.users.active,
        });
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const filteredUsers = users.filter(user => {
    const term = search.toLowerCase();
    const name = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const matchesSearch = user.email.toLowerCase().includes(term) || name.includes(term);
    
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'client' && user.isClient) ||
                       (roleFilter === 'ceo' && user.isCEO) ||
                       (roleFilter === 'admin' && user.isAdmin);
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (user: User) => {
    if (user.isAdmin) return { color: COLORS.danger, text: 'Admin', icon: <ShieldIcon size={12} color="#fff" /> };
    if (user.isCEO) return { color: COLORS.warning, text: 'CEO', icon: <StoreIcon size={12} color="#fff" /> };
    return { color: COLORS.secondary, text: 'Client', icon: <UsersIcon size={12} color="#fff" /> };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-SN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.05)', borderTopColor: COLORS.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Stats Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20
        }}>
          {[
            { label: 'Total Utilisateurs', value: stats.total, color: COLORS.primary, icon: <UsersIcon size={24} color={COLORS.primary} /> },
            { label: 'Clients actifs', value: stats.active, color: COLORS.success, icon: <CheckIcon size={24} color={COLORS.success} /> },
            { label: 'CEO / Vendeurs', value: stats.ceos, color: COLORS.warning, icon: <StoreIcon size={24} color={COLORS.warning} /> },
            { label: 'Utilisateurs inactifs', value: stats.inactive, color: COLORS.gray, icon: <TrashIcon size={24} color={COLORS.gray} /> }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              borderRadius: 20,
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                  {stat.value.toLocaleString()}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label}
                </div>
              </div>
              <div style={{
                width: 54, height: 54, borderRadius: 16,
                background: `rgba(${stat.color === COLORS.primary ? '255,107,53' : '255,255,255'}, 0.05)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters Bar */}
      <div style={{
        display: 'flex',
        gap: 16,
        padding: '16px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.05)',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
            <SearchIcon size={18} color="#fff" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un utilisateur (email, nom...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '12px 16px 12px 48px',
              color: '#fff',
              fontSize: 14,
              outline: 'none',
              transition: 'all 0.2s',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative' }}>
             <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              style={{
                appearance: 'none',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '12px 40px 12px 16px',
                color: '#fff',
                fontSize: 14,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all">Tous les rôles</option>
              <option value="client">Clients</option>
              <option value="ceo">CEO / Vendeurs</option>
              <option value="admin">Administrateurs</option>
            </select>
            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
              <FilterIcon size={14} color="#fff" />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{
                appearance: 'none',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '12px 40px 12px 16px',
                color: '#fff',
                fontSize: 14,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
             <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
              <CheckIcon size={14} color="#fff" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 24,
        border: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['Utilisateur', 'Rôle', 'Statut', 'Marque', 'Inscription', 'Actions'].map((h) => (
                  <th key={h} style={{ 
                    padding: '20px 24px', 
                    textAlign: 'left', 
                    fontSize: 12, 
                    fontWeight: 700, 
                    color: 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => {
                const role = getRoleBadge(user);
                
                return (
                  <tr key={user.id} style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    transition: 'background 0.2s'
                  }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 14,
                          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 15, fontWeight: 700, color: '#fff',
                          boxShadow: '0 4px 12px rgba(255,107,53,0.2)'
                        }}>
                          {user.firstName?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>
                            {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email.split('@')[0]}
                          </div>
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 14px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#fff',
                        background: `${role.color}20`,
                        border: `1px solid ${role.color}40`
                      }}>
                        {role.icon}
                        {role.text}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ 
                          width: 8, height: 8, borderRadius: '50%', 
                          background: user.isActive ? COLORS.success : COLORS.gray 
                        }} />
                        <span style={{ fontSize: 14, fontWeight: 500, color: user.isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      {user.brand ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{user.brand.name}</span>
                          {user.brand.isVerified && <CheckIcon size={14} color={COLORS.success} />}
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>Aucune</span>
                      )}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{formatDate(user.createdAt)}</div>
                      {user.lastLoginAt && (
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                          Dernière connexion: {formatDate(user.lastLoginAt)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <Link
                          href={`/admin/users/${user.id}`}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'flex', alignItems: 'center', gap: 6,
                            transition: 'all 0.2s'
                          }}
                        >
                          <EyeIcon size={14} color="#fff" />
                          Détails
                        </Link>
                        <button
                          onClick={async () => {
                            setActionLoading(user.id);
                            try {
                              if (user.isActive) await adminApi.deactivateUser(user.id);
                              else await adminApi.reactivateUser(user.id);
                              setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setActionLoading(null);
                            }
                          }}
                          disabled={actionLoading === user.id}
                          style={{
                            padding: '8px 16px',
                            background: user.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                            borderRadius: 10,
                            border: `1px solid ${user.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                            color: user.isActive ? COLORS.danger : COLORS.success,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {actionLoading === user.id ? '...' : user.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <UsersIcon size={48} color="rgba(255,255,255,0.1)" />
            <div style={{ color: 'rgba(255,255,255,0.3)', marginTop: 16, fontSize: 16 }}>
              Aucun utilisateur trouvé
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
