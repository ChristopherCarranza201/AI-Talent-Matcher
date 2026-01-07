# API dependencies

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client

from app.db.supabase import get_supabase

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase),
) -> str:
    """
    Resolves the authenticated user ID from the JWT and validates
    that a corresponding profile exists.

    Returns:
    --------
    user_id (str)
    """

    token = credentials.credentials

    # 1. Validate JWT and extract user
    user_response = supabase.auth.get_user(token)

    if user_response.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    user_id = user_response.user.id

    # 2. Validate profile existence (RLS-protected)
    profile_response = (
        supabase.table("profiles")
        .select("id")
        .eq("id", user_id)
        .maybe_single()   # <-- CRITICAL FIX
        .execute()
    )

    if profile_response.data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    return user_id


def require_recruiter(
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Ensures the authenticated user is a recruiter.

    Returns:
    --------
    A minimal recruiter identity dict for downstream use.
    """

    try:
        response = (
            supabase.table("profiles")
            .select("id, role")
            .eq("id", user_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify recruiter role: {exc}",
        )

    profile = response.data

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    if profile["role"] != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter access required",
        )

    return profile
