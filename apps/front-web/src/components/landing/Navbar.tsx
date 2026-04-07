'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { FONT_FAMILY_INTER } from '@/styles/typography';
import { useBrandCartStore } from '@/stores/brandCartStore';
import { GlobalCartDrawer } from '@/components/checkout/GlobalCartDrawer';
import { apiClient } from '@/services/api/client';

const NAV_LINKS = [
  { label: 'Marques', href: '/brands' },
  { label: 'Drops', href: '/collections' },
  { label: 'Explorer', href: '/explorer' },
  { label: 'À propos', href: '/about' },
];

export function Navbar({ transparent = false, black = false }: { transparent?: boolean; black?: boolean } = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const toggleCart = useBrandCartStore(s => s.toggleCart);
  const getTotalGlobalCount = useBrandCartStore(s => s.getTotalGlobalCount);
  const cartCount = getTotalGlobalCount();

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const postLoginHref = useMemo(() => {
    if (!user) return null;
    if (user.isCEO || user.isAdmin) return '/dashboard';
    if (!user.has_seen_creator_prompt) return '/onboarding';
    return '/';
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  useEffect(() => {
    if (!notificationsOpen) return;
    const handler = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notificationsOpen]);

  useEffect(() => {
    if (!mounted || !user) return;

    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get('/notifications/my-notifications');
        const data = response.data;
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [mounted, user]);

  return (
    <>
      <nav
        aria-label="Navigation principale"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          fontFamily: FONT_FAMILY_INTER,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: scrolled || transparent || black ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled || transparent || black ? 'blur(20px) saturate(180%)' : 'none',
          background: black ? '#000000' : (scrolled || transparent ? 'rgba(10, 10, 10, 0.85)' : 'transparent'),
          borderBottom: scrolled || transparent || black ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          boxShadow: scrolled || transparent || black ? '0 4px 32px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 28px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}>

          {/* ══ Logo (gauche) ══ */}
          <Link
            href="/"
            aria-label="Kollect — Accueil"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              flexShrink: 0,
              zIndex: 1,
            }}
          >
            <span style={{
              fontSize: '36px',
              fontWeight: 600,
              color: black ? '#fff' : '#fff',
              letterSpacing: '-0.7px',
              fontStyle: 'italic',
              fontFamily: "'Snell Roundhand', 'Dancing Script', 'Brush Script MT', cursive",
              lineHeight: 1,
            }}>
              Kollect
            </span>
          </Link>

          {/* ══ Nav links — desktop (centré absolument dans une pill) ══ */}
          <div
            className="nav-links-desktop"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              background: black ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.07)',
              borderRadius: '14px',
              padding: '5px',
              border: black ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-pill-link"
                  style={{
                    padding: '7px 18px',
                    borderRadius: '9px',
                    fontSize: '14px',
                    fontWeight: isActive ? 700 : 500,
                    color: black ? (isActive ? '#fff' : 'rgba(255,255,255,0.8)') : (isActive ? '#fff' : 'rgba(255,255,255,0.60)'),
                    textDecoration: 'none',
                    transition: 'all 200ms ease',
                    backgroundColor: isActive ? '#FF3B30' : 'transparent',
                    boxShadow: isActive ? '0 2px 12px rgba(255,59,48,0.40)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* ══ Spacer ══ */}
          <div style={{ flex: 1 }} />

          {/* ── Bouton panier (toujours visible, desktop + mobile) ── */}
          {mounted && (
            <button
              onClick={toggleCart}
              aria-label="Ouvrir le panier"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '9px', borderRadius: '10px',
                color: black ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.85)',
                backgroundColor: cartCount > 0 ? (black ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.12)') : (black ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.07)'),
                border: cartCount > 0 ? (black ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.20)') : (black ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.10)'),
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 200ms ease',
                flexShrink: 0,
                zIndex: 1,
                marginRight: '8px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '4px', right: '4px',
                  minWidth: '17px', height: '17px', borderRadius: '9px',
                  backgroundColor: '#FF3B30', color: '#fff',
                  fontSize: '9px', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px', lineHeight: 1,
                  boxShadow: black ? '0 0 0 2px #000000' : '0 0 0 2px rgba(10,10,10,0.9)',
                }}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          )}

          {/* ══ CTA actions — desktop (droite) ══ */}
          <div
            className="nav-cta-desktop"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, zIndex: 1 }}
          >
            {mounted && user && user.id ? (
              /* Connecté → notifications + menu profil */
              <>
                {/* Bouton Notifications */}
                <div ref={notificationsRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '9px',
                      borderRadius: '10px',
                      color: black ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.85)',
                      backgroundColor: black ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.07)',
                      border: black ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.10)',
                      cursor: 'pointer',
                      transition: 'all 200ms ease',
                      position: 'relative',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>

                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: '9px',
                        backgroundColor: '#FF3B30',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                        lineHeight: 1,
                        letterSpacing: '0.2px',
                        boxShadow: black ? '0 0 0 2px #000000' : '0 0 0 2px rgba(10,10,10,0.9)',
                      }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      minWidth: '320px',
                      maxHeight: '400px',
                      backgroundColor: '#141414',
                      borderRadius: '16px',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      overflow: 'hidden',
                      zIndex: 1000,
                    }}>
                      {/* Header */}
                      <div style={{
                        padding: '16px',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}>
                        Notifications
                        {unreadCount > 0 && (
                          <span style={{
                            marginLeft: '8px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#FF3B30',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}>
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Liste des notifications */}
                      <div style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                      }}>
                        {notifications.length === 0 ? (
                          <div style={{
                            padding: '32px 16px',
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.35)',
                            fontSize: '13px',
                            fontWeight: 500,
                          }}>
                            Aucune notification
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                backgroundColor: notification.read ? 'transparent' : 'rgba(255,255,255,0.03)',
                                cursor: 'pointer',
                                transition: 'background-color 0.15s',
                                position: 'relative',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = notification.read 
                                  ? 'rgba(255,255,255,0.05)' 
                                  : 'rgba(255,255,255,0.08)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = notification.read 
                                  ? 'transparent' 
                                  : 'rgba(255,255,255,0.03)';
                              }}
                              onClick={() => {
                                if (!notification.read) {
                                  markNotificationAsRead(notification.id);
                                }
                                // Optionnel: fermer le modal après clic
                                setNotificationsOpen(false);
                              }}
                            >
                              {/* Titre */}
                              <div style={{
                                color: notification.read ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.95)',
                                fontSize: '13px',
                                fontWeight: notification.read ? 500 : 600,
                                marginBottom: '4px',
                                lineHeight: 1.3,
                              }}>
                                {notification.title}
                              </div>
                              
                              {/* Message */}
                              <div style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '12px',
                                fontWeight: 400,
                                lineHeight: 1.4,
                                marginBottom: '6px',
                              }}>
                                {notification.message}
                              </div>

                              {/* Type et date */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px',
                              }}>
                                <span style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                  color: 'rgba(255,255,255,0.6)',
                                  fontSize: '10px',
                                  fontWeight: 500,
                                  textTransform: 'uppercase',
                                }}>
                                  {notification.type}
                                </span>
                                
                                {notification.createdAt && (
                                  <span style={{
                                    color: 'rgba(255,255,255,0.4)',
                                    fontSize: '10px',
                                    fontWeight: 400,
                                  }}>
                                    {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                )}
                              </div>

                              {/* Indicateur non lu */}
                              {!notification.read && (
                                <div style={{
                                  position: 'absolute',
                                  top: '16px',
                                  right: '16px',
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: '#FF3B30',
                                }} />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Menu profil */}
                <div ref={profileRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px 8px 8px',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: black ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.90)',
                      backgroundColor: black ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.07)',
                      border: black ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.10)',
                      cursor: 'pointer',
                      transition: 'all 200ms ease',
                    }}
                  >
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: '#FF3B30',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>

                  

                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 200ms ease',
                        opacity: 0.5,
                      }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {profileOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      minWidth: '220px',
                      backgroundColor: '#141414',
                      borderRadius: '16px',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      overflow: 'hidden',
                      zIndex: 1000,
                    }}>
                      <div style={{ padding: '8px' }}>
                        <Link
                          href="/onboarding"
                          className="dropdown-item"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.80)',
                            textDecoration: 'none',
                            transition: 'background-color 150ms ease',
                          }}
                          onClick={() => setProfileOpen(false)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21h-4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2z" />
                              <path d="M9 3h4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                              <path d="M3 9h4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z" />
                            </svg>
                            <span>Créer ma marque</span>
                          </div>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            color: '#FF3B30',
                            backgroundColor: 'rgba(255,59,48,0.15)',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            border: '1px solid rgba(255,59,48,0.25)',
                          }}>
                            PRO
                          </span>
                        </Link>

                        <Link
                          href="/favorites"
                          className="dropdown-item"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.80)',
                            textDecoration: 'none',
                            transition: 'background-color 150ms ease',
                          }}
                          onClick={() => setProfileOpen(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 0L2.81 7.89a5.5 5.5 0 0 0 0 7.78l1.06 1.06L12 18.33l7.06-7.06a5.5 5.5 0 0 0 0-7.78z" />
                            <path d="M12 2.69l5.66 5.66a.5.5 0 0 1 .71.0L12 20.49l-6.37-6.37a.5.5 0 0 1 .71-.71l6.63-6.63z" />
                          </svg>
                          Favoris
                        </Link>

                        <Link
                          href="/profile/orders"
                          className="dropdown-item"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.80)',
                            textDecoration: 'none',
                            transition: 'background-color 150ms ease',
                          }}
                          onClick={() => setProfileOpen(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 2l6 6-6 6" />
                            <path d="M3 12h18" />
                            <rect x="3" y="16" width="18" height="6" rx="2" />
                          </svg>
                          Historique d&apos;achats
                        </Link>

                        <Link
                          href="/profile/settings"
                          className="dropdown-item"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.80)',
                            textDecoration: 'none',
                            transition: 'background-color 150ms ease',
                          }}
                          onClick={() => setProfileOpen(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24" />
                          </svg>
                          Paramètres
                        </Link>

                        <div style={{
                          height: '1px',
                          backgroundColor: 'rgba(255,255,255,0.07)',
                          margin: '8px 14px',
                        }} />

                        <button
                          onClick={async () => {
                            // Déconnexion fonctionnelle avec votre système
                            await signOut();
                            setProfileOpen(false);
                          }}
                          className="dropdown-item-logout"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#FF3B30',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left',
                            transition: 'background-color 150ms ease',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16,17 21,12 16,7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="nav-btn-ghost"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: black ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)',
                    textDecoration: 'none',
                    border: black ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.12)',
                    transition: 'all 200ms ease',
                    backgroundColor: 'transparent',
                  }}
                >
                  Se connecter
                </Link>

                <Link
                  href="/auth/register"
                  className="nav-btn-cta"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 20px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#fff',
                    textDecoration: 'none',
                    backgroundColor: '#FF3B30',
                    boxShadow: '0 2px 16px rgba(255,59,48,0.35)',
                    transition: 'all 200ms ease',
                    letterSpacing: '0.1px',
                  }}
                >
                  Commencer
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </>
            )}
          </div>

          {/* ══ Burger — mobile ══ */}
          <button
            className="nav-burger"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(v => !v)}
            style={{
              display: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: black ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.12)',
              backgroundColor: black ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.07)',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '5px',
              cursor: 'pointer',
              padding: '0',
              flexShrink: 0,
              zIndex: 1,
              marginLeft: '8px',
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block',
                width: '18px',
                height: '2px',
                backgroundColor: black ? '#fff' : '#fff',
                borderRadius: '2px',
                transition: 'all 250ms ease',
                transformOrigin: 'center',
                transform:
                  i === 0 && mobileOpen ? 'translateY(7px) rotate(45deg)' :
                  i === 1 && mobileOpen ? 'scaleX(0)' :
                  i === 2 && mobileOpen ? 'translateY(-7px) rotate(-45deg)' :
                  'none',
                opacity: i === 1 && mobileOpen ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* ══ Overlay fond mobile ══ */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ══ Menu mobile drawer ══ */}
      <div
        ref={menuRef}
        role="dialog"
        aria-label="Menu mobile"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '300px',
          zIndex: 1001,
          backgroundColor: black ? '#FFFFFF' : '#0F0F0F',
          boxShadow: '-8px 0 60px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 24px',
          gap: '6px',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <span style={{
            fontSize: '40px',
            fontWeight: 700,
            fontStyle: 'italic',
            letterSpacing: '1.2px',
            color: black ? '#000000' : '#FF3B30',
            fontFamily: "'Snell Roundhand', 'Dancing Script', cursive",
          }}>
            Kollect
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer"
            style={{
              width: '36px', height: '36px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: 'transparent',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '13px 16px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: isActive ? 700 : 500,
                color: black ? (isActive ? '#fff' : 'rgba(0,0,0,0.8)') : (isActive ? '#fff' : 'rgba(255,255,255,0.60)'),
                textDecoration: 'none',
                backgroundColor: isActive ? '#FF3B30' : 'transparent',
                boxShadow: isActive ? '0 4px 16px rgba(255,59,48,0.30)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 200ms ease',
              }}
            >
              {link.label}
              {isActive && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </Link>
          );
        })}

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {mounted && user ? (
            /* Connecté → bouton Créer ma marque */
            <Link
              href="/onboarding"
              style={{
                padding: '14px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                color: '#fff',
                textDecoration: 'none',
                backgroundColor: '#FF3B30',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(255,59,48,0.35)',
              }}
            >
              Créer ma marque
            </Link>
          ) : (
            /* Non connecté → boutons Se connecter + Commencer */
            <>
              <Link
                href="/auth/login"
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: black ? '#000' : 'rgba(255,255,255,0.75)',
                  textDecoration: 'none',
                  border: black ? '1px solid rgba(0,0,0,0.3)' : '1px solid rgba(255,255,255,0.12)',
                  textAlign: 'center',
                  backgroundColor: 'transparent',
                }}
              >
                Se connecter
              </Link>
              <Link
                href="/auth/register"
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#fff',
                  textDecoration: 'none',
                  backgroundColor: '#FF3B30',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(255,59,48,0.35)',
                }}
              >
                Commencer gratuitement
              </Link>
            </>
          )}
        </div>
      </div>

      <GlobalCartDrawer />

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-cta-desktop { display: none !important; }
          .nav-burger { display: flex !important; }
        }
        .nav-pill-link:hover {
          color: #fff !important;
          background-color: rgba(255,255,255,0.09) !important;
        }
        .nav-btn-ghost:hover {
          color: #fff !important;
          border-color: rgba(255,255,255,0.25) !important;
          background-color: rgba(255,255,255,0.06) !important;
        }
        .nav-btn-cta:hover {
          background-color: #e0342a !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(255,59,48,0.50) !important;
        }
        .dropdown-item:hover {
          background-color: rgba(255,255,255,0.06) !important;
          color: #fff !important;
        }
        .dropdown-item-logout:hover {
          background-color: rgba(255,59,48,0.10) !important;
        }
      `}</style>
    </>
  );
}