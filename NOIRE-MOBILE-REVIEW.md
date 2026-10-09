# NOIRÉ mobile and professionalism review

The latest supplied project was reviewed locally and corrected. This is a source-file patch for your existing React/Vite project; no hosted site was changed.

## Findings and fixes

| Finding | Change |
| --- | --- |
| The size-guide grid could widen a phone's viewport and shrink the entire page. Narrow screens also lost table headings. | Constrained the grid and restored real tables; only the table scrolls sideways, with a swipe hint. |
| Header navigation clipped just above the old tablet breakpoint. | Compact navigation continues through 1050px. |
| Wishlist controls depended on hover; several controls were difficult to tap. | Visible mobile hearts, larger touch controls, readable mobile form text and clearer empty states. |
| Size/filter dialogs could sit under the header, leak background scrolling or lose keyboard focus. | Body-level dialogs, shared scroll locks, focus containment, Escape closing and larger close buttons. |
| The two department radio groups interfered with one another. | Unique group names keep sidebar and mobile-sheet choices independent. |
| Cart text and prices competed for space; an added-item toast could cover totals. | Mobile cart and checkout rows wrap cleanly, totals remain visible, and toasts are hidden behind active dialogs. |
| Buy now opened a cart drawer over checkout. | Buy now closes the cart and navigates directly to checkout. |
| Product-page fabric customization distracted from purchasing and loaded a 3D viewer immediately. | Fabric exploration is an optional disclosure; its viewer mounts only when opened. |
| Search used desktop-only instructions and a price suggestion that did not actually filter by price. | Mobile search fills the screen, focuses its input, uses touch instructions and applies the under-Rs.5,000 filter. |
| Reduced-motion preference prevented gallery swiping and did not consistently stop studio auto rotation. | Manual image swiping remains available; studio auto rotation starts off when reduced motion is requested. |
| Three journal photographs depended on external image requests. | The existing photographs are served as local optimized WebP assets. |
| Checkout, confirmation and account wording implied emails, payments and shipment progress that never occurred. | Clear local order-preview wording throughout; fictional shipment statuses removed. |
| Secondary prices and footer legal copy were too faint. | Stronger text contrast while keeping the ivory/green brand styling. |

The package also includes the earlier mobile shalwar-kameez 3D update: automatic turning, touch rotation, pause/reset controls and the homepage dock.

## Verification

- 34 route states at 320, 360, 390, 430, 768, 901, 1024, 1050, 1051 and 1440px: 340 layout checks. No detected page overflow, viewport enlargement, broken images, uncaught JavaScript errors or failed requests in that sweep.
- All 38 product pages opened; five representative department products were checked at all ten widths.
- Mobile navigation, wishlist save/remove, search suggestions, actual filtering, gallery swiping, size guide, cart, Buy now, delivery validation, payment choice, locally saved confirmation and account preview were exercised.
- Keyboard focus containment and Escape closing were checked. Portrait and landscape size-guide dialogs fit their viewports.
- Homepage 3D automatic rotation, pause, touch drag, vertical page scrolling, reset, reduced-motion behavior and desktop placement passed browser checks.
- `npm run build` passed. Vite still reports a size warning for the lazily loaded Three.js chunk; slower real phones should be checked before launch.

These checks used Chromium with mobile viewport/touch emulation. Physical iPhone/Safari and Android hardware, live hosting performance, and backend integrations were not tested.

## What still needs your business information

1. Connect real order processing, payment/COD handling and confirmation emails. The current checkout saves an order preview only on the visitor's device.
2. Supply real customer-care contact channels and verify delivery, returns, pricing and stock policies against your operations.
3. Replace sample supplier/editorial content and catalog information with your own verified products and approved photography.
4. Provide complete product-specific size measurements, including available XS/XXL options where applicable. The current generic S–XL chart is incomplete for some items; measurements were not invented.

## Apply the patch

1. Extract the ZIP.
2. Open your existing project folder containing `package.json`.
3. Merge the contents of the ZIP's `src` and `public` folders into the matching folders in your project. Replace matching files and add new files. Keep all other existing files; do not replace or delete whole folders.
4. Optionally copy this review document into the project root.
5. Run `npm run build` to check the merged project.
6. Review the changes and commit them using your usual Git workflow.

No dependency changes are required. This package deliberately excludes `dist` and `node_modules`. Copying or committing source files does not itself modify a previously uploaded manual deployment; your existing hosting deployment workflow controls the live update.

## Included source and asset files

- `public/_redirects`
- `public/photography/12584788.webp`
- `public/photography/20989158.webp`
- `public/photography/6765649.webp`
- `src/components/CartDrawer.jsx`
- `src/components/FabricStudio.jsx`
- `src/components/FabricViewer.jsx`
- `src/components/FilterBar.jsx`
- `src/components/FloatingGarment.jsx`
- `src/components/HomepageGarmentPreview.jsx`
- `src/components/MobileTabBar.jsx`
- `src/components/Navbar.jsx`
- `src/components/ProductGallery.jsx`
- `src/components/PromoBanner.jsx`
- `src/components/SearchOverlay.jsx`
- `src/components/ShalwarKameezCanvas.jsx`
- `src/components/SizeGuide.jsx`
- `src/data/info.js`
- `src/data/photography.js`
- `src/hooks/useDialog.js`
- `src/lib/orders.js`
- `src/main.jsx`
- `src/pages/Account.jsx`
- `src/pages/Checkout.jsx`
- `src/pages/Confirmation.jsx`
- `src/pages/Info.jsx`
- `src/pages/Product.jsx`
- `src/pages/Shop.jsx`
- `src/styles/brand.css`
- `src/styles/responsive.css`
