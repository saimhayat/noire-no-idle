import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
const ShalwarKameezCanvas = lazy(() => import('./ShalwarKameezCanvas.jsx'));

function GarmentDockVisual() {
  const [isDesktop, setIsDesktop] = useState(() => (
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 721px)').matches
  ));

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 721px)');
    const onChange = (event) => setIsDesktop(event.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // The second WebGL context is only created when the visitor is about a
  // screen away from the promo, so it never competes with the first paint.
  const dockRef = useRef(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = dockRef.current;
    if (!el || near || typeof IntersectionObserver === 'undefined') { if (!near) setNear(true); return undefined; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setNear(true); io.disconnect(); }
    }, { rootMargin: '150% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [isDesktop, near]);

  if (isDesktop) {
    return (
      <div className="promo__garment-dock" data-garment-dock="true" ref={dockRef}>
        {near && <Suspense fallback={null}><ShalwarKameezCanvas staticRotationY={0} className="promo__garment-canvas" /></Suspense>}
      </div>
    );
  }

  return (
    <picture className="promo__garment-dock" data-garment-dock="true">
      <source media="(max-width: 720px)" srcSet="/garments/shalwar-kameez-mobile.webp" />
      <img
        src="/garments/shalwar-kameez.webp"
        alt=""
        width="984"
        height="1492"
        loading="eager"
        decoding="async"
      />
    </picture>
  );
}

/* The promo slot becomes the real home for the garment once the scroll
   transition arrives. The dock stays inside this section, so it cannot follow
   the user into the footer. */
export default function PromoBanner({ eyebrow, title, text, to, cta, image, imageAlt, reverse = false, meta, tone = 'paper', garmentTarget = false }) {
  return (
    <section className={`promo promo--${tone} ${reverse ? 'promo--reverse' : ''} ${garmentTarget ? 'promo--garment-target' : ''}`} data-parallax-scope>
      <div className="promo__inner wrap">
        <div className={`promo__media ${garmentTarget ? 'promo__media--garment-target' : ''}`} data-garment-target={garmentTarget ? 'true' : undefined}>
          {garmentTarget ? (
            <GarmentDockVisual />
          ) : (
            <img
              src={image}
              alt={imageAlt || ''}
              width="1400"
              height="1000"
              loading="lazy"
              decoding="async"
              data-parallax="0.1"
              data-parallax-scale="1.08"
            />
          )}
        </div>
        <div className="promo__copy">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="promo__title">{title}</h2>
          {text && <p className="promo__text">{text}</p>}
          {to && <Link to={to} className="btn btn--solid">{cta || 'Shop the edit'}</Link>}
          {meta && <p className="promo__meta">{meta}</p>}
        </div>
      </div>
    </section>
  );
}
