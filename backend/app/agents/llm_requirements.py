"""
Requirements Agent

Purpose:
--------
Generates job requirements based on job description and employment type.
"""

from pydantic import BaseModel, field_validator

from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.core.config import settings


# ============================================================================
# SCHEMA
# ============================================================================

class RequirementsOutput(BaseModel):
    requirements: str

    @field_validator("requirements", mode="before")
    @classmethod
    def clean_requirements(cls, v):
        if not v:
            return ""
        if isinstance(v, str):
            return v.strip()
        return str(v).strip()


# ============================================================================
# TEMPLATE
# ============================================================================

TEMPLATE_REQUIREMENTS = """
You are a professional HR specialist creating job requirements.

Rules:
- Generate 5-8 clear, specific requirements in bullet point format.
- Each requirement should start with a dash (-).
- Focus on must-have qualifications, experience, and skills.
- Be specific about years of experience when relevant.
- Adapt requirements based on employment type:
  * Full-time/Part-time: Include education requirements, team collaboration skills, company culture fit
  * Contract: Focus on specific technical skills, project experience, deliverables
  * Freelance: Emphasize self-management, portfolio, client communication (DO NOT include education level)
  * Internship: Focus on learning capacity, basic skills, motivation (DO NOT include years of experience or education requirements)
- Do NOT include education level for Freelance roles.
- Do NOT include years of experience for Internship roles.
- For Freelance, focus on practical skills and portfolio quality.

Return a JSON structure EXACTLY matching this format:
{format_instructions}

Job Information:
<<<
Job Description: {job_description}
Employment Type: {employment_type}
>>>
"""


# ============================================================================
# AGENT
# ============================================================================

class RequirementsAgent:
    """Agent for generating job requirements"""

    def __init__(self, model_name: str = "gpt-4o-mini", temperature: float = 0.2):
        self.output_parser = PydanticOutputParser(
            pydantic_object=RequirementsOutput
        )

        self.prompt = PromptTemplate(
            template=TEMPLATE_REQUIREMENTS,
            input_variables=["job_description", "employment_type"],
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

    def invoke(self, job_description: str, employment_type: str) -> RequirementsOutput:
        return self.chain.invoke({
            "job_description": job_description,
            "employment_type": employment_type,
        })
