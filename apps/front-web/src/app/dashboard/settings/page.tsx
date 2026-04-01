'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { apiClient } from '@/services/api/client';

type SettingsSection = {
  title: string;
  items: SettingsItem[];
};

type SettingsItem = {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'input' | 'select' | 'button';
  value?: string | boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
};

export default function DashboardSettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // États des paramètres
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    twoFactorAuth: false,
    language: 'fr',
    currency: 'XOF',
    darkMode: false,
  });

  const [userInfo, setUserInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    // Charger les paramètres existants depuis l'API
    const loadSettings = async () => {
      try {
        const response = await apiClient.get('/user/settings');
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    };

    loadSettings();
  }, []);

  const handleLogout = async () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      setIsLoading(true);
      try {
        await signOut();
        toast.success('Déconnexion réussie');
        router.push('/');
      } catch (error) {
        toast.error('Erreur lors de la déconnexion');
        setIsLoading(false);
      }
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      await apiClient.patch('/user/settings', { [key]: value });
      setSettings(prev => ({ ...prev, [key]: value }));
      toast.success('Paramètre mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du paramètre');
    }
  };

  const updateUserInfo = async (key: string, value: string) => {
    try {
      await apiClient.patch('/user/profile', { [key]: value });
      setUserInfo(prev => ({ ...prev, [key]: value }));
      toast.success('Informations mises à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des informations');
    }
  };

  const sections: SettingsSection[] = [
    {
      title: 'Mon Compte',
      items: [
        {
          id: 'firstName',
          label: 'Prénom',
          type: 'input',
          value: userInfo.firstName,
          placeholder: 'Votre prénom',
          onPress: () => {},
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          ),
        },
        {
          id: 'lastName',
          label: 'Nom',
          type: 'input',
          value: userInfo.lastName,
          placeholder: 'Votre nom',
          onPress: () => {},
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          ),
        },
        {
          id: 'email',
          label: 'Email',
          type: 'input',
          value: userInfo.email,
          placeholder: 'votre@email.com',
          onPress: () => {},
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-3-3-3"/>
            </svg>
          ),
        },
        {
          id: 'phone',
          label: 'Téléphone',
          type: 'input',
          value: userInfo.phone,
          placeholder: '+221 123 45 67',
          onPress: () => {},
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18-2h.44a2 2 0 0 1 2.18 2v3a3.3 3 0 0 1-3.3 3"/>
              <path d="M15 13a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3"/>
              <path d="m22 16.92-3.63-1.42.3a2 2 0 0 0-2.11-.14l-3.64-3.64a2 2 0 0 0-2.11.14z"/>
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Préférences',
      items: [
        {
          id: 'emailNotifications',
          label: 'Notifications par email',
          description: 'Recevoir les notifications importantes par email',
          type: 'toggle',
          value: settings.emailNotifications,
          onPress: () => updateSetting('emailNotifications', !settings.emailNotifications),
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              <path d="M3 9l9 9v9"/>
              <path d="m9 9 9-9"/>
            </svg>
          ),
        },
        {
          id: 'pushNotifications',
          label: 'Notifications push',
          description: 'Recevoir les notifications sur votre appareil',
          type: 'toggle',
          value: settings.pushNotifications,
          onPress: () => updateSetting('pushNotifications', !settings.pushNotifications),
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              <path d="M3 9l9 9v9"/>
              <path d="m9 9 9-9"/>
            </svg>
          ),
        },
        {
          id: 'twoFactorAuth',
          label: 'Authentification à deux facteurs',
          description: 'Ajouter une couche de sécurité à votre compte',
          type: 'toggle',
          value: settings.twoFactorAuth,
          onPress: () => updateSetting('twoFactorAuth', !settings.twoFactorAuth),
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5"/>
            </svg>
          ),
        },
        {
          id: 'language',
          label: 'Langue',
          type: 'select',
          value: settings.language,
          options: [
            { value: 'fr', label: 'Français' },
            { value: 'en', label: 'English' },
          ],
          onPress: () => updateSetting('language', settings.language),
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m5 8 6 6"/>
              <path d="m14 8 6 6"/>
              <path d="m5 14 6 6"/>
              <path d="m14 14 6 6"/>
            </svg>
          ),
        },
        {
          id: 'currency',
          label: 'Devise',
          type: 'select',
          value: settings.currency,
          options: [
            { value: 'XOF', label: 'FCFA (XOF)' },
            { value: 'EUR', label: 'Euro (EUR)' },
            { value: 'USD', label: 'Dollar (USD)' },
          ],
          onPress: () => updateSetting('currency', settings.currency),
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v12m0-12h.01"/>
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Sécurité',
      items: [
        {
          id: 'changePassword',
          label: 'Changer le mot de passe',
          description: 'Mettre à jour votre mot de passe pour plus de sécurité',
          type: 'button',
          onPress: () => router.push('/dashboard/settings/password'),
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="m7 11 5 5"/>
            </svg>
          ),
        },
        {
          id: 'loginHistory',
          label: 'Historique de connexion',
          description: 'Voir les connexions récentes à votre compte',
          type: 'button',
          onPress: () => router.push('/dashboard/settings/login-history'),
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9h-6"/>
              <path d="M3 21v-2a4 4 0 0 0-4-4h.5"/>
              <circle cx="17.5" cy="8.5" r="2.5"/>
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F5F7',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <style>{`
        .settings-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 24px;
        }
        .settings-header {
          margin-bottom: 32px;
          text-align: center;
        }
        .settings-title {
          font-size: 28px;
          font-weight: 800;
          color: #0A0A0A;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .settings-subtitle {
          font-size: 16px;
          color: rgba(0,0,0,0.6);
          font-weight: 500;
        }
        .settings-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .settings-section-title {
          font-size: 18px;
          font-weight: 700;
          color: #0A0A0A;
          margin-bottom: 20px;
          letter-spacing: -0.3px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .settings-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .settings-item:last-child {
          border-bottom: none;
        }
        .settings-item-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }
        .settings-item-content {
          flex: 1;
        }
        .settings-item-label {
          font-size: 15px;
          font-weight: 600;
          color: #0A0A0A;
          margin-bottom: 4px;
        }
        .settings-item-description {
          font-size: 13px;
          color: rgba(0,0,0,0.5);
          line-height: 1.4;
        }
        .settings-item-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .settings-input {
          width: 100%;
          max-width: 300px;
          padding: 10px 14px;
          border: 1.5px solid rgba(0,0,0,0.1);
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .settings-input:focus {
          border-color: #FF3B30;
          box-shadow: 0 0 0 3px rgba(255,59,48,0.1);
        }
        .settings-select {
          width: 100%;
          max-width: 200px;
          padding: 10px 14px;
          border: 1.5px solid rgba(0,0,0,0.1);
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background: white;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .settings-select:focus {
          border-color: #FF3B30;
          box-shadow: 0 0 0 3px rgba(255,59,48,0.1);
        }
        .settings-toggle {
          position: relative;
          width: 48px;
          height: 28px;
          background: #E5E5E5;
          border-radius: 14px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .settings-toggle.active {
          background: #FF3B30;
        }
        .settings-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 12px;
          transition: transform 0.15s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .settings-toggle.active .settings-toggle-thumb {
          transform: translateX(20px);
        }
        .settings-button {
          padding: 10px 20px;
          border: 1.5px solid rgba(0,0,0,0.1);
          border-radius: 8px;
          background: white;
          color: #0A0A0A;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .settings-button:hover {
          border-color: #FF3B30;
          background: rgba(255,59,48,0.05);
        }
        .logout-section {
          background: #FFF5F5;
          border: 2px solid #FF3B30;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          margin-top: 32px;
        }
        .logout-button {
          background: #FF3B30;
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.5px;
        }
        .logout-button:hover {
          background: #E0321F;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255,59,48,0.3);
        }
        .logout-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        @media (max-width: 768px) {
          .settings-container {
            padding: 20px 16px;
          }
          .settings-section {
            padding: 20px;
            margin-bottom: 20px;
          }
          .settings-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 20px 0;
          }
          .settings-item-right {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>

      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <h1 className="settings-title">Paramètres</h1>
          <p className="settings-subtitle">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        {/* Sections */}
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="settings-section">
            <h2 className="settings-section-title">
              {section.title}
            </h2>
            
            <div>
              {section.items.map((item, itemIndex) => (
                <div key={item.id} className={`settings-item ${itemIndex === section.items.length - 1 ? 'last-child' : ''}`}>
                  <div className="settings-item-left">
                    <div style={{ color: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.icon}
                    </div>
                    <div className="settings-item-content">
                      <div className="settings-item-label">{item.label}</div>
                      {item.description && (
                        <div className="settings-item-description">{item.description}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="settings-item-right">
                    {item.type === 'toggle' && (
                      <button
                        className={`settings-toggle ${item.value ? 'active' : ''}`}
                        onClick={() => item.onPress?.()}
                        disabled={isLoading}
                      >
                        <div className="settings-toggle-thumb" />
                      </button>
                    )}
                    
                    {item.type === 'input' && (
                      <input
                        className="settings-input"
                        type="text"
                        value={item.value as string}
                        placeholder={item.placeholder}
                        onChange={(e) => {
                          const fieldName = item.id as keyof typeof userInfo;
                          setUserInfo(prev => ({ ...prev, [fieldName]: e.target.value }));
                        }}
                        onBlur={() => {
                          const fieldName = item.id as keyof typeof userInfo;
                          updateUserInfo(fieldName, userInfo[fieldName]);
                        }}
                      />
                    )}
                    
                    {item.type === 'select' && (
                      <select
                        className="settings-select"
                        value={item.value as string}
                        onChange={(e) => {
                          item.onPress?.();
                          updateSetting(item.id, e.target.value);
                        }}
                      >
                        {item.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {item.type === 'button' && (
                      <button
                        className="settings-button"
                        onClick={() => item.onPress?.()}
                      >
                        {item.label}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Section Déconnexion */}
        <div className="logout-section">
          <h3 style={{ 
            fontSize: 18, 
            fontWeight: 700, 
            color: '#0A0A0A', 
            marginBottom: 16,
            letterSpacing: '-0.3px'
          }}>
            Déconnexion
          </h3>
          <p style={{ 
            fontSize: 14, 
            color: 'rgba(0,0,0,0.6)', 
            marginBottom: 20,
            lineHeight: 1.5
          }}>
            Vous souhaitez vous déconnecter de votre compte Kollect ?
          </p>
          <button
            className="logout-button"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? 'DÉCONNEXION...' : 'SE DÉCONNECTER'}
          </button>
        </div>
      </div>
    </div>
  );
}
