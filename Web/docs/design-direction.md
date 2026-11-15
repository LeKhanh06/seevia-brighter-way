# SeeVia — Iris + Neo Lime

## Current design direction

Use the supplied seven-color palette exactly: Pearl White #F7F6FC, Soft Lavender #E4DEFA, Iris Purple #5A42AD, Digital Violet #A48BEE, Midnight Ink #22243D, Neo Lime #CFFF4D and Soft Tech Lime #D9F96B. Pearl/lavender provide reading surfaces, midnight anchors contrast, iris is the identity, violet provides sensory light, and lime is reserved for selected actions and simulation states.

## System and typography

src/styles/iris-theme.css defines primitive, semantic and component roles. Existing page CSS retains its gradient composition and behavior with migrated palette colors. Be Vietnam Pro handles navigation, body text and product headings. Lora gives human stories and selected hero language an editorial voice. System monospace identifies simulation controls and numbered instrumentation. All fonts are local or system fallbacks; no remote font service was added.

## Simulations

The homepage simulation retains its keyboard tabs and scripted responses. Its visual frame now includes scene numbering, region visibility and scan pause/resume controls with aria-pressed states. Switching scenes resets the visual controls. The technology conversation retains all original scripted steps and follow-up actions; its header, selected scenarios, processing indicators and answer surfaces use the shared system. Labels continue to identify simulations rather than live AI results.

Pointer lighting, radial/linear gradients, scan motion, radar and reduced-motion behavior remain functional. No physical glasses model or unverified capability was introduced. The empty glasses stage is reduced in height and still explicitly awaits imagery.

## Verification

Production build, 11 routes, responsive overflow, internal links, keyboard navigation, hero pointer interactions, VI/EN, drafts and conversation checks passed. New simulation controls pass region visibility, pause/resume, scene-reset and reduced-motion checks. Seven key palette combinations range from 6.29:1 to 14.08:1; this is not a full WCAG audit. Full-page screenshots at 1440, 820 and 390 pixels were reviewed. Existing photo/illustration colors and the physical burgundy glasses swatch remain accurate to the source assets.


## Current trial: Hyper Pink Sky

The new user reference supersedes Iris + Lime: Hyper Pink #E72B88, Electric Sky #38BDF8, Cloud White #F7FAFF, Deep Navy #14213D, Acid Lime #B5F44A and Soft Blush #F7C6DE. Pink is the primary action, sky illuminates simulations, lime remains for scan regions. Body links use a deeper pink #B51765 for contrast. Bright pink buttons use #090B12 text (4.77:1), as navy text did not meet AA normal-text contrast on that fill. Story typography, all gradients, pointer tracking and simulation controls are retained. Full-page responsive screenshots were reviewed; route, hero and simulation control checks passed.


## Current: SeeVia Design System

Colours follow the SeeVia Design System. Brand kit: Frozen Water #D9FCED, Electric Sapphire #405FFA (action colour), Strong Cyan #09BBC8, Twilight Indigo #3B3664, Evergreen #07240F, White. Iris #8B6CFF and Lilac #E7E0FF come from the logo tail. Page background is pearl #F6F8FF. Neutrals are Twilight-Indigo-tinted ink: ink-700 #3B3664 body text, ink-800 #292650 headings and the dusk dark ground, ink-600 #514E75 muted text, ink-200 #D6D5E6 hairlines. Every other colour in the stylesheets is a step of the sapphire, cyan, iris, mint or ink scales (see src/styles/iridescent-theme.css for the primitives). Dark chapters keep their layout and use the dusk indigo with sapphire glows. The burgundy swatch in the product colour picker stays #7A1823 because it shows the real frame colour; public/the-seevia-pearl.html is a standalone page and keeps its own palette.
All colours are defined once in src/styles/tokens.css, grouped like the design system board: brand kit, ink neutrals, sapphire/cyan/iris/mint scales, pillar colours, status, surfaces, gradients and glass. Stylesheets use var(--token) for solid colours; translucent tints are still written as 8-digit hex of a token value.
