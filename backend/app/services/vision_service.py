"""
Vision Service — Gemini Flash for document verification
Extracts name, skills, and auto-redacts sensitive ID numbers.
"""
import logging
import base64
from typing import Optional

logger = logging.getLogger(__name__)


async def verify_worker_document(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Verify a worker document using Gemini Flash vision API.
    Extracts name and skills; redacts sensitive ID numbers.
    """
    from app.config import get_settings
    settings = get_settings()

    if not settings.gemini_api_key:
        logger.warning("Gemini API key not set — using mock verification")
        return _mock_verification()

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)

        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = """Analyze this worker verification document image. 
        
        Please extract and return in JSON format:
        1. "full_name": The person's name (string)
        2. "designation": Their job title/skill (string)
        3. "skills": List of skills mentioned (array)
        4. "issuing_authority": Who issued this document (string)
        5. "is_valid_document": Whether this appears to be a genuine document (boolean)
        6. "confidence": Your confidence level 0-100 (integer)
        7. "flags": Any red flags found (array)
        
        IMPORTANT: Do NOT include any Aadhaar numbers, PAN numbers, or national ID numbers 
        in your response. Redact all sensitive identity numbers."""

        import PIL.Image
        import io
        image = PIL.Image.open(io.BytesIO(image_bytes))

        response = model.generate_content([prompt, image])

        # Parse response
        text = response.text
        import json
        import re
        json_match = re.search(r"\{.*\}", text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            result = {"analysis": text, "is_valid_document": True, "confidence": 60}

        result["verification_method"] = "gemini_vision"
        return result

    except Exception as e:
        logger.error(f"Vision verification failed: {e}")
        return {"error": str(e), "verification_method": "failed"}


def _mock_verification() -> dict:
    """Mock verification result when API key is not available."""
    return {
        "full_name": "Verification Pending",
        "designation": "N/A",
        "skills": [],
        "issuing_authority": "N/A",
        "is_valid_document": None,
        "confidence": 0,
        "flags": ["API key not configured — manual review required"],
        "verification_method": "mock",
    }
