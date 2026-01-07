"""
Applications API

Purpose:
--------
Handles job application workflows for both candidates and recruiters.

Guarantees:
-----------
- Applications are always linked to a valid candidate profile
- Candidates can only manage their own applications
- Recruiters can only view applications for jobs they own
- All access is enforced by RLS and ownership constraints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from postgrest.exceptions import APIError

from app.api.deps import get_current_user, require_recruiter
from app.db.supabase import get_supabase
from app.schemas.application import ApplicationCreate

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)

# ---------------------------------------------------------------------
# Candidate-side endpoints
# ---------------------------------------------------------------------

@router.post("/", status_code=201)
def apply_to_job(
    payload: ApplicationCreate,
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Creates a new job application for the authenticated candidate.

    Business rules:
    ----------------
    - A candidate can apply to a job only once
    - Candidates cannot apply to closed jobs
    - Applications are immutable except for status transitions
    """

    # ------------------------------------------------------------------
    # 1. Validate job exists and is open
    # ------------------------------------------------------------------
    job_response = (
        supabase.table("job_position")
        .select("id, status")
        .eq("id", payload.job_position_id)
        .maybe_single()
        .execute()
    )

    if job_response.data is None:
        raise HTTPException(
            status_code=404,
            detail="Job position not found",
        )

    if job_response.data["status"] != "open":
        raise HTTPException(
            status_code=400,
            detail="You cannot apply to a closed job",
        )

    # ------------------------------------------------------------------
    # 2. Create application
    # ------------------------------------------------------------------
    try:
        response = (
            supabase.table("applications")
            .insert(
                {
                    "candidate_profile_id": user_id,
                    "job_position_id": payload.job_position_id,
                    "cover_letter": payload.cover_letter,
                }
            )
            .execute()
        )

    except Exception as exc:
        # Unique constraint (candidate already applied)
        if "uq_candidate_job_application" in str(exc):
            raise HTTPException(
                status_code=409,
                detail="You have already applied to this job",
            )

        raise HTTPException(
            status_code=400,
            detail="Failed to create application",
        )

    return response.data[0]


@router.get("/me")
def get_my_applications(
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Returns all applications belonging to the authenticated candidate.

    Security:
    ---------
    - Filtered by candidate_profile_id = auth.uid()
    - Prevents exposure of other candidates' applications
    """

    response = (
        supabase.table("applications")
        .select("*")
        .eq("candidate_profile_id", user_id)
        .order("applied_at", desc=True)
        .execute()
    )

    return response.data

@router.patch("/{application_id}/status")
def update_application_status(
    application_id: int,
    status: str,
    recruiter=Depends(require_recruiter),
    supabase: Client = Depends(get_supabase),
):
    """
    Updates the status of an application.

    Notes:
    ------
    - Recruiters can only update applications for jobs they own
    - Status transitions are controlled at the API level
    """

    allowed_statuses = {
        "reviewing",
        "shortlisted",
        "rejected",
        "hired",
    }

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid application status",
        )

    try:
        response = (
            supabase.table("applications")
            .update({"status": status})
            .eq("id", application_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update application status: {exc}",
        )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Application not found or not authorized",
        )

    return {
        "application_id": application_id,
        "status": status,
    }


@router.patch("/{application_id}/withdraw")
def withdraw_application(
    application_id: int,
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Withdraws (soft-cancels) an application owned by the authenticated candidate.

    Security:
    ---------
    - Ownership enforced via candidate_profile_id
    - RLS acts as final authority
    """

    response = (
        supabase.table("applications")
        .update({"status": "withdrawn"})
        .eq("id", application_id)
        .eq("candidate_profile_id", user_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=403,
            detail="Not allowed",
        )

    return {"status": "withdrawn"}


# ---------------------------------------------------------------------
# Recruiter-side endpoints
# ---------------------------------------------------------------------

@router.get("/job/{job_id}")
def get_applications_for_job(
    job_id: int,
    recruiter=Depends(require_recruiter),
    supabase: Client = Depends(get_supabase),
):
    """
    Returns all applications for a specific job owned by the recruiter.

    Notes:
    ------
    - Recruiters can only access applications for jobs they own
    - Candidate data is exposed only through applications
    - This endpoint is the main entry point for recruiter candidate review
    """

    try:
        response = (
            supabase.table("applications")
            .select(
                """
                id,
                status,
                applied_at,
                cover_letter,
                candidate_profiles (
                    profile_id,
                    location,
                    profiles (
                        id,
                        full_name
                    )
                )
                """
            )
            .eq("job_position_id", job_id)
            .order("applied_at", desc=True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to fetch applications: {exc}",
        )

    applications = []

    for row in response.data or []:
        candidate_profile = row.get("candidate_profiles") or {}
        profile = candidate_profile.get("profiles") or {}

        applications.append(
            {
                "application_id": row["id"],
                "status": row["status"],
                "applied_at": row["applied_at"],
                "cover_letter": row["cover_letter"],
                "candidate": {
                    "id": profile.get("id"),
                    "full_name": profile.get("full_name"),
                    "location": candidate_profile.get("location"),
                },
            }
        )

    return applications
