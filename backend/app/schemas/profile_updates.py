"""
Profile Update Schemas

Purpose:
--------
Defines payloads for updating role-specific profile data.
These schemas are used exclusively by PATCH endpoints.
"""

from pydantic import BaseModel


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = None
    role: str | None = None
    role_title: str | None = None
    avatar_url: str | None = None


class CandidateProfileUpdateRequest(BaseModel):
    location: str | None = None
    last_upload_file: str | None = None


class RecruiterProfileUpdateRequest(BaseModel):
    company_name: str | None = None
    company_size: str | None = None
