# Main application entry point

from fastapi import FastAPI
from app.api import auth, me, jobs, applications, candidate_profiles, recruiter_profiles


app = FastAPI(title="AI Talent Matcher API")

app.include_router(auth.router)
app.include_router(me.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(candidate_profiles.router)
app.include_router(recruiter_profiles.router)
