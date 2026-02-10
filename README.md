# Nathan's Portfolio

A personal portfolio website combining One Piece Poneglyphs with blockchain aesthetics. Built entirely in Rust -- Leptos WASM frontend, Axum backend, pure CSS styling.

## Tech Stack

- **Frontend:** Rust + [Leptos](https://leptos.dev/) (CSR WASM)
- **Backend:** Rust + [Axum](https://github.com/tokio-rs/axum)
- **Styling:** Pure CSS (semantic classes, CSS custom properties)
- **Build:** [Trunk](https://trunkrs.dev/) (frontend), Cargo (backend)

## Project Structure

```text
portfolio/
├── Cargo.toml           # Workspace root
├── package.json          # Dev scripts (concurrently)
├── backend/              # Axum API server (port 3000)
│   └── src/main.rs
└── frontend/             # Leptos WASM SPA (port 8080)
    ├── Trunk.toml        # Build config + API proxy
    ├── index.html        # Trunk entry point
    ├── style/main.css    # All CSS
    ├── public/           # Static assets (SVGs, images)
    └── src/
        ├── main.rs       # Entry point
        ├── app.rs        # App component + infinite scroll
        ├── components/   # UI components + sections/
        ├── hooks/        # Intersection observer, throttled scroll
        └── utils/        # Poneglyph symbol converter
```

## Prerequisites

- [Rust](https://rustup.rs/) (stable, 2024 edition)
- [Trunk](https://trunkrs.dev/) (`cargo install trunk`)
- `wasm32-unknown-unknown` target (`rustup target add wasm32-unknown-unknown`)
- [cargo-watch](https://github.com/watchexec/cargo-watch) (optional, for backend live reload)
- GNU Make

## Development

```bash
# Start both backend and frontend
make dev

# Or run individually:
make dev-backend    # Backend at localhost:3000
make dev-frontend   # Frontend at localhost:8080
```

The Trunk dev server proxies `/api/` requests to the backend at `localhost:3000`.

## Build

```bash
# Both
make build

# Or individually:
make build-frontend   # outputs to frontend/dist/
make build-backend
```

## Testing

```bash
make test

# Or target a specific crate:
cargo test -p portfolio-frontend
cargo test -p portfolio-backend
```

## Linting

```bash
make lint
make fmt
```

## Features

- Poneglyph-themed visual design with custom SVG symbol alphabet
- Infinite scroll loop illusion via scroll teleportation
- Intersection observer-driven section entrance animations
- Interactive poneglyph overlay with staggered fade-out animation
- Responsive layout with CSS custom properties theming
- ~212K optimized WASM binary

## License

All Rights Reserved -- see [LICENSE](LICENSE).
