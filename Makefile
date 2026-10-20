.PHONY: dev check-port dev-backend dev-frontend build build-frontend build-backend test lint fmt clean

# Start both backend and frontend
dev: check-port
	@echo "Starting backend and frontend..."
	@trap 'kill 0' INT TERM; \
		$(MAKE) dev-backend & \
		$(MAKE) dev-frontend & \
		wait

# Refuse to start while port 3000 is taken (skipped when ss is missing)
check-port:
	@if ! command -v ss >/dev/null 2>&1; then \
		echo "ss not found, skipping the port 3000 check"; \
	elif ss -ltn | grep -q ':3000 '; then \
		echo "Port 3000 is already in use:"; \
		ss -ltnp | grep ':3000 '; \
		echo "Stop that process, then run make dev again."; \
		exit 1; \
	fi

dev-backend:
	cd backend && cargo watch -x run

dev-frontend:
	cd frontend && trunk serve

# Build
build: build-frontend build-backend

build-frontend:
	cd frontend && trunk build --release

build-backend:
	cd backend && cargo build --release

# Test
test:
	cargo test --workspace

# Lint & format
lint:
	cargo clippy --workspace

fmt:
	cargo fmt --all

# Clean build artifacts
clean:
	cargo clean
	rm -rf frontend/dist .trunk
