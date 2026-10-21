---
name: Portfolio
description: A One Piece poneglyph portfolio set in a deep-sea ancient relic world of carved stone slabs and luminous cyan glyphs.
colors:
  primary: "#00d4ff"
  abyss-900: "#04202e"
  abyss-800: "#062e44"
  ocean-900: "#0c4a6e"
  ocean-700: "#0369a1"
  ocean-100: "#e0f2fe"
  cyber-400: "#00d4ff"
  stone-face-hi: "#3b4a5c"
  stone-face-mid: "#27333f"
  stone-text: "#d4dde6"
  white: "#ffffff"
  glyph-ice: "#d5f8ff"
  glyph-glow: "#b8f4ff"
  ocean-hover: "#0376b3"
  status-dev: "#854d0e"
  status-dev-text: "#fef9c3"
  status-complete: "#166534"
  status-complete-text: "#dcfce7"
typography:
  display:
    fontFamily: "Young Serif, Iowan Old Style, Georgia, serif"
    fontSize: "3.5rem"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Young Serif, Iowan Old Style, Georgia, serif"
    fontSize: "2.75rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  display-compact:
    fontFamily: "Young Serif, Iowan Old Style, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline-compact:
    fontFamily: "Young Serif, Iowan Old Style, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "DM Sans, Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
  caption:
    fontFamily: "monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "Young Serif, Iowan Old Style, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "DM Sans, Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.7
  button:
    fontFamily: "DM Sans, Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    letterSpacing: "0.01em"
  label:
    fontFamily: "DM Sans, Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  card: "0.875rem"
  xs: "0.25rem"
  slab: "1.25rem"
  pip: "0.4rem"
  pill: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.5rem"
  lg: "2rem"
  xl: "3rem"
components:
  slab:
    backgroundColor: "{colors.stone-face-mid}"
    textColor: "{colors.white}"
    rounded: "{rounded.slab}"
    padding: "{spacing.xl}"
  card:
    backgroundColor: "{colors.stone-face-mid}"
    textColor: "{colors.stone-text}"
    rounded: "{rounded.card}"
    padding: "{spacing.md}"
  card-hover:
    backgroundColor: "{colors.stone-face-hi}"
    textColor: "{colors.white}"
  button-primary:
    backgroundColor: "{colors.ocean-700}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0.75rem 2rem"
  button-primary-hover:
    backgroundColor: "{colors.ocean-hover}"
    textColor: "{colors.white}"
  button-outline-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ocean-900}"
  button-outline:
    backgroundColor: "{colors.abyss-900}"
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0.75rem 2rem"
  tech-tag:
    backgroundColor: "{colors.abyss-800}"
    textColor: "{colors.ocean-100}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.125rem 0.5rem"
  nav-panel:
    backgroundColor: "{colors.abyss-900}"
    textColor: "{colors.white}"
    rounded: "{rounded.slab}"
    padding: "1.1rem 0.9rem"
  nav-pip-inactive:
    backgroundColor: "{colors.stone-face-hi}"
    rounded: "{rounded.pip}"
    size: "1.25rem"
  nav-pip-active:
    backgroundColor: "{colors.cyber-400}"
    rounded: "{rounded.pip}"
    size: "1.25rem"
  nav-pip-active-highlight:
    backgroundColor: "{colors.glyph-glow}"
    rounded: "{rounded.pill}"
  status-badge-dev:
    backgroundColor: "{colors.status-dev}"
    textColor: "{colors.status-dev-text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.125rem 0.5rem"
  status-badge-complete:
    backgroundColor: "{colors.status-complete}"
    textColor: "{colors.status-complete-text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.125rem 0.5rem"
  project-group-title:
    textColor: "{colors.primary}"
    typography: "{typography.lead}"
  contact-heading:
    textColor: "{colors.white}"
    typography: "{typography.lead}"
  decoder-item:
    backgroundColor: "{colors.abyss-900}"
    textColor: "{colors.stone-text}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
  webgl-notice:
    backgroundColor: "{colors.abyss-900}"
    textColor: "{colors.glyph-ice}"
    typography: "{typography.label}"
    rounded: "{rounded.card}"
    padding: "0.9rem 1rem"
  decode-hint:
    backgroundColor: "{colors.abyss-900}"
    textColor: "{colors.glyph-ice}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 1.25rem"
---

# Design System: Portfolio

## Overview

**Creative North Star: "Deep-sea ancient relic"**

A poneglyph rests on the ocean floor: heavy carved stone, lit from above by dim water, with cyan glyphs that glow as if they emit light. The voice is calm. Nothing shouts; surfaces are weighty, edges are lit softly, and the only saturated color is the cyan of the glyphs. Depth comes from light and layered elevation, never from decoration.

The page is a dark ocean field (abyss blues fading to a cyan halo at the top) holding stone slabs and cards. Display type is a warm serif that reads as inscription; body type is a neutral sans. A WebGL layer draws the slabs as lit stone with real thickness, the glyph decode as a ripple of flipping cells, and the helix as luminous 3D glyphs. It is always optional: without hardware WebGL the page keeps a CSS 3D look and says so.

**Key Characteristics:**
- Ocean/abyss blue field, stone-grey slabs, cyber-cyan accent used for glyphs, glow, active state and headings.
- Soft layered elevation: lit top edge, dark bottom edge, deep diffuse drop shadow, cyan glow on hover.
- Carved-stone slabs and cards with an inset inner border.
- Diamond rune-stone nav pips.
- Depth is real: a Three.js layer lights thick stone slabs; pointer effects stay off on touch and under reduced motion, and visitors without hardware WebGL get a CSS 3D fallback plus a notice.

## Colors

A cold, saturated-at-one-point palette: deep sea blues and weathered stone greys carry the surface, one electric cyan carries the light.

### Primary
- **Cyber Cyan** (primary, cyber-400): The light source. Section headings, active nav pip, glyph glow, project group titles, hover glow and focus outline.
- **Glyph Halo** (#d5f8ff): Near-white cyan for the hero title only, so the first heading glows brighter than section headings.

### Secondary
- **Ocean Blue** (ocean-900, ocean-700): The legacy field gradient (#0c4a6e to #0369a1) in main.css and the ocean-800 to ocean-700 primary button gradient, dark enough for white labels at 4.5:1. Ocean-100 is the text color of tech tags.
- **Abyss Blue** (abyss-900, abyss-800): The deepest water. Page background gradient, nav panel tint (60% alpha) and track of tags.

### Neutral
- **Carved Stone** (stone-face-hi, stone-face-mid, and #1d2731): The three stops of the 160-degree stone gradient on slabs and cards. A soft white radial highlight sits at the upper left.
- **Stone Text** (stone-text): Long descriptive copy on stone and ocean.
- **White** (white): Default body text color on dark surfaces.

### Named Rules
**The Light Source Rule.** Cyan is emitted light, never a flat fill for large areas. It appears as text, glow, thin borders (12 to 35% alpha) and small active marks.

**The Solid Heading Rule.** Headings are solid colors with a soft drop-shadow glow. Gradient-clipped text is retired.

## Typography

**Display Font:** Young Serif (with Iowan Old Style, Georgia, serif)
**Body Font:** DM Sans (with Inter, system-ui, sans-serif)

**Character:** Young Serif is an inscribed, slightly chiseled serif that suits the stone world; DM Sans stays quiet beside it. Young Serif ships a single weight, so display type is always 400 and never synthesized bold.

### Hierarchy
- **Display** (400, clamp(2.25rem, 4vw + 1rem, 3.5rem), 1.05; token holds the maximum): Hero title in glyph-halo with 20px cyan glow.
- **Headline** (400, clamp(1.875rem, 3vw + 1rem, 2.75rem), 1.2; token holds the maximum): Section headers and the alphabet title in Cyber Cyan with 18px glow.
- **Title** (400, 1.25rem): Project, experience and card titles in Young Serif.
- **Group title** (DM Sans 700, 1.5rem, 1.3; the `lead` token): Project group labels `Professional`, `Tools for Myself` and `Side Projects` in Cyber Cyan over a 1px cyan rule at 25% alpha.
- **Body** (400, 1.125rem, 1.7): Descriptions in stone-text. Intro copy is capped near 42rem.
- **Button** (600, 1rem, 0.01em): Buttons in DM Sans.
- **Label** (400, 0.875rem): Tech tags, skill tags and metadata.

### Named Rules
**The Single Weight Rule.** Display faces stay at weight 400. Emphasis comes from size, color and glow, not bold.

## Layout

A vertical scroll of full-height poneglyph sections, each centering one stone slab (max width 800px, 3rem padding) in a 2rem side gutter. The exception is Historical Records and Log Pose, which each hold a cluster of 3 slabs. Sections are joined by glyph helix chains and 100vh transition spacers for the infinite loop; do not alter them. Wider content (alphabet, projects) uses containers up to 80rem. Spacing runs in half-rem steps: 0.5, 0.75, 1, 1.5, 2, 3rem.

A cluster is up to 1120px wide on a 10-column grid. The top slab spans columns 2 to 9 (8/10, centred) and the pair below spans 6 and 4 columns (3:2), with the left slab 6rem lower. Historical Records is the exception: it uses 20 tracks, with the left slab on tracks 1 to 9 and the right slab on tracks 10 to 19, so Studies steps out about 58px past the top slab's right edge, the left slab still 6rem lower. Gaps are 3rem between rows and 2rem between columns, and slab padding is 2rem from 768px. Below 768px the cluster is one column with the standard slab padding, and from 480px slab 2 is inset 1.25rem on its right and slab 3 on its left. The section heading sits inside slab 1 and each slab carries its own group title.

Responsive: breakpoints at 640px, 768px (type steps up) and 1024px (desktop layout, and the CSS hover tilt of the fallback). Under 768px the section gutter drops to 0.75rem, slab padding becomes 2rem 1.25rem, and the nav panel and pips shrink (pips 0.9rem).

## Elevation & Depth

Hybrid of layered shadow and light. Every raised surface carries three cues: a 1px lit top edge, a 1px dark bottom edge (both inset), and a deep soft drop shadow. Hover adds a cyan glow rather than a harder shadow.

### Shadow Vocabulary
- **Elevation 1** (`box-shadow: 0 1px 0 rgba(255,255,255,0.14) inset, 0 -1px 0 rgba(0,0,0,0.45) inset, 0 8px 20px rgba(2,16,28,0.35)`): Cards, experience items, primary button.
- **Elevation 2** (`box-shadow: 0 1px 0 rgba(255,255,255,0.14) inset, 0 -1px 0 rgba(0,0,0,0.45) inset, 0 18px 40px rgba(2,16,28,0.5), 0 2px 6px rgba(2,16,28,0.4)`): Slabs, nav panel, hovered cards.
- **Cyan Glow** (`box-shadow: 0 0 24px rgba(0,212,255,0.28)`): Added on hover to slabs, cards and buttons.

### 3D
Rust decides once at startup and publishes it as `data-render` on `<html>`. With hardware accelerated WebGL (`webgl`), `scene.js` loads the vendored Three.js and a fixed full-viewport canvas draws behind the content. The camera is orthographic in CSS pixels, so a mesh sized from a DOM rect lines up with it exactly, and the same rotation is written to the DOM block as `rotateX`, `rotateY` and `scale` with no CSS perspective.

- **Slabs:** rounded boxes 56px deep with a generated stone normal map, leaning back 5 degrees at rest so the lit lower lip shows, and 9 degrees more while entering (mirroring the old scroll-driven settle). The stone starts at the overlay grey (`#4a5568`) so dark glyph ink stays readable, and darkens to `#27333f` during the decode.
- **Decode:** each glyph cell turns edge-on about its own vertical axis with a cyan flash, starting at the tap point (0.04s per cell of distance, 0.6s per flip), then the content fades in. In a cluster one tap starts the 3 slabs at once from the tap point in page coordinates, so the wave crosses from stone to stone. The quote is split by words across the 3 grids with the author on the last, and the content of all 3 slabs fades in together when the last slab finishes. The Get in Touch button on the About slab is the one exception to the tap: once its smooth scroll brings the Final Poneglyph into the middle of the viewport, that slab decodes itself from its centre, so contact details need no tap. The request lapses after 4 seconds, and the nav dots, manual scrolling and the loop keep the tap.
- **Helix:** two instanced strands of 24 luminous glyphs per chain, swinging in depth (scale 0.45 to 1.15, orbit 10s), plus a straight tail of glyphs at each end (WebGL only).
- **Pointer:** a cyan-white point light follows the pointer. The nearest slab, measured to its edge, leans up to 4 degrees toward it (40px hysteresis between slabs) and cards drift by depth layer.

Without hardware WebGL (`dom`) the page keeps the CSS look: `perspective` 1600px on sections and 900px on the helix, `translateZ`, `rotateX` and `rotateY`, a hover tilt of about 2 degrees on pointer devices at 1024px and up, and a scroll-driven rotateX entrance where supported. `?webgl=off` forces this mode for comparison.

### Named Rules
**The Reduced Motion Rule.** Under `prefers-reduced-motion` the slabs stop tilting and scaling, the helix freezes, the decode fades in place instead of flipping, the light and parallax are removed, and the auto decode window becomes a whole-slab fade with no text mask. On touch the light and pointer tilt are off but the scroll entrance still runs.

**The One Projection Rule.** In WebGL mode the mesh and its DOM block share one orthographic rotation. Never add CSS `perspective` to a section while the canvas is on, or text and stone drift apart.

**The Lit Edge Rule.** Raised means a light top edge, dark bottom edge and soft deep shadow together; never a single hard offset shadow.

## Shapes

Soft-cornered stone. Slabs and the nav panel use 1.25rem, cards 0.875rem, buttons 0.75rem, small controls 0.5rem and tags are pills. Slabs carry a faint inner border inset 0.5rem (cyan at 12% alpha) with an inner shadow, reading as a carved frame. Nav pips are rotated squares (diamonds) with 0.4rem corners. Borders are hairline (1px) at 7 to 25% white or cyan.

## Components

### Slabs (Poneglyph block)
Carved stone panel. In WebGL mode the canvas draws it as lit stone with grain and a lower lip, and the DOM block is transparent and holds only content, hidden until decoded. In DOM mode it is a stone gradient face, 1px border at 8% white, 1.25rem radius, Elevation 2, inner carved frame, and a faint cyan underglow beneath its lower edge, with hover tilt and glow on pointer devices at 1024px and up. A cluster holds 3 such slabs, each with its own overlay and decode, released together.

### Cards
Skill, project and experience cards. Translucent stone gradient, 0.875rem radius, Elevation 1, 1.5rem padding. Hover on skill and project cards lifts 4px, shifts the border to cyan (35% alpha) and adds Elevation 2 plus glow. Skill cards hold a group name and its tech tags, with no bars or percentages. The four skill cards form a 2x2 grid at tablet and desktop widths and stack in one column on phones. A lone last skill or project card spans its row so no slot stays empty. Professional experience items list their facts as bullets with cyan markers and a small kind label (Work, Internship). Trainings and studies carry no label and no bullets, only one or two plain sentences. Project cards sit in a grid under each group title; a card for a public repo links its title (inherited color, cyan underline at 45% alpha, opens in a new tab).

### Buttons
- **Shape:** 0.75rem radius, 0.75rem by 2rem padding, DM Sans 1rem.
- **Primary:** ocean-blue gradient (ocean-800 to ocean-700) with white text and Elevation 1; hover lifts 2px and adds the cyan glow.
- **Outline:** transparent with cyan text and 2px cyan border; hover adds glow and fills solid cyan with ocean-900 text.

### Contact links
GitHub and LinkedIn are anchor tiles in abyss glass (18% cyan border, 0.75rem radius). There is no CV button, because LinkedIn is the CV. Both open in a new tab with `rel="noopener noreferrer"` and show a 2px cyan focus outline. There is no contact form.

### Tags and decode hint
The decode hint stays hidden until a slab has been in the middle of the viewport for 15 seconds, so visitors can discover the gate on their own, then fades in. It is a cyan-ringed abyss pill fixed near the bottom of the viewport (raised above the WebGL notice when that is shown), reading "Click the stone to decode it" with a pointer and "Tap the stone to decode it" on touch. In a cluster only slab 1 shows it. It pulses gently and stops pulsing under `prefers-reduced-motion`. Decoding itself runs at half duration under 768px and under reduced motion.

Tech tags are cyan-tinted pills (10% fill, 25% border, ocean-100 text). Skills render as groups of tech tags; there are no skill bars.

### Navigation
Fixed right-side panel: abyss tint at 60% alpha, 14px backdrop blur, cyan 25% border, 1.25rem radius, Elevation 2. Rune-stone diamond pips: inactive pips are grey stone gradients, the active pip is a bright cyan radial. Pips scale by a variable and show a 2px cyan outline on keyboard focus. On mobile the panel hugs the right edge with smaller pips.

### Glyph helix
Signature element. Two strands of poneglyph symbols in luminous cyan (strand A) and a lighter blue (strand B) with a white core and soft glow, orbiting in real z depth. In WebGL mode they are instanced quads sampled from a glow atlas; in DOM mode they are filtered images.

In WebGL mode each chain is tied to its blocks. At both ends the swing narrows to a single line of glyphs on the page axis, alternating cyan and blue at half the strand opacity, spaced about 18px apart like the helix itself, each glyph, in the tails and in the helix itself, drifting on its own slow chaotic path (about 6px sideways, 4px vertically, still under reduced motion) so no gap, including the one at the seam with the helix, stays fixed, which runs to the edge of the slab that covers the axis (the lowest bottom edge before the chain, the highest top edge after it; in a cluster that is the slab the axis crosses) and fades to a faint trace (a fifth of its opacity at the edge) as it reaches the stone, so the line reads as going behind it. A tail is at least 96px long; when a slab sits right at the spacer the helix body pulls in to make room. The last chain keeps its dissolve and has no tail at its open end. The DOM look keeps the plain helix.

### Auto decode window
Once a visitor has decoded one block by hand (a tap, or Enter or Space on the focused stone), the stones stop asking for taps for the rest of that page visit. A reload starts the discovery again, nothing is stored. The Get in Touch decode does not count as the first tap. The first tap itself plays today's radial decode from the tap point, and the decode hint never shows again.

From then on every slab follows the viewport. In WebGL mode each glyph cell is decoded while it sits inside the viewport and flips back to its glyph in a thin band at the top and bottom edge, 9% of the viewport height each, so the middle of the screen stays clear for reading. The flip and the cyan flash are the same as the tap decode, and the glyph ink is the same dark ink as before the first tap. Inside the band the stone itself returns to the shipped grey (`#4a5568`) and darkens to `#27333f` towards the clear middle, so the dark ink stays readable. The block text fades in only after the glyphs have dissolved, over the next 40% of the band, so no line is ever drawn under a glyph. The window repeats on every scroll pass and a slab never needs another tap. Links inside the masked bands stay clickable, and keyboard focus scrolls them into the clear middle.

The DOM look and reduced motion use whole slabs instead of a window. A slab decodes when it reaches the middle of the viewport and encodes again once it is fully out of view. Under reduced motion the cells only fade, with no radial wave, no flip and no mask.

### WebGL notice
Shown only in the DOM fallback when hardware accelerated WebGL is unavailable, never with `?webgl=off`. A cyan-ringed abyss card fixed above the bottom edge (42rem wide, 12px gutters on phones) that says 3D effects are off and how to turn on hardware acceleration in Chrome, Edge and Firefox, with a dismiss button.

## Do's and Don'ts

### Do:
- **Do** keep display type in Young Serif at weight 400 and body in DM Sans.
- **Do** build every raised surface from Elevation 1 or 2 and add the cyan glow only on hover or for glyphs.
- **Do** use cyan as light: headings, glyphs, thin borders and active marks.
- **Do** keep 3D optional: still under `prefers-reduced-motion`, pointer effects off on touch, and a CSS fallback with a notice when hardware WebGL is missing.
- **Do** keep text at WCAG AA contrast over ocean and stone.
- **Do** link only to public repos and give every external link `rel="noopener noreferrer"`.

### Don't:
- **Don't** use a gradient fill on heading text.
- **Don't** let the canvas and the DOM disagree: one orthographic rotation for both, and no CSS `perspective` on sections while the canvas is on.
- **Don't** replace the poneglyph materials (ocean field, stone blocks, cyan glyphs) with another world.
- **Don't** add bold to Young Serif headings.
- **Don't** touch the scroll teleport and the overlay decode logic when restyling. The auto decode window is the one sanctioned change to the overlay.
