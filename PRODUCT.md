# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user is the owner, Nathan Gaud, using the portfolio as a personal playground for visual and interaction experiments. Visitors arrive from the owner's profiles and CV and are curious, not conversion-driven. Recruiters and clients may appear but are not the design target.

## Product Purpose

A One Piece poneglyph-themed personal portfolio: about, skills, experience, projects, an alphabet section and a contact section, scrolled through an infinite-loop illusion with teleportation between transition sections. Success is a surface the owner enjoys evolving and that feels crafted, not templated.

## Positioning

Poneglyph stone blocks, glyph helix chains linking them, and a scroll that never ends. No neighboring portfolio shares this world.

## Operating Context

Leptos CSR (Rust to WASM) built with Trunk, Pure CSS in `frontend/style/`, Axum backend on port 3000 for `/api/health`. A WebGL layer (`frontend/public/scene.js` with Three.js 0.170.0 vendored in `frontend/public/vendor/`) draws slabs, glyphs and helix when the browser has hardware accelerated WebGL. Dev server at `http://localhost:8080`.

## Capabilities and Constraints

- Infinite-scroll teleport and overlay logic from PRs #8 to #10 stays untouched.
- `poneglyph_converter.rs` and the symbol assets stay as they are.
- Backend stays untouched.
- No Tailwind. Release WASM stays near the current ~212K; the 692KB Three.js module loads only when the page runs in WebGL mode.
- Rust decides WebGL or DOM rendering once at startup (`data-render` on `<html>`). Visitors without hardware WebGL get the CSS look plus a notice on how to enable hardware acceleration. `?webgl=off` forces the DOM look, `?debug` exposes the WebGL test surface.

## Brand Commitments

- Poneglyph world: ocean blue field, stone blocks, cyan glyph accents. Evolve it, do not replace it.
- Feel: deep-sea ancient relic. Soft layered elevation, luminous cyan glyph accents, carved-stone cards, calm voice.

## Evidence on Hand

Written content is current and stays verbatim. Assets: `frontend/public/Nathan-G.png`, `poneglyph_alphabet.jpeg`, `symbols/`, `favicon.svg`. Reference capture: `.claude/visual/image.png`. No testimonials or metrics exist, so none are invented.

## Product Principles

1. The poneglyph world is the identity. Refine its materials, never swap them.
2. Depth comes from light and layered elevation, not decoration.
3. Motion serves the endless scroll and respects `prefers-reduced-motion`.
4. Playground first: experiments are welcome when they stay cheap in bytes and frames.

## Accessibility & Inclusion

Keep text contrast at WCAG AA over the ocean and stone surfaces. Honor `prefers-reduced-motion` by removing tilt, parallax, the pointer light and the helix rotation, and by fading the decode instead of flipping it. On touch, the pointer light and pointer tilt are off.
