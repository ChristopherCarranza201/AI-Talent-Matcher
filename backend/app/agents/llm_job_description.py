"""
Job Description Agent

Purpose:
--------
Generates job descriptions based on job title, employment type, and optional context.
"""

from typing import Optional
from pydantic import BaseModel, field_validator

from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.core.config import settings


# ============================================================================
# SCHEMA
# ============================================================================

class JobDescriptionOutput(BaseModel):
    description: str

    @field_validator("description", mode="before")
    @classmethod
    def clean_description(cls, v):
        if not v:
            return ""
        if isinstance(v, str):
            return v.strip()
        return str(v).strip()


# ============================================================================
# TEMPLATE
# ============================================================================

TEMPLATE_JOB_DESCRIPTION = """
You are a professional HR specialist creating a comprehensive job description.

Rules:
- Generate a professional, engaging job description.
- Include an overview of the role, key responsibilities, and what makes this opportunity exciting.
- Structure it in clear paragraphs.
- Be specific about the role expectations.
- Adapt the tone based on the employment type:
  * Full-time/Part-time: Focus on long-term growth, team collaboration, career development
  * Contract: Emphasize project scope, deliverables, timeline
  * Freelance: Highlight flexibility, project-based work, independence
  * Internship: Focus on learning opportunities, mentorship, growth potential

Return a JSON structure EXACTLY matching this format:
{format_instructions}

Job Information:
<<<
Job Title: {job_title}
Employment Type: {employment_type}
Existing Context (if any): {context}
>>>
"""


# ============================================================================
# AGENT
# ============================================================================

class JobDescriptionAgent:
    """Agent for generating job descriptions"""

    def __init__(self, model_name: str = "gpt-4o-mini", temperature: float = 0.3):
        self.output_parser = PydanticOutputParser(
            pydantic_object=JobDescriptionOutput
        )

        self.prompt = PromptTemplate(
            template=TEMPLATE_JOB_DESCRIPTION,
            input_variables=["job_title", "employment_type", "context"],
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

    def invoke(
        self,
        job_title: str,
        employment_type: str,
        context: Optional[str] = None,
    ) -> JobDescriptionOutput:
        context_text = context.strip() if context else "None"
        
        return self.chain.invoke({
            "job_title": job_title,
            "employment_type": employment_type,
            "context": context_text,
        })
