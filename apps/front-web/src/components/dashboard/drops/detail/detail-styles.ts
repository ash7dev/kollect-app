export const DETAIL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  /* ── Layout ── */
  .cd-layout {
    min-height: 100vh;
    display: grid;
    background: linear-gradient(180deg, #F5F6F8 0%, #ECEEF1 100%);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    transition: grid-template-columns 0.22s cubic-bezier(0.4,0,0.2,1);
  }
  .cd-main {
    padding: 22px 28px 60px;
    min-width: 0;
  }

  /* ── TopBar ── */
  .cd-topbar {
    position: sticky; top: 0; z-index: 50;
    display: flex; align-items: center; gap: 12px;
    padding: 10px 16px; margin-bottom: 24px;
    background: rgba(255,255,255,0.84);
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.95);
    border-radius: 18px;
    box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 6px 30px rgba(0,0,0,0.06),
                inset 0 1px 0 rgba(255,255,255,0.9);
  }
  .cd-topbar-title {
    flex: 1; min-width: 0;
    font-size: 15px; font-weight: 800; color: #0A0A0A; letter-spacing: -0.3px;
    overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  }
  .cd-topbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  /* ── Hero ── */
  .cd-hero {
    position: relative;
    width: 100%; height: 360px;
    border-radius: 20px; overflow: hidden;
    background: #0A0A0A; margin-bottom: 16px;
  }
  .cd-hero-media {
    width: 100%; height: 100%; object-fit: cover;
  }
  .cd-hero-empty {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 50%, #0f0f0f 100%);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 10px;
  }
  .cd-hero-scrim {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 55%);
  }
  .cd-hero-badges {
    position: absolute; top: 14px; left: 14px; right: 14px;
    display: flex; justify-content: space-between; align-items: flex-start;
  }
  .cd-hero-footer {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 20px 24px;
  }
  .cd-hero-name {
    font-size: 26px; font-weight: 900; color: #fff;
    letter-spacing: -0.7px; line-height: 1.15;
    text-shadow: 0 2px 8px rgba(0,0,0,0.4);
    margin: 0 0 6px;
  }
  .cd-hero-desc {
    font-size: 13px; color: rgba(255,255,255,0.6);
    line-height: 1.5; margin: 0;
    overflow: hidden; display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }

  /* ── Status pill ── */
  .cd-status-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: 99px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.2px;
    backdrop-filter: blur(8px);
  }

  /* ── Featured badge ── */
  .cd-featured-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 9px;
    background: rgba(255,59,48,0.9); backdrop-filter: blur(8px);
    border: 1px solid rgba(255,59,48,0.3);
    font-size: 10px; font-weight: 800; color: #fff; letter-spacing: 0.3px;
  }

  /* ── Meta row ── */
  .cd-meta-row {
    display: flex; gap: 10px; flex-wrap: wrap;
    margin-bottom: 32px;
  }
  .cd-meta-chip {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 14px; border-radius: 13px;
    background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.07);
    font-size: 12.5px; font-weight: 600; color: rgba(0,0,0,0.65);
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }

  /* ── Section header ── */
  .cd-section-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 18px;
  }
  .cd-section-label {
    font-size: 16px; font-weight: 800; color: #0A0A0A; letter-spacing: -0.3px;
  }
  .cd-section-count {
    font-size: 11.5px; font-weight: 700;
    padding: 3px 9px; border-radius: 99px;
    background: rgba(0,0,0,0.06); color: rgba(0,0,0,0.4);
  }

  /* ── Products grid ── */
  .cd-products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 16px;
  }

  /* ── Product card ── */
  .cd-product-card {
    background: #fff;
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 16px; overflow: hidden;
    display: flex; flex-direction: column;
    height: 100%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s;
  }
  .cd-product-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
  .cd-product-img-wrap {
    background: #0D0D0D;
    aspect-ratio: 3/4; position: relative; overflow: hidden;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .cd-product-img {
    width: 100%; height: 100%; object-fit: contain;
  }
  .cd-product-body {
    padding: 12px 14px 14px;
    display: flex; flex-direction: column; flex: 1;
  }
  /* Fixed 1-line name — price stays at same level across all cards */
  .cd-product-name {
    font-size: 13px; font-weight: 700; color: #111; letter-spacing: -0.2px;
    height: 18px; line-height: 18px;
    margin: 0 0 6px;
    overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  }
  .cd-product-price {
    font-size: 15px; font-weight: 800; color: #FF3B30;
    letter-spacing: -0.3px; margin: 0 0 10px;
    height: 20px; line-height: 20px;
  }
  .cd-product-footer {
    display: flex; align-items: center; gap: 5px;
    flex-wrap: nowrap; overflow: hidden;
    margin-top: auto;
  }
  .cd-stock-pill {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 8px; border-radius: 6px;
    font-size: 10.5px; font-weight: 700;
  }
  .cd-size-pill {
    display: inline-flex; padding: 2px 7px; border-radius: 5px;
    font-size: 10px; font-weight: 700;
    background: rgba(0,0,0,0.05); color: rgba(0,0,0,0.45);
  }

  /* ── Empty state ── */
  .cd-empty {
    grid-column: 1/-1;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 64px 24px; text-align: center; gap: 8px;
  }
  .cd-empty-icon {
    width: 64px; height: 64px; border-radius: 18px; margin-bottom: 8px;
    background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.07);
    display: flex; align-items: center; justify-content: center;
  }
  .cd-empty-title { font-size: 15px; font-weight: 700; color: rgba(0,0,0,0.45); margin: 0; }
  .cd-empty-sub { font-size: 12.5px; color: rgba(0,0,0,0.3); line-height: 1.55; max-width: 260px; margin: 0; }

  /* ── Skeleton ── */
  @keyframes cd-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  .cd-shimmer {
    background: linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.08) 37%, rgba(0,0,0,0.05) 63%);
    background-size: 800px 100%;
    animation: cd-shimmer 1.4s infinite;
    border-radius: 8px;
  }

  /* ── Buttons ── */
  .cd-btn-back {
    display: inline-flex; align-items: center; gap: 6px;
    height: 32px; padding: 0 12px;
    border: 1px solid rgba(0,0,0,0.1); border-radius: 9px;
    background: rgba(0,0,0,0.03); color: rgba(0,0,0,0.55);
    font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit;
    flex-shrink: 0; transition: background 0.15s;
  }
  .cd-btn-back:hover { background: rgba(0,0,0,0.07); }

  .cd-btn-primary {
    display: inline-flex; align-items: center; gap: 7px;
    height: 36px; padding: 0 16px; border: none; border-radius: 11px;
    background: linear-gradient(135deg, #FF3B30 0%, #E0321F 100%);
    color: #fff; font-size: 13px; font-weight: 700; cursor: pointer;
    box-shadow: 0 4px 16px rgba(255,59,48,0.3); font-family: inherit;
    transition: transform 0.12s, box-shadow 0.15s; flex-shrink: 0;
  }
  .cd-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(255,59,48,0.35); }
  .cd-btn-primary:active { transform: scale(0.98); }
  .cd-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .cd-btn-ghost {
    display: inline-flex; align-items: center; gap: 7px;
    height: 36px; padding: 0 14px;
    border: 1px solid rgba(0,0,0,0.1); border-radius: 11px;
    background: rgba(255,255,255,0.8); color: rgba(0,0,0,0.65);
    font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
    transition: background 0.15s; flex-shrink: 0;
  }
  .cd-btn-ghost:hover { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

  @keyframes cd-spin { to { transform: rotate(360deg); } }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .cd-layout { grid-template-columns: 1fr !important; }
    .cd-main   { padding: 12px 14px 40px; }
    .cd-hero   { height: 220px; margin-bottom: 12px; }
    .cd-hero-name { font-size: 20px; }
    .cd-meta-row  { gap: 8px; margin-bottom: 20px; }
    .cd-meta-chip { padding: 7px 11px; font-size: 12px; }
    .cd-products-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  }
  @media (max-width: 400px) {
    .cd-products-grid { grid-template-columns: 1fr; }
  }
`;
