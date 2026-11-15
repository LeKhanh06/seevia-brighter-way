# Digital Rose & Cyan ? visual-only review

## Scope

Only production CSS changed in this revision. Existing content, translations, JSX/TypeScript/JavaScript, navigation, APIs, image references and assets match the pre-edit checkpoint. No packages were installed. Existing section structure and layout rules were retained.

## Palette and visual roles

- Signature Pink #F53686: hero and collaboration CTAs, belief panel, static accents.
- Electric Sky #16B8F3: experience color block and static depth.
- Cloud White #F7FAFF and Ice Blue #DDF3FF: reading surfaces and inverse text.
- Deep Ocean #122B49: structural contrast, header, dark sections and footer.
- Soft Amber #FFCB68: limited simulation accent through legacy token aliases.
- Contrast companions: #071626 for small text on pink, #A91858 for small rose text on white. Exact signature pink with white or Ocean does not pass 4.5:1 for normal text.

## Preservation evidence

- A pre-edit ZIP and SHA-256 manifest include existing user changes.
- Original animation/transition declarations, keyframes and interaction-state rules were compared against the ZIP and remain unchanged.
- One static two-tone focus treatment was added to the existing focus-visible state for visibility on contrasting surfaces.
- All non-CSS files from the checkpoint retain their original hashes. New verification scripts and this report are outside the website runtime.
- DOM checks confirm identical text, section order, image references and links on 11 routes. Four sampled product reveal transition differences were observed between asynchronous runtime snapshots; the corresponding CSS and all reveal trigger code are unchanged. Source preservation checks provide the deterministic motion comparison.

## Validation

Production build passed. Existing checks passed for 11 routes at desktop/mobile sizes, internal links, hero pointer tracking after scroll/resize, keyboard/menu/Escape, reduced motion, simulation controls, VI/EN, draft preservation, community filters and news dialogs/search. Screenshots of all 11 routes at 1440 and 390 pixels were inspected selectively, including full-page homepage views. Seven selected contrast combinations passed their normal/large-text thresholds.

## Limits

This is not a complete WCAG 2.2 AA certification or a manual screen-reader audit. Existing moving effects and hover definitions were intentionally retained. Contrast checks cover selected rendered text/surface pairings; transparent/gradient surfaces use conservative palette endpoint references. No content or functionality fixes were attempted.

## Changed production files

- `src/components/Header.css`
- `src/components/SiteInformation.css`
- `src/styles/global.css`
- `src/styles/iris-theme.css`
- `HomePage/styles/about.css`
- `HomePage/styles/ai-photos.css`
- `HomePage/styles/capabilities.css`
- `HomePage/styles/experience.css`
- `HomePage/styles/hero-effects.css`
- `HomePage/styles/hero-polish.css`
- `HomePage/styles/Home.css`
- `HomePage/styles/partnership.css`
- `HomePage/styles/product-design.css`
- `ProductPage/styles/Product.css`
- `TechnologyPage/styles/Technology.css`
- `TechnologyPage/styles/TechnologyLayout.css`
- `AboutPage/styles/About.css`
- `CommunityPage/styles/Community.css`
- `NewsPage/styles/News.css`
- `PartnerPage/Partner.css`
- `ContactPage/Contact.css`
- `PolicyPage/Policy.css`

## Reversible checkpoint

`D:\SeeVia\test-results\digital-rose-checkpoint-20261017-010109\source.zip`

Restore only the CSS files listed above from the ZIP when rolling back this revision; this avoids overwriting later unrelated work. The checkpoint contains the previous user changes, not just the Git HEAD state.
