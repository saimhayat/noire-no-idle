import { Link } from 'react-router-dom';
import HomepageGarmentPreview from './HomepageGarmentPreview.jsx';

/* The promo slot becomes the real home for the garment once the scroll
   transition arrives. The dock stays inside this section, so it cannot follow
   the user into the footer. */
export default function PromoBanner({ eyebrow, title, text, to, cta, image, imageAlt, reverse = false, meta, tone = 'paper', garmentTarget = false }) {
  return (
    <section className={`promo promo--${tone} ${reverse ? 'promo--reverse' : ''} ${garmentTarget ? 'promo--garment-target' : ''}`} data-parallax-scope>
      <div className="promo__inner wrap">
        <div className={`promo__media ${garmentTarget ? 'promo__media--garment-target' : ''}`} data-garment-target={garmentTarget ? 'true' : undefined}>
          {garmentTarget ? (
            <HomepageGarmentPreview />
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
