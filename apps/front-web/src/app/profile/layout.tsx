'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const profileTabs = [
    { href: '/profile/orders', label: 'Mes commandes' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', fontFamily: FONT_FAMILY_INTER }}>
      <Navbar />

      {/* Header profile */}
      <div style={{
        background: '#0A0A0A',
        padding: '100px 28px 48px',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{
            margin: '0 0 12px', fontSize: 11, fontWeight: 800,
            letterSpacing: '3px', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
          }}>
            Mon compte
          </p>
          <h1 style={{
            margin: 0, fontSize: 32, fontWeight: 900,
            color: '#fff', letterSpacing: '-1px',
            lineHeight: 1.2,
          }}>
            Mes commandes
          </h1>
        </div>
      </div>

      {/* Navigation tabs */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ display: 'flex', gap: 32 }}>
            {profileTabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  padding: '20px 0',
                  borderBottom: pathname === tab.href ? '2px solid #0A0A0A' : '2px solid transparent',
                  color: pathname === tab.href ? '#0A0A0A' : 'rgba(0,0,0,0.5)',
                  fontSize: 14, fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  letterSpacing: '-0.2px',
                }}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 28px' }}>
        {children}
      </div>

      <Footer />
    </div>
  );
}
