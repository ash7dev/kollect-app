export function DarkPageLoader() {
  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <style>{`
        @keyframes kl-spin { to { transform: rotate(360deg); } }
        @keyframes kl-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        {/* Spinner */}
        <div style={{
          position: 'relative',
          width: 48,
          height: 48,
        }}>
          {/* Track */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.08)',
          }} />
          {/* Arc */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#FF3B30',
            animation: 'kl-spin 0.75s linear infinite',
          }} />
        </div>

        {/* Wordmark */}
        <p style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.2)',
          animation: 'kl-pulse 1.8s ease-in-out infinite',
        }}>
          Kollect
        </p>
      </div>
    </div>
  );
}
