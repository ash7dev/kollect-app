'use client';

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      <style>{`
        @keyframes explorerSk {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .explorer-sk { animation: explorerSk 1.4s ease-in-out infinite; }
      `}</style>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 20,
      }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              className="explorer-sk"
              style={{
                aspectRatio: '3/4',
                borderRadius: 16,
                backgroundColor: 'rgba(0,0,0,0.06)',
                animationDelay: `${i * 0.07}s`,
              }}
            />
            <div className="explorer-sk" style={{ height: 14, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.05)', width: '70%', animationDelay: `${i * 0.07 + 0.1}s` }} />
            <div className="explorer-sk" style={{ height: 12, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.04)', width: '40%', animationDelay: `${i * 0.07 + 0.2}s` }} />
          </div>
        ))}
      </div>
    </>
  );
}
