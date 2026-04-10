'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { DashboardSidebar, type SidebarSection } from '@/components/dashboard/DashboardSidebar';
import { SettingsProfileTab } from '@/components/dashboard/settings/SettingsProfileTab';
import { SettingsBrandTab } from '@/components/dashboard/settings/SettingsBrandTab';
import { SettingsSecurityTab } from '@/components/dashboard/settings/SettingsSecurityTab';

type TabType = 'profile' | 'brand' | 'security';

export default function DashboardSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { 
      id: 'profile', 
      label: 'Profil', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> 
    },
    { 
      id: 'brand', 
      label: 'Ma Boutique', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> 
    },
    { 
      id: 'security', 
      label: 'Sécurité', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> 
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F7' }}>
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onNavigate={(section) => {
          if (section === 'overview') router.push('/dashboard');
          else if (section === 'drops') router.push('/dashboard/drops');
          else if (section === 'products') router.push('/dashboard/produits');
          else if (section === 'orders') router.push('/dashboard/commandes');
          else if (section === 'promotions') router.push('/dashboard/promotions');
        }}
      />

      <main style={{ flex: 1, padding: '40px 48px', minWidth: 0 }}>
        <style>{`
          .settings-container { max-width: 1000px; margin: 0 auto; }
          .settings-header { margin-bottom: 40px; display: flex; align-items: center; justify-content: space-between; }
          .tabs-list { display: flex; gap: 8px; background: rgba(0,0,0,0.04); padding: 5px; border-radius: 14px; margin-bottom: 40px; width: fit-content; }
          .tab-item { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; border: none; background: transparent; color: rgba(0,0,0,0.5); font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
          .tab-item.active { background: #fff; color: #FF3B30; shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .tab-item:hover:not(.active) { color: #000; background: rgba(0,0,0,0.02); }

          @media (max-width: 768px) {
            main { padding: 24px 20px !important; }
            .settings-container { max-width: 100%; }
            .tabs-list { width: 100%; overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; }
            .tab-item { white-space: nowrap; }
          }
        `}</style>

        <div className="settings-container">
          <header className="settings-header">
            <div>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(0,0,0,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Réglages</p>
              <h1 style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-1px' }}>Configuration</h1>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.08)',
                background: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Retour Dashboard
            </button>
          </header>

          <nav className="tabs-list">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          <div>
            {activeTab === 'profile' && <SettingsProfileTab />}
            {activeTab === 'brand' && <SettingsBrandTab />}
            {activeTab === 'security' && <SettingsSecurityTab />}
          </div>
        </div>
      </main>
    </div>
  );
}
