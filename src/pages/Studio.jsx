import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FabricStudio from '../components/FabricStudio.jsx';
import { products } from '../data/products.js';
import { canPreview } from '../lib/fabric.js';
import { money } from '../lib/format.js';

export default function Studio() {
  const list = useMemo(() => products.filter(canPreview), []);
  const [slug, setSlug] = useState(list[0]?.slug);
  const product = list.find((p) => p.slug === slug) || null;

  useEffect(() => {
    document.title = 'Explore fabric in 3D | NOIRÉ';
    return () => { document.title = 'NOIRÉ | Modern fashion'; };
  }, []);

  return (
    <div className="page studio">
      <div className="page__head">
        <p className="eyebrow">Studio</p>
        <h1 className="section__title">Explore fabric in 3D</h1>
        <p className="page__lede">Explore colours and patterns on an illustrative garment model. Drag to rotate. This experiment does not reproduce individual products or change the item you buy.</p>
      </div>

      <label className="studio__pick">
        <span className="fabric__label">Start from</span>
        <select value={slug} onChange={(e) => setSlug(e.target.value)}>
          {list.map((p) => <option key={p.slug} value={p.slug}>{p.name} — {p.brand}</option>)}
        </select>
      </label>

      <FabricStudio product={product} variant="studio" />

      {product && (
        <p className="studio__cta">
          <Link className="btn btn--solid" to={`/product/${product.slug}`}>View {product.name} · {money(product.price)}</Link>
        </p>
      )}
    </div>
  );
}
