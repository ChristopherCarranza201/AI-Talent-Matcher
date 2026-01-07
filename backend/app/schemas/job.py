from pydantic import BaseModel
from typing import Optional
from datetime import date

class JobCreate(BaseModel):
    job_title: str
    job_description: Optional[str] = None
    job_requirements: Optional[str] = None
    job_skills: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    optional_salary: Optional[int] = None
    closing_date: Optional[date] = None
    sprint_duration: Optional[str] = None
