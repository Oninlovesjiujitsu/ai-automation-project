from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.config import settings  # Ensures env vars are validated on startup
from app.api.routes import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.rag.vectorstore import init_vectorstore
    init_vectorstore()
    yield

def create_app() -> FastAPI:
    """Application factory for the FastAPI backend."""
    app = FastAPI(title="Autonomous Support Engine API", lifespan=lifespan)
    
    app.include_router(api_router)
    
    @app.get("/")
    def health_check():
        return {"status": "ok", "message": "Backend is running with Groq + Gemini"}
        
    return app

app = create_app()
