# schemas/application.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApplicationCreate(BaseModel):
    job_position_id: int
    cover_letter: Optional[str] = None


class ApplicationOut(BaseModel):
    id: int
    job_position_id: int
    status: str
    applied_at: datetime
