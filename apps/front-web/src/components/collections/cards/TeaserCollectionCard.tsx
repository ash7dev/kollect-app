/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import type { PublicCollection } from '@/types/drops';

type TeaserCollectionCardProps = {
  collection: PublicCollection;
};

export function TeaserCollectionCard({ collection }: TeaserCollectionCardProps) {
  const [hovered, setHovered] = useState(false);

  const imageUrl = collection.coverImage || '/api/placeholder/400/300';
  const productCount = collection._count?.products || 0;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#0a0a0a',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: hovered 
          ? '0 16px 48px rgba(255,136,0,0.15), 0 6px 20px rgba(255,136,0,0.1)' 
          : '0 4px 20px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image avec overlay */}
      <div style={{
        position: 'relative',
        aspectRatio: '4 / 3',
        overflow: 'hidden',
      }}>
        <img
          src={imageUrl}
          alt={collection.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'blur(2px) brightness(0.7)',
            transition: 'filter 0.5s ease',
          }}
        />

        {/* Overlay Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(135deg, rgba(255,136,0,0.1) 0%, transparent 50%),
            linear-gradient(45deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)
          `,
        }} />

        {/* Coming Soon Badge */}
        <div 
          className="coming-soon-badge"
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            padding: '12px 20px',
            borderRadius: 16,
            backgroundColor: 'rgba(255,136,0,0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#fff',
          }} />
          <span style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: '#fff',
          }}>
            Bientôt Disponible
          </span>
        </div>

        {/* Brand Logo */}
        {collection.brand.logo && (
          <div style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: 6,
            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          }}>
            <img
              src={collection.brand.logo}
              alt={collection.brand.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {/* Hover Content */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px',
          transform: hovered ? 'translateY(0)' : 'translateY(20px)',
          opacity: hovered ? 1 : 0,
          transition: 'all 0.3s ease',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '12px 20px',
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF8800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
            </svg>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#FF8800',
              whiteSpace: 'nowrap',
            }}>
              Me Notifier
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '20px',
        backgroundColor: '#fff',
        position: 'relative',
      }}>
        {/* Shimmer Line */}
        <div 
          className="coming-soon-badge"
          style={{
            position: 'absolute',
            top: 0,
            left: 20,
            right: 20,
            height: 2,
            borderRadius: 2,
            background: 'linear-gradient(90deg, transparent, rgba(255,136,0,0.5), transparent)',
            backgroundSize: '200% 100%',
          }}
        />

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: '-0.2px',
              color: '#000',
              margin: '0 0 6px',
              textTransform: 'uppercase',
              lineHeight: 1.2,
            }}>
              {collection.name}
            </h3>
            <p style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(0,0,0,0.5)',
              margin: 0,
            }}>
              {collection.brand.name}
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#FF8800',
            }}>
              {productCount} article{productCount > 1 ? 's' : ''}
            </div>
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,136,0,0.6)',
            }}>
              En attente
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
