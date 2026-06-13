import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "Sahayak — BlueCollar AI"
    app_version: str = "2.0.0"
    debug: bool = False

    # Database
    database_url: str = "sqlite+aiosqlite:///./sahayak.db"

    # Redis
    redis_url: str = "redis://localhost:6379"
    redis_enabled: bool = True

    # Auth
    jwt_secret: str = "change-me-in-production-please-use-strong-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 hours

    # AI
    groq_api_key: str = ""
    gemini_api_key: str = ""

    # Twilio
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""

    # Telegram
    telegram_bot_token: str = ""

    # CORS
    cors_origins: str = "http://localhost:8000,http://127.0.0.1:8000,*"

    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60

    # CSV Path
    workers_csv_path: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    def get_cors_origins(self) -> list:
        return [o.strip() for o in self.cors_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
