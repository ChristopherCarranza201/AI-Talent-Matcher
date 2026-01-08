"""
LLM Agent Request Schemas
"""

from pydantic import BaseModel
from typing import Optional


class JobDescriptionRequest(BaseModel):
    job_title: str
    employment_type: str
    context: Optional[str] = None


class RequirementsRequest(BaseModel):
    job_description: str
    employment_type: str


class SkillsRequest(BaseModel):
    job_description: str
    requirements: str
