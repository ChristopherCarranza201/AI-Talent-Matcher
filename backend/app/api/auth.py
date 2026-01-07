"""
Authentication API

Purpose:
--------
Handles authentication-related endpoints, including:
- Role-specific signup (candidate, recruiter)
- User login

Signup is treated as a domain operation:
- Each signup endpoint fully initializes the user
- No partial or role-less users are allowed
"""

from fastapi import APIRouter, HTTPException

from app.schemas.auth import (
    CandidateSignupRequest,
    RecruiterSignupRequest,
    LoginRequest,
    AuthResponse,
)
from app.services.auth_service import (
    signup_candidate,
    signup_recruiter,
    login_user,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup/candidate", status_code=201)
def signup_candidate_endpoint(payload: CandidateSignupRequest):
    """
    Candidate signup.

    Creates:
    - Supabase Auth user
    - profiles row (role = candidate)
    - candidate_profiles row
    """
    return signup_candidate(payload)


@router.post("/signup/recruiter", status_code=201)
def signup_recruiter_endpoint(payload: RecruiterSignupRequest):
    """
    Recruiter signup.

    Creates:
    - Supabase Auth user
    - profiles row (role = recruiter)
    - recruiter_profiles row
    """
    return signup_recruiter(payload)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    """
    User login.

    Authenticates with Supabase Auth and returns an access token.
    """
    return login_user(payload)
