/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionStatus } from '@prisma/client';

type PageData = {
  title: string;
  description: string;
  imageUrl?: string | null;
  deepLink: string;
  ctaLabel: string;
  subtitle?: string;
  badge?: string;
};

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderSharePage(res: Response, reqUrl: string, data: PageData) {
  const title = escapeHtml(data.title);
  const description = escapeHtml(data.description);
  const subtitle = data.subtitle ? escapeHtml(data.subtitle) : '';
  const imageUrl = data.imageUrl ?? '';
  const deepLink = escapeHtml(data.deepLink);
  const ctaLabel = escapeHtml(data.ctaLabel);
  const canonicalUrl = escapeHtml(reqUrl);
  const badge = data.badge ? escapeHtml(data.badge) : '';

  const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} — Kollect</title>

    <meta name="description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    ${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    ${imageUrl ? `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />` : ''}
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👕</text></svg>" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :root {
        --red: #FF3B30;
        --red-glow: rgba(255, 59, 48, 0.35);
        --red-dim: rgba(255, 59, 48, 0.12);
        --bg: #000000;
        --surface: #0D0D0D;
        --surface-2: #161616;
        --border: rgba(255,255,255,0.08);
        --border-hover: rgba(255,255,255,0.14);
        --text-primary: #FFFFFF;
        --text-secondary: #888888;
        --text-muted: #444444;
        --font-display: 'Syne', sans-serif;
        --font-body: 'DM Sans', sans-serif;
        --radius: 20px;
        --radius-sm: 12px;
        --radius-xs: 8px;
      }

      html { color-scheme: dark; }

      body {
        font-family: var(--font-body);
        background: var(--bg);
        color: var(--text-primary);
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
      }

      /* ── NOISE TEXTURE OVERLAY ── */
      body::before {
        content: '';
        position: fixed;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
        pointer-events: none;
        z-index: 0;
      }

      /* ── AMBIENT GLOW BEHIND THE CARD ── */
      .glow-bg {
        position: fixed;
        top: -20%;
        left: 50%;
        transform: translateX(-50%);
        width: 600px;
        height: 600px;
        background: radial-gradient(ellipse at center, rgba(255,59,48,0.08) 0%, transparent 70%);
        pointer-events: none;
        z-index: 0;
      }

      /* ── LAYOUT ── */
      .page {
        position: relative;
        z-index: 1;
        flex: 1;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr auto;
        /* Desktop: side-by-side */
      }

      @media (min-width: 860px) {
        .page {
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr;
          min-height: 100dvh;
        }
      }

      /* ── IMAGE PANEL ── */
      .panel-image {
        position: relative;
        overflow: hidden;
        background: var(--surface);
        /* Mobile: fixed aspect ratio */
        aspect-ratio: 16 / 9;
      }

      @media (min-width: 860px) {
        .panel-image {
          aspect-ratio: unset;
          position: sticky;
          top: 0;
          height: 100dvh;
        }
      }

      .panel-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }

      .panel-image:hover img {
        transform: scale(1.03);
      }

      /* gradient overlay on image */
      .panel-image::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to bottom,
          transparent 40%,
          rgba(0,0,0,0.7) 100%
        );
      }

      @media (min-width: 860px) {
        .panel-image::after {
          background: linear-gradient(
            to right,
            transparent 60%,
            var(--bg) 100%
          );
        }
      }

      .panel-image-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--surface-2);
      }

      .panel-image-empty svg {
        opacity: 0.12;
        width: 80px;
        height: 80px;
      }

      /* ── CONTENT PANEL ── */
      .panel-content {
        display: flex;
        flex-direction: column;
        padding: 28px 20px 40px;
        gap: 0;
      }

      @media (min-width: 860px) {
        .panel-content {
          padding: 56px 48px 56px 40px;
          justify-content: center;
          min-height: 100dvh;
        }
      }

      @media (min-width: 1100px) {
        .panel-content {
          padding: 72px 64px 72px 56px;
        }
      }

      /* ── BRAND LOGO ── */
      .brand-mark {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 36px;
        text-decoration: none;
      }

      .brand-mark-icon {
        width: 28px;
        height: 28px;
        background: var(--red);
        border-radius: 7px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        line-height: 1;
        flex-shrink: 0;
      }

      .brand-mark-name {
        font-family: var(--font-display);
        font-weight: 800;
        font-size: 15px;
        letter-spacing: 0.04em;
        color: var(--text-secondary);
        text-transform: uppercase;
      }

      /* ── BADGE ── */
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 11px;
        border-radius: 999px;
        background: var(--red-dim);
        border: 1px solid rgba(255,59,48,0.25);
        color: var(--red);
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 16px;
        width: fit-content;
        animation: badge-pulse 3s ease-in-out infinite;
      }

      .badge::before {
        content: '';
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--red);
        flex-shrink: 0;
      }

      @keyframes badge-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      /* ── TITLE ── */
      .title {
        font-family: var(--font-display);
        font-size: clamp(26px, 5vw, 42px);
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: -0.02em;
        color: var(--text-primary);
        margin-bottom: 10px;
        /* Text reveal animation */
        animation: slide-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      /* ── SUBTITLE ── */
      .subtitle {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-secondary);
        letter-spacing: 0.01em;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        animation: slide-up 0.5s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .subtitle-dot {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: var(--text-muted);
        flex-shrink: 0;
      }

      /* ── DIVIDER ── */
      .divider {
        height: 1px;
        background: var(--border);
        margin-bottom: 20px;
        animation: slide-up 0.5s 0.12s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      /* ── DESCRIPTION ── */
      .desc {
        font-size: 14px;
        line-height: 1.65;
        color: var(--text-secondary);
        white-space: pre-line;
        margin-bottom: 28px;
        animation: slide-up 0.5s 0.16s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      /* ── CTA BUTTON ── */
      .cta-wrap {
        animation: slide-up 0.5s 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .cta {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        padding: 16px 20px;
        border-radius: var(--radius-sm);
        background: var(--red);
        color: #FFFFFF;
        text-decoration: none;
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 15px;
        letter-spacing: 0.01em;
        box-shadow: 0 0 0 0 var(--red-glow);
        transition:
          transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
          box-shadow 0.3s ease,
          background 0.2s ease;
        position: relative;
        overflow: hidden;
      }

      .cta::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%);
        pointer-events: none;
      }

      .cta:hover {
        transform: translateY(-2px) scale(1.01);
        box-shadow: 0 8px 32px var(--red-glow);
      }

      .cta:active {
        transform: translateY(0) scale(0.99);
      }

      .cta-icon {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .cta:hover .cta-icon {
        transform: translateX(3px);
      }

      /* ── SECONDARY ACTION (web browser) ── */
      .alt-action {
        margin-top: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 13px 20px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border);
        background: transparent;
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 13px;
        font-weight: 500;
        transition:
          border-color 0.2s,
          color 0.2s,
          background 0.2s,
          transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        animation: slide-up 0.5s 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .alt-action:hover {
        border-color: var(--border-hover);
        color: var(--text-primary);
        background: var(--surface-2);
        transform: translateY(-1px);
      }

      /* ── HINT ── */
      .hint {
        margin-top: 20px;
        padding: 12px 14px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: var(--radius-xs);
        display: flex;
        gap: 10px;
        align-items: flex-start;
        animation: slide-up 0.5s 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .hint-icon {
        font-size: 14px;
        flex-shrink: 0;
        margin-top: 1px;
      }

      .hint-text {
        font-size: 11.5px;
        line-height: 1.55;
        color: var(--text-secondary);
      }

      .hint-url {
        display: block;
        margin-top: 4px;
        font-family: monospace;
        font-size: 10.5px;
        color: var(--text-muted);
        word-break: break-all;
        user-select: all;
      }

      /* ── FOOTER ── */
      .footer {
        margin-top: 32px;
        padding-top: 20px;
        border-top: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        animation: slide-up 0.5s 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .footer-brand {
        font-family: var(--font-display);
        font-weight: 800;
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .footer-tagline {
        font-size: 11px;
        color: var(--text-muted);
      }

      /* ── ANIMATIONS ── */
      @keyframes slide-up {
        from {
          opacity: 0;
          transform: translateY(14px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ── MOBILE IMAGE POSITION TWEAK ── */
      @media (max-width: 859px) {
        .brand-mark {
          margin-bottom: 24px;
        }
        .title {
          font-size: clamp(24px, 7vw, 32px);
        }
      }

      /* ── COPY URL TOAST ── */
      .toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(80px);
        background: var(--surface-2);
        border: 1px solid var(--border-hover);
        border-radius: 999px;
        padding: 10px 20px;
        font-size: 13px;
        color: var(--text-primary);
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s;
        opacity: 0;
        pointer-events: none;
        z-index: 100;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    </style>
  </head>
  <body>
    <div class="glow-bg"></div>

    <main class="page">
      <!-- ── IMAGE PANEL ── -->
      <div class="panel-image${!imageUrl ? ' panel-image-empty' : ''}">
        ${imageUrl
          ? `<img src="${escapeHtml(imageUrl)}" alt="${title}" loading="eager" />`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
               <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
               <polyline points="21 15 16 10 5 21"/>
             </svg>`
        }
      </div>

      <!-- ── CONTENT PANEL ── -->
      <div class="panel-content">

        <!-- Brand -->
        <div class="brand-mark">
          <div class="brand-mark-icon">👕</div>
          <span class="brand-mark-name">Kollect</span>
        </div>

        <!-- Badge -->
        ${badge ? `<div class="badge">${badge}</div>` : ''}

        <!-- Title -->
        <h1 class="title">${title}</h1>

        <!-- Subtitle -->
        ${subtitle ? `<p class="subtitle">${subtitle.replace(' • ', '</p><span class="subtitle-dot"></span><p class="subtitle">').replace(/ • /g, ' <span class="subtitle-dot"></span> ')}</p>` : ''}

        <div class="divider"></div>

        <!-- Description -->
        <p class="desc">${description}</p>

        <!-- CTA -->
        <div class="cta-wrap">
          <a class="cta" href="${deepLink}" id="deep-link-btn">
            ${ctaLabel}
            <svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>

          <!-- Web fallback action -->
          <a class="alt-action" href="${canonicalUrl}" id="web-link-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Ouvrir dans le navigateur
          </a>
        </div>

        <!-- Hint -->
        <div class="hint">
          <span class="hint-icon">💡</span>
          <div class="hint-text">
            Si l'app ne s'ouvre pas, copie ce lien dans le navigateur de ton téléphone&nbsp;:
            <span class="hint-url" id="copy-url" title="Appuie pour copier">${canonicalUrl}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <span class="footer-brand">Kollect</span>
          <span class="footer-tagline">Le streetwear autrement.</span>
        </div>

      </div>
    </main>

    <!-- Toast copy feedback -->
    <div class="toast" id="toast">✅ Lien copié !</div>

    <script>
      (function() {
        // ── Deep link auto-open ──
        var deepLink = ${JSON.stringify(data.deepLink)};
        var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
          // Attempt to open the app silently
          var iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = deepLink;
          document.body.appendChild(iframe);
          setTimeout(function() { document.body.removeChild(iframe); }, 2000);
        }

        // ── Deep link button behaviour ──
        document.getElementById('deep-link-btn').addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = deepLink;
        });

        // ── Web link stays as-is (href already set) ──

        // ── Copy URL on tap ──
        var copyEl = document.getElementById('copy-url');
        var toast = document.getElementById('toast');
        copyEl.style.cursor = 'pointer';
        copyEl.addEventListener('click', function() {
          navigator.clipboard.writeText(window.location.href).then(function() {
            toast.classList.add('show');
            setTimeout(function() { toast.classList.remove('show'); }, 2200);
          });
        });
      })();
    </script>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}

@Controller('s')
export class ShareLinksController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('brand/:id')
  async brand(@Param('id') id: string, @Res() res: Response) {
    const brand = await this.prisma.marque.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        coverImage: true,
        bio: true,
        isActive: true,
        isVerified: true,
        instagram: true,
        followerCount: true,
        products: {
          where: { isVisible: true, isDeleted: false },
          select: { images: true },
          orderBy: { createdAt: 'desc' },
          take: 4,
        },
        _count: {
          select: { 
            collections: {
              where: { 
                status: { in: ['TEASER', 'DISPONIBLE'] }
              }
            } 
          }
        },
      },
    });

    if (!brand || !brand.isActive) {
      return res.status(404).send('Not Found');
    }

    const fallbackProductImage =
      brand.products?.find((p) => p.images && p.images.length > 0)?.images?.[0] ?? null;

    const imageUrl = brand.coverImage || brand.logo || fallbackProductImage;
    const deepLink = `kollect://brand/${brand.slug || brand.id}`;
    const url = `${res.req.protocol}://${res.req.get('host')}${res.req.originalUrl}`;

    // Formater les statistiques avec une meilleure UX
    const formatFollowers = (count: number) => {
      if (count === 0) return 'Aucun abonné';
      if (count === 1) return '1 abonné';
      if (count < 1000) return `${count} abonnés`;
      if (count < 1000000) return `${(count / 1000).toFixed(1)}k abonnés`;
      return `${(count / 1000000).toFixed(1)}M abonnés`;
    };

    const formatCollections = (count: number) => {
      if (count === 0) return 'Aucune collection';
      if (count === 1) return '1 collection';
      return `${count} collections`;
    };

    const statsText = `${formatFollowers(brand.followerCount ?? 0)} • ${formatCollections(brand._count.collections ?? 0)}`;

    return renderSharePage(res, url, {
      title: brand.name,
      subtitle: statsText,
      description: `${brand.isVerified ? '✅ Marque vérifiée • ' : ''}${brand.bio || `Découvre la marque ${brand.name} sur Kollect.`}${brand.instagram ? ` • Instagram: @${brand.instagram}` : ''}`,
      imageUrl,
      deepLink,
      ctaLabel: 'Suivre la marque',
      badge: brand.isVerified ? 'Vérifiée' : 'Populaire',
    });
  }

  @Get('product/:id')
  async product(@Param('id') id: string, @Res() res: Response) {
    const product = await this.prisma.produit.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        images: true,
        stock: true,
        sizes: true,
        colors: true,
        material: true,
        viewCount: true,
        isFeatured: true,
        createdAt: true,
        isDeleted: true,
        isVisible: true,
        collection: { select: { name: true, status: true } },
        brand: { select: { name: true } },
      },
    });

    if (
      !product ||
      product.isDeleted ||
      !product.isVisible ||
      product.collection.status !== CollectionStatus.DISPONIBLE
    ) {
      return res.status(404).send('Not Found');
    }

    const imageUrl = product.images?.[0] ?? null;
    const deepLink = `kollect://product/${product.id}`;
    const url = `${res.req.protocol}://${res.req.get('host')}${res.req.originalUrl}`;
    const priceFcfa = `${product.price.toLocaleString('fr-FR')} FCFA`;
    const isNewProduct = new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Formater les informations avec une meilleure UX
    const formatStock = (stock: number) => {
      if (stock === 0) return 'Rupture de stock';
      if (stock === 1) return 'Dernière pièce disponible';
      if (stock <= 5) return `Plus que ${stock} pièces`;
      if (stock <= 20) return `${stock} pièces en stock`;
      return 'En stock';
    };

    const formatSizes = (sizes: string[]) => {
      if (sizes.length === 0) return '';
      if (sizes.length <= 3) return `Tailles: ${sizes.join(', ')}`;
      return `Tailles: ${sizes.slice(0, 3).join(', ')} +${sizes.length - 3}`;
    };

    const formatColors = (colors: string[]) => {
      if (colors.length === 0) return '';
      if (colors.length <= 2) return `Couleurs: ${colors.join(', ')}`;
      return `Couleurs: ${colors.slice(0, 2).join(', ')} +${colors.length - 2}`;
    };

    const stockStatus = formatStock(product.stock);
    const availableSizes = formatSizes(product.sizes);
    const availableColors = formatColors(product.colors);
    const materialInfo = product.material ? `Matière: ${product.material}` : '';

    // Construire la description intelligemment
    const descriptionParts: string[] = [];
    if (product.isFeatured) descriptionParts.push('⭐ Produit en vedette');
    if (product.viewCount > 100) descriptionParts.push('Populaire');
    descriptionParts.push(stockStatus);
    if (availableSizes) descriptionParts.push(availableSizes);
    if (availableColors) descriptionParts.push(availableColors);
    if (materialInfo) descriptionParts.push(materialInfo);

    return renderSharePage(res, url, {
      title: product.name,
      subtitle: `${product.brand?.name ?? 'Marque'} • ${priceFcfa}`,
      description: descriptionParts.join(' • '),
      imageUrl,
      deepLink,
      ctaLabel: product.stock > 0 ? "Voir le produit dans l'app" : 'Prévoir le produit',
      badge: isNewProduct
        ? 'Nouveauté'
        : product.isFeatured
        ? 'Vedette'
        : product.stock > 0
        ? 'Disponible'
        : 'Rupture',
    });
  }

  @Get('collection/:id')
  async collection(@Param('id') id: string, @Res() res: Response) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        coverImage: true,
        teaserVideo: true,
        launchDate: true,
        launchedAt: true,
        viewCount: true,
        isFeatured: true,
        createdAt: true,
        brand: { select: { name: true } },
        _count: { select: { products: true } },
        products: {
          where: { isDeleted: false },
          select: { images: true },
          orderBy: { createdAt: 'asc' },
          take: 8,
        },
      },
    });

    if (
      !collection ||
      (collection.status !== CollectionStatus.TEASER && collection.status !== CollectionStatus.DISPONIBLE)
    ) {
      return res.status(404).send('Not Found');
    }

    const fallbackProductImage =
      collection.products?.find((p) => p.images && p.images.length > 0)?.images?.[0] ?? null;

    const imageUrl = collection.coverImage || fallbackProductImage || null;
    const deepLink = `kollect://collection/${collection.id}`;
    const url = `${res.req.protocol}://${res.req.get('host')}${res.req.originalUrl}`;
    
    // Formater les statistiques avec une meilleure UX
    const formatProducts = (count: number) => {
      if (count === 0) return 'Aucun produit';
      if (count === 1) return '1 produit';
      if (count < 10) return `${count} produits`;
      return `${count}+ produits`;
    };

    const formatViews = (count: number) => {
      if (count === 0) return '';
      if (count < 100) return `${count} vues`;
      if (count < 1000) return `${count} vues`;
      if (count < 1000000) return `${(count / 1000).toFixed(1)}k vues`;
      return `${(count / 1000000).toFixed(1)}M vues`;
    };

    const launchInfo = collection.launchDate
      ? `Lancement: ${new Date(collection.launchDate).toLocaleDateString('fr-FR')}`
      : '';
    const viewCount = formatViews(collection.viewCount);
    const productsCount = formatProducts(collection._count.products);

    return renderSharePage(res, url, {
      title: collection.name,
      subtitle: `${collection.brand?.name ?? 'Marque'} • ${productsCount}`,
      description: `${collection.isFeatured ? '⭐ Collection en vedette • ' : ''}${collection.teaserVideo ? '🎬 Vidéo teaser disponible • ' : ''}${viewCount ? `${viewCount} • ` : ''}${launchInfo ? `${launchInfo} • ` : ''}${collection.description || ''}`,
      imageUrl,
      deepLink,
      ctaLabel: 'Explorer la collection',
      badge: collection.status === CollectionStatus.TEASER ? 'Bientôt disponible' : 'Disponible',
    });
  }
}
