---
name: SeeVia
description: A guided walkway of tactile paving for a Vietnamese visual-assistant glasses project, built for low-vision readers.
colors:
  ink: "#151515"
  ink-soft: "#3b3830"
  lemon: "#ffd400"
  lemon-deep: "#e3bb00"
  lemon-shade: "#c9a500"
  dome-glint: "#fff3a8"
  cream: "#fff8d6"
  cream-deep: "#f6edc2"
  paper: "#ffffff"
  joint: "rgb(21 21 21 / 7%)"
  line: "rgb(21 21 21 / 18%)"
typography:
  display:
    fontFamily: "Nunito, Be Vietnam Pro, Arial, sans-serif"
    fontSize: "clamp(52px, 7.4vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  display-inner:
    fontFamily: "Nunito, Be Vietnam Pro, Arial, sans-serif"
    fontSize: "clamp(44px, 5.6vw, 92px)"
    fontWeight: 900
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Nunito, Be Vietnam Pro, Arial, sans-serif"
    fontSize: "clamp(32px, 3.8vw, 56px)"
    fontWeight: 900
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Nunito, Be Vietnam Pro, Arial, sans-serif"
    fontSize: "clamp(22px, 2vw, 30px)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  lede:
    fontFamily: "Be Vietnam Pro, Arial, Helvetica, sans-serif"
    fontSize: "clamp(19px, 1.5vw, 22px)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Be Vietnam Pro, Arial, Helvetica, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.65
  note:
    fontFamily: "Be Vietnam Pro, Arial, Helvetica, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Nunito, Be Vietnam Pro, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: 1.3
  button:
    fontFamily: "Nunito, Be Vietnam Pro, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "0"
rounded:
  tile-sm: "6px"
  tile: "8px"
  field: "12px"
  bubble: "14px"
  slab: "20px"
  cell: "28px"
  pill: "999px"
spacing:
  strip: "64px"
  strip-mobile: "14px"
  tile: "96px"
  gutter: "clamp(20px, 5vw, 88px)"
  section: "clamp(64px, 8vw, 120px)"
  measure: "1240px"
  slab-row: "22px clamp(18px, 3vw, 36px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.lemon}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.lemon}"
    textColor: "{colors.ink}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
    height: "52px"
  button-outline-hover:
    backgroundColor: "{colors.lemon}"
    textColor: "{colors.ink}"
  nav-item:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  nav-item-current:
    backgroundColor: "{colors.lemon}"
    textColor: "{colors.ink}"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
  tab-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.lemon}"
    rounded: "{rounded.pill}"
    height: "48px"
  slab-walk:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.slab}"
    padding: "{spacing.slab-row}"
  slab-walk-current:
    backgroundColor: "{colors.lemon}"
    textColor: "{colors.ink}"
  tile:
    backgroundColor: "{colors.lemon}"
    rounded: "{rounded.tile}"
    size: "52px"
---

# Design System: SeeVia

## Overview

**Creative North Star: "The Guided Walkway"**

The site is laid like the tactile paving at a Vietnamese crosswalk. A lemon guidance strip runs down the left edge of every page; the page itself is cream pavement with faint square joints at a 96px tile pitch; content sits on flush slabs edged with 3px ink outlines and separated by joints. The two tile textures carry meaning everywhere they appear: dome tiles say *stop and look* (the current thing, the thing available now), rib tiles say *keep going* (passed, in progress, future direction). Type is ink, heavy and round; nothing glows.

The world is built for low-vision readers first. Contrast is high by construction (ink on cream, ink on lemon, lemon on ink), body text is 18px, headings are 900-weight rounded sans, and emphasis is a highlighter stroke rather than italic or colour. Density is calm: one idea per slab, generous section padding, long rows instead of grids of small cards.

The signature is the logo's six-dot braille cell (letter S, dots 2, 3, 4; dot 4 is also the pupil), rendered as tactile domes on a lemon plate in the home opening, and the same dome/rib vocabulary scaled down into section-rail stops, step markers and row tiles. It rejects the dark, glowing "AI glasses" hero and the icon-card feature grid.

**Key Characteristics:**
- Cream pavement ground with 1px joints at 96px tile pitch.
- A fixed lemon guidance strip (64px; 14px on mobile) that doubles as the section rail.
- Dome = stop and look; rib = keep going. Applied consistently to tiles, steps and rail stops.
- Flush slabs with 3px ink outlines, divided by 2px joints, never floating cards.
- Nunito 800/900 for every heading and control; Be Vietnam Pro 18px for reading.
- Ink pill buttons with lemon text; monoline icons with round caps.

## Colors

A two-colour signage palette (ink and lemon) laid on warm cream pavement, with three lemon shades that exist only to model raised tiles.

### Primary
- **Guidance Lemon** (lemon): the strip, the tiles, lemon slabs, the current nav item, the current walk row, the heading highlighter on cream, and text on ink slabs and ink buttons.
- **Tile Relief** (lemon-deep, lemon-shade, dome-glint): the body, shadow edge and top-left glint of raised domes and ribs. Material only; never used for text or flat fills.

### Neutral
- **Signage Ink** (ink): all headings and body text, every outline and slab edge, primary buttons, ink slabs (closing section, footer), focus outline.
- **Worn Ink** (ink-soft): secondary notes, captions, figcaptions and inactive language toggles. Still AA on cream, lemon and paper; never for headings.
- **Pavement Cream** (cream): the page ground and opening sections; text on ink slabs.
- **Deep Cream** (cream-deep): hover wash on nav items, scrollbar track.
- **Paper** (paper): reading slabs (walk lists, statements, community, chat panels), input fields, and the highlighter under headings that sit on lemon slabs.
- **Joint** (joint) and **Line** (line): the pavement joint pattern, and the 2px joints between rows inside a slab.

### Named Rules
**The Signage Pair Rule.** Text is ink on cream, paper or lemon, or lemon/cream on ink. No other text pairing; no lemon text on light grounds.

**The Highlighter Rule.** Emphasis inside a heading is a highlighter band (58% to 92% of the line): lemon on cream and paper, paper on lemon slabs, plain lemon text with no band on ink slabs. Emphasis in body copy is weight 700, no band.

**The Relief-Only Rule.** lemon-deep, lemon-shade and dome-glint model tile relief and nothing else.

## Typography

**Display Font:** Nunito 700/800/900 (with Be Vietnam Pro, Arial)
**Body Font:** Be Vietnam Pro 400/500/600/700 (with Arial, Helvetica)

Both load latin and vietnamese subsets; every family must render full Vietnamese diacritics.

**Character:** Nunito's round terminals echo the logo's round-cap strokes and the domes; heavy weights make headings readable at a distance. Be Vietnam Pro is a sturdy, wide-aperture reading face drawn for Vietnamese.

### Hierarchy
- **Display** (900, clamp(52px, 7.4vw, 6rem), 0.98): home opening h1 only. Inner-page openings use **display-inner** (900, clamp(44px, 5.6vw, 92px), 1.02).
- **Headline** (900, clamp(32px, 3.8vw, 56px), 1.08): section h2. Statement sections may push to clamp(38-40px, 5-5.2vw, 76-80px) at 1.02.
- **Title** (800, clamp(22px, 2vw, 30px), 1.2): h3 and walk-row names. Headings use text-wrap: balance.
- **Lede** (400, clamp(19px, 1.5vw, 22px), 1.55): the paragraph after an opening h1, max 34-52ch.
- **Body** (400, 18px desktop / 17px mobile, 1.65): all reading copy, roughly 40-56ch.
- **Note** (400, 15px, 1.5, ink-soft): disclaimers, figcaptions, form hints.
- **Label** (Nunito 800, 16-18px, 1.3): nav, form labels, legends, tab and scenario buttons, the walk legend.
- **Button** (Nunito 900, 19px, letter-spacing 0).

### Named Rules
**The Upright Rule.** Nothing is italic, anywhere: em, blockquote, cite and quote classes are forced upright.

**The One Display Voice Rule.** h1 and h2 are always 900, h3 always 800, always Nunito, always ink (or lemon/cream on ink slabs).

**The Wordmark Rule.** "SeeVia" as a mark is never typeset; it is always the official hand-drawn wordmark from the logo files.

## Layout

A fixed guidance strip occupies the left 64px of the viewport; all page content is offset by it. Sections run full width as horizontal bands, padded clamp(64px, 8vw, 120px) vertically and clamp(20px, 5vw, 88px) horizontally, with inner content capped at a 1240px measure. Openings fill roughly the first viewport (home: calc(100svh - 84px)).

Sections are mostly two-column asymmetric grids (1.25fr/0.75fr, 1.1fr/0.9fr, 1fr/1fr) with gaps of clamp(32px, 5-6vw, 80-96px). Lists of capabilities, moments and technology are **walks**: one bordered slab holding full-width rows (tile column, title column, description column) separated by 2px joints, not grids of cards. Steps are adjoining cells inside one slab sharing 3px ink joints.

Breakpoints: 1000px collapses home section grids to one column; 900px collapses overview and product grids; 760px narrows the strip to a 14px edge band of small domes, hides the rail stops, and drops the header to 68px; 560px tightens gutters to 18px and stacks the ask-bar.

## Elevation & Depth

The system is flat. Depth is expressed as relief on the tiles themselves (inset shade edges and a glint on domes and ribs), never as a lifted surface. Content blocks carry no shadow. Soft ambient shadows appear only on true overlays that genuinely sit above the page.

### Shadow Vocabulary
- **Drawer cast** (`box-shadow: -18px 0 40px rgb(21 21 21 / 22%)`): the lemon menu drawer.
- **Assistant launcher** (`box-shadow: 0 8px 20px rgb(21 21 21 / 25%)`) and **assistant panel** (`box-shadow: 0 24px 60px rgb(21 21 21 / 30%)`): the floating SeeVia AI widget.
- **Tile relief** (`box-shadow: inset 0 -3px 0 var(--lemon-shade), 0 0 0 2.5px var(--ink)`): dome stops; the raised braille cell domes add a soft drop (`0 10px 18px rgb(21 21 21 / 28%)`).
- **Lemon halo** (`box-shadow: 0 0 0 7px var(--lemon)` around a `3px solid` ink outline, offset 3px): the focus ring and selected states.

### Named Rules
**The Flush Paving Rule.** Articles, figures, cards and panels in page content sit flush on the pavement with no shadow. Only overlays (drawer, assistant widget) cast shadows.

## Shapes

Every surface is outlined in ink: 3px for slabs, sections, header, strip and buttons; 2.5px for tiles, fields, tabs and inner controls; 2px for bubbles and row joints. Corners are softly rounded and nest from small to large: tiles 8px (6px when small), fields 12px, speech and chat bubbles 14px, slabs, photos and walks 20-24px, the braille-cell plate 28px, buttons, nav items, tabs and the ask-bar as full pills. Rail stops and the menu toggle are circles. Placeholders for not-yet-existing product imagery use a 3px dashed ink border on cream, an honest "not built yet" signal.

Icons are monoline, round caps and joins, currentColor: 2.6 stroke on a 32 grid for capability icons, 3 stroke on a 24 grid for the arrow, matching the logo's round-cap wordmark.

## Components

### Buttons
Confident ink pills that flip to lemon.
- **Shape:** full pill (999px), 3px ink border, min height 52px.
- **Primary:** ink fill, lemon text, Nunito 900 19px, padding 12px 28px; optional monoline arrow at 18px.
- **Hover / Active:** fill turns lemon, text ink (0.18s ease); active nudges down 1px.
- **Outline:** transparent fill, ink text and border; hover fills lemon.
- **Light:** lemon fill, ink text, for use on ink grounds.

### Chips / Tabs
- **Style:** paper fill, 2.5px ink border, Nunito 800 17px, pill, min height 48px.
- **State:** selected tabs invert to ink with lemon text; pressed scenario buttons fill lemon. Status badges are small ink or lemon pills in Nunito 900 14px.

### Cards / Containers (Slabs)
- **Corner Style:** 20px on the outer slab; rows inside are square.
- **Background:** paper or cream rows; the current/available row is lemon.
- **Shadow Strategy:** none (see The Flush Paving Rule).
- **Border:** 3px ink outer edge; 2px line joints between rows; 3px ink joints between step cells.
- **Internal Padding:** 22px clamp(18px, 3vw, 36px) per row; clamp(24px, 3vw, 44px) for step cells.
- **Section slabs:** full-width bands in cream (openings carry the pavement joints), paper, lemon or ink, bordered top and bottom with 3px ink. Ink slabs are rare: the closing call and the footer.

### Inputs / Fields
- **Style:** paper fill, 2.5px ink border, 12px radius, Be Vietnam Pro 17px, placeholder in a warm grey that holds AA.
- **Focus:** 3px ink outline offset 3px plus a 7px lemon halo. The home ask-bar is a pill holding the input and an ink button; it shows a 6px lemon halo on focus-within.

### Navigation
- **Header:** cream, 84px tall (68px mobile), 3px ink bottom edge, ink logo at 156px. Nav items are Nunito 800 17px pills; hover washes deep cream; current page is a lemon pill with a 2.5px inset ink ring. Language toggles: current is lemon.
- **Menu toggle:** 48px ink-outlined circle, three 3px rounded bars; hover lemon.
- **Drawer:** a lemon guidance panel with a 3px ink left edge, a rib band along its foot, Nunito 800 26px links on 2px joints; the current link is underlined 3px.
- **Footer:** ink slab topped by a 22px rib band; lemon logo and column headings, cream links that turn lemon and underline on hover.

### Guidance Strip and Section Rail (signature)
A fixed 64px lemon column with a 3px ink right edge. Above the rail it shows domes, below it ribs. The rail lists one stop per top-level section: **passed** stops are small rib tiles, the **current** stop is an inked dome with a cream glint ringed by lemon and ink, **upcoming** stops are plain lemon domes. Stops are 44px hit targets, scale to 1.12 on hover, and scroll smoothly unless reduced motion is requested. On mobile the strip becomes a 14px band of small domes with no stops.

### Tactile Tiles
Square lemon tiles with a 2.5px inset ink ring and 8px corners, in two textures: **dome** (a 13px grid of raised dots) and **rib** (vertical bars). Sizes: 52px in walk rows and steps, 30px in legends, 26px in scenario buttons. In step sequences ribs mark stages in motion and a dome (inked dots) marks where the journey stops or the current step.

### Braille Cell (signature)
The logo cell built as tactile domes on a lemon plate (3px ink border, 28px radius): dots 2, 3, 4 raised in ink, dot 4 enlarged as the pupil with a cream glint, the empty positions as small lemon domes. Domes rise in sequence on load (0.7s, cubic-bezier(0.16, 1, 0.3, 1), staggered 0.16s) and the glint pops last; both are disabled under reduced motion.

### Assistant Widget
A 68px lemon circular launcher with a 3px ink edge (hover inverts to ink); the panel is cream with a 3px ink border, an ink header, paper assistant bubbles and ink user bubbles with lemon text.

## Do's and Don'ts

### Do:
- **Do** set every heading in Nunito 900 (h3 800) and ink; keep body copy at 18px Be Vietnam Pro, 1.65 line height.
- **Do** use dome tiles for "stop and look / available now" and rib tiles for "keep going / passed / later", and never swap them.
- **Do** group related items as rows in one 3px-outlined slab separated by 2px joints.
- **Do** emphasise heading words with the highlighter band: lemon on cream and paper, paper on lemon, lemon text on ink.
- **Do** use the ink logo on cream, paper and lemon, and the lemon (or white) logo on ink; use the official SVG paths verbatim.
- **Do** keep the 3px ink outline plus lemon halo focus ring on every interactive element, and 44px minimum targets.
- **Do** draw icons and illustrations as monoline strokes with round caps and joins in currentColor.

### Don't:
- **Don't** place the lemon logo (or any lemon text) on white, cream or other light grounds.
- **Don't** retype "SeeVia" in Nunito, Be Vietnam Pro or any other font; use the wordmark file.
- **Don't** use italics anywhere, including quotes and emphasis.
- **Don't** set headings in ink-soft or any colour other than ink (lemon and cream only on ink slabs).
- **Don't** float content blocks with shadows; shadows belong only to the drawer and the assistant widget.
- **Don't** build a dark, glowing "AI glasses" hero or an icon-card feature grid.
- **Don't** use lemon-deep, lemon-shade or the dome glint as text or flat fill colours.
