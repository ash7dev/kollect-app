import Link from 'next/link';
import React from 'react';

interface LogoProps {
  className?: string;
  href?: string;
}

export function Logo({ className = '', href = '/' }: LogoProps) {
  return (
    <Link href={href} style={{ display: 'inline-flex', textDecoration: 'none' }} className={className}>
      <span style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #FF3B30, #FF6B6B)',
        boxShadow: '0 12px 48px rgba(255,59,48,0.4)',
        fontSize: '30px',
        fontWeight: 600,
        fontStyle: 'italic',
        color: '#fff',
        fontFamily: "'Dancing Script', 'Snell Roundhand', cursive",
        lineHeight: '48px',
        textAlign: 'center',
      }}>
        K
      </span>
    </Link>
  );
}
