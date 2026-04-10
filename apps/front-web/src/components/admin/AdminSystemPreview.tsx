'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/adminApi';
import { useRouter } from 'next/navigation';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export function AdminSystemPreview() {
  const router = useRouter();
  const [data, setData] = useState<{ queues: any[]; deadletters: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminApi.getSystemQueues();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load system queues', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalActive = data?.queues.reduce((acc, q) => acc + q.active, 0) || 0;
  const deadletterCount = data?.deadletters?.length || 0;
  const isHealthy = deadletterCount === 0;

  return (
    <div 
      onClick={() => router.push('/admin/system')}
      style={{
        background: '#111113', 
        borderRadius: 16,
        border: `1px solid ${isHealthy ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 59, 48, 0.2)'}`,
        padding: '16px 24px', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        fontFamily: FONT_FAMILY_INTER,
        transition: 'all 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseOut={(e) => e.currentTarget.style.background = '#111113'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 12, height: 12, borderRadius: '50%',
          background: isHealthy ? '#34C759' : '#FF3B30',
          boxShadow: `0 0 10px ${isHealthy ? '#34C759' : '#FF3B30'}`
        }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>État des Workers (BullMQ)</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            {loading ? 'Vérification...' : isHealthy ? 'Tous les systèmes sont opérationnels' : 'Attention requise'}
          </div>
        </div>
      </div>
      
      {!loading && data && (
        <div style={{ display: 'flex', gap: 24, textAlign: 'right' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Jobs Actifs</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{totalActive}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>File Morte (Erreurs)</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: isHealthy ? '#34C759' : '#FF3B30' }}>{deadletterCount}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>
      )}
    </div>
  );
}
