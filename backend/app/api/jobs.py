"""
Jobs API

Purpose:
--------
Handles job position management for recruiters and public job discovery
for candidates.

Guarantees:
-----------
- Only recruiters can create and manage jobs
- Recruiters can only manage their own jobs
- Candidates can only view open jobs
- Ownership is enforced via RLS and recruiter identity
"""

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.schemas.job import JobCreate
from app.api.deps import require_recruiter
from app.db.supabase import get_supabase

router = APIRouter(prefix="/jobs", tags=["Jobs"])


# ---------------------------------------------------------------------
# Recruiter-side endpoints
# ---------------------------------------------------------------------

@router.post("/", status_code=201)
def create_job(
    payload: JobCreate,
    recruiter=Depends(require_recruiter),
    supabase: Client = Depends(get_supabase),
):
    """
    Creates a new job position owned by the authenticated recruiter.
    """

    try:
        response = (
            supabase.table("job_position")
            .insert(
                {
                    **payload.model_dump(),
                    "recruiter_profile_id": recruiter["id"],
                }
            )
            .select("*")  # <-- CRITICAL
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create job: {exc}",
        )

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="Job was not created",
        )

    return response.data[0]


@router.get("/me")
def list_my_jobs(
    recruiter=Depends(require_recruiter),
    supabase: Client = Depends(get_supabase),
):
    """
    Returns all jobs owned by the authenticated recruiter.
    """

    response = (
        supabase.table("job_position")
        .select("*")
        .eq("recruiter_profile_id", recruiter["id"])
        .execute()
    )

    return response.data


# ---------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------

@router.get("/")
def list_open_jobs(supabase: Client = Depends(get_supabase)):
    """
    Returns all open job positions.

    Notes:
    ------
    - Accessible by candidates and unauthenticated users
    - RLS restricts visibility to jobs with status = 'open'
    """

    response = (
        supabase.table("job_position")
        .select("id, job_title, location, employment_type, status")
        .eq("status", "open")
        .execute()
    )

    return response.data