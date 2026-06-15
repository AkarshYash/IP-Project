"""
Sahayak — BlueCollar AI Platform API
FastAPI Backend for React Frontend
Created by Akarsh Chaturvedi
"""
from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")

# Import routers
from .api.chatbot import router as chatbot_router
from .api.workers import router as workers_router
from .api.bookings import router as bookings_router
from .api.auth import router as auth_router
from .api.analytics import router as analytics_router
from .api.jobs import router as jobs_router
from .api.conversations import router as conversations_router
from .api.disputes import disputes_router, fraud_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("🚀 Sahayak API Server starting...")
    yield
    logging.info("🛑 Shutting down.")


app = FastAPI(
    title="Sahayak API",
    description="AI-powered blue-collar job platform backend",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS - Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(chatbot_router, prefix="/api/chatbot", tags=["Chatbot"])
app.include_router(workers_router, prefix="/api/workers", tags=["Workers"])
app.include_router(bookings_router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(auth_router, tags=["Auth"])
app.include_router(analytics_router, tags=["Analytics"])
app.include_router(jobs_router, tags=["Jobs"])
app.include_router(conversations_router, tags=["Conversations"])
app.include_router(disputes_router, tags=["Disputes"])
app.include_router(fraud_router, tags=["Fraud"])


@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "app": "Sahayak API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "frontend": "React app at http://localhost:5173"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "sahayak-api"}


# For Render.com health checks
@app.get("/ping")
async def ping():
    """Ping endpoint for health monitoring"""
    return {"ping": "pong"}

