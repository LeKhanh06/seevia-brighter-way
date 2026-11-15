# SeeVia visual quality audit

Date: 17 October 2026. Scope: presentation across all 11 routes.

## Findings and repairs

- Multiple historical palette layers left burgundy/plum backgrounds in secondary pages. The final quality stylesheet maps compatibility tokens to the Optical palette and replaces remaining conflicting static backgrounds. Ink contrast panels remain deliberate accents; reading surfaces stay light.
- Page gutters differed between homepage, product, technology and editorial pages. Shared responsive gutter and section-spacing tokens now establish a consistent reading axis while retaining the existing grids and section order.
- Heading scales and tracking varied; some article prose was 13–14px. Section headings now use a bounded responsive scale, existing Lora supplies editorial emphasis, and selected reading text uses 16px with 1.8 line height. Instrumentation and metadata retain smaller sizes.
- Homepage capability columns, icon offsets and belief/copy panels lacked balance. Their padding, heading proportions and alignment are corrected without changing markup.
- Metallic gradients covered too many content surfaces. Reading panels now use quieter mist backgrounds; chrome remains on optical/product simulation frames, with a shared restrained shadow.
- Partner CTA hover had insufficient contrast after the surface correction. The hover now uses silver with ink text. Focus colors distinguish light surfaces and dark sections while retaining existing focus geometry.
- Technology flow used a two-column outer grid and icon/text inner grid simultaneously on small screens. It now uses a single outer column on phones and a shrinkable text column, eliminating overflow at 320px.

## System

`src/styles/visual-quality.css` defines primitive `--sv-*` colors; semantic surfaces, text, links, gutters and spacing; component panel roles and compatibility aliases. Pink and blue are accents; darker related shades are used for small text. Existing fonts, images, content, components, routes, JavaScript logic, keyframes, hover transforms and timing are retained. No dependencies were added.

## Validation

- Production TypeScript/Vite build.
- 11-route content snapshot comparison: identical text, section order, link destinations and image references.
- Desktop/mobile screenshots of all routes; direct visual review of homepage, partner mobile, technology flow mobile and policy hero.
- 33 opaque button/palette contrast checks, including normal and hover states. This samples actual styles; it is not a complete WCAG conformance audit.
- 11 routes at 320, 375, 768, 1024 and 844px landscape: no horizontal document overflow and visible primary headings.
- Identical computed animation/transition declarations on the same DOM with the quality stylesheet enabled/disabled.
- Existing site and language tests: 11 bilingual routes, 41 internal links, responsive menus, product anchor, language persistence, draft/download, search, dialog/chat.
- Hero checks: five mouse/touch selections, keyboard arrows/Home/End, confined pointer illumination and reduced motion.
- Simulation controls: region visibility, pause/resume, scenario reset and reduced motion.

The navigation snapshot initially showed four transition differences on product headings. Inspection traced these to the existing viewport-dependent SiteMotion class assignment following changed text dimensions. The same-DOM stylesheet comparison confirms this pass does not change motion declarations. Reveal positions naturally follow the corrected layout.

## Changed source files

1. `src/main.tsx`: imports the quality stylesheet; application logic unchanged.
2. `src/styles/visual-quality.css`: visual repairs and responsive tokens.
3. `tests/visual-quality-check.mjs`: responsive and motion-preservation verification.
4. `docs/visual-quality-audit.md`: this report.

## Reversal and limitations

Remove the new stylesheet import and stylesheet to reverse this pass. The exact pre-pass main entry was verified against the earlier source checkpoint and included in `test-results/quality-checkpoint-20261017-104109/runtime-source.zip`, with the rest of the current runtime source. The archive excludes the newly added quality stylesheet.

Browser checks use installed Chrome through existing Playwright tooling. No physical-device, Safari/Firefox, manual screen-reader or comprehensive contrast audit was performed. Existing backend integrations were not exercised against live services. Historical theme rules remain for compatibility; this pass does not attempt a risky deletion of legacy selectors or interaction styles.
