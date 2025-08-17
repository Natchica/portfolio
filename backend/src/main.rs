use axum::{
    response::Json,
    routing::get,
    Router,
};
use serde_json::{json, Value};
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    // Build our application with routes
    let app = Router::new()
        .route("/", get(root))
        .route("/api/health", get(health_check))
        // Add CORS so frontend can make requests
        .layer(CorsLayer::permissive());

    // Run it with hyper on localhost:3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
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
