// Shared CSS string for the DropsWizardModal
export const WIZARD_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; }

/* ── Backdrop & Modal ── */
.wz-backdrop {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(10,10,15,0.55);
  backdrop-filter: blur(10px) saturate(160%);
  -webkit-backdrop-filter: blur(10px) saturate(160%);
  display: flex; align-items: flex-end; justify-content: center;
  animation: wz-fade-in 0.2s ease;
}
.wz-modal {
  width: min(1040px, 100%);
  height: 92vh;
  background: #FAFAFA;
  border-radius: 24px 24px 0 0;
  border: 1px solid rgba(255,255,255,0.95);
  border-bottom: none;
  box-shadow: 0 -12px 60px rgba(0,0,0,0.25), 0 -2px 12px rgba(0,0,0,0.1);
  display: flex; flex-direction: column;
  overflow: hidden;
  animation: wz-slide-up 0.32s cubic-bezier(0.16,1,0.3,1);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
@keyframes wz-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes wz-slide-up { from { transform: translateY(60px); opacity: 0.6; } to { transform: translateY(0); opacity: 1; } }

/* ── Modal header ── */
.wz-header {
  padding: 18px 24px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.07);
  background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,250,0.95) 100%);
  display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-shrink: 0;
}
.wz-title { font-size: 19px; font-weight: 900; color: #0A0A0A; letter-spacing: -0.5px; margin: 0; }
.wz-subtitle { font-size: 12px; color: rgba(0,0,0,0.4); font-weight: 500; margin: 3px 0 0; }
.wz-close {
  width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1);
  background: rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s, transform 0.12s; flex-shrink: 0;
}
.wz-close:hover { background: rgba(0,0,0,0.09); transform: scale(1.05); }


/* ── Body / scroll ── */
.wz-body { flex: 1; overflow-y: auto; padding: 24px; scroll-behavior: smooth; }
.wz-body::-webkit-scrollbar { width: 4px; }
.wz-body::-webkit-scrollbar-track { background: transparent; }
.wz-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }

/* ── Section heading ── */
.wz-section-title { font-size: 14px; font-weight: 800; color: #111; letter-spacing: -0.3px; margin: 0 0 4px; }
.wz-section-sub { font-size: 12.5px; color: rgba(0,0,0,0.45); margin: 0 0 20px; }

/* ── Field ── */
.wz-field { margin-bottom: 20px; }
.wz-label {
  display: block; font-size: 12px; font-weight: 700;
  color: rgba(0,0,0,0.6); letter-spacing: 0.1px; margin-bottom: 7px;
}
.wz-label span { color: #FF3B30; margin-left: 2px; }
.wz-input, .wz-textarea, .wz-select {
  width: 100%; border: 1.5px solid rgba(0,0,0,0.1); border-radius: 12px;
  padding: 11px 13px; font-size: 14px; font-family: inherit; color: #111;
  background: #fff; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
}
.wz-input:focus, .wz-textarea:focus, .wz-select:focus {
  border-color: rgba(255,59,48,0.4);
  box-shadow: 0 0 0 3px rgba(255,59,48,0.08);
}
.wz-textarea { min-height: 100px; resize: vertical; line-height: 1.6; }
.wz-hint { font-size: 11px; color: rgba(0,0,0,0.38); margin-top: 5px; font-weight: 500; }
.wz-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 700px) { .wz-grid-2 { grid-template-columns: 1fr; } }

/* ── Pills (sizes / colors) ── */
.wz-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.wz-pill {
  padding: 7px 14px; border-radius: 99px; border: 1.5px solid rgba(0,0,0,0.1);
  background: #fff; font-size: 13px; font-weight: 600; cursor: pointer; color: rgba(0,0,0,0.6);
  transition: border-color 0.15s, background 0.15s, color 0.15s, box-shadow 0.15s;
}
.wz-pill.sel {
  background: rgba(255,59,48,0.08); border-color: rgba(255,59,48,0.4); color: #FF3B30;
  box-shadow: 0 2px 8px rgba(255,59,48,0.12);
}
.wz-color-swatch {
  width: 34px; height: 34px; border-radius: 50%; cursor: pointer;
  border: 2px solid transparent; position: relative; flex-shrink: 0;
  transition: transform 0.15s, box-shadow 0.15s;
}
.wz-color-swatch.sel {
  border-color: #FF3B30;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
  transform: scale(1.12);
}

/* ── Upload zone ── */
.wz-upload-zone {
  border: 2px dashed rgba(0,0,0,0.15); border-radius: 16px;
  padding: 36px 20px; text-align: center; cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: rgba(0,0,0,0.015);
}
.wz-upload-zone:hover, .wz-upload-zone.drag { border-color: #FF3B30; background: rgba(255,59,48,0.03); }
.wz-upload-zone-icon {
  width: 52px; height: 52px; border-radius: 16px;
  background: rgba(0,0,0,0.05); margin: 0 auto 14px;
  display: flex; align-items: center; justify-content: center;
}

/* ── Image grid ── */
.wz-img-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
.wz-img-thumb {
  width: 88px; height: 88px; border-radius: 12px;
  position: relative; overflow: hidden; border: 1px solid rgba(0,0,0,0.08);
  background: #f0f0f0; flex-shrink: 0;
}
.wz-img-thumb img { width: 100%; height: 100%; object-fit: cover; }
.wz-img-remove {
  position: absolute; top: 4px; right: 4px;
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(0,0,0,0.65); border: 1.5px solid rgba(255,255,255,0.9);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #fff; transition: background 0.15s;
}
.wz-img-remove:hover { background: #FF3B30; }
.wz-img-main-badge {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 3px 0; text-align: center; font-size: 9px; font-weight: 800;
  color: #fff; background: rgba(16,185,129,0.92); letter-spacing: 0.5px;
}
.wz-add-img {
  width: 88px; height: 88px; border-radius: 12px;
  border: 2px dashed rgba(0,0,0,0.15); background: rgba(0,0,0,0.02);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; cursor: pointer; color: rgba(0,0,0,0.35);
  transition: border-color 0.15s, background 0.15s; flex-shrink: 0;
}
.wz-add-img:hover { border-color: #FF3B30; background: rgba(255,59,48,0.03); color: #FF3B30; }
.prod-img-wrap:hover .prod-img-set-main { opacity: 1 !important; }
.wz-add-img-label { font-size: 10px; font-weight: 700; }

/* ── Product card ── */
.wz-product-card {
  background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 16px;
  padding: 16px; margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s;
}
.wz-product-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.08); }

/* ── Toggle (media type) ── */
.wz-toggle-group { display: flex; background: rgba(0,0,0,0.04); border-radius: 11px; padding: 3px; gap: 2px; }
.wz-toggle-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 9px 16px; border: none; border-radius: 8px; cursor: pointer;
  font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.45); font-family: inherit;
  background: transparent; transition: background 0.15s, color 0.15s, box-shadow 0.15s;
}
.wz-toggle-btn.active {
  background: #fff; color: #111; font-weight: 700;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.06);
}

/* ── Calendar ── */
.wz-cal-wrap { display: flex; gap: 14px; flex-wrap: wrap; }
.wz-cal {
  background: #fff; border: 1px solid rgba(0,0,0,0.09); border-radius: 16px;
  padding: 16px; width: 280px; flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}
.wz-cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.wz-cal-month { font-size: 14px; font-weight: 800; color: #111; letter-spacing: -0.3px; }
.wz-cal-nav {
  width: 30px; height: 30px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1);
  background: rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s;
}
.wz-cal-nav:hover { background: rgba(0,0,0,0.08); }
.wz-cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; }
.wz-cal-day-label { font-size: 10px; font-weight: 700; color: rgba(0,0,0,0.3); padding: 4px 0 8px; letter-spacing: 0.2px; }
.wz-cal-day {
  aspect-ratio: 1; border-radius: 50%; border: none; background: transparent;
  font-size: 12.5px; font-weight: 600; color: rgba(0,0,0,0.65); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.wz-cal-day:hover:not(:disabled) { background: rgba(255,59,48,0.08); color: #FF3B30; }
.wz-cal-day.today { color: #FF3B30; font-weight: 800; }
.wz-cal-day.sel { background: #FF3B30; color: #fff; box-shadow: 0 3px 10px rgba(255,59,48,0.32); }
.wz-cal-day:disabled { color: rgba(0,0,0,0.18); cursor: default; }
.wz-cal-day.other-month { color: rgba(0,0,0,0.2); }

.wz-time-wrap {
  background: #fff; border: 1px solid rgba(0,0,0,0.09); border-radius: 16px;
  padding: 16px; flex: 1; min-width: 140px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}
.wz-time-label { font-size: 11px; font-weight: 700; color: rgba(0,0,0,0.4); margin-bottom: 12px; letter-spacing: 0.3px; }
.wz-time-row { display: flex; align-items: center; gap: 6px; }
.wz-time-input {
  width: 60px; text-align: center; border: 1.5px solid rgba(0,0,0,0.1);
  border-radius: 10px; padding: 10px 8px; font-size: 24px; font-weight: 800;
  color: #111; background: rgba(0,0,0,0.02); outline: none; font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.wz-time-input:focus { border-color: rgba(255,59,48,0.4); box-shadow: 0 0 0 3px rgba(255,59,48,0.08); }
.wz-time-sep { font-size: 22px; font-weight: 900; color: rgba(0,0,0,0.3); }

/* ── Summary ── */
.wz-summary-card {
  background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 20px;
  overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07);
}
.wz-summary-cover {
  width: 100%; height: 200px; object-fit: cover; display: block;
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
}
.wz-summary-body { padding: 20px; }
.wz-summary-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.06); }
.wz-summary-row:last-child { border-bottom: none; }
.wz-summary-icon { width: 32px; height: 32px; border-radius: 9px; background: rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
.wz-summary-key { font-size: 11px; font-weight: 700; color: rgba(0,0,0,0.35); letter-spacing: 0.2px; margin-bottom: 3px; }
.wz-summary-val { font-size: 14px; font-weight: 700; color: #111; letter-spacing: -0.2px; }
.wz-product-mini { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.wz-product-mini-img { width: 44px; height: 44px; border-radius: 10px; overflow: hidden; background: #f0f0f0; flex-shrink: 0; }
.wz-product-mini-img img { width: 100%; height: 100%; object-fit: cover; }

/* ── Footer / actions ── */
.wz-footer {
  padding: 16px 24px; border-top: 1px solid rgba(0,0,0,0.07);
  background: rgba(255,255,255,0.95); display: flex; align-items: center;
  justify-content: space-between; gap: 12px; flex-shrink: 0;
}
.wz-btn-back {
  display: inline-flex; align-items: center; gap: 7px;
  height: 42px; padding: 0 18px; border: 1.5px solid rgba(0,0,0,0.12);
  border-radius: 12px; background: transparent; color: rgba(0,0,0,0.6);
  font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: background 0.15s, border-color 0.15s;
}
.wz-btn-back:hover { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.18); }
.wz-btn-next {
  display: inline-flex; align-items: center; gap: 8px;
  height: 42px; padding: 0 24px; border: none; border-radius: 12px;
  background: linear-gradient(135deg, #111 0%, #1a1a1a 100%);
  color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 16px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08);
  transition: transform 0.12s, box-shadow 0.15s;
}
.wz-btn-next:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08); }
.wz-btn-next:active { transform: scale(0.98); }
.wz-btn-launch {
  display: inline-flex; align-items: center; gap: 8px;
  height: 42px; padding: 0 28px; border: none; border-radius: 12px;
  background: linear-gradient(135deg, #FF3B30 0%, #D93025 100%);
  color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
  box-shadow: 0 6px 24px rgba(255,59,48,0.32), inset 0 1px 0 rgba(255,255,255,0.15);
  transition: transform 0.12s, box-shadow 0.15s;
}
.wz-btn-launch:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(255,59,48,0.4); }
.wz-btn-launch:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
.wz-error-box {
  margin-top: 0; padding: 12px 14px; border-radius: 12px;
  background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2);
  color: rgba(0,0,0,0.75); font-size: 12.5px; line-height: 1.6;
}
.wz-info-box {
  padding: 12px 14px; border-radius: 12px;
  background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.18);
  color: rgba(0,0,0,0.65); font-size: 12.5px; line-height: 1.6;
  display: flex; gap: 10px; align-items: flex-start; margin-bottom: 20px;
}
.wz-media-preview {
  width: 100%; aspect-ratio: 16/9; border-radius: 16px; overflow: hidden;
  position: relative; background: #0A0A0A;
}
.wz-media-preview img {
  width: 100%; height: 100%; object-fit: cover;
}
.wz-media-preview video {
  width: 100%; height: 100%; object-fit: contain;
}
.wz-media-change {
  position: absolute; bottom: 12px; right: 12px;
  padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer;
  background: rgba(0,0,0,0.65); backdrop-filter: blur(8px);
  color: #fff; font-size: 12px; font-weight: 700; font-family: inherit;
  transition: background 0.15s;
}
.wz-media-change:hover { background: rgba(0,0,0,0.82); }
`;

export const COLORS = [
  { value: '#000000', name: 'Noir' },      { value: '#FFFFFF', name: 'Blanc' },
  { value: '#1a1a2e', name: 'Marine' },    { value: '#FF3B30', name: 'Rouge' },
  { value: '#FF6B00', name: 'Orange' },    { value: '#FFCC00', name: 'Jaune' },
  { value: '#34C759', name: 'Vert' },      { value: '#007AFF', name: 'Bleu' },
  { value: '#5856D6', name: 'Violet' },    { value: '#FF2D55', name: 'Rose' },
  { value: '#8B4513', name: 'Marron' },    { value: '#C0C0C0', name: 'Argent' },
  { value: '#FFD700', name: 'Or' },        { value: '#708090', name: 'Gris' },
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'UNIQUE'];

export function genSKU(name: string) {
  const prefix = name.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, 'X') || 'PROD';
  return `${prefix}-${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 900)}`;
}
