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
    allow_origins=["*"],
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
    return {
        "app": "Sahayak API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/init-db")
async def init_db():
    try:
        from app.models.database import async_session
        from app.models.db_models import Worker
        from sqlalchemy import select
        
        async with async_session() as session:
            result = await session.execute(select(Worker).limit(1))
            if result.scalar_one_or_none():
                return {"status": "already_initialized"}
            
            workers = [
                {"worker_id": "WKR001", "full_name": "Rajesh Kumar", "designation": "Carpenter", "rating": 4.5, "reviews_count": 45, "hourly_rate_inr": 300, "experience_years": 5, "mobile_number": "+91 9876543210", "state": "Delhi", "city": "New Delhi", "languages_known": "Hindi, English", "location": "Connaught Place", "payment_method": "Cash, UPI", "availability": "Available", "profile_summary": "Experienced carpenter", "verification_status": "verified"},
                {"worker_id": "WKR002", "full_name": "Amit Sharma", "designation": "Plumber", "rating": 4.7, "reviews_count": 62, "hourly_rate_inr": 350, "experience_years": 7, "mobile_number": "+91 9876543211", "state": "Maharashtra", "city": "Mumbai", "languages_known": "Hindi, Marathi", "location": "Andheri", "payment_method": "Cash, UPI", "availability": "Available", "profile_summary": "Professional plumber", "verification_status": "verified"},
                {"worker_id": "WKR003", "full_name": "Suresh Patel", "designation": "Electrician", "rating": 4.6, "reviews_count": 53, "hourly_rate_inr": 400, "experience_years": 6, "mobile_number": "+91 9876543212", "state": "Karnataka", "city": "Bangalore", "languages_known": "Hindi, Kannada", "location": "Koramangala", "payment_method": "UPI", "availability": "Available", "profile_summary": "Certified electrician", "verification_status": "verified"},
            ]
            
            for w in workers:
                session.add(Worker(**w))
            await session.commit()
            
            return {"status": "success", "added": len(workers)}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "sahayak-api"}


@app.get("/ping")
async def ping():
    return {"ping": "pong"}
