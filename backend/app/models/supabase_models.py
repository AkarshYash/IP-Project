"""
Enhanced Database Models for Supabase PostgreSQL
Enterprise-grade schema with advanced features
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional
import uuid

Base = declarative_base()

def generate_uuid():
    """Generate UUID for primary keys"""
    return str(uuid.uuid4())

class Worker(Base):
    """Enhanced Worker Model with Vector Embeddings"""
    __tablename__ = "workers"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, unique=True, index=True)  # For auth
    name = Column(String(200), nullable=False)
    phone = Column(String(15), unique=True, index=True)
    email = Column(String(255), unique=True, nullable=True)
    
    # Skills & Experience
    primary_skill = Column(String(100), index=True)
    skills = Column(JSON)  # Array of skills
    experience_years = Column(Float, default=0)
    certifications = Column(JSON)  # Array of certification objects
    
    # Location
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(Text)
    city = Column(String(100), index=True)
    state = Column(String(100))
    pincode = Column(String(10), index=True)
    
    # Verification
    is_verified = Column(Boolean, default=False)
    blockchain_verified = Column(Boolean, default=False)
    government_id_verified = Column(Boolean, default=False)
    aadhaar_verified = Column(Boolean, default=False)
    verification_documents = Column(JSON)
    
    # Profile
    profile_photo = Column(String(500))  # Supabase storage URL
    bio = Column(Text)
    languages = Column(JSON)  # Array of languages spoken
    
    # Ratings & Reviews
    rating = Column(Float, default=0)
    total_reviews = Column(Integer, default=0)
    completed_jobs = Column(Integer, default=0)
    
    # Financial
    hourly_rate = Column(Float)
    daily_rate = Column(Float)
    total_earnings = Column(Float, default=0)
    
    # AI & ML
    skill_embedding = Column(JSON)  # Vector embedding for semantic search
    ml_score = Column(Float, default=0)  # ML matching score
    
    # Metadata
    is_active = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    last_active = Column(DateTime, default=func.now())
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    jobs = relationship("Job", back_populates="worker")
    reviews = relationship("Review", foreign_keys="Review.worker_id", back_populates="worker")
    
    __table_args__ = (
        Index('idx_worker_skill_city', 'primary_skill', 'city'),
        Index('idx_worker_location', 'latitude', 'longitude'),
    )

class Employer(Base):
    """Enhanced Employer Model"""
    __tablename__ = "employers"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, unique=True, index=True)
    name = Column(String(200), nullable=False)
    company_name = Column(String(200))
    phone = Column(String(15), unique=True, index=True)
    email = Column(String(255), unique=True, nullable=True)
    
    # Location
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(Text)
    city = Column(String(100), index=True)
    state = Column(String(100))
    pincode = Column(String(10))
    
    # Verification
    is_verified = Column(Boolean, default=False)
    business_verified = Column(Boolean, default=False)
    verification_documents = Column(JSON)
    
    # Profile
    profile_photo = Column(String(500))
    company_logo = Column(String(500))
    description = Column(Text)
    
    # Ratings
    rating = Column(Float, default=0)
    total_reviews = Column(Integer, default=0)
    jobs_posted = Column(Integer, default=0)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    jobs = relationship("Job", back_populates="employer")

class Job(Base):
    """Enhanced Job Model with AI Matching"""
    __tablename__ = "jobs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    employer_id = Column(String, ForeignKey("employers.id"), nullable=False, index=True)
    worker_id = Column(String, ForeignKey("workers.id"), nullable=True, index=True)
    
    # Job Details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), index=True)
    required_skills = Column(JSON)  # Array of required skills
    
    # Location
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(Text)
    city = Column(String(100), index=True)
    is_remote = Column(Boolean, default=False)
    
    # Payment
    payment_type = Column(String(20))  # hourly, daily, fixed
    payment_amount = Column(Float, nullable=False)
    advance_payment = Column(Float, default=0)
    
    # Timeline
    start_date = Column(DateTime)
    end_date = Column(DateTime, nullable=True)
    duration_days = Column(Integer)
    is_urgent = Column(Boolean, default=False)
    
    # Status
    status = Column(String(20), default="open", index=True)  # open, assigned, in_progress, completed, cancelled
    
    # AI & ML
    skill_embedding = Column(JSON)  # For semantic matching
    matched_workers = Column(JSON)  # AI-matched worker IDs with scores
    
    # Metadata
    views = Column(Integer, default=0)
    applications = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    employer = relationship("Employer", back_populates="jobs")
    worker = relationship("Worker", back_populates="jobs")
    reviews = relationship("Review", back_populates="job")
    
    __table_args__ = (
        Index('idx_job_status_city', 'status', 'city'),
        Index('idx_job_category_status', 'category', 'status'),
    )

class Review(Base):
    """Enhanced Review System with Blockchain Verification"""
    __tablename__ = "reviews"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False, index=True)
    worker_id = Column(String, ForeignKey("workers.id"), nullable=False, index=True)
    employer_id = Column(String, ForeignKey("employers.id"), nullable=False, index=True)
    
    # Review by Employer for Worker
    employer_rating = Column(Float)
    employer_comment = Column(Text)
    employer_review_date = Column(DateTime)
    
    # Review by Worker for Employer
    worker_rating = Column(Float)
    worker_comment = Column(Text)
    worker_review_date = Column(DateTime)
    
    # Verification
    is_verified = Column(Boolean, default=False)
    blockchain_hash = Column(String(100))  # For tamper-proof reviews
    
    # Safety & Quality
    safety_rating = Column(Float)  # How safe was the job site?
    payment_on_time = Column(Boolean)
    would_work_again = Column(Boolean)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    job = relationship("Job", back_populates="reviews")
    worker = relationship("Worker", foreign_keys=[worker_id], back_populates="reviews")

class Message(Base):
    """Enhanced Chat Messages with AI Context"""
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    conversation_id = Column(String, index=True)
    sender_id = Column(String, nullable=False, index=True)
    receiver_id = Column(String, nullable=False, index=True)
    
    # Content
    message_type = Column(String(20), default="text")  # text, image, location, voice, document
    content = Column(Text, nullable=False)
    metadata = Column(JSON)  # Additional data (file URLs, coordinates, etc.)
    
    # AI Processing
    intent = Column(String(50))  # Detected intent by AI
    sentiment = Column(String(20))  # positive, neutral, negative
    language = Column(String(10))
    translated_content = Column(Text)  # Auto-translated content
    
    # Status
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=func.now(), index=True)
    
    __table_args__ = (
        Index('idx_message_conversation', 'conversation_id', 'created_at'),
        Index('idx_message_sender_receiver', 'sender_id', 'receiver_id'),
    )

class Document(Base):
    """Worker Documents & Certificates"""
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    worker_id = Column(String, ForeignKey("workers.id"), nullable=False, index=True)
    
    # Document Info
    document_type = Column(String(50), nullable=False)  # aadhaar, pan, certificate, resume
    document_name = Column(String(200))
    file_url = Column(String(500), nullable=False)  # Supabase storage URL
    file_type = Column(String(20))
    file_size = Column(Integer)
    
    # AI Extraction
    extracted_data = Column(JSON)  # Data extracted by Gemini Vision
    is_verified = Column(Boolean, default=False)
    verification_status = Column(String(20))  # pending, verified, rejected
    
    # Metadata
    uploaded_at = Column(DateTime, default=func.now())
    verified_at = Column(DateTime, nullable=True)

class ActivityLog(Base):
    """User Activity Tracking for Analytics"""
    __tablename__ = "activity_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False, index=True)
    user_type = Column(String(20))  # worker, employer
    
    # Activity
    action = Column(String(50), nullable=False, index=True)  # login, search, apply, hire, etc.
    details = Column(JSON)
    
    # Context
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    device_type = Column(String(20))  # mobile, desktop, tablet
    
    # Metadata
    created_at = Column(DateTime, default=func.now(), index=True)
    
    __table_args__ = (
        Index('idx_activity_user_action', 'user_id', 'action', 'created_at'),
    )

class Notification(Base):
    """Push Notifications System"""
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False, index=True)
    
    # Notification
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50))  # job_match, message, payment, review
    action_url = Column(String(500))
    
    # Status
    is_read = Column(Boolean, default=False)
    is_sent = Column(Boolean, default=False)
    sent_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    read_at = Column(DateTime, nullable=True)
    
    __table_args__ = (
        Index('idx_notification_user_read', 'user_id', 'is_read', 'created_at'),
    )
