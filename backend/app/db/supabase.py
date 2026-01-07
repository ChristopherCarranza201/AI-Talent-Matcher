# Supabase database connection and utilities

from supabase import create_client, Client
from app.core.config import settings

_supabase: Client | None = None


def get_supabase() -> Client:
    """
    Returns a singleton Supabase client instance.

    This function is safe to use with FastAPI Depends
    and preserves backward compatibility with the existing
    `supabase` variable.
    """
    global _supabase

    if _supabase is None:
        _supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )

    return _supabase


# Backward compatibility (existing imports keep working)
supabase = get_supabase()
