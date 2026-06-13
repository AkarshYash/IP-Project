"""
Chatbot API — REST + WebSocket endpoints
POST /api/chatbot/message
WS   /api/chatbot/ws/{session_id}
POST /api/chatbot/feedback
POST /api/chatbot/verify-document
GET  /api/chatbot/salary-predict
"""
import json
import uuid
import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.models.database import get_db
from app.models.db_models import Conversation, Message
from app.services.chatbot_engine import process_message
from app.services.vision_service import verify_worker_document
from app.services.salary_predictor import predict_salary

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])
logger = logging.getLogger(__name__)

# Active WebSocket connections
active_connections: dict[str, WebSocket] = {}


class MessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: Optional[str] = None


class FeedbackRequest(BaseModel):
    message_id: int
    feedback: int  # 1 = positive, -1 = negative


@router.post("/message")
async def send_message(
    req: MessageRequest,
    db: AsyncSession = Depends(get_db),
):
    """Main chat endpoint — processes message through full AI pipeline."""
    session_id = req.session_id or str(uuid.uuid4())

    # Get or create conversation
    result = await db.execute(
        select(Conversation).where(Conversation.session_id == session_id)
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        conversation = Conversation(
            session_id=session_id,
            channel="web",
        )
        db.add(conversation)
        await db.flush()

    # Load conversation history
    history_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.desc())
        .limit(10)
    )
    history = [
        {"role": m.role, "content": m.content}
        for m in reversed(history_result.scalars().all())
    ]

    # Process through AI pipeline
    chat_result = await process_message(
        user_message=req.message,
        session_id=session_id,
        conversation_history=history,
        force_language=req.language,
    )

    # Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=req.message,
        language=chat_result.language,
        intent=chat_result.intent,
        confidence=chat_result.confidence,
    )
    db.add(user_msg)

    # Save assistant response
    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=chat_result.response,
        language=chat_result.language,
        intent=chat_result.intent,
        response_time_ms=chat_result.response_time_ms,
    )
    db.add(assistant_msg)

    # Update conversation
    conversation.language = chat_result.language
    conversation.intent_summary = chat_result.intent
    conversation.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(assistant_msg)

    return {
        "session_id": session_id,
        "message_id": assistant_msg.id,
        "response": chat_result.response,
        "intent": chat_result.intent,
        "confidence": round(chat_result.confidence, 2),
        "language": chat_result.language,
        "response_time_ms": chat_result.response_time_ms,
        "pii_masked": len(chat_result.pii_found) > 0,
        "llm_used": chat_result.llm_used,
        "entities": chat_result.entities,
    }


@router.websocket("/ws/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    """Real-time WebSocket chat endpoint."""
    await websocket.accept()
    active_connections[session_id] = websocket
    logger.info(f"WebSocket connected: {session_id}")

    try:
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "session_id": session_id,
            "message": "🙏 Connected to Sahayak AI! How can I help you today?",
        })

        history = []
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            user_message = payload.get("message", "")
            language = payload.get("language")

            if not user_message.strip():
                continue

            # Send typing indicator
            await websocket.send_json({"type": "typing", "status": True})

            # Process message
            result = await process_message(
                user_message=user_message,
                session_id=session_id,
                conversation_history=history,
                force_language=language,
            )

            history.append({"role": "user", "content": user_message})
            history.append({"role": "assistant", "content": result.response})
            if len(history) > 20:
                history = history[-20:]

            await websocket.send_json({
                "type": "message",
                "response": result.response,
                "intent": result.intent,
                "confidence": round(result.confidence, 2),
                "language": result.language,
                "response_time_ms": result.response_time_ms,
                "llm_used": result.llm_used,
                "entities": result.entities,
            })

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.send_json({"type": "error", "message": str(e)})
    finally:
        active_connections.pop(session_id, None)


@router.post("/feedback")
async def submit_feedback(req: FeedbackRequest, db: AsyncSession = Depends(get_db)):
    """Submit thumbs up/down feedback on a message."""
    result = await db.execute(select(Message).where(Message.id == req.message_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.feedback = req.feedback
    await db.commit()
    return {"status": "ok", "message_id": req.message_id, "feedback": req.feedback}


@router.post("/verify-document")
async def verify_document(file: UploadFile = File(...)):
    """Upload and verify a worker document using Gemini Vision."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported")

    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    result = await verify_worker_document(image_bytes, mime_type=file.content_type)
    return result


@router.get("/salary-predict")
async def salary_prediction(
    designation: str = "Electrician",
    city: str = "Delhi",
    state: str = "Delhi",
    experience_years: int = 5,
    rating: float = 4.0,
):
    """Predict salary range for a worker profile."""
    return predict_salary(
        designation=designation,
        city=city,
        state=state,
        experience_years=experience_years,
        rating=rating,
    )
