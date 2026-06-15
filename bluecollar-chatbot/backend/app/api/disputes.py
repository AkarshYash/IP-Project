"""
Disputes & Fraud Alerts API
GET  /api/disputes/
POST /api/disputes/
PATCH /api/disputes/{id}/action
GET  /api/fraud/
PATCH /api/fraud/{id}/action
"""
import uuid
import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.models.database import get_db
from app.models.db_models import Dispute, FraudAlert, DisputeStatus, FraudStatus

router = APIRouter(tags=["disputes"])
logger = logging.getLogger(__name__)


class NewDispute(BaseModel):
    worker_name: str
    employer_name: str
    amount_inr: float
    reason: str
    priority: str = "medium"


class DisputeAction(BaseModel):
    action: str  # approve | refund | reject


class FraudAction(BaseModel):
    action: str  # suspend | investigate | clear


# ── Disputes ──────────────────────────────────────────────────────────────────

disputes_router = APIRouter(prefix="/api/disputes", tags=["disputes"])


@disputes_router.get("/")
async def list_disputes(
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    query = select(Dispute).order_by(Dispute.created_at.desc())
    if status:
        try:
            query = query.where(Dispute.status == DisputeStatus(status))
        except ValueError:
            pass

    total_result = await db.execute(select(func.count(Dispute.id)))
    total = total_result.scalar() or 0

    result = await db.execute(query.limit(limit).offset(offset))
    disputes = result.scalars().all()

    # Seed sample data if empty
    if total == 0:
        return {"disputes": _sample_disputes(), "total": 8}

    return {
        "disputes": [_dispute_to_dict(d) for d in disputes],
        "total": total,
    }


@disputes_router.post("/")
async def create_dispute(data: NewDispute, db: AsyncSession = Depends(get_db)):
    dispute = Dispute(
        dispute_ref=f"D{str(uuid.uuid4())[:6].upper()}",
        worker_name=data.worker_name,
        employer_name=data.employer_name,
        amount_inr=data.amount_inr,
        reason=data.reason,
        priority=data.priority,
        status=DisputeStatus.open,
    )
    db.add(dispute)
    await db.commit()
    await db.refresh(dispute)
    return _dispute_to_dict(dispute)


@disputes_router.patch("/{dispute_id}/action")
async def dispute_action(
    dispute_id: int,
    req: DisputeAction,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Dispute).where(Dispute.id == dispute_id))
    dispute = result.scalar_one_or_none()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")

    action_map = {
        "approve": DisputeStatus.resolved,
        "refund": DisputeStatus.refunded,
        "reject": DisputeStatus.rejected,
    }
    new_status = action_map.get(req.action)
    if not new_status:
        raise HTTPException(status_code=400, detail="Invalid action")

    dispute.status = new_status
    dispute.resolved_at = datetime.utcnow()
    await db.commit()
    return {"dispute_id": dispute_id, "status": new_status.value}


# ── Fraud Alerts ──────────────────────────────────────────────────────────────

fraud_router = APIRouter(prefix="/api/fraud", tags=["fraud"])


@fraud_router.get("/")
async def list_fraud_alerts(
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    total_result = await db.execute(select(func.count(FraudAlert.id)))
    total = total_result.scalar() or 0

    query = select(FraudAlert).order_by(FraudAlert.created_at.desc())
    if status:
        try:
            query = query.where(FraudAlert.status == FraudStatus(status))
        except ValueError:
            pass

    result = await db.execute(query.limit(limit).offset(offset))
    alerts = result.scalars().all()

    if total == 0:
        return {"alerts": _sample_fraud_alerts(), "total": 5}

    return {
        "alerts": [_fraud_to_dict(a) for a in alerts],
        "total": total,
    }


@fraud_router.patch("/{alert_id}/action")
async def fraud_action(
    alert_id: int,
    req: FraudAction,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(FraudAlert).where(FraudAlert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    action_map = {
        "suspend": FraudStatus.suspended,
        "investigate": FraudStatus.investigating,
        "clear": FraudStatus.cleared,
    }
    new_status = action_map.get(req.action)
    if not new_status:
        raise HTTPException(status_code=400, detail="Invalid action")

    alert.status = new_status
    await db.commit()
    return {"alert_id": alert_id, "status": new_status.value}


def _dispute_to_dict(d: Dispute) -> dict:
    return {
        "id": d.id,
        "dispute_ref": d.dispute_ref,
        "worker_name": d.worker_name,
        "employer_name": d.employer_name,
        "amount_inr": d.amount_inr,
        "reason": d.reason,
        "status": d.status.value,
        "priority": d.priority,
        "created_at": d.created_at.isoformat(),
        "resolved_at": d.resolved_at.isoformat() if d.resolved_at else None,
    }


def _fraud_to_dict(a: FraudAlert) -> dict:
    return {
        "id": a.id,
        "alert_ref": a.alert_ref,
        "suspect_name": a.suspect_name,
        "alert_type": a.alert_type,
        "risk_score": a.risk_score,
        "description": a.description,
        "status": a.status.value,
        "created_at": a.created_at.isoformat(),
    }


def _sample_disputes() -> list:
    return [
        {"id": 1, "dispute_ref": "DA1F3C", "worker_name": "Rajesh Kumar", "employer_name": "Sharma Constructions",
         "amount_inr": 2500, "reason": "Work not completed as agreed", "status": "open", "priority": "high",
         "created_at": "2026-06-10T10:30:00", "resolved_at": None},
        {"id": 2, "dispute_ref": "DB2E7A", "worker_name": "Sunita Devi", "employer_name": "Hotel Grand Palace",
         "amount_inr": 1800, "reason": "Payment delay by employer", "status": "open", "priority": "medium",
         "created_at": "2026-06-11T14:20:00", "resolved_at": None},
        {"id": 3, "dispute_ref": "DC4F1B", "worker_name": "Mohammed Rashid", "employer_name": "Tech Park Ltd",
         "amount_inr": 5000, "reason": "Quality of electrical work substandard", "status": "resolved", "priority": "high",
         "created_at": "2026-06-08T09:00:00", "resolved_at": "2026-06-12T11:00:00"},
    ]


def _sample_fraud_alerts() -> list:
    return [
        {"id": 1, "alert_ref": "FR001A", "suspect_name": "Unknown User", "alert_type": "fake_profile",
         "risk_score": 87, "description": "Multiple accounts from same IP address detected",
         "status": "open", "created_at": "2026-06-12T08:00:00"},
        {"id": 2, "alert_ref": "FR002B", "suspect_name": "Vijay Sharma", "alert_type": "payment_fraud",
         "risk_score": 73, "description": "Unusual payment pattern — 15 transactions in 1 hour",
         "status": "investigating", "created_at": "2026-06-11T16:00:00"},
    ]
