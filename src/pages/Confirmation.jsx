import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { money } from '../lib/format.js';
import { lastOrder } from '../lib/orders.js';

/* The receipt. The order lives on this device (there is nowhere else for it to
   live), so arriving without one is a state we handle rather than an error. */
export default function Confirmation() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    setOrder(lastOrder());
    document.title = 'Order preview saved | NOIRÉ';
    return () => { document.title = 'NOIRÉ | Modern fashion'; };
  }, []);

  if (!order) {
    return (
      <div className="page wrap confirm">
        <div className="page__head">
          <h1 className="section__title">No order to show</h1>
          <p className="page__lede">
            There is no saved order preview on this device yet. Explore the collection or open your account to see your saved pieces.
          </p>
          <Link className="btn btn--solid" to="/shop">Back to the shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page wrap confirm">
      <header className="page__head confirm__head">
        <p className="confirm__mark" aria-hidden="true">✓</p>
        <h1 className="section__title">Order preview saved</h1>
        <p className="page__lede">
          Thank you, {order.name.split(' ')[0]}. Your order preview is saved on this device. No payment has been taken, no delivery has been arranged and no email has been sent.
        </p>
        <dl className="confirm__meta">
          <div><dt>Order</dt><dd>{order.id}</dd></div>
          <div><dt>Placed</dt><dd>{order.placed}</dd></div>
          <div><dt>Payment</dt><dd>{order.method || 'Card'}</dd></div>
          <div><dt>Shipping to</dt><dd>{order.city}, {order.country}</dd></div>
        </dl>
      </header>

      <section className="confirm__grid" aria-label="What you ordered">
        <ul className="confirm__lines">
          {order.items.map((i, n) => (
            <li className="checkout__line" key={`${i.name}-${n}`}>
              <img src={i.image} alt="" width="72" height="90" loading="lazy" />
              <div>
                <p className="line__name">{i.name}</p>
                <p className="line__meta">{i.size} · {i.color} · ×{i.qty}</p>
              </div>
              <p className="line__side">{money(i.price * i.qty)}</p>
            </li>
          ))}
        </ul>
        <aside className="confirm__totals" aria-label="Order total">
          <dl className="checkout__totals">
            <div><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
            <div><dt>Delivery</dt><dd>{order.shipping ? money(order.shipping) : 'Free'}</dd></div>
            <div className="total"><dt>Total</dt><dd>{money(order.total)}</dd></div>
          </dl>
          <p className="checkout__note">
            You can find this preview again in your account on this device. Clearing your browser data removes it.
          </p>
          <div className="confirm__actions">
            <Link className="btn btn--solid" to="/shop">Continue shopping</Link>
            <Link className="btn btn--ghost" to="/account">See your orders</Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
