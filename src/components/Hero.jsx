import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

import { EDITORIAL } from '../data/photography.js';

/* ---------------------------------------------------------------- the plate

   The hero stays image-based: the floating homepage garment is handled by the
   dedicated overlay component so this existing hero layout remains unchanged. */

const LINES = ['Rooted in', 'tradition.', 'Made for you.'];

export default function Hero() {
  const ref = useRef(null);

  // one orchestrated moment, on load only: the type arrives, the plate settles
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('.hero__line > span', { yPercent: 112, duration: 1.2, stagger: 0.09 }, 0.05)
        .from('.hero__eyebrow', { opacity: 0, y: 14, duration: 0.9 }, 0)
        .from('.hero__lede', { opacity: 0, y: 16, duration: 1 }, 0.4)
        .from('.hero__actions > *', { opacity: 0, y: 16, duration: 0.9, stagger: 0.08 }, 0.55)
        .from('.hero__facts span', { opacity: 0, y: 12, duration: 0.8, stagger: 0.06 }, 0.7)
        .from('.hero__plate', { opacity: 0, scale: 1.03, duration: 1.5, ease: 'power2.out' }, 0.1)
;
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={ref} data-parallax-scope aria-labelledby="hero-title">
      <div className="hero__inner wrap">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">NOIRÉ / A Pakistani wardrobe</p>
          <h1 id="hero-title" className="hero__title" aria-label={LINES.join(' ')}>
            {LINES.map((line) => (
              <span className="hero__line" key={line}><span>{line}</span></span>
            ))}
          </h1>
          <p className="hero__lede">
            Lawn, eastern wear and festive pieces.
            For your everyday and every celebration.
          </p>
          <div className="hero__actions">
            <Link to="/shop?sort=newest" className="btn btn--solid">Shop the collection ↗</Link>
            <Link to="/shop?department=Men" className="btn btn--ghost">Shop men</Link>
          </div>
          <p className="hero__facts"><span>Lawn &amp; cotton</span><span>Eastern wear</span><span>Festive dressing</span></p>
          <p className="hero__signature" lang="ur" dir="rtl">روایت سے آج تک</p>
        </div>

        <div className="hero__plate" data-parallax="0.05" data-parallax-scale="1.05">
          <img
            src={EDITORIAL.hero}
            alt="Embroidered eastern wear from the NOIRÉ edit"
            width="1200"
            height="1500"
            fetchpriority="high"
          />
        </div>
      </div>


    </section>
  );
}
