from fastapi import FastAPI
from app.api.routes import router as api_router
from app.core.config import settings  # Ensures env vars are validated on startup

def create_app() -> FastAPI:
    """Application factory for the FastAPI backend."""
    app = FastAPI(title="Autonomous Support Engine API")
    
    app.include_router(api_router)
    
    @app.get("/")
    def health_check():
        return {"status": "ok", "message": "Backend is running with Groq + Gemini"}
        
    return app

app = create_app()
