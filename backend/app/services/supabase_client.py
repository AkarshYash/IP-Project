import logging
from supabase import create_client, Client
from ..config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

def get_supabase() -> Client | None:
    if not settings.supabase_url or not settings.supabase_key:
        logger.warning("Supabase URL or Key is missing. Supabase integration is disabled.")
        return None
    try:
        supabase: Client = create_client(settings.supabase_url, settings.supabase_key)
        return supabase
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None

supabase_client = get_supabase()
