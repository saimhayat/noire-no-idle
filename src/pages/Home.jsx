import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Band from '../components/Band.jsx';
import CategorySection from '../components/CategorySection.jsx';
import CollectionStrip from '../components/CollectionStrip.jsx';
import PromoBanner from '../components/PromoBanner.jsx';
import useParallax from '../hooks/useParallax.js';
import { inDepartment, newIn, salePicks } from '../data/products.js';
import { MAX_DISCOUNT } from '../data/nav.js';
import { EDITORIAL, shot } from '../data/photography.js';

const NEW = newIn(4);
const NEW_IDS = new Set(NEW.map((p) => p.id));
const WOMEN = inDepartment('Women').filter((p) => !NEW_IDS.has(p.id)).slice(0, 4);
const MEN = inDepartment('Men').filter((p) => !NEW_IDS.has(p.id)).slice(0, 4);
const USED_IDS = new Set([...NEW, ...WOMEN, ...MEN].map((p) => p.id));
const SALE = salePicks(50).filter((p) => !USED_IDS.has(p.id)).slice(0, 4);

export default function Home() {
  const ref = useRef(null);
  useParallax(ref);
  return (
    <div className="home" ref={ref}>
      <Hero />
      <CategorySection />
      <CollectionStrip id="new" eyebrow="The latest edit" title="New arrivals" text="Fresh colours. Familiar silhouettes. Find your next favourite." to="/shop?sort=newest" link="Shop new in" products={NEW} />
      <section className="occasion wrap" aria-labelledby="occasion-title">
        <header className="occasion__intro">
          <p className="eyebrow">From everyday to occasion</p>
          <h2 id="occasion-title">A little more<br />you, every day.</h2>
          <p>Easy lawn for the everyday. Embroidered pieces for the moments you dress up for.</p>
        </header>
        <Link className="occasion__tile" to="/shop?department=Women&category=Kurta%2CKameez%20%26%20Trouser">
          <img src={shot('kameez-sand', 0)} alt="Cream kurta and trouser" width="900" height="1125" loading="lazy" />
          <span><small>The everyday edit</small><strong>Lawn &amp; cotton</strong><em>Explore the edit ↗</em></span>
        </Link>
        <Link className="occasion__tile" to="/shop?department=Women&category=Formal%2CBridal">
          <img src={shot('formal-maroon', 0)} alt="Maroon embroidered formal outfit" width="900" height="1125" loading="lazy" />
          <span><small>For your celebrations</small><strong>Festive dressing</strong><em>Explore the edit ↗</em></span>
        </Link>
      </section>
      <CollectionStrip id="women" eyebrow="Women" title="Your everyday, elevated" to="/shop?department=Women" link="Shop women" products={WOMEN} />
      <PromoBanner garmentTarget eyebrow="The NOIRÉ sale edit" title={`Good finds. Up to ${MAX_DISCOUNT}% off.`} text="Discover reduced pieces across the collection. Your next favourite could be waiting here." to="/shop?sale=1" cta="Explore the sale" />
      <CollectionStrip id="men" eyebrow="Men’s eastern wear" title="A classic, your way" to="/shop?department=Men" link="Shop men" products={MEN} />
      <PromoBanner reverse tone="ink" eyebrow="The finishing touch" title="Carry a little character." text="Leather bags, jewellery and accessories to make the look your own." to="/shop?department=Accessories" cta="Shop accessories" image={EDITORIAL.accessories} imageAlt="Leather handbags" />
      <CollectionStrip id="reduced" eyebrow="The sale selection" title="Worth a second look" to="/shop?sale=1" link="Shop all sale" products={SALE} />
      <Band />
      <section className="brand-note wrap" aria-labelledby="brand-note-title">
        <p className="eyebrow">NOIRÉ / Pakistan</p>
        <h2 id="brand-note-title">Rooted in our wardrobe.<br />Ready for your everyday.</h2>
        <p>Kameez, kurta, lawn and festive silhouettes, brought together with the details that complete them.</p>
        <Link to="/about" className="link-underline">Discover NOIRÉ</Link>
      </section>
    </div>
  );
}
