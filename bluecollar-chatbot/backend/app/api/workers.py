"""
Workers API — search, list, seed from CSV, verification queue
GET  /api/workers/
GET  /api/workers/search
GET  /api/workers/{worker_id}
POST /api/workers/seed
PATCH /api/workers/{worker_id}/verify
GET  /api/workers/designations
GET  /api/workers/cities
"""
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.models.database import get_db
from app.models.db_models import Worker, VerificationStatus
from app.services.matching_engine import search_workers, get_all_designations, get_all_cities, get_stats

router = APIRouter(prefix="/api/workers", tags=["workers"])
logger = logging.getLogger(__name__)


class VerifyRequest(BaseModel):
    status: str  # verified | rejected | pending


@router.get("/")
async def list_workers(
    page: int = 1,
    limit: int = 20,
    designation: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    availability: Optional[str] = None,
    min_rating: float = 0.0,
    db: AsyncSession = Depends(get_db),
):
    """List workers from DB with filters and pagination."""
    # Check if DB has workers
    count_result = await db.execute(select(func.count(Worker.id)))
    db_count = count_result.scalar() or 0

    if db_count == 0:
        # Serve from CSV via matching engine
        results = search_workers(
            query=designation or city or "worker",
            city=city,
            designation=designation,
            min_rating=min_rating,
            availability=availability,
            top_k=limit,
        )
        return {
            "workers": results,
            "total": get_stats().get("total", 500),
            "page": page,
            "limit": limit,
            "source": "csv",
        }

    # Query DB
    query = select(Worker)
    if designation:
        query = query.where(Worker.designation.ilike(f"%{designation}%"))
    if city:
        query = query.where(Worker.city.ilike(f"%{city}%"))
    if state:
        query = query.where(Worker.state.ilike(f"%{state}%"))
    if availability:
        query = query.where(Worker.availability.ilike(f"%{availability}%"))
    if min_rating > 0:
        query = query.where(Worker.rating >= min_rating)

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar() or 0

    query = query.order_by(Worker.rating.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    workers = result.scalars().all()

    return {
        "workers": [_worker_to_dict(w) for w in workers],
        "total": total,
        "page": page,
        "limit": limit,
        "source": "db",
    }


@router.get("/search")
async def semantic_search(
    q: str = Query(..., description="Search query"),
    city: Optional[str] = None,
    designation: Optional[str] = None,
    min_rating: float = 0.0,
    availability: Optional[str] = None,
    top_k: int = 10,
):
    """Semantic TF-IDF search over worker dataset."""
    results = search_workers(
        query=q,
        city=city,
        designation=designation,
        min_rating=min_rating,
        availability=availability,
        top_k=top_k,
    )
    return {"results": results, "count": len(results), "query": q}


@router.get("/designations")
async def list_designations():
    return {"designations": get_all_designations()}


@router.get("/cities")
async def list_cities():
    return {"cities": get_all_cities()}


@router.get("/stats")
async def worker_stats():
    return get_stats()


@router.get("/{worker_id}")
async def get_worker(worker_id: str, db: AsyncSession = Depends(get_db)):
    """Get specific worker by ID — from DB or CSV."""
    result = await db.execute(select(Worker).where(Worker.worker_id == worker_id))
    worker = result.scalar_one_or_none()

    if worker:
        return _worker_to_dict(worker)

    # Fallback to CSV
    from app.services.matching_engine import get_worker_by_id
    csv_worker = get_worker_by_id(worker_id)
    if csv_worker:
        return csv_worker

    raise HTTPException(status_code=404, detail="Worker not found")


@router.patch("/{worker_id}/verify")
async def update_verification(
    worker_id: str,
    req: VerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update worker verification status."""
    result = await db.execute(select(Worker).where(Worker.worker_id == worker_id))
    worker = result.scalar_one_or_none()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    try:
        worker.verification_status = VerificationStatus(req.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")

    await db.commit()
    return {"worker_id": worker_id, "status": req.status}


@router.post("/seed")
async def seed_workers_from_csv(db: AsyncSession = Depends(get_db)):
    """Seed database from CSV file."""
    count_result = await db.execute(select(func.count(Worker.id)))
    existing = count_result.scalar() or 0
    if existing > 0:
        return {"message": f"DB already has {existing} workers", "seeded": 0}

    import pandas as pd
    from app.services.matching_engine import _find_csv
    csv_path = _find_csv()
    if not csv_path:
        raise HTTPException(status_code=404, detail="CSV file not found")

    df = pd.read_csv(csv_path)
    seeded = 0
    for _, row in df.iterrows():
        worker = Worker(
            worker_id=str(row.get("worker_id", "")),
            full_name=str(row.get("full_name", "")),
            designation=str(row.get("designation", "")),
            rating=float(row.get("rating", 0)),
            reviews_count=int(row.get("reviews_count", 0)),
            hourly_rate_inr=int(row.get("hourly_rate_inr", 0)),
            experience_years=int(row.get("experience_years", 0)),
            mobile_number=str(row.get("mobile_number", "")),
            state=str(row.get("state", "")),
            city=str(row.get("city", "")),
            languages_known=str(row.get("languages_known", "")),
            payment_method=str(row.get("payment_method", "")),
            availability=str(row.get("availability", "Available")),
            profile_summary=str(row.get("profile_summary", "")),
        )
        db.add(worker)
        seeded += 1

    await db.commit()
    return {"message": f"Seeded {seeded} workers", "seeded": seeded}


def _worker_to_dict(w: Worker) -> dict:
    return {
        "worker_id": w.worker_id,
        "full_name": w.full_name,
        "designation": w.designation,
        "rating": w.rating,
        "reviews_count": w.reviews_count,
        "hourly_rate_inr": w.hourly_rate_inr,
        "experience_years": w.experience_years,
        "mobile_number": w.mobile_number,
        "state": w.state,
        "city": w.city,
        "languages_known": w.languages_known,
        "payment_method": w.payment_method,
        "availability": w.availability,
        "profile_summary": w.profile_summary,
        "verification_status": w.verification_status.value,
        "is_featured": w.is_featured,
        "created_at": w.created_at.isoformat(),
    }
