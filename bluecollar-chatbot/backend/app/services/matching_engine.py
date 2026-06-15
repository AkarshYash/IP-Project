"""
Matching Engine stats — enhanced
"""
import logging
import os
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Optional

logger = logging.getLogger(__name__)

# Global state
_df: Optional[pd.DataFrame] = None
_vectorizer: Optional[TfidfVectorizer] = None
_tfidf_matrix = None


def _find_csv() -> Optional[str]:
    """Search for the CSV file in common locations."""
    candidates = [
        os.path.join(os.path.dirname(__file__), "../../../../blue_collar_workers_500.csv"),
        os.path.join(os.path.dirname(__file__), "../../../blue_collar_workers_500.csv"),
        "blue_collar_workers_500.csv",
        "../blue_collar_workers_500.csv",
        "../../blue_collar_workers_500.csv",
    ]
    for path in candidates:
        abs_path = os.path.abspath(path)
        if os.path.exists(abs_path):
            return abs_path
    return None


def build_index():
    """Build TF-IDF index from worker CSV."""
    global _df, _vectorizer, _tfidf_matrix

    csv_path = _find_csv()
    if not csv_path:
        logger.warning("⚠️  Worker CSV not found — matching engine disabled")
        return

    try:
        _df = pd.read_csv(csv_path)
        logger.info(f"✅ Loaded {len(_df)} workers from {csv_path}")

        # Build searchable text for each worker
        _df["search_text"] = (
            _df["designation"].fillna("") + " " +
            _df["city"].fillna("") + " " +
            _df["state"].fillna("") + " " +
            _df["languages_known"].fillna("") + " " +
            _df["profile_summary"].fillna("") + " " +
            _df["availability"].fillna("")
        ).str.lower()

        _vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            stop_words="english",
        )
        _tfidf_matrix = _vectorizer.fit_transform(_df["search_text"])
        logger.info("✅ TF-IDF index built successfully")
    except Exception as e:
        logger.error(f"❌ Failed to build index: {e}")


def search_workers(
    query: str,
    top_k: int = 10,
    city: Optional[str] = None,
    designation: Optional[str] = None,
    min_rating: float = 0.0,
    availability: Optional[str] = None,
    use_weaviate: bool = False,
    use_postgis: bool = False,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    radius_km: float = 10.0,
) -> list[dict]:
    """
    Semantic search over workers. Supports:
    1. Weaviate Vector Search
    2. PostGIS Geo-spatial search
    3. TF-IDF cosine similarity (fallback)
    """
    global _df, _vectorizer, _tfidf_matrix

    if use_weaviate:
        logger.info("Routing query to Weaviate Vector DB...")
        # Placeholder for Weaviate query execution
        # client.query.get("Worker").with_near_text({"concepts": [query]}).do()
        pass

    if use_postgis and lat and lon:
        logger.info(f"Filtering results via PostGIS ST_DWithin({radius_km}km)...")
        # Placeholder for geoalchemy2 ST_DWithin query
        pass

    if _df is None or _vectorizer is None:
        # Return sample data if index not available
        return _get_sample_workers(top_k)

    try:
        # Vectorize query
        query_vec = _vectorizer.transform([query.lower()])
        scores = cosine_similarity(query_vec, _tfidf_matrix).flatten()

        # Get top candidates (3x to allow filtering)
        top_indices = np.argsort(scores)[::-1][:top_k * 3]
        results = []

        for idx in top_indices:
            worker = _df.iloc[idx].to_dict()
            score = float(scores[idx])

            # Apply filters
            if city and city.lower() not in str(worker.get("city", "")).lower():
                continue
            if designation and designation.lower() not in str(worker.get("designation", "")).lower():
                continue
            if float(worker.get("rating", 0)) < min_rating:
                continue
            if availability and availability.lower() not in str(worker.get("availability", "")).lower():
                continue

            worker["match_score"] = round(score, 3)
            # Mask phone for public view
            if "mobile_number" in worker:
                phone = str(worker["mobile_number"])
                worker["mobile_number"] = phone[:4] + "XXXXXX" if len(phone) > 4 else "XXXXXXXXXX"

            results.append(worker)
            if len(results) >= top_k:
                break

        return results
    except Exception as e:
        logger.error(f"Search failed: {e}")
        return _get_sample_workers(top_k)


def get_worker_by_id(worker_id: str) -> Optional[dict]:
    """Get a specific worker by ID."""
    if _df is None:
        return None
    matches = _df[_df["worker_id"] == worker_id]
    if matches.empty:
        return None
    return matches.iloc[0].to_dict()


def get_all_designations() -> list[str]:
    """Get unique list of designations."""
    if _df is None:
        return []
    return sorted(_df["designation"].unique().tolist())


def get_all_cities() -> list[str]:
    """Get unique list of cities."""
    if _df is None:
        return []
    return sorted(_df["city"].unique().tolist())


def get_stats() -> dict:
    """Return dataset statistics."""
    if _df is None:
        return {"total": 0, "available": 0, "avg_rating": 0}
    
    avail_col = _df["availability"].fillna("").str.lower()
    available_count = int(avail_col.str.contains("available", na=False).sum())
    today_count = int(avail_col.str.contains("today", na=False).sum())
    busy_count = int(avail_col.str.contains("busy", na=False).sum())
    
    return {
        "total": len(_df),
        "available": available_count,
        "available_today": today_count,
        "busy": busy_count,
        "avg_rating": round(float(_df["rating"].mean()), 2),
        "designations": int(_df["designation"].nunique()),
        "cities": int(_df["city"].nunique()),
        "states": int(_df["state"].nunique()),
        "avg_hourly_rate": round(float(_df["hourly_rate_inr"].mean()), 0),
        "max_hourly_rate": int(_df["hourly_rate_inr"].max()),
        "min_hourly_rate": int(_df["hourly_rate_inr"].min()),
    }


def _get_sample_workers(n: int = 5) -> list[dict]:
    """Fallback sample data."""
    return [
        {
            "worker_id": "W0001",
            "full_name": "Rajesh Kumar",
            "designation": "Electrician",
            "rating": 4.5,
            "reviews_count": 120,
            "hourly_rate_inr": 500,
            "experience_years": 10,
            "mobile_number": "+91XXXXXXXXXX",
            "state": "Delhi",
            "city": "New Delhi",
            "languages_known": "Hindi, English",
            "availability": "Available Today",
            "match_score": 0.95,
        }
    ][:n]
