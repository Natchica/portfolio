.PHONY: dev dev-backend dev-frontend build build-frontend build-backend test lint fmt clean

# Start both backend and frontend
dev:
	@echo "Starting backend and frontend..."
	@trap 'kill 0' INT TERM; \
		$(MAKE) dev-backend & \
		$(MAKE) dev-frontend & \
		wait

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
