'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/config/supabaseClient';

export function SettingsSecurityTab() {
  const { user, signOut } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleResetPassword = async () => {
    if (!user?.email) {
      toast.error('Adresse email introuvable.');
      return;
    }
    
    setIsResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      toast.success('Un email de réinitialisation vous a été envoyé.');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'envoi de l\'email.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      setIsLoggingOut(true);
      try {
        await signOut();
        toast.success('Déconnexion réussie');
      } catch (error) {
        toast.error('Erreur lors de la déconnexion');
        setIsLoggingOut(false);
      }
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <style>{`
        .st-btn-outline { height: 52px; padding: 0 32px; background: transparent; color: #0A0A0A; border: 1.5px solid rgba(0,0,0,0.1); border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .st-btn-outline:hover { border-color: #0A0A0A; background: rgba(0,0,0,0.02); }
        .st-btn-danger { height: 52px; padding: 0 32px; background: #FFF5F5; color: #FF3B30; border: 1.5px solid rgba(255,59,48,0.2); border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .st-btn-danger:hover { background: #FF3B30; color: #fff; border-color: #FF3B30; box-shadow: 0 4px 12px rgba(255,59,48,0.25); transform: translateY(-1px); }
        .sec-card { background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; padding: 24px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.5px' }}>Sécurité du compte</h2>
        <p style={{ margin: 0, fontSize: 15, color: 'rgba(0,0,0,0.5)' }}>Gestion du mot de passe et sessions actives.</p>
      </div>

      <div className="sec-card">
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Mot de passe</h3>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(0,0,0,0.5)' }}>Recevez un lien par email pour choisir un nouveau mot de passe via Supabase.</p>
        </div>
        <button className="st-btn-outline" onClick={handleResetPassword} disabled={isResetting}>
          {isResetting ? 'Envoi en cours...' : 'Réinitialiser le mot de passe'}
        </button>
      </div>

      <div className="sec-card">
         <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#FF3B30' }}>Déconnexion</h3>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(0,0,0,0.5)' }}>Déconnectez-vous de votre session sur cet appareil.</p>
        </div>
        <button className="st-btn-danger" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
        </button>
      </div>
    </div>
  );
}
