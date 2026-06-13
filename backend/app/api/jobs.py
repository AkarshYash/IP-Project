"""
Jobs API — post jobs, match with workers via semantic search
GET  /api/jobs/
POST /api/jobs/
GET  /api/jobs/{job_id}
GET  /api/jobs/{job_id}/matches
PATCH /api/jobs/{job_id}/close
DELETE /api/jobs/{job_id}
"""
import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.models.database import get_db
from app.models.db_models import JobPost
from app.services.matching_engine import search_workers

router = APIRouter(prefix="/api/jobs", tags=["jobs"])
logger = logging.getLogger(__name__)


class NewJob(BaseModel):
    title: str
    description: str
    designation: str
    city: str
    state: str = ""
    budget_min_inr: int = 0
    budget_max_inr: int = 0
    experience_required: int = 0
    is_urgent: bool = False
    employer_name: str
    employer_contact: Optional[str] = None
    expires_days: int = 30


class JobUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_urgent: Optional[bool] = None


@router.get("/")
async def list_jobs(
    active_only: bool = True,
    city: Optional[str] = None,
    designation: Optional[str] = None,
    urgent_only: bool = False,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """List all active job postings."""
    query = select(JobPost).order_by(JobPost.is_urgent.desc(), JobPost.created_at.desc())
    if active_only:
        query = query.where(JobPost.is_active == True)
    if city:
        query = query.where(JobPost.city.ilike(f"%{city}%"))
    if designation:
        query = query.where(JobPost.designation.ilike(f"%{designation}%"))
    if urgent_only:
        query = query.where(JobPost.is_urgent == True)

    total_result = await db.execute(select(func.count(JobPost.id)).where(JobPost.is_active == True))
    total = total_result.scalar() or 0

    result = await db.execute(query.limit(limit).offset(offset))
    jobs = result.scalars().all()

    # Seed sample jobs if empty
    if total == 0:
        return {"jobs": _sample_jobs(), "total": 6}

    return {
        "jobs": [_job_to_dict(j) for j in jobs],
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.post("/")
async def create_job(data: NewJob, db: AsyncSession = Depends(get_db)):
    """Create a new job posting."""
    job = JobPost(
        job_ref=f"J{str(uuid.uuid4())[:6].upper()}",
        title=data.title,
        description=data.description,
        designation=data.designation,
        city=data.city,
        state=data.state,
        budget_min_inr=data.budget_min_inr,
        budget_max_inr=data.budget_max_inr,
        experience_required=data.experience_required,
        is_urgent=data.is_urgent,
        employer_name=data.employer_name,
        employer_contact=data.employer_contact,
        expires_at=datetime.utcnow() + timedelta(days=data.expires_days),
        is_active=True,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return _job_to_dict(job)


@router.get("/stats")
async def job_stats(db: AsyncSession = Depends(get_db)):
    """Get job statistics."""
    total = (await db.execute(select(func.count(JobPost.id)))).scalar() or 0
    active = (await db.execute(select(func.count(JobPost.id)).where(JobPost.is_active == True))).scalar() or 0
    urgent = (await db.execute(select(func.count(JobPost.id)).where(JobPost.is_urgent == True, JobPost.is_active == True))).scalar() or 0
    return {"total": total, "active": active, "urgent": urgent}


@router.get("/{job_ref}")
async def get_job(job_ref: str, db: AsyncSession = Depends(get_db)):
    """Get a specific job by ref or id."""
    result = await db.execute(select(JobPost).where(JobPost.job_ref == job_ref))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return _job_to_dict(job)


@router.get("/{job_ref}/matches")
async def get_job_matches(job_ref: str, top_k: int = 5, db: AsyncSession = Depends(get_db)):
    """Use semantic search to find best worker matches for a job."""
    result = await db.execute(select(JobPost).where(JobPost.job_ref == job_ref))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Build search query from job details
    query = f"{job.designation} {job.city} {job.description[:200]}"
    matches = search_workers(
        query=query,
        city=job.city,
        designation=job.designation,
        top_k=top_k,
        min_rating=3.5,
    )
    return {
        "job_ref": job_ref,
        "job_title": job.title,
        "matches": matches,
        "count": len(matches),
    }


@router.patch("/{job_ref}/close")
async def close_job(job_ref: str, db: AsyncSession = Depends(get_db)):
    """Close/deactivate a job posting."""
    result = await db.execute(select(JobPost).where(JobPost.job_ref == job_ref))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.is_active = False
    await db.commit()
    return {"job_ref": job_ref, "status": "closed"}


def _job_to_dict(j: JobPost) -> dict:
    return {
        "id": j.id,
        "job_ref": j.job_ref,
        "title": j.title,
        "description": j.description,
        "designation": j.designation,
        "city": j.city,
        "state": j.state,
        "budget_min_inr": j.budget_min_inr,
        "budget_max_inr": j.budget_max_inr,
        "experience_required": j.experience_required,
        "is_urgent": j.is_urgent,
        "is_active": j.is_active,
        "employer_name": j.employer_name,
        "employer_contact": j.employer_contact,
        "created_at": j.created_at.isoformat(),
        "expires_at": j.expires_at.isoformat() if j.expires_at else None,
    }


def _sample_jobs() -> list:
    return [
        {
            "id": 1, "job_ref": "J1A2B3",
            "title": "Residential Electrician Needed",
            "description": "Need an experienced electrician for rewiring 3BHK flat in South Mumbai. Must have ITI certification.",
            "designation": "Electrician",
            "city": "Mumbai", "state": "Maharashtra",
            "budget_min_inr": 600, "budget_max_inr": 900,
            "experience_required": 3,
            "is_urgent": True, "is_active": True,
            "employer_name": "Sharma Constructions",
            "employer_contact": "+91XXXXXXXXXX",
            "created_at": "2026-06-12T09:00:00",
            "expires_at": "2026-07-12T09:00:00",
        },
        {
            "id": 2, "job_ref": "JC4D5E",
            "title": "AC Service Technician",
            "description": "Seasonal maintenance for 50 AC units in commercial complex. 2-week project.",
            "designation": "AC Technician",
            "city": "Delhi", "state": "Delhi",
            "budget_min_inr": 500, "budget_max_inr": 700,
            "experience_required": 2,
            "is_urgent": False, "is_active": True,
            "employer_name": "CoolAir Commercial",
            "employer_contact": "+91XXXXXXXXXX",
            "created_at": "2026-06-11T14:00:00",
            "expires_at": "2026-07-11T14:00:00",
        },
        {
            "id": 3, "job_ref": "JF6G7H",
            "title": "Experienced Plumber for Pipeline Work",
            "description": "Large pipeline installation project in new housing society. 2-month contract available.",
            "designation": "Plumber",
            "city": "Pune", "state": "Maharashtra",
            "budget_min_inr": 550, "budget_max_inr": 800,
            "experience_required": 5,
            "is_urgent": False, "is_active": True,
            "employer_name": "BlueStar Housing",
            "employer_contact": "+91XXXXXXXXXX",
            "created_at": "2026-06-10T11:00:00",
            "expires_at": "2026-07-10T11:00:00",
        },
        {
            "id": 4, "job_ref": "JI8J9K",
            "title": "CCTV Installation Specialist",
            "description": "Install and configure 32-camera CCTV system in factory premises. Must know IP cameras.",
            "designation": "CCTV Installer",
            "city": "Chennai", "state": "Tamil Nadu",
            "budget_min_inr": 700, "budget_max_inr": 1000,
            "experience_required": 2,
            "is_urgent": True, "is_active": True,
            "employer_name": "TechSec Industries",
            "employer_contact": "+91XXXXXXXXXX",
            "created_at": "2026-06-13T08:00:00",
            "expires_at": "2026-07-13T08:00:00",
        },
        {
            "id": 5, "job_ref": "JL0M1N",
            "title": "House Painter — Interior & Exterior",
            "description": "Complete painting job for 4-floor building. Must supply own brushes. Primer + 2 coats.",
            "designation": "Painter",
            "city": "Bangalore", "state": "Karnataka",
            "budget_min_inr": 400, "budget_max_inr": 600,
            "experience_required": 1,
            "is_urgent": False, "is_active": True,
            "employer_name": "Prestige Builders",
            "employer_contact": "+91XXXXXXXXXX",
            "created_at": "2026-06-09T16:00:00",
            "expires_at": "2026-07-09T16:00:00",
        },
    ]
