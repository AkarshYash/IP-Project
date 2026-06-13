"""
Content Moderation Service
- PII masking: Aadhaar, PAN, phone numbers, bank accounts
- Profanity filter (EN + HI)
- Harmful intent detection
"""
import re
import logging

logger = logging.getLogger(__name__)

# PII Patterns
PII_PATTERNS = {
    "aadhaar": r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b",
    "pan": r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",
    "phone": r"\b(?:\+91[\s-]?)?[6-9]\d{9}\b",
    "bank_account": r"\b\d{9,18}\b",
    "ifsc": r"\b[A-Z]{4}0[A-Z0-9]{6}\b",
    "credit_card": r"\b(?:\d{4}[\s-]?){3}\d{4}\b",
    "email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
}

# Replacement tokens
PII_REPLACEMENTS = {
    "aadhaar": "[AADHAAR-REDACTED]",
    "pan": "[PAN-REDACTED]",
    "phone": "[PHONE-REDACTED]",
    "bank_account": "[ACCOUNT-REDACTED]",
    "ifsc": "[IFSC-REDACTED]",
    "credit_card": "[CARD-REDACTED]",
    "email": "[EMAIL-REDACTED]",
}

# Harmful intents / keywords
HARMFUL_KEYWORDS_EN = [
    "kill", "murder", "bomb", "attack", "weapon", "suicide",
    "drug", "poison", "hack", "exploit", "scam", "fraud",
]

HARMFUL_KEYWORDS_HI = [
    "मार", "हत्या", "बम", "हमला", "आत्महत्या",
    "नशा", "धोखा", "घोटाला",
]

PROFANITY_EN = [
    "shit", "fuck", "ass", "bitch", "damn", "crap",
    "bastard", "hell",
]

PROFANITY_HI = ["गधा", "बेवकूफ", "कमीना", "हरामी"]


def mask_pii(text: str) -> tuple[str, list[str]]:
    """
    Mask all PII in text.
    Returns (masked_text, list_of_found_pii_types)
    """
    found_pii = []
    masked = text

    for pii_type, pattern in PII_PATTERNS.items():
        matches = re.findall(pattern, masked, re.IGNORECASE)
        if matches:
            found_pii.append(pii_type)
            masked = re.sub(pattern, PII_REPLACEMENTS[pii_type], masked, flags=re.IGNORECASE)

    return masked, found_pii


def is_harmful(text: str) -> bool:
    """Check if text contains harmful intent."""
    text_lower = text.lower()
    for keyword in HARMFUL_KEYWORDS_EN + HARMFUL_KEYWORDS_HI:
        if keyword.lower() in text_lower:
            return True
    return False


def contains_profanity(text: str) -> bool:
    """Check for profanity."""
    text_lower = text.lower()
    for word in PROFANITY_EN + PROFANITY_HI:
        if word.lower() in text_lower:
            return True
    return False


def moderate(text: str) -> dict:
    """
    Full moderation pipeline.
    Returns {
        "safe": bool,
        "masked_text": str,
        "pii_found": list,
        "reason": str
    }
    """
    if is_harmful(text):
        return {
            "safe": False,
            "masked_text": text,
            "pii_found": [],
            "reason": "harmful_intent",
        }

    if contains_profanity(text):
        return {
            "safe": False,
            "masked_text": text,
            "pii_found": [],
            "reason": "profanity",
        }

    masked_text, pii_found = mask_pii(text)

    return {
        "safe": True,
        "masked_text": masked_text,
        "pii_found": pii_found,
        "reason": None,
    }
