import { Link } from 'react-router-dom';
const COLS = [
  { title: 'Shop the edit', links: [['Women', '/shop?department=Women'], ['Men', '/shop?department=Men'], ['Kids', '/shop?department=Kids'], ['Bags & accessories', '/shop?department=Accessories'], ['Footwear', '/shop?department=Footwear']] },
  { title: 'Customer care', links: [['Delivery in Pakistan', '/shipping'], ['Returns & exchanges', '/returns'], ['Size guide', '/size-guide'], ['Your orders', '/account'], ['FAQs', '/faq'], ['Contact', '/contact']] },
  { title: 'Discover NOIRÉ', links: [['About us', '/about'], ['New arrivals', '/shop?sort=newest'], ['Sale edit', '/shop?sale=1'], ['Fabric studio', '/studio']] }
];
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner wrap">
        <div className="footer__identity"><Link to="/" className="footer__logo" aria-label="NOIRÉ home">NOIRÉ</Link><p>A Pakistani wardrobe.<br />Everyday pieces. Special moments.</p><span lang="ur" dir="rtl">روایت سے آج تک</span></div>
        <div className="footer__grid">
          {COLS.map(({ title, links }) => <nav key={title} aria-label={title}><h2>{title}</h2><ul>{links.map(([label, to]) => <li key={label}><Link to={to} className="footer__link">{label}</Link></li>)}</ul></nav>)}
        </div>
        <div className="footer__legal"><p className="footer__copy">© {new Date().getFullYear()} NOIRÉ · Pakistan · Prices in PKR</p><div className="footer__links"><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/faq">Help</Link></div></div>
      </div>
    </footer>
  );
}
