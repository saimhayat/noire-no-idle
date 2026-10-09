import { useEffect } from 'react';
import { Link } from 'react-router-dom';
export default function Contact() {
  useEffect(() => { document.title = 'Customer care | NOIRÉ'; }, []);
  return <div className="page contact"><header className="page__head"><p className="eyebrow">Here to help</p><h1 className="section__title">Customer care</h1><p className="page__lede">Find answers about sizing, delivery and returns.</p></header><div className="page__body"><div className="contact-help">
    <Link to="/size-guide"><h2>Find your size ↗</h2><p>Measurements for clothing, kids and footwear.</p></Link>
    <Link to="/shipping"><h2>Delivery in Pakistan ↗</h2><p>Delivery charges and expected timings.</p></Link>
    <Link to="/returns"><h2>Returns &amp; exchanges ↗</h2><p>Read the conditions before you order.</p></Link>
    <Link to="/account"><h2>Your orders ↗</h2><p>View order records saved on this device.</p></Link>
  </div><p className="contact-help__note">Direct customer care contact details will be listed here when available.</p></div></div>;
}
