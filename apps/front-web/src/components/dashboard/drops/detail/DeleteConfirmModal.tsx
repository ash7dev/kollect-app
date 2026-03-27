'use client';

const F = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

type Props = {
  collectionName: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmModal({ collectionName, isPending, onConfirm, onCancel }: Props) {
  return (
    /* Overlay */
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#fff', borderRadius: 20,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        fontFamily: F,
        animation: 'cd-modal-in 0.18s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Top danger band */}
        <div style={{
          height: 4,
          background: 'linear-gradient(90deg, #FF3B30, #E0321F)',
        }} />

        <div style={{ padding: '24px 24px 20px' }}>
          {/* Icon */}
          <div style={{
            width: 48, height: 48, borderRadius: 14, marginBottom: 16,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
              stroke="#EF4444" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </div>

          {/* Title */}
          <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.3px' }}>
            Supprimer cette collection ?
          </h3>

          {/* Body */}
          <p style={{ margin: '0 0 6px', fontSize: 13.5, color: 'rgba(0,0,0,0.55)', lineHeight: 1.6 }}>
            Tu es sur le point de supprimer{' '}
            <strong style={{ color: '#0A0A0A', fontWeight: 700 }}>&quot;{collectionName}&quot;</strong>.
          </p>
          <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(0,0,0,0.38)', lineHeight: 1.55 }}>
            Cette action est <strong style={{ color: '#EF4444' }}>irréversible</strong> — tous les produits associés seront également supprimés.
          </p>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', gap: 10, padding: '0 24px 24px',
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            style={{
              flex: 1, height: 42, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12,
              background: 'rgba(0,0,0,0.03)', color: 'rgba(0,0,0,0.6)',
              fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: F,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            style={{
              flex: 1, height: 42, border: 'none', borderRadius: 12,
              background: isPending ? 'rgba(0,0,0,0.08)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
              color: isPending ? 'rgba(0,0,0,0.3)' : '#fff',
              fontSize: 13.5, fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer',
              fontFamily: F,
              boxShadow: isPending ? 'none' : '0 4px 14px rgba(239,68,68,0.3)',
              transition: 'transform 0.12s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { if (!isPending) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            {isPending ? 'Suppression…' : 'Supprimer définitivement'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cd-modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}
