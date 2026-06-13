"""
Translation Service — supports 10 Indian languages
Uses deep-translator with langdetect for auto-detection.
"""
import logging
from langdetect import detect, LangDetectException

logger = logging.getLogger(__name__)

# Language code mapping
SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "bn": "Bengali",
    "ta": "Tamil",
    "te": "Telugu",
    "gu": "Gujarati",
    "kn": "Kannada",
    "pa": "Punjabi",
    "or": "Odia",
    "ml": "Malayalam",
    "ur": "Urdu",
}

# Greeting words per language for quick detection
LANG_GREETINGS = {
    "hi": ["नमस्ते", "नमस्कार", "हैलो", "काम", "मजदूर", "नौकरी"],
    "bn": ["নমস্কার", "হ্যালো", "কাজ", "শ্রমিক"],
    "ta": ["வணக்கம்", "வேலை", "தொழிலாளர்"],
    "te": ["నమస్కారం", "పని", "కార్మికుడు"],
    "mr": ["नमस्कार", "काम", "कामगार"],
    "gu": ["નમસ્તે", "કામ", "મજૂર"],
    "kn": ["ನಮಸ್ಕಾರ", "ಕೆಲಸ", "ಕಾರ್ಮಿಕ"],
    "pa": ["ਸਤ ਸ੍ਰੀ ਅਕਾਲ", "ਕੰਮ", "ਮਜ਼ਦੂਰ"],
}


def detect_language(text: str) -> str:
    """Detect language code from text. Returns 'en' as fallback."""
    # Quick check for Indian script characters
    for lang, words in LANG_GREETINGS.items():
        for word in words:
            if word in text:
                return lang

    try:
        detected = detect(text)
        if detected in SUPPORTED_LANGUAGES:
            return detected
        return "en"
    except LangDetectException:
        return "en"


def translate_to_english(text: str, source_lang: str = "auto") -> str:
    """Translate text to English. Returns original if translation fails."""
    if source_lang == "en" or not text.strip():
        return text

    try:
        from deep_translator import GoogleTranslator
        if source_lang == "auto":
            source_lang = detect_language(text)
        if source_lang == "en":
            return text
        translated = GoogleTranslator(source=source_lang, target="en").translate(text)
        return translated or text
    except Exception as e:
        logger.warning(f"Translation to EN failed: {e}")
        return text


def translate_from_english(text: str, target_lang: str) -> str:
    """Translate English text to target language."""
    if target_lang == "en" or not text.strip():
        return text

    try:
        from deep_translator import GoogleTranslator
        translated = GoogleTranslator(source="en", target=target_lang).translate(text)
        return translated or text
    except Exception as e:
        logger.warning(f"Translation from EN to {target_lang} failed: {e}")
        return text


def get_language_name(lang_code: str) -> str:
    return SUPPORTED_LANGUAGES.get(lang_code, "English")
