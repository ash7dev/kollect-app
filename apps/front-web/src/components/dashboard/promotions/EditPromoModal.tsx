'use client';

import { DropIcon } from '@/components/dashboard/drops/drop-shared';
import { Promotion } from '@/types/api';

const PROMO_ICONS = {
  tag: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
};

type Props = {
  promotion: Promotion;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Promotion>) => void;
  isSaving: boolean;
};

export function EditPromoModal({ promotion, isOpen, onClose, onSave, isSaving }: Props) {
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; z-index: 999; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
          animation: modal-fade 0.2s ease-out;
        }
        @keyframes modal-fade { from { opacity: 0; } to { opacity: 1; } }
        .modal-card {
          width: 100%; max-width: 560px; background: #fff; border-radius: 28px; padding: 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.25);
          animation: modal-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modal-up { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .create-input:focus { border-color: #FF3B30 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(255,59,48,0.1) !important; }
        .promo-btn-primary {
          display: inline-flex; align-items: center; gap: 7px; padding: 10px 20px; border-radius: 11px;
          background: #E63329; color: #fff; border: none; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s;
          box-shadow: 0 4px 16px rgba(230,51,41,0.25);
          font-family: inherit;
        }
        .promo-btn-primary:hover {
          transform: translateY(-1px);
          background: #CC2920;
          box-shadow: 0 6px 20px rgba(230,51,41,0.35);
        }
      `}</style>

      <div className="modal-overlay">
        <div className="modal-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'linear-gradient(135deg, #FF3B30 0%, #E0321F 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(255,59,48,0.3)'
            }}>
              <DropIcon d={PROMO_ICONS.tag} size={22} stroke="#fff" sw={2} />
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111', marginBottom: 2, letterSpacing: '-0.4px' }}>Modifier la promotion</h2>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0, fontWeight: 500 }}>
                {promotion.isAutoApplied ? 'Automatique' : 'Code promo'} · {promotion.discountType === 'PERCENTAGE' ? 'Pourcentage' : 'Montant fixe'}
              </p>
            </div>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data = {
              description: fd.get('description') as string,
              discountValue: Number(fd.get('discountValue')),
              isActive: fd.get('isActive') === 'true',
            };
            onSave(promotion.id, data);
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Discount Value */}
              <div>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 800,
                  color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px',
                  marginBottom: 8
                }}>
                  Valeur de la remise
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="discountValue"
                    type="number"
                    defaultValue={promotion.discountValue}
                    style={{
                      width: '100%', height: 48, borderRadius: 12,
                      border: '1.5px solid #EBEBEB', padding: '0 16px',
                      fontSize: 15, fontWeight: 700, background: '#FAFAFA',
                      outline: 'none', transition: 'all 0.15s'
                    }}
                    className="create-input"
                    min={1}
                    max={promotion.discountType === 'PERCENTAGE' ? 100 : undefined}
                  />
                  <span style={{
                    position: 'absolute', right: 16, top: '50%',
                    transform: 'translateY(-50%)', fontSize: 13,
                    fontWeight: 800, color: '#9CA3AF', pointerEvents: 'none'
                  }}>
                    {promotion.discountType === 'PERCENTAGE' ? '%' : 'CFA'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 800,
                  color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px',
                  marginBottom: 8
                }}>
                  Description interne
                </label>
                <textarea
                  name="description"
                  defaultValue={promotion.description || ''}
                  placeholder="Notes internes..."
                  style={{
                    width: '100%', minHeight: 90, borderRadius: 12,
                    border: '1.5px solid #EBEBEB', padding: '12px 16px',
                    fontSize: 14, fontWeight: 500, background: '#FAFAFA',
                    outline: 'none', transition: 'all 0.15s', resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  className="create-input"
                  maxLength={300}
                />
              </div>

              {/* Active Toggle */}
              <div style={{
                padding: '14px 16px', borderRadius: 12,
                background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                border: '1.5px solid #EBEBEB'
              }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#111'
                }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    defaultChecked={promotion.isActive}
                    value="true"
                    style={{ width: 20, height: 20, cursor: 'pointer', accentColor: '#FF3B30' }}
                  />
                  <span>Promotion active</span>
                </label>
                <p style={{ fontSize: 12, color: '#6B7280', margin: '6px 0 0 32', fontWeight: 400 }}>
                  {promotion.isActive
                    ? 'Les clients peuvent utiliser cette promotion'
                    : 'La promotion est masquée mais peut être réactivée'}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  style={{
                    width: 'auto', height: 48, fontWeight: 700,
                    borderRadius: 12, border: '1.5px solid #EBEBEB',
                    background: '#fff', color: '#111', cursor: 'pointer',
                    fontSize: 14, transition: 'all 0.15s'
                  }}
                  onClick={onClose}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="promo-btn-primary"
                  style={{ height: 48, boxShadow: '0 4px 16px rgba(230,51,41,0.25)' }}
                  disabled={isSaving}
                >
                  {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
