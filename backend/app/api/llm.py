"""
LLM Agents API

Purpose:
--------
Handles AI generation requests for job descriptions, requirements, and skills.
"""

from fastapi import APIRouter, Depends, HTTPException
from app.schemas.llm import (
    JobDescriptionRequest,
    RequirementsRequest,
    SkillsRequest,
)
from app.agents.llm_job_description import JobDescriptionAgent
from app.agents.llm_requirements import RequirementsAgent
from app.agents.llm_skills import SkillsAgent
from app.core.config import settings
from app.api.deps import require_recruiter

router = APIRouter(prefix="/llm", tags=["LLM Agents"])


def get_job_description_agent() -> JobDescriptionAgent:
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured",
        )
    return JobDescriptionAgent()


def get_requirements_agent() -> RequirementsAgent:
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured",
        )
    return RequirementsAgent()


def get_skills_agent() -> SkillsAgent:
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured",
        )
    return SkillsAgent()


@router.post("/job-description")
def generate_job_description(
    payload: JobDescriptionRequest,
    recruiter=Depends(require_recruiter),
):
    """
    Generates a job description based on job title, employment type, and optional context.
    """
    if not payload.job_title or not payload.employment_type:
        raise HTTPException(
            status_code=400,
            detail="job_title and employment_type are required",
        )

    try:
        agent = get_job_description_agent()
        result = agent.invoke(
            job_title=payload.job_title,
            employment_type=payload.employment_type,
            context=payload.context,
        )
        return {"description": result.description}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate job description: {exc}",
        )


@router.post("/requirements")
def generate_requirements(
    payload: RequirementsRequest,
    recruiter=Depends(require_recruiter),
):
    """
    Generates job requirements based on job description and employment type.
    Requires job description to be present.
    """
    if not payload.job_description or not payload.employment_type:
        raise HTTPException(
            status_code=400,
            detail="job_description and employment_type are required",
        )

    try:
        agent = get_requirements_agent()
        result = agent.invoke(
            job_description=payload.job_description,
            employment_type=payload.employment_type,
        )
        return {"requirements": result.requirements}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate requirements: {exc}",
        )


@router.post("/skills")
def generate_skills(
    payload: SkillsRequest,
    recruiter=Depends(require_recruiter),
):
    """
    Generates required technical skills based on job description and requirements.
    """
    if not payload.job_description or not payload.requirements:
        raise HTTPException(
            status_code=400,
            detail="job_description and requirements are required",
        )

    try:
        agent = get_skills_agent()
        result = agent.invoke(
            job_description=payload.job_description,
            requirements=payload.requirements,
        )
        return {"skills": result.skills}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate skills: {exc}",
        )
