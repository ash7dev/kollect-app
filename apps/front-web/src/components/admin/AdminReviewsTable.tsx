'use client';

import { useState, useEffect } from 'react';
import { adminApi, type Review, type ReviewStats } from '@/services/adminApi';
import { 
  COLORS, 
  CheckIcon, 
  StarIcon, 
  SearchIcon, 
  TrashIcon, 
  FilterIcon, 
  TrendingUpIcon,
  UsersIcon,
  StoreIcon
} from './AdminIcons';
import { AdminStatCard } from './AdminStatCard';

export function AdminReviewsTable() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [ratingFilter, setRatingFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const [reviewsResponse, statsResponse] = await Promise.all([
          adminApi.getReviews({
            search,
            status: statusFilter === 'all' ? undefined : statusFilter as any,
            rating: ratingFilter === 'all' ? undefined : ratingFilter,
            verified: verifiedFilter === 'all' ? undefined : (verifiedFilter === 'verified' ? 'true' : 'false'),
            limit: 50,
          }),
          adminApi.getStats('30days'),
        ]);
        
        setReviews(reviewsResponse.data?.data || []);
        setStats(statsResponse.data?.reviews || null);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [search, statusFilter, ratingFilter, verifiedFilter]);

  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId + '_approve');
    try {
      await adminApi.approveReview(reviewId);
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, isApproved: true } : r));
    } catch (e) {
      console.error('Erreur approbation avis:', e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reviewId: string) => {
    setActionLoading(reviewId + '_reject');
    try {
      await adminApi.rejectReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (e) {
      console.error('Erreur rejet avis:', e);
    } finally {
      setActionLoading(null);
    }
  };

  const fmtDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-SN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon 
            key={i} 
            size={14} 
            color={i < rating ? '#FFD426' : 'rgba(255,255,255,0.1)'} 
            filled={i < rating} 
          />
        ))}
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.05)', borderTopColor: COLORS.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Moderation KPIs */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          <AdminStatCard
            title="Total Avis"
            value={stats.total.toLocaleString()}
            color="#FFD426"
            chartData={[20, 25, 22, 30, 28, 35, 32, 40]}
          />
          <AdminStatCard
            title="Note Moyenne"
            value={`${stats.averageRating.toFixed(1)} / 5`}
            color={COLORS.success}
            chartData={[4.2, 4.3, 4.5, 4.4, 4.6, 4.5, 4.7, 4.6]}
          />
          <AdminStatCard
            title="En attente"
            value={stats.pending.toLocaleString()}
            color={COLORS.warning}
            chartData={[15, 12, 10, 8, 5, 7, 4, 3]}
          />
          <AdminStatCard
            title="Achats Vérifiés"
            value={stats.verifiedPurchases.toLocaleString()}
            color={COLORS.primary}
            chartData={[10, 15, 18, 22, 25, 24, 28, 30]}
          />
        </div>
      )}

      {/* Control Hub */}
      <div style={{ 
        display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
        padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: `1px solid ${COLORS.border}`
      }}>
        <div style={{ flex: 1, position: 'relative', minWidth: 300 }}>
          <input
            type="text"
            placeholder="Rechercher par auteur, produit, contenu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px 14px 44px', borderRadius: 16,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff', fontSize: 14, outline: 'none'
            }}
          />
          <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
            <SearchIcon size={18} color="#fff" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{
              padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="pending">⏳ En attente</option>
            <option value="approved">✅ Approuvés</option>
            <option value="rejected">❌ Rejetés</option>
            <option value="all">Tous les avis</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value as any)}
            style={{
              padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="all">Toutes notes</option>
            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} étoiles</option>)}
          </select>
        </div>
      </div>

      {/* Review Cards Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {reviews.length === 0 ? (
          <div style={{ padding: 100, textAlign: 'center', color: COLORS.textSecondary, background: COLORS.cardBg, borderRadius: 24, border: `1px solid ${COLORS.border}` }}>
            <StarIcon size={48} color="rgba(255,255,255,0.05)" />
            <div style={{ marginTop: 16 }}>Aucun avis ne correspond à vos critères.</div>
          </div>
        ) : reviews.map((review) => (
          <article 
            key={review.id}
            style={{
              padding: 24, background: COLORS.cardBg, borderRadius: 24, 
              border: `1px solid ${COLORS.border}`, display: 'flex', gap: 24,
              backdropFilter: 'blur(30px)', transition: 'transform 0.2s',
              cursor: 'default'
            }}
          >
            {/* Product Thumbnail */}
            <div style={{ width: 100, height: 100, flexShrink: 0, borderRadius: 16, overflow: 'hidden', border: `1px solid ${COLORS.border}`, background: '#fff' }}>
              <img 
                src={review.product.images[0] || '/placeholder.jpg'} 
                alt={review.product.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Content Core */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{review.user.name}</span>
                    {review.isVerified && (
                      <span style={{ 
                        display: 'flex', alignItems: 'center', gap: 4, 
                        padding: '4px 8px', borderRadius: 8, background: 'rgba(52,199,89,0.1)', 
                        color: COLORS.success, fontSize: 11, fontWeight: 800 
                      }}>
                        <CheckIcon size={10} color={COLORS.success} /> Achat Vérifié
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.textSecondary }}>
                    {review.user.email} • {fmtDate(review.createdAt)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {renderStars(review.rating)}
                  <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: '#fff' }}>
                    {review.product.name}
                  </div>
                </div>
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

              <div>
                {review.title && <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#fff' }}>{review.title}</h4>}
                <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{review.comment}</p>
              </div>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  {review.images.map((img, idx) => (
                    <img 
                      key={idx} src={img} alt="Avis" 
                      style={{ width: 80, height: 80, borderRadius: 12, border: `1px solid ${COLORS.border}`, objectFit: 'cover' }} 
                    />
                  ))}
                </div>
              )}

              {/* Seller Feedback */}
              {review.response && (
                <div style={{ 
                  marginTop: 8, padding: 16, background: 'rgba(0,122,255,0.05)', 
                  borderRadius: 16, border: '1px solid rgba(0,122,255,0.1)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <StoreIcon size={14} color={COLORS.primary} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: COLORS.primary }}>Réponse de la boutique</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{review.response}</p>
                </div>
              )}

              {/* Moderation Controls */}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                {!review.isApproved && (
                  <>
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={!!actionLoading}
                      style={{
                        padding: '10px 20px', borderRadius: 12, border: 'none',
                        background: COLORS.success, color: '#fff', fontSize: 13, fontWeight: 800,
                        cursor: 'pointer', transition: 'box-shadow 0.2s'
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.boxShadow = '0 0 15px rgba(52,199,89,0.3)')}
                      onMouseOut={(e) => (e.currentTarget.style.boxShadow = 'none')}
                    >
                      {actionLoading === review.id + '_approve' ? '…' : 'Approuver'}
                    </button>
                    <button
                      onClick={() => handleReject(review.id)}
                      disabled={!!actionLoading}
                      style={{
                        padding: '10px 20px', borderRadius: 12,
                        background: 'rgba(255,59,48,0.1)', color: COLORS.danger, fontSize: 13, fontWeight: 800,
                        cursor: 'pointer', border: `1px solid ${COLORS.danger}30`
                      }}
                    >
                      {actionLoading === review.id + '_reject' ? '…' : 'Supprimer'}
                    </button>
                  </>
                )}
                <button style={{
                  padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${COLORS.border}`, color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer'
                }}>
                  Signalé par 0 utilisateurs
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
