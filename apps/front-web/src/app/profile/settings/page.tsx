'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/services/api/client';
import { FONT_FAMILY_INTER } from '@/styles/typography';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'laptop' | 'tablet';
  lastSeen: string;
  trusted: boolean;
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [devices, setDevices] = useState<Device[]>([
    { id: '1', name: 'iPhone 14', type: 'mobile', lastSeen: '2026-03-26 14:30', trusted: true },
    { id: '2', name: 'MacBook Pro', type: 'laptop', lastSeen: '2026-03-26 09:15', trusted: true },
    { id: '3', name: 'iPad Air', type: 'tablet', lastSeen: '2026-03-25 18:45', trusted: false },
  ]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const toggleDeviceTrust = (deviceId: string) => {
    setDevices((prev) => 
      prev.map((device) => 
        device.id === deviceId ? { ...device, trusted: !device.trusted } : device
      )
    );
  };

  const toggleTwoFactor = () => {
    setTwoFactorEnabled((prev) => !prev);
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const response = await apiClient.get('/notifications/my-notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) => 
        prev.map((n) => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter((n) => !n.read).map((n) => 
          apiClient.patch(`/notifications/${n.id}/read`)
        )
      );
      setNotifications((prev) => 
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (activeSection === 'notifications') {
      fetchNotifications();
    }
  }, [activeSection]);

  const handleSignOut = async () => {
    setIsUpdating(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const menuItems = [
    { 
      id: 'profile', 
      label: 'Profil', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      )
    },
    { 
      id: 'security', 
      label: 'Sécurité', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 0v1" />
          <path d="M22 12a4 4 0 0 1-4-4H6a4 4 0 0 1-4 4" />
          <path d="M2 12a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4" />
        </svg>
      )
    },
    { 
      id: 'privacy', 
      label: 'Confidentialité', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3v9c0 5.333-8 10-8z" />
          <path d="M12 22s8-4 8-10V5l-8-3v9c0 5.333-8 10-8z" />
        </svg>
      )
    },
    { 
      id: 'help', 
      label: 'Aide', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2 1 4 3 4" />
          <path d="M12 22v-4" />
        </svg>
      )
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>
        {/* Sidebar Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '16px 20px', borderRadius: 16,
                background: activeSection === item.id 
                  ? 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)'
                  : '#fff',
                color: activeSection === item.id ? '#fff' : 'rgba(0,0,0,0.7)',
                fontSize: 14, fontWeight: activeSection === item.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeSection === item.id 
                  ? '0 4px 16px rgba(0,0,0,0.15)'
                  : '0 2px 8px rgba(0,0,0,0.04)',
                border: activeSection === item.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
              {activeSection === item.id && (
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#fff', marginLeft: 'auto',
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {activeSection === 'profile' && (
            <>
              {/* Profile Info Card */}
              <div style={{
                background: '#fff',
                borderRadius: 20,
                border: '1.5px solid rgba(0,0,0,0.06)',
                padding: 32,
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 20,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {user?.isCEO ? (
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      ) : (
                        <>
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2v10M12 22v-4" />
                        </>
                      )}
                    </svg>
                  </div>
                  <div>
                    <h3 style={{
                      margin: 0, fontSize: 20, fontWeight: 800,
                      color: '#0A0A0A', letterSpacing: '-0.4px',
                    }}>
                      {user?.email?.split('@')[0]}
                    </h3>
                    <p style={{
                      margin: '4px 0 0', fontSize: 14, color: 'rgba(0,0,0,0.6)',
                      fontWeight: 500,
                    }}>
                      {user?.email}
                    </p>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      marginTop: 8,
                    }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 8,
                        background: user?.isCEO ? '#FEF3C7' : '#DBEAFE',
                        color: user?.isCEO ? '#B45309' : '#1E3A5F',
                      }}>
                        {user?.isCEO ? 'Créateur' : 'Client'}
                      </span>
                      <span style={{
                        fontSize: 11, padding: '4px 8px', borderRadius: 6,
                        background: '#10B981', color: '#fff', fontWeight: 600,
                      }}>
                        Vérifié ✓
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{
                    padding: 16, borderRadius: 12,
                    background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)',
                  }}>
                    <p style={{ margin: '0 0 4px', fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>
                      Membre depuis
                    </p>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0A0A0A' }}>
                      Mars 2024
                    </p>
                  </div>
                  <div style={{
                    padding: 16, borderRadius: 12,
                    background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)',
                  }}>
                    <p style={{ margin: '0 0 4px', fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>
                      Commandes totales
                    </p>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0A0A0A' }}>
                      12 commandes
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{
                background: '#fff',
                borderRadius: 20,
                border: '1.5px solid rgba(0,0,0,0.06)',
                padding: 24,
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}>
                <h3 style={{
                  margin: '0 0 20px', fontSize: 16, fontWeight: 800,
                  color: '#0A0A0A', letterSpacing: '-0.4px',
                }}>
                  Actions rapides
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button style={{
                    padding: '14px 16px', borderRadius: 12,
                    border: '1.5px solid rgba(0,0,0,0.08)',
                    background: '#fff', color: '#0A0A0A',
                    fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-3.5 3.5a2.121 2.121 0 0 1 3-3L12 9l3.5-3.5a2.121 2.121 0 0 1 3 3z" />
                    </svg>
                    Modifier le profil
                  </button>
                  <button style={{
                    padding: '14px 16px', borderRadius: 12,
                    border: '1.5px solid rgba(0,0,0,0.08)',
                    background: '#fff', color: '#0A0A0A',
                    fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Changer le mot de passe
                  </button>
                  <button style={{
                    padding: '14px 16px', borderRadius: 12,
                    border: '1.5px solid rgba(0,0,0,0.08)',
                    background: '#fff', color: '#0A0A0A',
                    fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 20V10" />
                      <path d="M18 4v4" />
                      <path d="M14 4h4" />
                      <path d="M14 20h4" />
                      <path d="M8 4h4" />
                      <path d="M8 20h4" />
                    </svg>
                    Statistiques
                  </button>
                  <button style={{
                    padding: '14px 16px', borderRadius: 12,
                    border: '1.5px solid rgba(0,0,0,0.08)',
                    background: '#fff', color: '#0A0A0A',
                    fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 2.52 2.83L12 22l-7.5-7.5z" />
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 2.52 2.83L12 22l-7.5-7.5z" />
                    </svg>
                    Personnalisation
                  </button>
                </div>
              </div>
            </>
          )}

          {activeSection === 'security' && (
            <div style={{
              background: '#fff',
              borderRadius: 20,
              border: '1.5px solid rgba(0,0,0,0.06)',
              padding: 32,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{
                margin: '0 0 24px', fontSize: 16, fontWeight: 800,
                color: '#0A0A0A', letterSpacing: '-0.4px',
              }}>
                Sécurité du compte
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{
                  padding: 20, borderRadius: 12,
                  background: twoFactorEnabled ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${twoFactorEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(0,0,0,0.1)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={twoFactorEnabled ? '#166534' : 'rgba(0,0,0,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: twoFactorEnabled ? '#166534' : 'rgba(0,0,0,0.6)' }}>
                      Authentification à deux facteurs
                    </h4>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ margin: 0, fontSize: 13, color: twoFactorEnabled ? '#166534' : 'rgba(0,0,0,0.6)', lineHeight: 1.5 }}>
                      {twoFactorEnabled 
                        ? 'Active - Votre compte est protégé par une authentification à deux facteurs' 
                        : 'Désactivée - Activez l&apos;authentification à deux facteurs pour sécuriser votre compte'
                      }
                    </p>
                    <button
                      onClick={toggleTwoFactor}
                      style={{
                        padding: '8px 16px', borderRadius: 8,
                        border: `1px solid ${twoFactorEnabled ? '#166534' : 'rgba(0,0,0,0.2)'}`,
                        background: twoFactorEnabled ? '#166534' : '#0A0A0A',
                        color: '#fff',
                        fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {twoFactorEnabled ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </div>

                <div style={{
                  padding: 20, borderRadius: 12,
                  background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21H5a2 2 0 0 1-2-2h5" />
                    </svg>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'rgba(0,0,0,0.8)' }}>
                      Appareils connectés ({devices.length})
                    </h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {devices.map((device) => (
                      <div key={device.id} style={{
                        padding: '16px', borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.06)',
                        background: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: device.type === 'mobile' ? '#DBEAFE' : 
                                       device.type === 'laptop' ? '#FEF3C7' : '#F3F4F6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {device.type === 'mobile' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                <path d="M12 18h-1" />
                              </svg>
                            )}
                            {device.type === 'laptop' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 20V10" />
                                <path d="M18 4v4" />
                                <path d="M14 4h4" />
                                <path d="M14 20h4" />
                                <path d="M8 4h4" />
                                <path d="M8 20h4" />
                              </svg>
                            )}
                            {device.type === 'tablet' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                                <path d="M12 18H9a2 2 0 0 1-2-2h6" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#0A0A0A' }}>
                              {device.name}
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>
                              {device.type === 'mobile' ? 'Mobile' : 
                               device.type === 'laptop' ? 'Ordinateur portable' : 'Tablette'}
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>
                              Dernière connexion: {device.lastSeen}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                            background: device.trusted ? '#10B981' : '#FEE2E2',
                            color: device.trusted ? '#fff' : '#92400E',
                          }}>
                            {device.trusted ? 'Fiable' : 'Non fiable'}
                          </span>
                          <button
                            onClick={() => toggleDeviceTrust(device.id)}
                            style={{
                              padding: '4px 8px', borderRadius: 4,
                              border: '1px solid rgba(0,0,0,0.1)',
                              background: 'transparent', color: 'rgba(0,0,0,0.6)',
                              fontSize: 10, fontWeight: 500,
                              cursor: 'pointer', transition: 'all 0.15s',
                            }}
                          >
                            {device.trusted ? 'Révoquer' : 'Fiable'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <>
              {/* Notifications Header */}
              <div style={{
                background: '#fff',
                borderRadius: 20,
                border: '1.5px solid rgba(0,0,0,0.06)',
                padding: 24,
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                marginBottom: 24,
              }}>
                <div style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 20 
                }}>
                  <h3 style={{
                    margin: 0, fontSize: 16, fontWeight: 800,
                    color: '#0A0A0A', letterSpacing: '-0.4px',
                  }}>
                    Notifications
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: 13, color: 'rgba(0,0,0,0.6)', fontWeight: 500,
                    }}>
                      {notifications.filter((n) => !n.read).length} non lue{notifications.filter((n) => !n.read).length > 1 ? 's' : ''}
                    </span>
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{
                          padding: '6px 12px', borderRadius: 8,
                          border: '1px solid rgba(0,0,0,0.1)',
                          background: '#0A0A0A', color: '#fff',
                          fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div style={{
                background: '#fff',
                borderRadius: 20,
                border: '1.5px solid rgba(0,0,0,0.06)',
                padding: 8,
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                maxHeight: '500px',
                overflowY: 'auto',
              }}>
                {notificationsLoading ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{
                      width: 24, height: 24, border: '2px solid rgba(0,0,0,0.1)',
                      borderTopColor: '#0A0A0A', borderRadius: '50%',
                      animation: 'op-spin 0.75s linear infinite',
                      margin: '0 auto 16px',
                    }} />
                    <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(0,0,0,0.5)' }}>
                      Chargement des notifications...
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{ 
                    padding: '60px 24px', textAlign: 'center',
                    color: 'rgba(0,0,0,0.4)'
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 0v1" />
                      <path d="M22 12a4 4 0 0 1-4-4H6a4 4 0 0 1-4 4" />
                      <path d="M2 12a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4" />
                    </svg>
                    <p style={{ margin: '16px 0 8px', fontSize: 16, fontWeight: 700, color: 'rgba(0,0,0,0.6)' }}>
                      Aucune notification
                    </p>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
                      Vous n&apos;avez pas encore reçu de notifications
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                        style={{
                          padding: '16px 20px',
                          borderRadius: 12,
                          border: '1px solid rgba(0,0,0,0.06)',
                          background: notification.read ? 'transparent' : 'rgba(0,0,0,0.02)',
                          cursor: notification.read ? 'default' : 'pointer',
                          transition: 'all 0.15s',
                          borderLeft: notification.read ? 'none' : '3px solid #0A0A0A',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: notification.read ? '#F3F4F6' : '#0A0A0A',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={notification.read ? 'rgba(0,0,0,0.4)' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 8A6 6 0 0 0 6 0v1" />
                              <path d="M22 12a4 4 0 0 1-4-4H6a4 4 0 0 1-4 4" />
                              <path d="M2 12a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4" />
                            </svg>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              display: 'flex', alignItems: 'center', gap: 8, 
                              marginBottom: 4 
                            }}>
                              <span style={{
                                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                                background: notification.type === 'ORDER' ? '#DBEAFE' : 
                                           notification.type === 'PROMOTION' ? '#FEF3C7' : 
                                           notification.type === 'SYSTEM' ? '#F3F4F6' : '#E5E7EB',
                                color: notification.type === 'ORDER' ? '#1E3A5F' : 
                                     notification.type === 'PROMOTION' ? '#B45309' : 
                                     notification.type === 'SYSTEM' ? '#374151' : '#6B7280',
                                textTransform: 'uppercase',
                              }}>
                                {notification.type}
                              </span>
                              <span style={{
                                fontSize: 11, color: 'rgba(0,0,0,0.4)', fontWeight: 500,
                              }}>
                                {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <h4 style={{
                              margin: 0, fontSize: 14, fontWeight: 700,
                              color: notification.read ? 'rgba(0,0,0,0.6)' : '#0A0A0A',
                              lineHeight: 1.4,
                            }}>
                              {notification.title}
                            </h4>
                            <p style={{
                              margin: 0, fontSize: 13, color: 'rgba(0,0,0,0.5)',
                              lineHeight: 1.5,
                            }}>
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Danger Zone */}
          <div style={{
            background: '#fff',
            borderRadius: 20,
            border: '1.5px solid rgba(239,68,68,0.1)',
            padding: 24,
            boxShadow: '0 4px 20px rgba(239,68,68,0.04)',
          }}>
            <h3 style={{
              margin: '0 0 20px', fontSize: 16, fontWeight: 800,
              color: '#DC2626', letterSpacing: '-0.4px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a4 4 0 0 1 5.71 5.71L12 4.29l5.17 5.17a4 4 0 0 1 5.71-5.71L12 4.29z" />
                <line x1="12" y1="4" x2="12" y2="20" />
              </svg>
              Zone à risque
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={handleSignOut}
                disabled={isUpdating}
                style={{
                  padding: '16px 20px',
                  borderRadius: 12,
                  border: '1.5px solid rgba(239,68,68,0.2)',
                  background: 'rgba(239,68,68,0.06)',
                  color: '#DC2626',
                  fontSize: 14, fontWeight: 600,
                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  opacity: isUpdating ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                }}
              >
                {isUpdating ? (
                  <>
                    <div style={{
                      width: 18, height: 18, border: '2px solid rgba(239,68,68,0.3)',
                      borderTopColor: '#DC2626', borderRadius: '50%',
                      animation: 'op-spin 0.75s linear infinite',
                    }} />
                    Déconnexion en cours...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2h4" />
                      <polyline points="16,17 21,12 16,7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Se déconnecter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
