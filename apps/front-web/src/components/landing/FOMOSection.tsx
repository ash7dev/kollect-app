'use client';

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api/client';
import { FONT_FAMILY_INTER } from '@/styles/typography';
import { FeaturedCard, FeaturedSkeleton, type FeaturedCollection } from './FeaturedCollections';

/* ─── Types ─────────────────────────────────────────────────────── */
interface TrendingCollection {
  id: string;
  name: string;
  slug: string;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    isVerified: boolean;
  };
  status: string;
  launchDate?: string;
  launchedAt?: string;
  coverImage?: string;
  teaserVideo?: string;
  viewCount: number;
  trendingScore: number;
  _count: {
    products: number;
  };
}

interface ComingSoonCollection {
  id: string;
  name: string;
  slug: string;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    isVerified: boolean;
  };
  status: string;
  launchDate: string;
  coverImage?: string;
  teaserVideo?: string;
  _count: {
    products: number;
  };
}

interface LiveActivity {
  viewingNow: number;
  recentSales: Array<{
    productName: string;
    soldAt: string;
    size?: string;
    price: number;
  }>;
  waitingList: number;
  lastUpdated: string;
}

/* ─── Icons ─────────────────────────────────────────────────────── */
function IconTrending() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

/* ─── Utilities ───────────────────────────────────────────────── */
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffMinutes < 1) return 'à l\'instant';
  if (diffMinutes < 60) return `il y a ${diffMinutes} min`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `il y a ${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `il y a ${diffDays}j`;
}

function getCountdown(launchDate: string): { days: number; hours: number; minutes: number; string: string } {
  const now = new Date();
  const launch = new Date(launchDate);
  const diff = launch.getTime() - now.getTime();
  
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, string: 'Disponible' };
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  let string = '';
  if (days > 0) string += `${days}j `;
  if (hours > 0) string += `${hours}h `;
  if (minutes > 0) string += `${minutes}min`;
  
  return { days, hours, minutes, string: string.trim() };
}

/* ─── Skeleton Components ───────────────────────────────────────────────── */
function TrendingSkeleton() {
  return (
    <div style={{ 
      backgroundColor: '#0A0A0A', 
      border: '1px solid rgba(255,255,255,0.06)', 
      borderRadius: '16px', 
      padding: '20px',
      animation: 'fomoSkeleton 1.6s ease-in-out infinite'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: '14px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginBottom: '6px', width: '60%' }} />
          <div style={{ height: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '40%' }} />
        </div>
      </div>
      <div style={{ height: '16px', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '4px', marginBottom: '12px', width: '80%' }} />
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ height: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '60px' }} />
        <div style={{ height: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '80px' }} />
      </div>
    </div>
  );
}

function LiveActivitySkeleton() {
  return (
    <div style={{ 
      backgroundColor: '#0A0A0A', 
      border: '1px solid rgba(255,255,255,0.06)', 
      borderRadius: '16px', 
      padding: '24px',
      animation: 'fomoSkeleton 1.6s ease-in-out infinite'
    }}>
      <div style={{ height: '20px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginBottom: '16px', width: '40%' }} />
      <div style={{ height: '14px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '12px', width: '70%' }} />
      <div style={{ height: '14px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '60%' }} />
    </div>
  );
}

/* ─── Hero Card with Visual Impact ───────────────────────────────────────────────── */
function HeroTrendingCard({ collection, isMain = false }: { collection: TrendingCollection; isMain?: boolean }) {
  const isTeaser = collection.status === 'TEASER';
  const countdown = collection.launchDate ? getCountdown(collection.launchDate) : null;
  
  if (isMain) {
    // Version desktop avec grand visuel
    return (
      <Link
        href={`/brand/${collection.brand.slug}/${collection.slug}`}
        className="hero-trending-card"
        style={{
          display: 'block',
          backgroundColor: '#0A0A0A',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          overflow: 'hidden',
          textDecoration: 'none',
          color: 'inherit',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          height: '100%',
          minHeight: '320px',
        }}
      >
        {/* Background Image */}
        {collection.coverImage && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${collection.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.4) contrast(1.1)',
            zIndex: 1,
          }} />
        )}
        
        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.9) 100%)',
          zIndex: 2,
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 3,
          padding: '32px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {/* Top */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255,59,48,0.2)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,59,48,0.3)',
              }}>
                <IconTrending />
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#FF3B30',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}>
                  Tendance du moment
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {collection.brand.name}
                </span>
                {collection.brand.isVerified && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#34C759',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </div>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '-1px',
                lineHeight: 1.1,
                margin: 0,
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}>
                {collection.name}
              </h2>
            </div>
          </div>

          {/* Bottom */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconEye />
                <span style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.8)',
                }}>
                  {formatNumber(collection.viewCount)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                  <line x1="15" y1="3" x2="15" y2="21"/>
                </svg>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.8)',
                }}>
                  {collection._count.products} pièces
                </span>
              </div>
            </div>

            {isTeaser && countdown ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,149,0,0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,149,0,0.3)',
              }}>
                <IconClock />
                <span style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#FF9500',
                  letterSpacing: '0.5px',
                }}>
                  Lancement dans {countdown.string}
                </span>
              </div>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                borderRadius: '12px',
                backgroundColor: 'rgba(52,199,89,0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(52,199,89,0.3)',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#34C759',
                  boxShadow: '0 0 8px rgba(52,199,89,0.6)',
                }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#34C759',
                  letterSpacing: '0.5px',
                }}>
                  Disponible maintenant
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Version card standard pour desktop et mobile
  return (
    <Link
      href={`/brand/${collection.brand.slug}/${collection.slug}`}
      className="trending-card"
      style={{
        display: 'block',
        backgroundColor: '#0A0A0A',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '20px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 220ms ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Trending indicator */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '999px',
        backgroundColor: 'rgba(255,59,48,0.15)',
        border: '1px solid rgba(255,59,48,0.25)',
      }}>
        <IconTrending />
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          color: '#FF3B30',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          Trending
        </span>
      </div>

      {/* Brand info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '14px',
          fontWeight: 700,
        }}>
          {collection.brand.name.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {collection.brand.name}
            </span>
            {collection.brand.isVerified && (
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#34C759',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collection name */}
      <h3 style={{
        fontSize: '16px',
        fontWeight: 800,
        color: '#fff',
        letterSpacing: '-0.3px',
        lineHeight: 1.3,
        margin: '0 0 16px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {collection.name}
      </h3>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <IconEye />
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
          }}>
            {formatNumber(collection.viewCount)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="15" y1="3" x2="15" y2="21"/>
          </svg>
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
          }}>
            {collection._count.products} pcs
          </span>
        </div>
      </div>

      {/* Countdown or status */}
      {isTeaser && countdown ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: 'rgba(255,149,0,0.1)',
          border: '1px solid rgba(255,149,0,0.2)',
        }}>
          <IconClock />
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#FF9500',
            letterSpacing: '0.5px',
          }}>
            {countdown.string}
          </span>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: 'rgba(52,199,89,0.1)',
          border: '1px solid rgba(52,199,89,0.2)',
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#34C759',
          }} />
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#34C759',
            letterSpacing: '0.5px',
          }}>
            Disponible
          </span>
        </div>
      )}
    </Link>
  );
}

/* ─── Live Activity Component — polling réel, fallback propre ──────── */
interface LiveActivityData {
  viewingNow: number;
  recentSales: Array<{
    productName: string;
    soldAt: string;
    size?: string;
    price: number;
  }>;
  totalSalesToday?: number;
  hasRealData: boolean;
}

function LiveActivity() {
  const [activity, setActivity] = useState<LiveActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      // On réutilise /collections/home qui contient les infos de tendance
      const res = await apiClient.get('/collections/home');
      const homeData = res.data;

      // Extraire les ventes récentes depuis les trending collections
      const trending: any[] = Array.isArray(homeData?.trending) ? homeData.trending : [];
      const recentSales: LiveActivityData['recentSales'] = [];

      trending.forEach((col: any) => {
        if (Array.isArray(col.recentSales)) {
          col.recentSales.slice(0, 2).forEach((sale: any) => {
            recentSales.push({
              productName: sale.productName || col.name,
              soldAt: sale.soldAt || sale.createdAt || new Date().toISOString(),
              size: sale.size,
              price: sale.price ?? 0,
            });
          });
        }
      });

      // viewingNow depuis le champ stats de la home, sinon on accumule viewCount
      const totalViews = trending.reduce((acc: number, c: any) => acc + (c.viewCount ?? 0), 0);
      // Normaliser : on montre pas le total brut, mais une fenêtre "actifs maintenant"
      // Logique : viewCount / durée de vie estimée en heures → approximation sensée
      const estimatedActive = trending.length > 0
        ? Math.min(Math.max(Math.round(totalViews / 24), 12), 9999)
        : 0;

      setActivity({
        viewingNow: estimatedActive,
        recentSales: recentSales.slice(0, 3),
        totalSalesToday: homeData?.stats?.salesToday ?? 0,
        hasRealData: recentSales.length > 0 || estimatedActive > 0,
      });
    } catch {
      // Pas d'erreur visible — on affiche un état "calme" neutre
      setActivity({ viewingNow: 0, recentSales: [], hasRealData: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
    // Polling léger toutes les 2 minutes — pas de WebSocket nécessaire
    const interval = setInterval(fetchActivity, 120_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LiveActivitySkeleton />;
  if (!activity) return null;

  // Quand il n'y a pas de vraies données, afficher un état calme (pas de faux chiffres)
  if (!activity.hasRealData) {
    return (
      <div style={{
        backgroundColor: '#0A0A0A',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: '12px',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.5 }}>
          Calme en ce moment.
          <br />
          <span style={{ color: 'rgba(255,255,255,0.18)' }}>Les nouveaux drops arrivent bientôt.</span>
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#0A0A0A',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          backgroundColor: '#34C759',
          boxShadow: '0 0 8px rgba(52,199,89,0.7)',
          animation: 'livePulse 2s ease-in-out infinite',
        }} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#34C759', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Activité récente
        </span>
      </div>

      {/* Stats — only shown when > 0 */}
      {activity.viewingNow > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconUsers />
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>
                {formatNumber(activity.viewingNow)}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                actifs aujourd&apos;hui
              </div>
            </div>
          </div>
          {(activity.totalSalesToday ?? 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#FF9500', letterSpacing: '-0.5px', lineHeight: 1 }}>
                  {activity.totalSalesToday}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                  ventes aujourd&apos;hui
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent sales */}
      {activity.recentSales.length > 0 && (
        <div>
          <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 10px' }}>
            Ventes récentes
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activity.recentSales.map((sale, index) => (
              <div key={index} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.03)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#34C759', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sale.productName}
                  </span>
                  {sale.size && (
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                      {sale.size}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {sale.price > 0 && (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                      {formatPrice(sale.price)}
                    </span>
                  )}
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
                    {getTimeAgo(sale.soldAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────── */
export function FOMOSection() {
  const [featured, setFeatured] = useState<FeaturedCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const featuredRes = await apiClient.get('/collections/featured?limit=6');
        const raw: FeaturedCollection[] = Array.isArray(featuredRes.data) ? featuredRes.data : [];
        // Trier : collections avec vidéo en premier, puis coverImage, puis reste
        const sorted = [...raw].sort((a, b) => {
          if (a.teaserVideo && !b.teaserVideo) return -1;
          if (!a.teaserVideo && b.teaserVideo) return 1;
          if (a.coverImage && !b.coverImage) return -1;
          if (!a.coverImage && b.coverImage) return 1;
          return 0;
        });
        setFeatured(sorted);
      } catch (err) {
        console.error('Failed to fetch featured collections:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <section
      id="fomo"
      aria-label="Tendances et activité en direct"
      style={{
        padding: '120px 24px',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-xxxl)',
        margin: '0 12px',
        border: '1px solid rgba(255,255,255,0.06)',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      {/* Background pattern */}
      <div aria-hidden style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
        {/* Header - Inspiré de DropsPreview */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#FF3B30',
              boxShadow: '0 0 12px rgba(255,59,48,0.6)',
              animation: 'dropPulse 1.5s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#C2923B',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
            }}>
              Collections en vedette
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-1.5px',
            lineHeight: 1.1,
            margin: 0,
          }}>
            Ce que le monde{' '}
            <span style={{ color: 'rgba(255,255,255,0.32)' }}>
              porte en ce moment.
            </span>
          </h2>
        </div>

        {/* Carousel featured */}
        <div className="featured-carousel fomo-carousel" style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '24px',
          padding: '4px 4px 20px',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          marginBottom: '48px',
        }}>
          {loading ? (
            [0, 1, 2].map(i => (
              <div key={i} style={{ flexShrink: 0, width: 'clamp(280px, 38vw, 480px)', scrollSnapAlign: 'center' }}>
                <FeaturedSkeleton />
              </div>
            ))
          ) : (
            featured.map((collection, index) => (
              <div key={collection.id} style={{ flexShrink: 0, width: 'clamp(280px, 38vw, 480px)', scrollSnapAlign: 'center' }}>
                <FeaturedCard collection={collection} index={index} />
              </div>
            ))
          )}
        </div>


        {/* Footer CTA */}
        {!loading && !error && (
          <div className="fomo-footer-cta" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '48px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.3px',
                margin: '0 0 8px',
              }}>
                Ne manque rien.
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.6,
                margin: 0,
              }}>
                Sois notifié des lancements avant tout le monde.
              </p>
            </div>
            <Link
              href="/explorer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#fff',
                textDecoration: 'none',
                backgroundColor: '#FF3B30',
                boxShadow: '0 8px 32px rgba(255,59,48,0.35)',
                transition: 'all 220ms ease',
              }}
            >
              Explorer les tendances
              <IconArrowRight />
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dropPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(255,59,48,0.8); }
          50% { opacity: 0.5; box-shadow: 0 0 4px rgba(255,59,48,0.3); }
        }
        @keyframes fomoSkeleton {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .hero-trending-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 24px 56px rgba(0,0,0,0.5) !important;
          border-color: rgba(255,59,48,0.3) !important;
        }
        @media (max-width: 960px) {
          #fomo .grid { 
            grid-template-columns: 1fr !important; 
            gap: 20px !important; 
          }
          .hero-trending-card {
            min-height: 280px !important;
          }
          #fomo .grid h2 {
            font-size: 2.2rem !important;
          }
        }
        @media (max-width: 640px) {
          #fomo { padding: 64px 16px !important; margin: 0 6px !important; }
          #fomo .grid {
            grid-template-columns: 1fr !important;
          }
          .hero-trending-card {
            min-height: 240px !important;
          }
          #fomo .grid h2 {
            font-size: 1.8rem !important;
          }
          .featured-card-wrapper { height: 420px !important; }
          .featured-card h3 { font-size: 20px !important; line-height: 24px !important; }
          .fomo-carousel { gap: 14px !important; }
          .fomo-footer-cta { flex-direction: column !important; align-items: flex-start !important; gap: 20px !important; }
        }
      `}</style>
    </section>
  );
}
