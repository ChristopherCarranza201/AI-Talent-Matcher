"""
Profile Update Schemas

Purpose:
--------
Defines payloads for updating role-specific profile data.
These schemas are used exclusively by PATCH endpoints.
"""

from pydantic import BaseModel


class CandidateProfileUpdateRequest(BaseModel):
    location: str | None = None
    last_upload_file: str | None = None


class RecruiterProfileUpdateRequest(BaseModel):
    company_name: str | None = None
    company_size: str | None = None
