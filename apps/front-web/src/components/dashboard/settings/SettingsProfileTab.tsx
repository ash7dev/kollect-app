'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/services/api/client';
import { useAuth } from '@/providers/AuthProvider';

export function SettingsProfileTab() {
  const { user } = useAuth();
  
  // États
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.patch('/user/profile', formData);
      toast.success('Profil mis à jour avec succès');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .st-form-group { margin-bottom: 24px; }
        .st-label { display: block; font-size: 13px; font-weight: 700; color: rgba(0,0,0,0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .st-input-wrap { display: flex; align-items: center; background: #fff; border: 1.5px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 0 16px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .st-input-wrap:focus-within { border-color: #FF3B30; box-shadow: 0 0 0 4px rgba(255,59,48,0.1); }
        .st-input-icon { color: rgba(0,0,0,0.3); margin-right: 12px; display: flex; }
        .st-input { flex: 1; height: 52px; border: none; outline: none; background: transparent; font-size: 15px; font-weight: 500; color: #000; }
        .st-btn { height: 52px; padding: 0 32px; background: #0A0A0A; color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .st-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }
        .st-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
      `}</style>
      
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.5px' }}>Informations personnelles</h2>
        <p style={{ margin: 0, fontSize: 15, color: 'rgba(0,0,0,0.5)' }}>Mets à jour tes informations de contact et d&apos;application.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
        {/* Prénom & Nom */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
           <div className="st-form-group" style={{ flex: '1 1 calc(50% - 8px)' }}>
             <label className="st-label">Prénom</label>
             <div className="st-input-wrap">
               <span className="st-input-icon">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
               </span>
               <input 
                 className="st-input" 
                 type="text" 
                 placeholder="Ton prénom"
                 value={formData.firstName}
                 onChange={e => setFormData({ ...formData, firstName: e.target.value })}
               />
             </div>
           </div>

           <div className="st-form-group" style={{ flex: '1 1 calc(50% - 8px)' }}>
             <label className="st-label">Nom</label>
             <div className="st-input-wrap">
               <span className="st-input-icon">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
               </span>
               <input 
                 className="st-input" 
                 type="text" 
                 placeholder="Ton nom"
                 value={formData.lastName}
                 onChange={e => setFormData({ ...formData, lastName: e.target.value })}
               />
             </div>
           </div>
        </div>

        <div className="st-form-group">
          <label className="st-label">Adresse Email</label>
          <div className="st-input-wrap">
            <span className="st-input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </span>
            <input 
              className="st-input" 
              type="email" 
              placeholder="votre@email.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="st-form-group" style={{ marginBottom: 40 }}>
          <label className="st-label">Numéro de Téléphone</label>
          <div className="st-input-wrap">
            <span className="st-input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </span>
            <input 
              className="st-input" 
              type="tel" 
              placeholder="+221 00 000 00 00"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="st-btn" disabled={isLoading}>
          {isLoading ? (
            <>
              <svg style={{ animation: 'spin 1s linear infinite' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Enregistrement...
            </>
          ) : (
            'Enregistrer les modifications'
          )}
        </button>
      </form>
    </div>
  );
}
