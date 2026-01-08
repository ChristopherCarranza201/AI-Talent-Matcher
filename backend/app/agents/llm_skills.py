"""
Skills Agent

Purpose:
--------
Generates required technical skills based on job description and requirements.
"""

from typing import List
from pydantic import BaseModel, field_validator

from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.core.config import settings


# ============================================================================
# SCHEMA
# ============================================================================

class SkillsOutput(BaseModel):
    skills: List[str]

    @field_validator("skills", mode="before")
    @classmethod
    def clean_skills(cls, v):
        if not v:
            return []
        if isinstance(v, str):
            # Handle comma-separated string
            return [s.strip() for s in v.split(",") if s.strip()]
        if isinstance(v, list):
            return [s.strip() for s in v if isinstance(s, str) and s.strip()]
        return []


# ============================================================================
# TEMPLATE
# ============================================================================

TEMPLATE_SKILLS = """
You are a technical recruiter extracting required technical skills from job information.

Rules:
- Extract ONLY technical skills (programming languages, frameworks, tools, technologies).
- Focus on concrete, specific technologies (e.g., "React", "Python", "AWS", "Docker").
- Do NOT include soft skills (communication, teamwork, etc.).
- Do NOT include general concepts unless they are specific technologies.
- Generate a minimum of 5 skills.
- Prioritize skills that are explicitly mentioned or clearly implied.
- Return technology names as commonly used in the industry (e.g., "Node.js" not "NodeJS", "TypeScript" not "TS").

Return a JSON structure EXACTLY matching this format:
{format_instructions}

Job Information:
<<<
Job Description: {job_description}
Job Requirements: {requirements}
>>>
"""


# ============================================================================
# AGENT
# ============================================================================

class SkillsAgent:
    """Agent for extracting required technical skills"""

    def __init__(self, model_name: str = "gpt-4o-mini", temperature: float = 0):
        self.output_parser = PydanticOutputParser(
            pydantic_object=SkillsOutput
        )

        self.prompt = PromptTemplate(
            template=TEMPLATE_SKILLS,
            input_variables=["job_description", "requirements"],
            partial_variables={
                "format_instructions": self.output_parser.get_format_instructions()
            },
        )

        self.llm = ChatOpenAI(
            model=model_name,
            temperature=temperature,
            openai_api_key=settings.OPENAI_API_KEY,
        )

        self.chain = self.prompt | self.llm | self.output_parser

    def invoke(self, job_description: str, requirements: str) -> SkillsOutput:
        return self.chain.invoke({
            "job_description": job_description,
            "requirements": requirements,
        })
