/* Fabric preview helpers: which pieces can be previewed, the printed patterns a
   customer can try, and a way to read a colour off a product photograph.
   Nothing here imports three.js, so the catalogue pages stay light; the 3D
   viewer (lazy loaded) turns these descriptions into textures. */

export const PATTERNS = [
  { key: 'plain', label: 'Plain' },
  { key: 'pinstripe', label: 'Pinstripe' },
  { key: 'stripe', label: 'Stripe' },
  { key: 'check', label: 'Gingham' },
  { key: 'dots', label: 'Dots' }
];

/* The preview model is a kurta and shalwar, so it only makes sense for grown-up
   clothing: not shoes, bags, jewellery, shawls, bridal or children's wear. */
export const canPreview = (product) => Boolean(product)
  && (product.department === 'Women' || product.department === 'Men')
  && !/shawl|bridal|bag|jewel|shoe|jutti|khussa/i.test(product.category);

/* Draws one repeat of a pattern onto a 2D canvas context (size x size). */
export function paintPattern(ctx, size, kind, base, accent) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = accent;
  if (kind === 'pinstripe') {
    for (let x = 0; x < size; x += size / 32) ctx.fillRect(x, 0, size / 400, size);
  } else if (kind === 'stripe') {
    for (let x = 0; x < size; x += size / 8) ctx.fillRect(x, 0, size / 22, size);
  } else if (kind === 'check') {
    ctx.globalAlpha = 0.5;
    const cell = size / 8;
    for (let i = 0; i < 8; i += 2) {
      ctx.fillRect(i * cell, 0, cell, size);
      ctx.fillRect(0, i * cell, size, cell);
    }
    ctx.globalAlpha = 1;
  } else if (kind === 'dots') {
    const step = size / 12;
    for (let r = 0; r < 12; r += 1) {
      for (let c = 0; c < 12; c += 1) {
        ctx.beginPath();
        ctx.arc((c + (r % 2 ? 0.5 : 0)) * step + step / 2, r * step + step / 2, step * 0.14, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/* Best-guess cloth colour from a product photograph: the commonest colour in the
   middle of the frame once skin tones and near-greys are set aside. Resolves
   null (never throws) if the image will not load or is not readable. */
export function colourFromPhoto(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = () => resolve(null);
    img.onload = () => {
      try {
        const W = 48;
        const H = 64;
        const c = document.createElement('canvas');
        c.width = W;
        c.height = H;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, W, H);
        const data = ctx.getImageData(Math.round(W * 0.28), Math.round(H * 0.28), Math.round(W * 0.44), Math.round(H * 0.42)).data;
        const buckets = new Map();
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]; const g = data[i + 1]; const b = data[i + 2];
          const mx = Math.max(r, g, b); const mn = Math.min(r, g, b);
          const l = (mx + mn) / 510;
          const s = mx === mn ? 0 : (mx - mn) / (255 - Math.abs(2 * l * 255 - 255));
          let h = 0;
          if (mx !== mn) {
            const d = mx - mn;
            h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
            h = (h * 60 + 360) % 360;
          }
          const skin = h >= 8 && h <= 40 && s > 0.2 && s < 0.65 && l > 0.3 && l < 0.82;
          if (skin) continue;
          const key = `${r >> 5},${g >> 5},${b >> 5}`;
          const e = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
          e.n += 1; e.r += r; e.g += g; e.b += b;
          buckets.set(key, e);
        }
        let best = null;
        buckets.forEach((e) => { if (!best || e.n > best.n) best = e; });
        if (!best || best.n < 6) { resolve(null); return; }
        const hex = [best.r, best.g, best.b].map((v) => Math.round(v / best.n).toString(16).padStart(2, '0')).join('');
        resolve(`#${hex}`);
      } catch {
        resolve(null); // a tainted canvas (no CORS on the photo) lands here
      }
    };
    img.src = url;
  });
}
