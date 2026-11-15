# SeeVia ? Prism Atelier visual system

## Identity

Experimental creative studio, optical art and editorial luxury, expressed through light surfaces, precise interface details and human storytelling. This palette supersedes Digital Rose & Cyan. Website content, structure, assets and functionality are preserved.

## Primitive palette

| Color | Value | Role |
| --- | --- | --- |
| Ivory Light | #FCFAF4 | Predominant reading surface and negative space |
| Prism Pink | #E94B87 | Statement panels and signature detail |
| Electric Periwinkle | #6B7CFF | Distinctive color blocking and optical depth |
| Sky Aura | #8ED8FF | Light fields and supporting surfaces |
| Soft Lime Glow | #DDF36A | Limited CTA and simulation accent |
| Deep Plum Ink | #3E3558 | Main text, outlines, contrast and device frames |

Contrast companions are #21172F for normal-sized text on pink/periwinkle, #9C2350 for small rose text on ivory and #60566D for muted body text. Normal-sized plum/white text on pure periwinkle does not meet 4.5:1; use the stronger ink. Lime is a fill/accent, never body text on ivory.

## Token architecture

The primitive variables in src/styles/iris-theme.css feed semantic --brand-* roles and component tokens for buttons and simulation surfaces. Compatibility aliases preserve existing page implementations. Palette migrations in page CSS change static colors only. Original keyframes, transitions, animation timings and interaction-state declarations remain intact.

## Typography and optical language

Retain local Be Vietnam Pro for interface clarity, Lora for selected narrative statements and system monospace for simulation instrumentation. Pair open ivory space with a single decisive color field. Preserve existing radial/linear gradients and restrained rings; avoid adding arbitrary glows or animated layers. Keep original logos, images and product assets unchanged.

## Cross-medium application

| Medium | Application |
| --- | --- |
| Website | Ivory reading field; sky experience section; pink story panel; periwinkle collaboration section; plum header/footer and simulation frames |
| Posters | Ivory field, plum headline, one pink or periwinkle block; lime only for a small action or date marker |
| Slides | Ivory default, plum charts/labels, pink/periwinkle series with direct labels; lime used sparingly for emphasis |
| Device presentation | Use these roles in concept boards, packaging layouts and interface annotations; do not recolor supplied glasses assets or imply an available physical model |
| Visual identity | Preserve approved logo proportions and source colors; place white logo on plum; use the same text/gradient pairings across media |

For print, use the printer's ICC profile and proof the bright periwinkle/lime; no unverified CMYK, Pantone or material specification is assigned.

## Preservation and verification

A source ZIP and SHA-256 manifest were created before editing. Only production CSS changed. All pre-existing non-CSS source and assets retain their hashes. Original motion declarations, keyframes and state rules match the checkpoint. Automated checks passed for 11 routes, responsive layouts, internal links, keyboard/pointer interactions, simulation controls, reduced motion and VI/EN. Desktop/mobile screenshots of eight pages were captured and selected views reviewed. Palette pairings tested from 4.74:1 to 10.85:1; this is not a complete WCAG or manual screen-reader audit.
