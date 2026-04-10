'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / (3600*24));
  const hrs = Math.floor(seconds % (3600*24) / 3600);
  const mins = Math.floor(seconds % 3600 / 60);
  return `${days}d ${hrs}h ${mins}m`;
}

export default function AdminSystemHealthPage() {
  const [data, setData] = useState<{ rawMetrics: string } | null>(null);
  const [queues, setQueues] = useState<any[]>([]);
  const [deadletters, setDeadletters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryLoader, setRetryLoader] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const [metricsRes, queuesRes] = await Promise.all([
        adminApi.getSystemMetrics(),
        adminApi.getSystemQueues(),
      ]);
      setData(metricsRes.data);
      setQueues(queuesRes.data.queues || []);
      setDeadletters(queuesRes.data.deadletters || []);
    } catch (err) {
      console.error('Error fetching system health', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      setRetryLoader(jobId);
      await adminApi.retryDeadletterJob(jobId);
      await fetchSystemData(); // Reload queues state
    } catch (err) {
      console.error('Failed to retry job', err);
      alert("Erreur lors de la relance du job");
    } finally {
      setRetryLoader(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#fff', animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  // Parse very basic raw metrics for easy display
  const metricsText = data?.rawMetrics || '';
  const lines = metricsText.split('\n');
  const getMetric = (matchStr: string) => {
    const line = lines.find(l => l.startsWith(matchStr));
    return line ? line.split(' ')[1] : '0';
  };

  const dbDuration = getMetric('kollect_db_query_duration_seconds_sum');
  const cacheHit = getMetric('kollect_cache_hit_rate');

  return (
    <div style={{ padding: '30px', color: '#fff', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>Santé du Système & Infrastructure</h1>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)' }}>Supervisez l'état des Workers Redis, BullMQ et des API.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: 40 }}>
        {/* Basic Gauges parsed from raw metrics */}
        <div style={{ background: '#111113', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textTransform: 'uppercase', marginBottom: 10 }}>PDB Query Time (Sum)</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{dbDuration ? Number(dbDuration).toFixed(3) : '0.00'}s</div>
        </div>
        <div style={{ background: '#111113', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textTransform: 'uppercase', marginBottom: 10 }}>Cache Hit Rate</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{cacheHit ? (Number(cacheHit) * 100).toFixed(1) : '---'}%</div>
        </div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Queues BullMQ (Workers)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 40 }}>
        {queues.map(q => (
          <div key={q.name} style={{ background: '#111113', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <strong style={{ fontSize: 15 }}>{q.name}</strong>
            </div>
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Actifs</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: q.active > 0 ? '#34C759' : '#fff' }}>{q.active}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>En attente</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{q.waiting}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Complétés</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{q.completed}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Échoués</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: q.failed > 0 ? '#FF3B30' : '#fff' }}>{q.failed}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Deadletter Queue (Jobs en échec)</h2>
      {deadletters.length === 0 ? (
        <div style={{ padding: 30, background: '#111113', borderRadius: 12, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
           ✓ Aucun job mort. Les workers sont en pleine santé.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {deadletters.map(job => (
            <div key={job.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, background: 'rgba(255, 59, 48, 0.05)', border: '1px solid rgba(255, 59, 48, 0.2)', borderRadius: 12 }}>
              <div>
                <strong style={{ display: 'block', marginBottom: 6, color: '#FF3B30' }}>Job ID: {job.id} ({job.name})</strong>
                <code style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: 4, fontFamily: 'monospace' }}>
                  {job.error}
                </code>
              </div>
              <button 
                onClick={() => handleRetryJob(job.id)}
                disabled={retryLoader === job.id}
                style={{
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  opacity: retryLoader === job.id ? 0.7 : 1
                }}
              >
                {retryLoader === job.id ? 'Relance...' : 'Relancer Job'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
