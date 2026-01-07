"""
Recruiter Profiles API

Purpose:
--------
Allows recruiters to update their own role-specific profile data.
Profile creation is handled at signup time only.
"""

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.api.deps import get_current_user
from app.db.supabase import get_supabase
from app.schemas.profile_updates import RecruiterProfileUpdateRequest

router = APIRouter(prefix="/recruiter-profiles", tags=["Recruiter Profiles"])


@router.patch("/me")
def update_recruiter_profile(
    payload: RecruiterProfileUpdateRequest,
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Updates the authenticated recruiter's profile.

    Ownership is enforced by:
    - auth.uid() dependency
    - RLS policy on recruiter_profiles
    """

    update_data = payload.dict(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update",
        )

    try:
        response = (
            supabase.table("recruiter_profiles")
            .update(update_data)
            .eq("profile_id", user_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update recruiter profile: {exc}",
        )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Recruiter profile not found",
        )

    return {"status": "updated"}
