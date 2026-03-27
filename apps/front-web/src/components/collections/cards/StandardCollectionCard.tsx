/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import type { PublicCollection } from '@/types/drops';

type StandardCollectionCardProps = {
  collection: PublicCollection;
};

export function StandardCollectionCard({ collection }: StandardCollectionCardProps) {
  const [hovered, setHovered] = useState(false);

  const imageUrl = collection.coverImage || '/api/placeholder/400/300';
  const productCount = collection._count?.products || 0;

  return (
    <a
      href={`/brand/${collection.brand.slug}/${collection.slug}`}
      style={{
        display: 'block',
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#0a0a0a',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: hovered 
          ? '0 12px 40px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)' 
          : '0 2px 12px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
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
            transition: 'transform 0.5s ease',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
          }}
        />

        {/* Overlay Gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 100%)',
          opacity: hovered ? 1 : 0.7,
          transition: 'opacity 0.3s ease',
        }} />

        {/* Status Badges */}
        <div style={{
          position: 'absolute',
          top: 16,
          left: 16,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
        }}>
          {collection.status === 'DISPONIBLE' && (
            <div style={{
              padding: '6px 12px',
              borderRadius: 999,
              backgroundColor: '#00C851',
              color: '#fff',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(0,200,81,0.3)',
            }}>
              Nouveau
            </div>
          )}
          
          {collection.status === 'TEASER' && (
            <div style={{
              padding: '6px 12px',
              borderRadius: 999,
              backgroundColor: '#FF8800',
              color: '#fff',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(255,136,0,0.3)',
            }}>
              Bientôt
            </div>
          )}
        </div>

        {/* Brand Logo */}
        {collection.brand.logo && (
          <div style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: '#fff',
            padding: 6,
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
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

        {/* Hover Action */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.3s ease',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#000',
              whiteSpace: 'nowrap',
            }}>
              Explorer
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '20px',
        backgroundColor: '#fff',
      }}>
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
            gap: 2,
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(0,0,0,0.4)',
            }}>
              {productCount} article{productCount > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
