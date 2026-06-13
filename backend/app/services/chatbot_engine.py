"""
Core Chatbot Engine — orchestrates the full AI pipeline:
Language detect → Moderate → Translate → Classify → Handle/LLM → Translate back → Persist
"""
import time
import logging
from dataclasses import dataclass
from typing import Optional

from app.services.translation_service import detect_language, translate_to_english, translate_from_english
from app.services.moderation import moderate
from app.services.intent_classifier import classify_intent
from app.services.action_handlers import get_handler

logger = logging.getLogger(__name__)


@dataclass
class ChatResponse:
    response: str
    intent: str
    confidence: float
    language: str
    response_time_ms: int
    pii_found: list
    entities: dict
    llm_used: bool = False


async def process_message(
    user_message: str,
    session_id: str,
    conversation_history: list = None,
    force_language: Optional[str] = None,
) -> ChatResponse:
    """
    Full pipeline:
    1. Detect language
    2. Moderate content (PII masking, harmful content check)
    3. Translate to English
    4. Classify intent
    5. Route to handler or LLM
    6. Translate response back to user language
    """
    start_time = time.time()

    # 1. Detect language
    detected_lang = force_language or detect_language(user_message)

    # 2. Moderation
    mod_result = moderate(user_message)
    if not mod_result["safe"]:
        reason = mod_result["reason"]
        response_text = {
            "harmful_intent": "⚠️ I cannot help with that request. Please ask about job-related topics.",
            "profanity": "🙏 Please keep our conversation respectful. I'm here to help with work-related queries.",
        }.get(reason, "⚠️ Request blocked by content policy.")

        elapsed = int((time.time() - start_time) * 1000)
        return ChatResponse(
            response=response_text,
            intent="blocked",
            confidence=1.0,
            language=detected_lang,
            response_time_ms=elapsed,
            pii_found=mod_result["pii_found"],
            entities={},
        )

    # 3. Translate to English if needed
    working_text = translate_to_english(mod_result["masked_text"], source_lang=detected_lang)

    # 4. Intent classification
    intent_result = classify_intent(working_text)

    # 5. Route to handler or LLM
    llm_used = False
    if intent_result.confidence >= 0.3 and intent_result.intent != "general":
        # Use structured handler
        handler = get_handler(intent_result.intent)
        response_en = handler(intent_result.entities, lang=detected_lang)
    else:
        # Fall back to LLM
        response_en = await _call_llm(working_text, conversation_history or [], intent_result.entities)
        llm_used = True

    # 6. Translate response back if needed
    final_response = translate_from_english(response_en, target_lang=detected_lang)

    elapsed = int((time.time() - start_time) * 1000)

    return ChatResponse(
        response=final_response,
        intent=intent_result.intent,
        confidence=intent_result.confidence,
        language=detected_lang,
        response_time_ms=elapsed,
        pii_found=mod_result["pii_found"],
        entities=intent_result.entities,
        llm_used=llm_used,
    )


async def _call_llm(
    message: str,
    history: list,
    entities: dict,
) -> str:
    """Call Groq LLM with context about the platform."""
    from app.config import get_settings
    settings = get_settings()

    if not settings.groq_api_key:
        return _fallback_response(message)

    try:
        from groq import Groq
        client = Groq(api_key=settings.groq_api_key)

        system_prompt = """You are Sahayak, an AI assistant for a blue-collar job marketplace in India.
        
You help with:
- Finding skilled workers (electricians, plumbers, carpenters, mechanics, etc.)
- Checking market salary rates in Indian cities
- Worker registration and verification
- Payment and dispute resolution
- Emergency worker requests

Guidelines:
- Be concise and helpful (max 150 words)
- Use simple language suitable for both employers and workers
- Include INR amounts when discussing salaries
- Mention specific Indian cities when relevant
- Use relevant emojis to make responses friendly
- If someone asks about safety emergencies, always prioritize safety first
- Do NOT discuss topics unrelated to blue-collar work, jobs, or the platform"""

        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history (last 4 exchanges)
        for h in history[-8:]:
            messages.append({"role": h["role"], "content": h["content"]})

        messages.append({"role": "user", "content": message})

        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=messages,
            max_tokens=300,
            temperature=0.7,
        )
        return response.choices[0].message.content

    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        return _fallback_response(message)


def _fallback_response(message: str) -> str:
    """Intelligent fallback when no API key is configured."""
    return (
        "🤖 I understand your query! For the best results:\n\n"
        "• Use the **Workers** page to search and filter workers\n"
        "• Check **Analytics** for salary market data\n"
        "• Visit **Settings** to configure your Groq API key for enhanced AI responses\n\n"
        "💡 Get a free Groq API key at **console.groq.com** for full AI chat capabilities!"
    )
