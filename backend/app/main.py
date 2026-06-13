"""
Sahayak — BlueCollar AI Chatbot v2
FastAPI Application Entry Point

Run: uvicorn app.main:app --reload --port 8000
"""
import logging
import time
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

from app.config import get_settings
from app.models.database import init_db
from app.api.auth import router as auth_router
from app.api.chatbot import router as chatbot_router
from app.api.analytics import router as analytics_router
from app.api.workers import router as workers_router
from app.api.conversations import router as conversations_router
from app.api.disputes import disputes_router, fraud_router
from app.api.jobs import router as jobs_router
from app.middleware.rate_limiter import RateLimiterMiddleware

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)
settings = get_settings()

# ── Prometheus Metrics ─────────────────────────────────────────────────────────
REQUEST_COUNT = Counter(
    "sahayak_requests_total", "Total HTTP requests", ["method", "endpoint", "status"]
)
REQUEST_LATENCY = Histogram(
    "sahayak_request_duration_seconds", "Request latency", ["endpoint"]
)
CHAT_MESSAGES = Counter("sahayak_chat_messages_total", "Total chat messages processed")


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("🚀 Sahayak starting up...")

    # 1. Init database
    await init_db()

    # 2. Build semantic search index
    try:
        from app.services.matching_engine import build_index
        build_index()
    except Exception as e:
        logger.warning(f"Matching engine init warning: {e}")

    # 3. Train salary model
    try:
        from app.services.salary_predictor import train_model
        import asyncio
        loop = asyncio.get_event_loop()
        loop.run_in_executor(None, train_model)
    except Exception as e:
        logger.warning(f"Salary model init warning: {e}")

    # 4. Connect Redis (optional)
    redis_client = None
    try:
        import redis.asyncio as aioredis
        redis_client = aioredis.from_url(settings.redis_url, decode_responses=True)
        await redis_client.ping()
        logger.info("✅ Redis connected")
        app.state.redis = redis_client
    except Exception:
        logger.warning("⚠️  Redis not available — using in-memory rate limiting")
        app.state.redis = None

    logger.info("✅ Sahayak ready!")
    yield

    # Shutdown
    if redis_client:
        await redis_client.close()
    logger.info("👋 Sahayak shutting down")


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Sahayak — BlueCollar AI",
    description="AI-powered platform connecting blue-collar workers with employers across India",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware ─────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimiterMiddleware)


@app.middleware("http")
async def timing_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    elapsed = round((time.time() - start) * 1000, 2)
    response.headers["X-Process-Time"] = f"{elapsed}ms"
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code,
    ).inc()
    return response


# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(chatbot_router)
app.include_router(analytics_router)
app.include_router(workers_router)
app.include_router(conversations_router)
app.include_router(disputes_router)
app.include_router(fraud_router)
app.include_router(jobs_router)


# ── Static Files (Frontend) ────────────────────────────────────────────────────
_frontend_dir = os.path.join(os.path.dirname(__file__), "../../frontend")
_frontend_dir = os.path.abspath(_frontend_dir)

if os.path.isdir(_frontend_dir):
    app.mount("/static", StaticFiles(directory=_frontend_dir), name="static")
    logger.info(f"✅ Frontend served from {_frontend_dir}")


# ── System Endpoints ───────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def serve_root():
    """Serve the frontend dashboard."""
    index_path = os.path.join(_frontend_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse({"message": "Sahayak API is running", "docs": "/docs", "version": "2.0.0"})


@app.get("/health")
async def health_check():
    """System health check."""
    import platform
    health = {
        "status": "healthy",
        "version": "2.0.0",
        "python": platform.python_version(),
        "services": {
            "database": "ok",
            "redis": "ok",
            "llm_groq": "configured" if settings.groq_api_key else "not_configured",
            "llm_gemini": "configured" if settings.gemini_api_key else "not_configured",
        },
    }

    # Check Redis
    try:
        if hasattr(app.state, "redis") and app.state.redis:
            await app.state.redis.ping()
        else:
            health["services"]["redis"] = "not_connected"
    except Exception:
        health["services"]["redis"] = "error"

    # Check DB
    try:
        from app.models.database import AsyncSessionLocal
        from sqlalchemy import text
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
    except Exception as e:
        health["services"]["database"] = f"error: {e}"
        health["status"] = "degraded"

    return health


@app.get("/metrics")
async def prometheus_metrics():
    """Prometheus metrics endpoint."""
    from fastapi.responses import Response
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/api/config")
async def get_public_config():
    """Public feature flags for frontend."""
    return {
        "llm_enabled": bool(settings.groq_api_key),
        "vision_enabled": bool(settings.gemini_api_key),
        "redis_enabled": True,
        "supported_languages": [
            {"code": "en", "name": "English"},
            {"code": "hi", "name": "हिन्दी"},
            {"code": "mr", "name": "मराठी"},
            {"code": "bn", "name": "বাংলা"},
            {"code": "ta", "name": "தமிழ்"},
            {"code": "te", "name": "తెలుగు"},
            {"code": "gu", "name": "ગુજરાતી"},
            {"code": "kn", "name": "ಕನ್ನಡ"},
            {"code": "pa", "name": "ਪੰਜਾਬੀ"},
            {"code": "or", "name": "ଓଡ଼ିଆ"},
        ],
        "version": "2.0.0",
    }


# ── Frontend Routes ────────────────────────────────────────────────────────────
@app.get("/{page}.html", include_in_schema=False)
async def serve_page(page: str):
    """Serve any HTML page from frontend directory."""
    page_path = os.path.join(_frontend_dir, f"{page}.html")
    if os.path.exists(page_path):
        return FileResponse(page_path)
    # Fall back to index
    index_path = os.path.join(_frontend_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse({"error": "Page not found"}, status_code=404)


@app.get("/login", include_in_schema=False)
async def serve_login():
    """Redirect /login to login.html."""
    login_path = os.path.join(_frontend_dir, "login.html")
    if os.path.exists(login_path):
        return FileResponse(login_path)
    return JSONResponse({"error": "Login page not found"}, status_code=404)
