/* There is no backend, so an order is written to the device that placed it and
   read back by the confirmation and the account page. The list is capped: this
   is a receipt drawer, not a database. */

const KEY = 'noire-orders';
const LAST = 'noire-order';

export const readOrders = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(list) ? list : [];
  } catch { return []; }
};

export const lastOrder = () => readOrders()[0] || null;

export const writeOrder = (order) => {
  try {
    const list = [order, ...readOrders().filter((o) => o.id !== order.id)].slice(0, 12);
    localStorage.setItem(KEY, JSON.stringify(list));
    // the single-order key is kept so older receipts on this device still open
    localStorage.setItem(LAST, JSON.stringify(order));
  } catch { /* private mode */ }
  return order;
};

/* A local preview has no courier feed or fulfillment status. */
export const orderStatus = () => 'Saved locally';
