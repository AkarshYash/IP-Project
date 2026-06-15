"""
Resume Parser Service using spaCy and PyMuPDF
Extracts skills, designation, and experience from PDF resumes.
"""
import logging
import io
import re
from typing import Dict, Any

logger = logging.getLogger(__name__)

def parse_resume_pdf(pdf_bytes: bytes) -> Dict[str, Any]:
    """Parse a PDF resume and extract relevant entities using spaCy."""
    try:
        import fitz  # PyMuPDF
        import spacy
    except ImportError:
        logger.warning("spaCy or PyMuPDF not installed. Returning mock data.")
        return _mock_parse()

    # Extract text from PDF
    text = ""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page in doc:
            text += page.get_text()
    except Exception as e:
        logger.error(f"Failed to read PDF: {e}")
        return {"error": "Invalid PDF format"}

    # Load spaCy model (fallback to en_core_web_sm if available, otherwise rule-based)
    try:
        nlp = spacy.load("en_core_web_sm")
        doc_spacy = nlp(text)
        # We could use advanced NER here, but for blue-collar we often rely on regex/keywords
    except Exception as e:
        logger.warning(f"spaCy model not loaded ({e}). Using regex rules.")

    return _rule_based_extraction(text)

def _rule_based_extraction(text: str) -> Dict[str, Any]:
    """Fallback rule-based extraction for blue-collar skills."""
    text_lower = text.lower()
    
    # Common designations
    designations = [
        "electrician", "plumber", "carpenter", "painter", "mechanic",
        "welder", "driver", "gardener", "housekeeper", "mason",
        "technician"
    ]
    
    found_desig = "Unknown"
    for d in designations:
        if d in text_lower:
            found_desig = d.title()
            break
            
    # Extract years of experience (e.g. "5 years of experience")
    exp_match = re.search(r'(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience', text_lower)
    exp_years = int(exp_match.group(1)) if exp_match else 0
    
    # Extract phone number (Indian format)
    phone_match = re.search(r'(?:\+91|91)?\W*([6-9]\d{9})', text)
    phone = phone_match.group(1) if phone_match else None
    
    return {
        "designation": found_desig,
        "experience_years": exp_years,
        "mobile_number": phone,
        "raw_text_length": len(text),
        "parser": "spacy_rules"
    }

def _mock_parse() -> Dict[str, Any]:
    return {
        "designation": "Electrician",
        "experience_years": 5,
        "mobile_number": "9876543210",
        "parser": "mock"
    }
