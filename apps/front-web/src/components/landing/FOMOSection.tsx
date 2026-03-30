'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api/client';
import { FONT_FAMILY_INTER } from '@/styles/typography';

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

/* ─── Live Activity Component ───────────────────────────────────────────────── */
function LiveActivity() {
  const [activity, setActivity] = useState<LiveActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler l'activité en attendant la vraie route
    const mockActivity: LiveActivity = {
      viewingNow: Math.floor(Math.random() * 500) + 100,
      recentSales: [
        {
          productName: 'Street Dakar Premium',
          soldAt: new Date(Date.now() - Math.random() * 900000).toISOString(),
          price: 25000,
          size: 'L'
        },
        {
          productName: 'Urban Flow Limited',
          soldAt: new Date(Date.now() - Math.random() * 1800000).toISOString(),
          price: 18000,
          size: 'M'
        },
      ],
      waitingList: Math.floor(Math.random() * 1000) + 200,
      lastUpdated: new Date().toISOString(),
    };
    
    setTimeout(() => {
      setActivity(mockActivity);
      setLoading(false);
    }, 1000);

    // Simuler des mises à jour toutes les 30 secondes
    const interval = setInterval(() => {
      setActivity(prev => prev ? {
        ...prev,
        viewingNow: prev.viewingNow + Math.floor(Math.random() * 20) - 10,
        waitingList: prev.waitingList + Math.floor(Math.random() * 10) - 3,
        lastUpdated: new Date().toISOString(),
      } : null);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <LiveActivitySkeleton />;
  if (!activity) return null;

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
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#FF3B30',
          animation: 'livePulse 2s ease-in-out infinite',
        }} />
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#FF3B30',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}>
          En direct
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconUsers />
          <div>
            <div style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.5px',
              lineHeight: 1,
            }}>
              {formatNumber(activity.viewingNow)}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              fontWeight: 500,
            }}>
              personnes connectées
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconClock />
          <div>
            <div style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#FF9500',
              letterSpacing: '-0.5px',
              lineHeight: 1,
            }}>
              {formatNumber(activity.waitingList)}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              fontWeight: 500,
            }}>
              en liste d&apos;attente
            </div>
          </div>
        </div>
      </div>

      {/* Recent sales */}
      <div>
        <h4 style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          margin: '0 0 12px',
        }}>
          Ventes récentes
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activity.recentSales.map((sale, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.03)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#34C759',
                }} />
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.7)',
                }}>
                  {sale.productName}
                </span>
                {sale.size && (
                  <span style={{
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.4)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}>
                    {sale.size}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#fff',
                }}>
                  {formatPrice(sale.price)}
                </span>
                <span style={{
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.4)',
                }}>
                  {getTimeAgo(sale.soldAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────── */
export function FOMOSection() {
  const [trending, setTrending] = useState<TrendingCollection[]>([]);
  const [comingSoon, setComingSoon] = useState<ComingSoonCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Utiliser les vraies routes existantes comme dans DropsPreview
        const res = await apiClient.get('/collections/home');
        const homeData = res.data;

        const trending: any[] = Array.isArray(homeData?.trending) ? homeData.trending : [];
        const comingSoon: any[] = Array.isArray(homeData?.comingSoon) ? homeData.comingSoon : [];

        setTrending(trending);
        setComingSoon(comingSoon);
      } catch (err) {
        console.error('Failed to fetch FOMO data:', err);
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

        {/* Content Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <TrendingSkeleton />
            <TrendingSkeleton />
            <LiveActivitySkeleton />
          </div>
        ) : error ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '60px 24px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '20px',
            }}>
              Impossible de charger les tendances
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                backgroundColor: '#FF3B30',
                color: '#fff',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Hero Trending Card - Grand visuel impactant */}
            <div style={{ height: '100%', minHeight: '400px' }}>
              {trending[0] && <HeroTrendingCard collection={trending[0]} isMain={true} />}
            </div>

            {/* Secondary content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Live Activity */}
              <LiveActivity />
              
              {/* Other trending collections compactes */}
              <div>
                <h3 style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  margin: '0 0 12px',
                }}>
                  Autres tendances
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {trending.slice(1, 4).map((collection, index) => (
                    <HeroTrendingCard key={collection.id} collection={collection} isMain={false} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer CTA */}
        {!loading && !error && (
          <div style={{
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
        @media (max-width: 600px) {
          #fomo .grid { 
            grid-template-columns: 1fr !important; 
          }
          .hero-trending-card {
            min-height: 240px !important;
          }
          #fomo .grid h2 {
            font-size: 1.8rem !important;
          }
        }
      `}</style>
    </section>
  );
}
