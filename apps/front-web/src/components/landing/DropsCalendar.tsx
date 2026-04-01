'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { apiClient } from '@/services/api/client';
import { FONT_FAMILY_INTER } from '@/styles/typography';
import { UpcomingDrops } from './UpcomingDrops';
import { RecentDrops } from './RecentDrops';

/* ─── Types ─────────────────────────────────────────────────────── */
interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  isVerified?: boolean;
}

interface CalendarCollection {
  id: string;
  name: string;
  slug: string;
  brand: Brand;
  status: string;
  launchDate?: string | null;
  launchedAt?: string | null;
  coverImage?: string | null;
  teaserVideo?: string | null;
  _count?: { products: number };
  viewCount?: number;
}

interface HomeData {
  comingSoon?: CalendarCollection[];
  newReleases?: CalendarCollection[];
}

/* ─── Constants ─────────────────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_API_URL ?? '';
const FETCH_OPTS: RequestInit = {
  headers: { 'ngrok-skip-browser-warning': '1' },
  next: { revalidate: 60 },
};

/* ─── Time helpers ───────────────────────────────────────────────── */
function isUpcoming(collection: CalendarCollection): collection is { status: 'TEASER'; launchDate: string } & CalendarCollection {
  return collection.status === 'TEASER' && 
         !!collection.launchDate && 
         new Date(collection.launchDate).getTime() > Date.now();
}

function isRecent(collection: CalendarCollection): boolean {
  if (collection.status !== 'DISPONIBLE') return false;
  
  const ref = collection.launchedAt || collection.launchDate;
  if (!ref) return false;
  
  const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(ref).getTime() <= FIFTEEN_DAYS_MS;
}

/* ═════════════════════════════════════════════════════════════════
   DROPS CALENDAR MAIN COMPONENT
   Orchestrateur qui décide quoi afficher
   ═════════════════════════════════════════════════════════════ */
export function DropsCalendar() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadCalendarData() {
      try {
        const res = await apiClient.get('/collections/home');
        const data = res.data;
        
        setHomeData({
          comingSoon: Array.isArray(data?.comingSoon) ? data.comingSoon : [],
          newReleases: Array.isArray(data?.newReleases) ? data.newReleases : [],
        });
      } catch (err) {
        console.error('DropsCalendar fetch failed:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadCalendarData();
  }, []);

  // Décider quoi afficher en priorité
  const hasUpcoming = homeData?.comingSoon && homeData.comingSoon.length > 0 && 
                     homeData.comingSoon.some(isUpcoming);
  const hasRecent = homeData?.newReleases && homeData.newReleases.length > 0 && 
                   homeData.newReleases.some(isRecent);

  const showBoth = hasUpcoming && hasRecent;
  const showOnlyUpcoming = hasUpcoming && !hasRecent;
  const showOnlyRecent = !hasUpcoming && hasRecent;

  return (
    <div style={{ fontFamily: FONT_FAMILY_INTER }}>
      {/* Header unifié quand les deux sections sont présentes */}
      {showBoth && (
        <section
          id="drops-calendar-header"
          aria-label="Agenda des lancements"
          style={{
            padding: 'clamp(60px, 8vw, 100px) 24px',
            backgroundColor: '#000',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 'var(--radius-xxxl)',
            margin: '0 12px 24px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Atmospheric bg */}
          <div aria-hidden style={{ 
            position: 'absolute', 
            top: '-100px', 
            left: '-100px', 
            width: '600px', 
            height: '600px', 
            background: 'radial-gradient(circle, rgba(255,59,48,0.06) 0%, transparent 65%)', 
            pointerEvents: 'none' 
          }} />
          <div aria-hidden style={{ 
            position: 'absolute', 
            bottom: '-80px', 
            right: '-80px', 
            width: '500px', 
            height: '500px', 
            background: 'radial-gradient(circle, rgba(255,149,0,0.05) 0%, transparent 65%)', 
            pointerEvents: 'none' 
          }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>

            {/* ─── Section Header ─── */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-end', 
              justifyContent: 'space-between', 
              marginBottom: '48px', 
              flexWrap: 'wrap', 
              gap: '20px' 
            }}>
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  marginBottom: '16px' 
                }}>
                  <span style={{
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF3B30 0%, #FF9500 100%)',
                    display: 'inline-block',
                    boxShadow: '0 0 10px rgba(255,59,48,0.8)',
                    animation: 'dropsCalendarPulse 2s ease-in-out infinite',
                  }} />
                  <p style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    color: '#FF3B30', 
                    letterSpacing: '2.5px', 
                    textTransform: 'uppercase', 
                    margin: 0 
                  }}>
                    Agenda des marques
                  </p>
                </div>
                <h2 style={{ 
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', 
                  fontWeight: 900, 
                  color: '#fff', 
                  letterSpacing: '-1.5px', 
                  lineHeight: 1.1, 
                  margin: 0 
                }}>
                  Les lancements qui comptent.{' '}
                  <span style={{ color: 'rgba(255,255,255,0.28)' }}>Avant tout le monde.</span>
                </h2>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Link
                  href="/collections"
                  className="drops-calendar-see-all"
                  style={{
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '10px 20px', 
                    borderRadius: '10px',
                    fontSize: '14px', 
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.55)', 
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.10)',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    transition: 'all 200ms ease', 
                  }}
                >
                  Voir tout le calendrier
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/create-brand"
                  className="drops-calendar-create"
                  style={{
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '11px', 
                    textDecoration: 'none', 
                    color: 'rgba(255,255,255,0.25)', 
                    transition: 'color 200ms ease',
                  }}
                >
                  Tu es créateur ?{' '}
                  <span style={{ color: '#C9A962', fontWeight: 700 }}>Planifier un lancement →</span>
                </Link>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes dropsCalendarPulse {
              0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(255,59,48,0.8); }
              50% { opacity: 0.5; box-shadow: 0 0 4px rgba(255,59,48,0.3); }
            }
            .drops-calendar-see-all:hover {
              color: #fff !important;
              border-color: rgba(255,255,255,0.25) !important;
              background-color: rgba(255,255,255,0.08) !important;
            }
            .drops-calendar-create:hover {
              color: #C9A962 !important;
            }
          `}</style>
        </section>
      )}

      {/* Afficher les composants appropriés */}
      {showOnlyUpcoming && <UpcomingDrops />}
      {showOnlyRecent && <RecentDrops />}
      
      {showBoth && (
        <>
          <UpcomingDrops />
          <RecentDrops />
        </>
      )}

      {/* Message d'erreur unifié */}
      {error && (
        <section style={{
          padding: '80px 24px',
          textAlign: 'center',
          backgroundColor: '#000',
          margin: '0 12px',
          borderRadius: 'var(--radius-xxxl)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: '60px', 
            height: '60px', 
            borderRadius: '20px',
            background: 'rgba(255,59,48,0.08)', 
            border: '1px solid rgba(255,59,48,0.18)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 style={{ 
            fontSize: '1.4rem', 
            fontWeight: 800, 
            color: '#fff', 
            letterSpacing: '-0.5px', 
            margin: '0 0 16px' 
          }}>
            Impossible de charger les lancements
          </h3>
          <p style={{ 
            fontSize: '0.95rem', 
            color: 'rgba(255,255,255,0.38)', 
            lineHeight: 1.7, 
            maxWidth: '400px', 
            margin: '0 0 24px' 
          }}>
            Une erreur est survenue lors du chargement des prochains lancements et nouveautés.
          </p>
          <Link href="/collections" style={{
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '12px 24px', 
            borderRadius: '12px', 
            fontSize: '14px', 
            fontWeight: 800,
            color: '#fff', 
            textDecoration: 'none',
            backgroundColor: '#FF3B30', 
            boxShadow: '0 6px 24px rgba(255,59,48,0.35)',
          }}>
            Voir le calendrier complet
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </section>
      )}

      {/* Loading unifié */}
      {loading && !homeData && (
        <section style={{
          padding: '80px 24px',
          backgroundColor: '#000',
          margin: '0 12px',
          borderRadius: 'var(--radius-xxxl)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '60px', 
                height: '8px', 
                borderRadius: '4px',
                background: 'linear-gradient(90deg, rgba(255,59,48,0.6) 0%, rgba(255,149,0,0.6) 100%)',
                animation: `dropsCalendarLoading 1.2s ease-in-out ${i * 0.1}s infinite`,
              }} />
            ))}
            <p style={{ 
              fontSize: '13px', 
              color: 'rgba(255,255,255,0.35)', 
              fontWeight: 500 
            }}>
              Chargement des lancements...
            </p>
          </div>
          <style>{`
            @keyframes dropsCalendarLoading {
              0%, 100% { opacity: 0.4; transform: scaleX(0.8); }
              50% { opacity: 1; transform: scaleX(1); }
            }
          `}</style>
        </section>
      )}

      {/* Empty state unifié */}
      {!loading && homeData && !hasUpcoming && !hasRecent && (
        <section style={{
          padding: '80px 24px',
          textAlign: 'center',
          backgroundColor: '#000',
          margin: '0 12px',
          borderRadius: 'var(--radius-xxxl)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: '70px', 
            height: '70px', 
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(255,59,48,0.08) 0%, rgba(255,149,0,0.08) 100%)', 
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 style={{ 
            fontSize: '1.4rem', 
            fontWeight: 800, 
            color: '#fff', 
            letterSpacing: '-0.5px', 
            margin: '0 0 16px' 
          }}>
            Aucun lancement prévu
          </h3>
          <p style={{ 
            fontSize: '0.95rem', 
            color: 'rgba(255,255,255,0.38)', 
            lineHeight: 1.7, 
            maxWidth: '420px', 
            margin: '0 0 24px' 
          }}>
            Les marques préparent actuellement leurs futures collections. Reviens bientôt pour découvrir les prochains lancements et nouveautés.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/explorer" style={{
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '12px 20px', 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: 800,
              color: '#fff', 
              textDecoration: 'none',
              backgroundColor: '#FF3B30', 
              boxShadow: '0 4px 16px rgba(255,59,48,0.35)',
            }}>
              Explorer les collections
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/create-brand" style={{
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '12px 20px', 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)', 
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(255,255,255,0.04)',
            }}>
              Créer sa marque
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
