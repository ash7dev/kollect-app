'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/services/api/client';
import { useAuth } from '@/providers/AuthProvider';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export function SettingsBrandTab() {
  const { user, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    coverImage: '',
  });
  
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFullBrandData = async () => {
      try {
        const { data } = await apiClient.get(API_ENDPOINTS.BRANDS.MY_BRAND);
        if (data) {
          setFormData({
            name: data.name || '',
            slug: data.slug || '',
            description: data.description || '',
            logo: data.logo || '',
            coverImage: data.coverImage || '',
          });
        }
      } catch (err) {
        toast.error('Impossible de charger les détails');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchFullBrandData();
  }, []);

  const handleUpload = async (file: File, type: 'logo' | 'banner') => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image trop lourde (max 2MB)');
      return;
    }
    const brandId = user?.brand?.id;
    if (!brandId) return;

    if (type === 'logo') setIsUploadingLogo(true);
    else setIsUploadingBanner(true);

    const data = new FormData();
    data.append('file', file);

    try {
      const endpoint = type === 'logo' ? `/brands/${brandId}/logo` : `/brands/${brandId}/banner`;
      const response = await apiClient.post(endpoint, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newUrl = response.data.url;
      setFormData(prev => ({ ...prev, [type === 'logo' ? 'logo' : 'coverImage']: newUrl }));
      toast.success('Image mise à jour');
      await refreshUser();
    } catch (err) {
      toast.error("Échec de l'upload");
    } finally {
      if (type === 'logo') setIsUploadingLogo(false);
      else setIsUploadingBanner(false);
    }
  };

  const handleDeleteImage = async (e: React.MouseEvent, type: 'logo' | 'banner') => {
    e.stopPropagation(); // Évite d'ouvrir le sélecteur de fichier
    const brandId = user?.brand?.id;
    if (!brandId) return;

    if (!confirm(`Es-tu sûr de vouloir supprimer ${type === 'logo' ? 'le logo' : 'la bannière'} ?`)) return;

    setIsDeleting(type);
    try {
      // On update la marque avec null pour le champ concerné
      await apiClient.patch(API_ENDPOINTS.BRANDS.UPDATE(brandId), {
        [type === 'logo' ? 'logo' : 'coverImage']: null
      });
      setFormData(prev => ({ ...prev, [type === 'logo' ? 'logo' : 'coverImage']: '' }));
      toast.success('Image supprimée');
      await refreshUser();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const brandId = user?.brand?.id;
    if (!brandId) return;

    setIsSaving(true);
    try {
      await apiClient.patch(API_ENDPOINTS.BRANDS.UPDATE(brandId), {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
      });
      toast.success('Enregistré');
      await refreshUser();
    } catch (err) {
      toast.error('Erreur de sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '40px 0', color: 'rgba(0,0,0,0.4)', fontWeight: 600, fontSize: 14 }}>
        <svg style={{ animation: 'spin 1s linear infinite' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Chargement de la boutique...
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .st-form-group { margin-bottom: 32px; }
        .st-label { display: block; font-size: 13px; font-weight: 800; color: rgba(0,0,0,0.4); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
        .st-input-wrap { display: flex; align-items: center; background: #fff; border: 1.5px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 0 16px; transition: all 0.2s; }
        .st-input-wrap:focus-within { border-color: #FF3B30; box-shadow: 0 0 0 4px rgba(255,59,48,0.06); }
        .st-input { flex: 1; height: 54px; border: none; outline: none; background: transparent; font-size: 15px; font-weight: 600; color: #000; }
        .st-textarea { flex: 1; padding: 18px 0; border: none; outline: none; background: transparent; font-size: 15px; font-weight: 600; color: #000; min-height: 120px; resize: none; line-height: 1.5; }
        .st-btn { height: 54px; padding: 0 36px; background: #0A0A0A; color: #fff; border: none; border-radius: 14px; font-size: 15px; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .st-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.25); }
        .st-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        
        .logo-preview { width: 110px; height: 110px; border-radius: 50%; background: #F5F5F7; border: 2px dashed rgba(0,0,0,0.08); display: flex; alignItems: center; justifyContent: center; cursor: pointer; transition: all 0.2s; overflow: hidden; position: relative; }
        .logo-preview:hover { border-color: #FF3B30; background: rgba(255,59,48,0.03); }
        
        .banner-preview { width: 100%; height: 180px; border-radius: 18px; background: #F5F5F7; border: 2px dashed rgba(0,0,0,0.08); display: flex; alignItems: center; justifyContent: center; cursor: pointer; transition: all 0.2s; overflow: hidden; position: relative; }
        .banner-preview:hover { border-color: #FF3B30; background: rgba(255,59,48,0.03); }

        .btn-delete-img { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 10px; background: #fff; border: none; color: #FF3B30; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,15); cursor: pointer; transition: all 0.2s; z-index: 10; opacity: 0.9; }
        .btn-delete-img:hover { transform: scale(1.1); background: #FF3B30; color: #fff; opacity: 1; }
      `}</style>

      <form onSubmit={handleSubmit} style={{ maxWidth: 650 }}>
        {/* Banner */}
        <div className="st-form-group">
          <label className="st-label">Bannière de la boutique</label>
          <div className="banner-preview" onClick={() => bannerInputRef.current?.click()}>
            {formData.coverImage ? (
              <>
                <img src={formData.coverImage} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" className="btn-delete-img" onClick={(e) => handleDeleteImage(e, 'banner')} title="Supprimer la bannière">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-4 5v5m-4-5v5"/></svg>
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'rgba(0,0,0,0.3)' }}>CHOISIR UNE BANNIÈRE</p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(0,0,0,0.2)', fontWeight: 600 }}>1200x400 recommandé</p>
              </div>
            )}
            {(isUploadingBanner || isDeleting === 'banner') && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
                <svg style={{ animation: 'spin 1s linear infinite' }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              </div>
            )}
          </div>
          <input type="file" ref={bannerInputRef} style={{ display: 'none' }} accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'banner')} />
        </div>

        {/* Logo */}
        <div className="st-form-group">
          <label className="st-label">Logo officiel</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div className="logo-preview" onClick={() => logoInputRef.current?.click()}>
              {formData.logo ? (
                <>
                  <img src={formData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" className="btn-delete-img" style={{ top: 0, right: 0, width: 28, height: 28 }} onClick={(e) => handleDeleteImage(e, 'logo')} title="Supprimer le logo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
              )}
              {(isUploadingLogo || isDeleting === 'logo') && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
                  <svg style={{ animation: 'spin 1s linear infinite' }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="4"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                </div>
              )}
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 800, color: '#000' }}>Logo circulaire</p>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(0,0,0,0.4)', fontWeight: 500, maxWidth: 220 }}>S&apos;affiche partout sur Kollect. Max 2MB.</p>
              <input type="file" ref={logoInputRef} style={{ display: 'none' }} accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'logo')} />
            </div>
          </div>
        </div>

        <div className="st-form-group">
          <label className="st-label">Nom de la boutique</label>
          <div className="st-input-wrap">
            <input className="st-input" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
        </div>

        <div className="st-form-group">
          <label className="st-label">URL de la boutique (Slug)</label>
          <div className="st-input-wrap">
            <span style={{ color: 'rgba(0,0,0,0.25)', marginRight: 4, fontSize: 14, fontWeight: 700 }}>kollect.ma/brand/</span>
            <input className="st-input" type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} />
          </div>
        </div>

        <div className="st-form-group" style={{ marginBottom: 40 }}>
          <label className="st-label">Bio de la marque</label>
          <div className="st-input-wrap">
            <textarea className="st-textarea" placeholder="Raconte ton histoire..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
        </div>

        <button type="submit" className="st-btn" disabled={isSaving || isUploadingLogo || isUploadingBanner || isDeleting !== null}>
          {isSaving ? 'Mise à jour en cours...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  );
}
