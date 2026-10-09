# NOIRÉ — Pakistani brand refresh

This revision uses the shopping structure of https://zarr.com.pk as inspiration: clear departments, product-led sections, local pricing, and accessible shopping help. NOIRÉ retains its own typography, colours, photography and content. No Zarr logos, images or product listings were copied.

## What changed

| Area | Change and purpose |
| --- | --- |
| Brand design | Warm ivory, deep green, editorial serif headings, restrained Urdu signature: “روایت سے آج تک”. |
| Hero | Shorter campaign copy and clear collection/men shopping actions. Existing image and animation anchors retained. |
| Categories | Six image tiles: women, men’s eastern, festive, kids, bags/accessories and footwear. Links use existing filters. |
| Homepage | Four product rails instead of seven, with no duplicate product IDs between rails. Everyday and festive shopping edits added. |
| Clutter | Removed the duplicate department jump bar, repeated best-seller/accessory/combined department rails, lengthy craft/fabric blocks and fictional label directory from the homepage. |
| Trust | Removed generated review cards, invented review counts and rating display from product pages. Removed generic social-network home links, nonfunctional newsletter signups and unsupported lifetime-repair messaging from prominent shopping surfaces. |
| Navigation | Removed the reading-progress line and moved the fabric studio to a footer link. Search, category menus, filters, wishlist and cart remain. |
| Support | Replaced the contact form that falsely reported a sent message with functional links to sizing, delivery, returns and saved orders. No customer care number or email has been invented. |
| Product pages | Removed duplicate material/care block and clothing-only fit copy from accessories. The existing shared fabric model remains with an accurate explanatory label. |
| Asset delivery | Existing storefront photographs compressed to local WebP files; body, display and Urdu fonts served locally. Font licenses are in `public/fonts/`. |
| Loading | Homepage 3D code loaded separately; the initial JS bundle is approximately 478 kB minified, down from approximately 1,346 kB before splitting. The larger 3D chunk remains. |

## Preserved

Existing product IDs, slugs, photographs, prices, filters, gallery, cart, wishlist, checkout and routes. The floating garment’s scroll calculations and docking code were not rewritten. No environment variables or credentials changed.

The supplied ZIP contains `FabricStudio` and the homepage garment models. It does **not** contain the later `ProductPhoto3DPreview` / `Product3DSection` implementation described in the conversation. This refresh therefore preserves the 3D functionality actually supplied; it does not claim to restore missing product-specific models. The shared fabric model is illustrative and does not represent the exact item’s cut or embroidery.

## Best next improvements

1. Replace the sample catalogue with real NOIRÉ products and a consistent photo shoot: front, back, detail and fabric shots on the same background. Use actual product colour/size images.
2. Add product-level stitched/unstitched, piece count, fabric composition, measurements and fit details. Only create an unstitched category when that stock exists.
3. Supply real WhatsApp, Instagram and customer-care details, then connect their links. Avoid placeholder profiles.
4. Connect the actual order system and payment providers. The supplied checkout remains a local demonstration; a visual refresh does not enable transactions, dispatch or courier tracking.
5. Confirm delivery charges, returns, tax and COD conditions against your actual business before launch. Existing business rules were retained, not independently verified.
6. Use authentic reviews from fulfilled orders. The old catalogue still contains sample ratings, sales and stock used by its filters/sorts; these should come from real records in a production shop.
7. Add matching product-specific GLB files or restore the newer photo-preview project before extending product 3D experiences. Keep approximation labels visible where appropriate.

## Run

```bash
npm install
npm run dev
npm run build
```

The lockfile was refreshed to match the package manifest, including the existing Three.js dependencies.

## Verification

- Production build passed.
- Homepage checked at 1440, 1024, 768 and 390 px: no horizontal overflow.
- All six category tiles render; the festive filter returns five matching products.
- Storefront photographs and local fonts load.
- Mobile menu opens and closes. Wishlist toggles correctly. Product add-to-bag opens the cart with the selected handbag.
- Scrolling into the sale promo activates the garment dock with its WebGL canvas.
- Browser checks on the tested home/shop/product flows reported no uncaught JavaScript errors.

Original Pexels image references are retained in `src/data/photography.js`; photographed items and sample product descriptions have not been independently authenticated. Some retained editorial routes still use external images.
