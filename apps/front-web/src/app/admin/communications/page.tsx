'use client';

import { useState } from 'react';
import { adminApi } from '@/services/adminApi';

export default function AdminCommunicationPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'clients' | 'ceos'>('all');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [isSending, setIsSending] = useState(false);
  const [sentStatus, setSentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSentStatus('idle');
    
    try {
      if (target === 'all') {
        await adminApi.sendGlobalNotification({ title, message, priority });
      } else {
        const roleMap: Record<string, 'isClient' | 'isCEO' | 'isAdmin'> = {
          clients: 'isClient',
          ceos: 'isCEO',
        };
        await adminApi.sendNotificationByRole({ role: roleMap[target], title, message });
      }
      setSentStatus('success');
      setTitle('');
      setMessage('');
    } catch (err) {
      console.error('Erreur envoi notification:', err);
      setSentStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111' }}>Communications & Push</h2>
        <p style={{ margin: '8px 0 0', color: 'rgba(0,0,0,0.5)', fontSize: 14 }}>
          Envoyez des notifications globales ou ciblées à l'ensemble des utilisateurs de la plateforme.
        </p>
      </div>

      <div style={{ 
        display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start'
      }}>
        <form onSubmit={handleSend} style={{
          background: '#fff', padding: 24, borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 20
        }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 8 }}>
              Titre de la notification
            </label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Nouveau Drop disponible !"
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)',
                fontSize: 14, outline: 'none', transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 8 }}>
              Message (Contenu)
            </label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez l'annonce ici..."
              required
              rows={5}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)',
                fontSize: 14, outline: 'none', resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
             <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 8 }}>Cible</label>
                <select 
                  value={target}
                  onChange={(e) => setTarget(e.target.value as any)}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: '#fff' }}
                >
                  <option value="all">Tous les utilisateurs</option>
                  <option value="clients">Clients uniquement</option>
                  <option value="ceos">Vendeurs (CEO) uniquement</option>
                </select>
             </div>
             <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 8 }}>Priorité</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: '#fff' }}
                >
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Normale</option>
                  <option value="HIGH">Haute</option>
                  <option value="URGENT">Urgent (Immédiat)</option>
                </select>
             </div>
          </div>

          <button 
            type="submit" 
            disabled={isSending}
            style={{
              padding: '14px', background: '#FF3B30', color: '#fff', border: 'none',
              borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer',
              transition: 'all 0.2s', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
            }}
          >
            {isSending ? 'Envoi en cours...' : 'Envoyer la Notification'}
            {!isSending && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>

          {sentStatus === 'success' && (
            <div style={{ padding: '12px', background: 'rgba(52, 199, 89, 0.1)', color: '#34C759', borderRadius: 10, fontSize: 13, textAlign: 'center', fontWeight: 600 }}>
              ✓ Notification envoyée avec succès à la file d'attente.
            </div>
          )}
          {sentStatus === 'error' && (
            <div style={{ padding: '12px', background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', borderRadius: 10, fontSize: 13, textAlign: 'center', fontWeight: 600 }}>
              ✗ Erreur lors de l'envoi. Vérifiez la connexion au serveur.
            </div>
          )}
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
           <div style={{
              background: '#0A0A0B', color: '#fff', padding: 20, borderRadius: 16,
              boxShadow: '0 12px 40px rgba(0,0,0,0.1)'
           }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>Aperçu Mobile</h4>
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12,
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                 <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, background: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900 }}>K</div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>KOLLECT</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>MAINTENANT</span>
                 </div>
                 <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{title || 'Titre de la notification'}</div>
                 <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{message || 'Le contenu de votre message apparaîtra ici pour les utilisateurs...'}</div>
              </div>
           </div>

           <div style={{
              padding: 20, borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', background: '#fff'
           }}>
              <h4 style={{ margin: '0 0 16px', fontSize: 14, color: '#111' }}>Conseils de Rédaction</h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li>Soyez concis et percutant.</li>
                <li>Utilisez des Emojis pour attirer l'attention.</li>
                <li>Vérifiez les liens avant l'envoi.</li>
                <li>Évitez les envois multiples en moins de 24h.</li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
