import { DEPARTMENTS, categoriesIn, products } from './products.js';
import { shot } from './photography.js';
import { discountOf } from '../lib/format.js';

/* The deepest markdown in the shop, read off the catalogue rather than typed
   into the copy: a banner that promises 40% while the best price is 25% off is
   the kind of claim a shop should not be able to make by accident. */
export const MAX_DISCOUNT = Math.max(...products.map(discountOf));

/* The navigation is derived from the catalogue rather than typed out beside it:
   a department's columns are the categories it actually holds, and its brand
   column is the labels it actually carries. Add a piece and the menu knows. */

/* One picture per menu, always a piece the shop actually holds. */
const PROMOS = {
  Women: { eyebrow: 'Formals', title: 'Chiffon, organza and velvet', cta: 'Shop formals', to: '/shop?department=Women&category=Formal', image: shot('formal-maroon', 0) },
  Men: { eyebrow: 'Everyday', title: 'Kurtas and shalwar kameez', cta: 'Shop men', to: '/shop?department=Men&category=Kurta', image: shot('kameez-white', 0) },
  Kids: { eyebrow: 'Festive', title: 'Little looks for special days', cta: 'Shop kids', to: '/shop?department=Kids', image: shot('kid-orange', 0) },
  Footwear: { eyebrow: 'Hand worked', title: 'Jutti and bridal khussa', cta: 'Shop footwear', to: '/shop?department=Footwear&category=Juttis%20%26%20Khussa', image: shot('khussa-bridal', 0) },
  Accessories: { eyebrow: 'Sialkot leather', title: 'Bags and hand-finished gold', cta: 'Shop accessories', to: '/shop?department=Accessories', image: shot('bag-crimson', 0) }
};

/* Three columns and a picture. A department has few enough categories to list
   them under one heading, which is one fewer thing to read. */
const mega = (department) => {
  const cats = categoriesIn(department);
  const columns = [
    {
      title: 'Categories',
      links: cats.map((c) => ({ label: c, to: `/shop?department=${department}&category=${encodeURIComponent(c)}` }))
    }
  ];
  columns.push({
    title: 'Shop by',
    links: [
      { label: 'New In', to: `/shop?department=${department}&sort=newest` },
      { label: 'Explore all', to: `/shop?department=${department}` },
      { label: 'Exclusive', to: `/shop?department=${department}&view=exclusive` },
      { label: 'On Sale', to: `/shop?department=${department}&sale=1` }
    ]
  });
  columns.push({ title: 'Shopping help', links: [{ label: 'Size guide', to: '/size-guide' }, { label: 'Delivery in Pakistan', to: '/shipping' }, { label: 'Returns & exchanges', to: '/returns' }] });
  return { columns, promo: PROMOS[department] };
};

export const NAV = [
  ...DEPARTMENTS.map((d) => ({ label: d.title, to: d.to, ...mega(d.key) })),
  { label: 'New In', to: '/shop?sort=newest' },
  { label: 'Sale', to: '/shop?sale=1' }
];

/* The strip the announcement bar walks through. */
export const ANNOUNCEMENTS = [
  { text: 'Free delivery over Rs. 5,000, countrywide', to: '/shipping' },
  { text: 'Discover the latest NOIRÉ arrivals', to: '/shop?sort=newest' },
  { text: 'Easy 30-day returns, exchanges free', to: '/returns' },
  { text: `Up to ${MAX_DISCOUNT}% off in the sale edit`, to: '/shop?sale=1' }
];
