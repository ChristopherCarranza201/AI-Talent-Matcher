"""
Profiles API

Purpose:
--------
Allows users to update their base profile information (full_name, role, avatar_url).
This is separate from role-specific profile updates.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from supabase import Client
import uuid
from typing import Optional

from app.api.deps import get_current_user
from app.db.supabase import get_supabase
from app.schemas.profile_updates import ProfileUpdateRequest

router = APIRouter(prefix="/profiles", tags=["Profiles"])


@router.patch("/me")
def update_profile(
    payload: ProfileUpdateRequest,
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Updates the authenticated user's base profile (full_name, role, avatar_url).
    
    Ownership is enforced by:
    - auth.uid() dependency
    - RLS policy on profiles
    """
    
    update_data = payload.dict(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update",
        )
    
    # Validate role if provided
    if "role" in update_data:
        if update_data["role"] not in ["recruiter", "candidate"]:
            raise HTTPException(
                status_code=400,
                detail="Role must be either 'recruiter' or 'candidate'",
            )
    
    try:
        response = (
            supabase.table("profiles")
            .update(update_data)
            .eq("id", user_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update profile: {exc}",
        )
    
    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )
    
    return {"status": "updated", "data": response.data[0]}


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Uploads a profile picture to Supabase Storage and updates the profile.
    
    File size limit: 5MB
    Allowed formats: jpg, jpeg, png, gif, webp
    """
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}",
        )
    
    # Read file content
    file_content = await file.read()
    
    # Validate file size (5MB limit)
    max_size = 5 * 1024 * 1024  # 5MB in bytes
    if len(file_content) > max_size:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 5MB limit",
        )
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{user_id}/{uuid.uuid4()}.{file_extension}"
    
    try:
        # Upload to Supabase Storage
        storage_response = supabase.storage.from_("avatars").upload(
            unique_filename,
            file_content,
            file_options={"content-type": file.content_type, "upsert": "true"}
        )
        
        # Get public URL from Supabase Storage
        # The get_public_url method returns a string with the full public URL
        from app.core.config import settings
        avatar_url_response = supabase.storage.from_("avatars").get_public_url(unique_filename)
        
        # Handle different response formats from Supabase client
        # Most versions return a string directly, but some might return a dict
        if isinstance(avatar_url_response, dict):
            avatar_url = avatar_url_response.get("publicUrl") or avatar_url_response.get("public_url") or avatar_url_response.get("data", {}).get("publicUrl")
        elif isinstance(avatar_url_response, str):
            avatar_url = avatar_url_response
        else:
            avatar_url = None
        
        # Fallback: construct URL manually if get_public_url didn't return a valid URL
        if not avatar_url or not isinstance(avatar_url, str) or avatar_url.strip() == "":
            if not settings.SUPABASE_URL:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to generate avatar URL: SUPABASE_URL not configured",
                )
            # Construct public URL manually
            avatar_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/avatars/{unique_filename}"
        
        # Log the avatar URL for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Generated avatar URL: {avatar_url}")
        logger.info(f"Avatar URL type: {type(avatar_url)}")
        
        # Update profile with avatar URL
        profile_response = (
            supabase.table("profiles")
            .update({"avatar_url": avatar_url})
            .eq("id", user_id)
            .execute()
        )
        
        if not profile_response.data:
            raise HTTPException(
                status_code=404,
                detail="Profile not found",
            )
        
        return {
            "status": "uploaded",
            "avatar_url": avatar_url,
            "profile": profile_response.data[0]
        }
        
    except Exception as exc:
        error_message = str(exc)
        
        # Check if bucket doesn't exist
        if "bucket" in error_message.lower() and ("not found" in error_message.lower() or "404" in error_message):
            raise HTTPException(
                status_code=404,
                detail=(
                    "Storage bucket 'avatars' not found. "
                    "Please create the bucket in Supabase Storage dashboard. "
                    "See docs/supabase_storage_setup_step_by_step.md for instructions."
                ),
            )
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload avatar: {error_message}",
        )
