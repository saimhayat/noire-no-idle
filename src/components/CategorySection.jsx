import { Link } from 'react-router-dom';
import SectionHead from './SectionHead.jsx';
import { shot } from '../data/photography.js';

const EDITS = [
  ['Women’s wear', 'Lawn, kurtas & everyday sets', 'kameez-emerald', '/shop?department=Women'],
  ['Men’s eastern', 'Kurta & shalwar kameez', 'kurta-navy', '/shop?department=Men'],
  ['Festive wear', 'Formals & bridal silhouettes', 'formal-maroon', '/shop?department=Women&category=Formal%2CBridal'],
  ['Kids', 'Little looks for big moments', 'kid-orange', '/shop?department=Kids'],
  ['Bags & accessories', 'The finishing touches', 'bag-tan', '/shop?department=Accessories'],
  ['Footwear', 'Jutti, khussa & leather shoes', 'market-juttis', '/shop?department=Footwear']
];
export default function CategorySection() {
  return (
    <section className="section categories" aria-labelledby="cat-title">
      <SectionHead id="cat-title" eyebrow="Find your edit" title="What are you dressing for?" to="/shop" link="Shop all" />
      <div className="catgrid">
        {EDITS.map(([title, text, image, to]) => (
          <Link key={title} to={to} className="catgrid__tile">
            <span className="catgrid__media"><img src={shot(image, 0)} alt="" width="900" height="1125" loading="lazy" decoding="async" /></span>
            <span className="catgrid__label"><span className="catgrid__title">{title}</span><span aria-hidden="true">↗</span></span>
            <span className="catgrid__text">{text}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
