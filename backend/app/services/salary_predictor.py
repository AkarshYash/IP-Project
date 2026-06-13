"""
Salary Predictor — scikit-learn model trained on blue_collar_workers_500.csv
Predicts hourly wage range based on designation, city, experience.
"""
import logging
import os
import pandas as pd
import numpy as np
from typing import Optional
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

logger = logging.getLogger(__name__)

# Global model state
_model: Optional[GradientBoostingRegressor] = None
_encoders: dict = {}
_feature_cols: list = []


def _find_csv() -> Optional[str]:
    candidates = [
        os.path.join(os.path.dirname(__file__), "../../../../blue_collar_workers_500.csv"),
        os.path.join(os.path.dirname(__file__), "../../../blue_collar_workers_500.csv"),
        "blue_collar_workers_500.csv",
        "../blue_collar_workers_500.csv",
    ]
    for path in candidates:
        abs_path = os.path.abspath(path)
        if os.path.exists(abs_path):
            return abs_path
    return None


def train_model():
    """Train salary prediction model on CSV data."""
    global _model, _encoders, _feature_cols

    csv_path = _find_csv()
    if not csv_path:
        logger.warning("⚠️  CSV not found — salary predictor disabled")
        return

    try:
        df = pd.read_csv(csv_path)
        logger.info(f"Training salary model on {len(df)} records...")

        # Encode categorical features
        cat_cols = ["designation", "city", "state", "availability"]
        for col in cat_cols:
            le = LabelEncoder()
            df[col + "_enc"] = le.fit_transform(df[col].fillna("Unknown").astype(str))
            _encoders[col] = le

        _feature_cols = [c + "_enc" for c in cat_cols] + ["experience_years", "rating", "reviews_count"]
        X = df[_feature_cols].fillna(0)
        y = df["hourly_rate_inr"].fillna(0)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        _model = GradientBoostingRegressor(
            n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42
        )
        _model.fit(X_train, y_train)
        score = _model.score(X_test, y_test)
        logger.info(f"✅ Salary model trained — R² score: {score:.3f}")
    except Exception as e:
        logger.error(f"❌ Salary model training failed: {e}")


def predict_salary(
    designation: str,
    city: str = "Delhi",
    state: str = "Delhi",
    experience_years: int = 5,
    rating: float = 4.0,
) -> dict:
    """
    Predict hourly rate range for a worker profile.
    Returns dict with min, median, max rates.
    """
    global _model, _encoders

    if _model is None:
        # Fallback rule-based estimate
        base_rates = {
            "electrician": 500, "plumber": 450, "carpenter": 550,
            "mechanic": 600, "welder": 650, "painter": 400,
            "driver": 500, "mason": 400, "gardener": 350,
            "housekeeper": 300,
        }
        base = base_rates.get(designation.lower(), 450)
        exp_multiplier = 1 + (experience_years * 0.04)
        rate = int(base * exp_multiplier)
        return {
            "designation": designation,
            "city": city,
            "experience_years": experience_years,
            "predicted_min": int(rate * 0.8),
            "predicted_median": rate,
            "predicted_max": int(rate * 1.3),
            "currency": "INR/hour",
            "confidence": "rule_based",
        }

    try:
        features = {}
        for col in ["designation", "city", "state", "availability"]:
            le = _encoders[col]
            val = {"designation": designation, "city": city, "state": state, "availability": "Available"}[col]
            try:
                features[col + "_enc"] = le.transform([val])[0]
            except ValueError:
                features[col + "_enc"] = 0  # unknown category

        features["experience_years"] = experience_years
        features["rating"] = rating
        features["reviews_count"] = 50  # default

        X = pd.DataFrame([features])[_feature_cols]
        prediction = float(_model.predict(X)[0])
        prediction = max(200, min(prediction, 2000))  # clamp

        return {
            "designation": designation,
            "city": city,
            "experience_years": experience_years,
            "predicted_min": int(prediction * 0.8),
            "predicted_median": int(prediction),
            "predicted_max": int(prediction * 1.3),
            "currency": "INR/hour",
            "confidence": "ml_model",
        }
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        return {"error": str(e)}
