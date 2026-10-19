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
  ink: "#000000"
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
  skill-bar-track:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.pill}"
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

The page is a dark ocean field (abyss blues fading to a cyan halo at the top) holding stone slabs and cards. Display type is a warm serif that reads as inscription; body type is a neutral sans. A subtle CSS 3D layer (tilt, settle, helix depth) adds physicality but is always optional.

**Key Characteristics:**
- Ocean/abyss blue field, stone-grey slabs, cyber-cyan accent used for glyphs, glow, active state and headings.
- Soft layered elevation: lit top edge, dark bottom edge, deep diffuse drop shadow, cyan glow on hover.
- Carved-stone slabs and cards with an inset inner border.
- Diamond rune-stone nav pips.
- 3D is CSS-only and flattens on small screens and under reduced motion.

## Colors

A cold, saturated-at-one-point palette: deep sea blues and weathered stone greys carry the surface, one electric cyan carries the light.

### Primary
- **Cyber Cyan** (primary, cyber-400): The light source. Section headings, active nav pip, glyph glow, skill-bar glow, hover glow and focus outline.
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
- **Body** (400, 1.125rem, 1.7): Descriptions in stone-text. Intro copy is capped near 42rem.
- **Button** (600, 1rem, 0.01em): Buttons in DM Sans.
- **Label** (400, 0.875rem): Tech tags, metadata, small form text.

### Named Rules
**The Single Weight Rule.** Display faces stay at weight 400. Emphasis comes from size, color and glow, not bold.

## Layout

A vertical scroll of full-height poneglyph sections, each centering one stone slab (max width 800px, 3rem padding) in a 2rem side gutter. Sections are joined by glyph helix chains and 100vh transition spacers for the infinite loop; do not alter them. Wider content (alphabet, projects) uses containers up to 80rem. Spacing runs in half-rem steps: 0.5, 0.75, 1, 1.5, 2, 3rem.

Responsive: breakpoints at 640px, 768px (type steps up, 3D switches on) and 1024px (hover tilt, desktop layout). Under 768px the section gutter drops to 0.75rem, slab padding becomes 2rem 1.25rem, and the nav panel and pips shrink (pips 0.9rem).

## Elevation & Depth

Hybrid of layered shadow and light. Every raised surface carries three cues: a 1px lit top edge, a 1px dark bottom edge (both inset), and a deep soft drop shadow. Hover adds a cyan glow rather than a harder shadow.

### Shadow Vocabulary
- **Elevation 1** (`box-shadow: 0 1px 0 rgba(255,255,255,0.14) inset, 0 -1px 0 rgba(0,0,0,0.45) inset, 0 8px 20px rgba(2,16,28,0.35)`): Cards, experience items, primary button.
- **Elevation 2** (`box-shadow: 0 1px 0 rgba(255,255,255,0.14) inset, 0 -1px 0 rgba(0,0,0,0.45) inset, 0 18px 40px rgba(2,16,28,0.5), 0 2px 6px rgba(2,16,28,0.4)`): Slabs, nav panel, hovered cards.
- **Cyan Glow** (`box-shadow: 0 0 24px rgba(0,212,255,0.28)`): Added on hover to slabs, cards and buttons.

### 3D
CSS 3D only: `perspective` (1600px on sections, 900px on the helix), `translateZ`, `rotateX` and `rotateY`. Slabs tilt about 2 degrees on hover (pointer devices at 1024px and up) and settle in with a scroll-driven rotateX entrance where supported. Helix nodes swing in z by up to 60px and turn up to 28 degrees.

### Named Rules
**The Flat Fallback Rule.** Under 768px and under `prefers-reduced-motion`, perspective is removed and all 3D transforms, entrance animation and hover lifts are flattened. Depth is then carried by the shadows alone.

**The Lit Edge Rule.** Raised means a light top edge, dark bottom edge and soft deep shadow together; never a single hard offset shadow.

## Shapes

Soft-cornered stone. Slabs and the nav panel use 1.25rem, cards 0.875rem, buttons 0.75rem, small controls 0.5rem and tags are pills. Slabs carry a faint inner border inset 0.5rem (cyan at 12% alpha) with an inner shadow, reading as a carved frame. Nav pips are rotated squares (diamonds) with 0.4rem corners. Borders are hairline (1px) at 7 to 25% white or cyan.

## Components

### Slabs (Poneglyph block)
Carved stone panel. Stone gradient face, 1px border at 8% white, 1.25rem radius, Elevation 2, inner carved frame, and a faint cyan underglow beneath its lower edge. Hover tilt and glow on pointer devices at 1024px and up.

### Cards
Skill, project and experience cards. Translucent stone gradient, 0.875rem radius, Elevation 1, 1.5rem padding. Hover on skill and project cards lifts 4px, shifts the border to cyan (35% alpha) and adds Elevation 2 plus glow.

### Buttons
- **Shape:** 0.75rem radius, 0.75rem by 2rem padding, DM Sans 1rem.
- **Primary:** ocean-blue gradient (ocean-800 to ocean-700) with white text and Elevation 1; hover lifts 2px and adds the cyan glow.
- **Outline:** transparent with cyan text and 2px cyan border; hover adds glow and fills solid cyan with ocean-900 text.

### Tags and skill bars
The decode hint is a cyan-ringed abyss pill centered on the encoded slab (never lower than 40vh, so it stays on screen on tall mobile slabs), reading "Click to decode" with a pointer and "Tap to decode" on touch. It pulses gently and stops pulsing under `prefers-reduced-motion`. Decoding itself runs at half duration under 768px and under reduced motion.

Tech tags are cyan-tinted pills (10% fill, 25% border, ocean-100 text). Skill bars sit in an inset dark track with a glowing cyan fill.

### Navigation
Fixed right-side panel: abyss tint at 60% alpha, 14px backdrop blur, cyan 25% border, 1.25rem radius, Elevation 2. Rune-stone diamond pips: inactive pips are grey stone gradients, the active pip is a bright cyan radial. Pips scale by a variable and show a 2px cyan outline on keyboard focus. On mobile the panel hugs the right edge with smaller pips.

### Glyph helix
Signature element. Two strands of poneglyph symbols recolored to luminous cyan (strand A) and a lighter blue (strand B) via filter plus layered glow, orbiting in real z depth.

## Do's and Don'ts

### Do:
- **Do** keep display type in Young Serif at weight 400 and body in DM Sans.
- **Do** build every raised surface from Elevation 1 or 2 and add the cyan glow only on hover or for glyphs.
- **Do** use cyan as light: headings, glyphs, thin borders and active marks.
- **Do** use CSS 3D only, and flatten it under 768px and under `prefers-reduced-motion`.
- **Do** keep text at WCAG AA contrast over ocean and stone.

### Don't:
- **Don't** use a gradient fill on heading text.
- **Don't** use JavaScript or canvas for depth; 3D stays in CSS transforms.
- **Don't** replace the poneglyph materials (ocean field, stone blocks, cyan glyphs) with another world.
- **Don't** add bold to Young Serif headings.
- **Don't** touch the scroll teleport and overlay behavior when restyling.
