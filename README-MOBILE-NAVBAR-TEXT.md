# Mobile header and typography update

This ZIP contains only the four source files changed or added for this update.

## Changes

- At 900px and below, the header shows the menu and a centred NOIRÉ logo. Search, saved pieces and the bag appear only in the bottom navigation. Account access remains in the menu. At wider sizes the header tools remain available.
- Shared typography rules keep reading sections aligned to their starting edge, give headings balanced wrapping and use a consistent line height and readable paragraph width.
- Product names reserve two lines so adjacent card prices line up while longer names remain fully visible.
- Prices and totals keep each amount together; totals align to the end of their row.
- Mobile section links sit beneath their headings. Journal next-entry links, account help links and footer legal text stack neatly.
- The account heading and introduction are shorter and clearer.

## Apply

1. Open your existing project folder containing package.json.
2. Copy the ZIP's src contents into your project's src folder, preserving the subfolders. Replace matching files and add typography.css. Keep all other existing files.
3. Run npm run build.
4. Review and commit the changes using your usual Git workflow.

Do not replace the entire src folder with this smaller patch. No dependency changes are required. No dist folder is included, and this update does not change your live deployment by itself.

## Verification

- 34 route states at 320, 390, 600, 768, 900, 901, 1051 and 1440px: 272 layout checks with no detected horizontal overflow, enlarged layout viewport, broken images, uncaught JavaScript errors or failed requests.
- Unique mobile actions, exact logo centring, desktop/mobile breakpoint transitions, and search, wishlist, bag and account access from the mobile navigation passed.
- The revised account page fits all eight widths. All 38 catalogue cards were examined at 320, 390 and 1440px; adjacent card prices aligned within one pixel in these checks.
- Mobile menu, search, filters, size dialog, cart, Buy now, delivery validation, payment preview, local confirmation and account order display passed at 320 and 390px.
- npm run build passed. The existing lazy Three.js chunk still produces Vite's bundle-size warning.

Checks used Chromium with mobile viewport and touch emulation. Physical iPhone/Safari and Android hardware were not tested.

## Files

- src/main.jsx — imports the typography stylesheet.
- src/styles/responsive.css — removes the duplicate mobile header tools and centres the logo.
- src/styles/typography.css — new shared text layout rules.
- src/pages/Account.jsx — clearer heading and introduction.
