use anyhow::bail;
use axum::{Router, routing::get};
use sqlx::PgPool;
use std::sync::Arc;
use tracing::info;

mod form_types;
mod forms_provider;
mod vm;

pub struct ServerContext {
    pub db: PgPool,
}
impl ServerContext {
    pub async fn new(addr: &str) -> anyhow::Result<Self> {
        let db = PgPool::connect(addr).await?;
        Ok(Self { db })
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Logging
    dotenv::dotenv().ok();
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    let server_state = Arc::new(
        ServerContext::new(&dotenv::var("DATABASE_URL").ok().unwrap())
            .await
            .unwrap(),
    );
    let app = Router::new()
        .route("/", get(|| async { "Hello world" }))
        .with_state(server_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:5123")
        .await
        .expect("Port is used");
    info!("Server started at the port 5123");

    if axum::serve(listener, app).await.is_err() {
        bail!("You fool");
    }
    Ok(())
}
