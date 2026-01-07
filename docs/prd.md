# PRD – Intelligent Technical Recruitment Platform (AI Talent Matcher)

## 1. Product Overview

The Intelligent Technical Recruitment Platform is a recruiter-centric system designed to automate
technical candidate screening and vacancy creation using AI agents. The platform parses
candidate CVs, evaluates their alignment with job requirements, and produces an objective Match
Score to support faster, data-driven hiring decisions.

## 2. Problem Statement

Technical recruiters face high volumes of CVs, inconsistent candidate evaluation, and
time-consuming vacancy creation. Manual screening introduces subjectivity, slows hiring cycles,
and limits the ability to objectively compare candidates across multiple roles.

## 3. Product Goals & Objectives

• Reduce time-to-hire through automated CV parsing and ranking.  
• Standardize candidate evaluation using explainable Match Scores.  
• Enable recruiters to focus on decision-making rather than manual review.

## 4. Scope Definition (3-Week MVP)

### In Scope:

• AI-assisted vacancy description and skill generation.  
• CV upload, parsing, and structured JSON snapshot storage in S3.  
• Multi-agent Match Score evaluation (experience, education, skills).  
• Recruiter dashboard with ranked candidate profiles.  
• Candidate dataset initialization for search and evaluation.

### Out of Scope:

• Automated coding assessments.  
• Full ATS integrations.

## 6. Core Features / Functional Requirements

• AI Vacancy Generator: Generates editable job descriptions and skill lists.  
• CV Parsing Engine: Extracts experience, education, and skills into structured JSON.  
• Match Scoring Engine: Aggregates scores from specialized agents into a unified score (max 11).  
• Recruiter Actions: Accept candidate, export CSV, schedule interview.  
• Candidate Application Tracking: Displays application status per vacancy.

## 7. User Flows

• Recruiter creates vacancy → AI suggests description and skills → Vacancy published.  
• Candidate uploads CV → System parses CV → Profile stored and evaluated.  
• Recruiter reviews ranked candidates → Accepts / exports / schedules interview.  
• Candidate views application status progression per vacancy.

## 8. Non-Functional Requirements

• Vacancy generation response time < 5 seconds.  
• CV parsing and scoring < 10 seconds.  
• System supports asynchronous processing and retry mechanisms.  
• Secure handling of CV files and personal data.

## 9. Data Model Overview

Key entities include Candidate, CV Snapshot, Job Requisition, and Match Score. CVs are stored as
immutable files in S3, parsed JSON snapshots are versioned, and operational data is stored in
PostgreSQL.

## 10. Detailed Flows (Updated)

CV Upload Flow:  
CV uploaded → stored in S3 → Lambda triggers parser agent → structured JSON
stored in S3 → Match evaluation executed on job application.

## 11. Release Plan

• Week 1: Vacancy generation, CV upload, S3 integration.  
• Week 2: CV parsing agents, Match Score logic, recruiter dashboard.  
• Week 3: Search, CSV export, interview scheduling, candidate status tracking.
