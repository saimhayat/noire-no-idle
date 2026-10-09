import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { COLOURS, colourName } from '../data/products.js';
import { CLOTH_PRESETS } from '../data/cloth.js';
import { PATTERNS, colourFromPhoto } from '../lib/fabric.js';

const FabricViewer = lazy(() => import('./FabricViewer.jsx'));

const hexOf = (key) => COLOURS[key]?.hex || '#cdc7ba';

/* The viewer plus its controls. On a product page it opens on that piece's own
   cloth and colourways (and follows the colour chosen above); in the studio it
   starts from whichever piece the customer picks, or from nothing at all. */
export default function FabricStudio({ product = null, colourKey, onColourKey, variant = 'pdp' }) {
  const wrapRef = useRef(null);
  const [near, setNear] = useState(false);
  const [custom, setCustom] = useState(null); // a colour typed in by hand
  const [photoHex, setPhotoHex] = useState(null);
  const [picked, setPicked] = useState(colourKey || product?.colours?.[0] || null);
  const [cloth, setCloth] = useState(product?.cloth || 'poplin');
  const [pattern, setPattern] = useState('plain');
  const [accent, setAccent] = useState('#f5f1e8');
  const [scale, setScale] = useState(1);
  const [upload, setUpload] = useState(null);
  const [auto, setAuto] = useState(true);

  // mount the 3D canvas only once it is about to be seen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setNear(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // a new piece starts from its own cloth and first colourway
  const slug = product?.slug;
  useEffect(() => {
    setPicked(colourKey || product?.colours?.[0] || null);
    setCloth(product?.cloth || 'poplin');
    setCustom(null);
    setPattern('plain');
    setUpload(null);
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // the colour chosen on the product page drives the preview
  useEffect(() => {
    if (colourKey) { setPicked(colourKey); setCustom(null); }
  }, [colourKey]);

  // read a colour off the product photograph
  useEffect(() => {
    setPhotoHex(null);
    if (!product?.image) return undefined;
    let live = true;
    colourFromPhoto(product.image).then((hex) => { if (live) setPhotoHex(hex); });
    return () => { live = false; };
  }, [product?.image]);

  useEffect(() => () => { if (upload) URL.revokeObjectURL(upload); }, [upload]);

  const keys = product?.colours?.length ? product.colours : Object.keys(COLOURS);
  const color = custom || (picked ? hexOf(picked) : '#e6dfd0');

  const fabric = useMemo(() => ({
    color, accent, pattern, cloth, imageUrl: upload, scale
  }), [color, accent, pattern, cloth, upload, scale]);

  const choose = (key) => { setPicked(key); setCustom(null); setUpload(null); onColourKey?.(key); };
  const label = upload ? 'Your fabric image' : custom ? 'Custom colour' : picked ? colourName(picked) : 'Colour';

  return (
    <section className={`fabric fabric--${variant}`} ref={wrapRef} aria-label="See the fabric on a 3D model">
      <div className="fabric__stage">
        {near ? (
          <Suspense fallback={<p className="fabric__loading">Loading the model…</p>}>
            <FabricViewer fabric={fabric} autoRotate={auto} />
          </Suspense>
        ) : <p className="fabric__loading">Loading the model…</p>}
        <button type="button" className="fabric__spin" onClick={() => setAuto((v) => !v)} aria-pressed={auto}>
          {auto ? 'Pause turn' : 'Auto turn'}
        </button>
      </div>

      <div className="fabric__panel">
        <header className="fabric__head">
          <p className="eyebrow">{variant === 'pdp' ? 'Explore fabric in 3D' : 'Fabric studio'}</p>
          <h2 className="fabric__title">{label} · {CLOTH_PRESETS.find((c) => c.key === cloth)?.label}</h2>
        </header>

        <div className="fabric__group">
          <span className="fabric__label">Colour</span>
          <div className="fabric__swatches" role="radiogroup" aria-label="Colour">
            {photoHex && (
              <button
                type="button"
                role="radio"
                aria-checked={custom === photoHex}
                className={`fabric__swatch fabric__swatch--photo ${custom === photoHex ? 'is-on' : ''}`}
                style={{ '--sw': photoHex }}
                title="Colour read from the product photograph"
                onClick={() => { setCustom(photoHex); setUpload(null); }}
              ><span>Photo</span></button>
            )}
            {keys.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={!custom && !upload && picked === k}
                aria-label={colourName(k)}
                title={colourName(k)}
                className={`fabric__swatch ${!custom && !upload && picked === k ? 'is-on' : ''}`}
                style={{ '--sw': hexOf(k) }}
                onClick={() => choose(k)}
              />
            ))}
            <label className="fabric__swatch fabric__swatch--pick" title="Pick any colour">
              <input type="color" value={color} onChange={(e) => { setCustom(e.target.value); setUpload(null); }} aria-label="Pick any colour" />
              <span aria-hidden="true">+</span>
            </label>
          </div>
        </div>

        <div className="fabric__group">
          <span className="fabric__label">Cloth</span>
          <div className="fabric__chips">
            {CLOTH_PRESETS.map((c) => (
              <button key={c.key} type="button" className={`chip ${cloth === c.key ? 'is-on' : ''}`} onClick={() => setCloth(c.key)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="fabric__group">
          <span className="fabric__label">Pattern</span>
          <div className="fabric__chips">
            {PATTERNS.map((p) => (
              <button key={p.key} type="button" className={`chip ${!upload && pattern === p.key ? 'is-on' : ''}`} onClick={() => { setPattern(p.key); setUpload(null); }}>
                {p.label}
              </button>
            ))}
          </div>
          {!upload && pattern !== 'plain' && (
            <label className="fabric__inline">
              <span>Pattern colour</span>
              <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} aria-label="Pattern colour" />
            </label>
          )}
        </div>

        <div className="fabric__group">
          <label className="fabric__inline fabric__inline--range">
            <span>{upload || pattern !== 'plain' ? 'Pattern size' : 'Weave size'}</span>
            <input type="range" min="0.5" max="2" step="0.05" value={scale} onChange={(e) => setScale(Number(e.target.value))} />
          </label>
          <label className="btn btn--ghost fabric__upload">
            Try your own fabric photo
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setUpload(URL.createObjectURL(f));
                e.target.value = '';
              }}
            />
          </label>
        </div>

        <p className="fabric__note">Illustrative fabric preview on a shared garment shape. It does not reproduce this product’s cut, embroidery or fit. Refer to the product gallery for those details.</p>
      </div>
    </section>
  );
}
