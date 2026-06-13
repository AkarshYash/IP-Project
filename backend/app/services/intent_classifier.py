"""
Intent Classifier — 16 intents for blue-collar job platform
Uses keyword matching with confidence scoring.
"""
import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class IntentResult:
    intent: str
    confidence: float
    entities: dict


# Intent definitions with keywords
INTENTS = {
    "find_worker": {
        "keywords": [
            "find", "need", "hire", "looking for", "want", "search",
            "electrician", "plumber", "carpenter", "painter", "mechanic",
            "welder", "driver", "gardener", "housekeeper", "mason",
            "cctv", "ac technician", "solar", "pest control", "mobile repair",
            "ढूंढ", "चाहिए", "काम", "मजदूर", "कारीगर",
        ],
        "weight": 1.2,
    },
    "check_salary": {
        "keywords": [
            "salary", "pay", "rate", "cost", "price", "charge", "fee",
            "wage", "earning", "income", "how much", "kitna",
            "वेतन", "तनख्वाह", "पैसा", "कितना", "दाम", "खर्च",
        ],
        "weight": 1.0,
    },
    "register_worker": {
        "keywords": [
            "register", "sign up", "join", "create account", "enroll",
            "पंजीकरण", "दर्ज", "शामिल", "रजिस्टर",
        ],
        "weight": 1.0,
    },
    "check_availability": {
        "keywords": [
            "available", "free", "when", "schedule", "time", "today",
            "tomorrow", "now", "urgent",
            "उपलब्ध", "कब", "आज", "कल", "अभी", "जल्दी",
        ],
        "weight": 0.9,
    },
    "job_status": {
        "keywords": [
            "status", "update", "progress", "done", "complete", "finished",
            "work order", "booking", "स्थिति", "अपडेट", "काम हुआ",
        ],
        "weight": 0.9,
    },
    "payment_issue": {
        "keywords": [
            "payment", "paid", "money", "refund", "transaction", "transfer",
            "upi", "bank", "cash", "invoice",
            "भुगतान", "पैसे", "वापस", "रिफंड",
        ],
        "weight": 1.1,
    },
    "dispute": {
        "keywords": [
            "dispute", "complaint", "problem", "issue", "wrong", "bad",
            "quality", "not satisfied", "poor", "cheat", "fraud",
            "शिकायत", "समस्या", "गलत", "धोखा",
        ],
        "weight": 1.1,
    },
    "emergency": {
        "keywords": [
            "emergency", "urgent", "asap", "immediately", "danger",
            "leak", "fire", "accident", "help", "sos",
            "आपातकाल", "जरूरी", "खतरा", "मदद", "लीक",
        ],
        "weight": 1.5,
    },
    "verify_worker": {
        "keywords": [
            "verify", "verification", "check", "background", "authentic",
            "genuine", "trust", "certificate", "id proof",
            "सत्यापन", "जांच", "प्रमाण",
        ],
        "weight": 1.0,
    },
    "skill_info": {
        "keywords": [
            "skill", "expertise", "experience", "qualification", "training",
            "certif", "course", "learn",
            "कौशल", "अनुभव", "प्रशिक्षण",
        ],
        "weight": 0.9,
    },
    "location_search": {
        "keywords": [
            "near", "nearby", "location", "area", "city", "state",
            "district", "pincode", "address", "km", "distance",
            "पास", "नजदीक", "क्षेत्र", "शहर",
        ],
        "weight": 1.0,
    },
    "language_help": {
        "keywords": [
            "hindi", "bengali", "tamil", "telugu", "marathi", "gujarati",
            "kannada", "punjabi", "language", "translate",
            "हिंदी", "भाषा",
        ],
        "weight": 0.8,
    },
    "greeting": {
        "keywords": [
            "hello", "hi", "hey", "namaste", "good morning", "good evening",
            "नमस्ते", "नमस्कार", "हेलो", "प्रणाम",
        ],
        "weight": 0.7,
    },
    "farewell": {
        "keywords": [
            "bye", "goodbye", "thank you", "thanks", "ok done",
            "धन्यवाद", "शुक्रिया", "अलविदा", "ठीक है",
        ],
        "weight": 0.7,
    },
    "help": {
        "keywords": [
            "help", "support", "assist", "guide", "how to", "what can",
            "मदद", "सहायता", "कैसे", "क्या",
        ],
        "weight": 0.8,
    },
    "general": {
        "keywords": [],
        "weight": 0.1,
    },
}


def classify_intent(text: str) -> IntentResult:
    """
    Classify intent from user text.
    Returns IntentResult with intent name, confidence (0-1), and extracted entities.
    """
    text_lower = text.lower()
    scores = {}

    for intent_name, intent_data in INTENTS.items():
        if intent_name == "general":
            continue
        score = 0
        matched_keywords = []
        for keyword in intent_data["keywords"]:
            if keyword.lower() in text_lower:
                score += intent_data["weight"]
                matched_keywords.append(keyword)
        if score > 0:
            scores[intent_name] = score

    if not scores:
        return IntentResult(intent="general", confidence=0.3, entities=extract_entities(text))

    best_intent = max(scores, key=scores.get)
    max_score = scores[best_intent]

    # Normalize confidence to 0-1
    confidence = min(max_score / 3.0, 1.0)

    return IntentResult(
        intent=best_intent,
        confidence=confidence,
        entities=extract_entities(text),
    )


def extract_entities(text: str) -> dict:
    """Extract key entities: location, designation, rate."""
    entities = {}

    # Designations
    designations = [
        "electrician", "plumber", "carpenter", "painter", "mechanic",
        "welder", "driver", "gardener", "housekeeper", "mason",
        "ac technician", "cctv installer", "solar panel technician",
        "pest control technician", "mobile repair technician",
        "computer repair technician", "refrigerator technician",
        "water purifier technician", "appliance repair technician",
        "tv repair technician",
    ]
    text_lower = text.lower()
    for d in designations:
        if d in text_lower:
            entities["designation"] = d.title()
            break

    # Indian cities
    cities = [
        "mumbai", "delhi", "bangalore", "bengaluru", "hyderabad", "chennai",
        "kolkata", "pune", "jaipur", "ahmedabad", "surat", "lucknow",
        "kanpur", "nagpur", "indore", "bhopal", "noida", "gurugram",
        "coimbatore", "madurai", "jodhpur", "udaipur", "warangal",
        "siliguri", "mysuru", "hubballi",
    ]
    for city in cities:
        if city in text_lower:
            entities["city"] = city.title()
            break

    # States
    states = [
        "maharashtra", "delhi", "karnataka", "telangana", "tamil nadu",
        "west bengal", "gujarat", "rajasthan", "uttar pradesh",
        "madhya pradesh", "punjab",
    ]
    for state in states:
        if state in text_lower:
            entities["state"] = state.title()
            break

    # Budget/rate
    rate_match = re.search(r"(\d+)\s*(?:rs|inr|rupee|₹)", text_lower)
    if rate_match:
        entities["budget_inr"] = int(rate_match.group(1))

    return entities
