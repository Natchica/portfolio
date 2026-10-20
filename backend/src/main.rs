use std::io::ErrorKind;

use axum::{Router, response::Json, routing::get};
use serde_json::{Value, json};
use tower_http::cors::CorsLayer;

const PORT: u16 = 3000;

#[tokio::main]
async fn main() {
    // Build our application with routes
    let app = Router::new()
        .route("/", get(root))
        .route("/api/health", get(health_check))
        // Add CORS so frontend can make requests
        .layer(CorsLayer::permissive());

    // Run it with hyper on localhost:3000
    let listener = match tokio::net::TcpListener::bind(("0.0.0.0", PORT)).await {
        Ok(listener) => listener,
        Err(err) => match bind_error_message(err.kind(), PORT) {
            Some(message) => {
                eprintln!("{message}");
                std::process::exit(1);
            }
            None => panic!("failed to bind 0.0.0.0:{PORT}: {err}"),
        },
    };
    println!("🚀 Backend server running on http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}

// Basic root handler
async fn root() -> &'static str {
    "Nathan's Portfolio Backend 🦀"
}

// Health check endpoint for frontend
async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "healthy",
        "message": "Portfolio backend is running!",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

/// Explains a bind failure the user can fix; `None` means "let it panic".
fn bind_error_message(kind: ErrorKind, port: u16) -> Option<String> {
    match kind {
        ErrorKind::AddrInUse => Some(format!(
            "Port {port} is already in use. Another portfolio backend is probably running: \
             find it with 'ss -ltnp | grep :{port}', stop it, then retry."
        )),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::bind_error_message;
    use std::io::ErrorKind;

    #[test]
    fn bind_error_message_returns_hint_only_when_addr_in_use() {
        let message = bind_error_message(ErrorKind::AddrInUse, 3000)
            .expect("AddrInUse should produce a message");
        assert!(message.contains("Port 3000 is already in use"));
        assert!(bind_error_message(ErrorKind::ConnectionRefused, 3000).is_none());
    }
}
