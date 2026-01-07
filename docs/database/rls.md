# Row Level Security (RLS) Overview

## Purpose
This document describes the Row Level Security (RLS) strategy implemented in the database.

RLS is used to enforce data ownership, role isolation, and access control directly at the database level.
The system relies on role-based signup guarantees, meaning all users are fully initialized at signup time and no partial or role-less users can exist.

## Core Assumptions
The RLS policies are built on the following invariants:

* Every authenticated request has a valid auth.uid()
* `profiles.id = auth.uid()`
* `profiles.role ∈ ('candidate', 'recruiter')`
* Each user has exactly one role-specific profile:
    * candidate_profiles for candidates
    * recruiter_profiles for recruiters
* Role-specific profiles are created only at signup using the Supabase service role

If any of these assumptions are violated, the issue is considered an application-layer bug, not an RLS concern.

## Table-by-Table RLS Strategy

### profiles
**Purpose:**
Stores shared identity information for all users.

**Access Rules:**
* Users can read and update only their own profile
* Inserts are restricted to the service role (signup)
* Deletion is not allowed

**Policies:**
* `SELECT: id = auth.uid()`
* `UPDATE: id = auth.uid()`

### candidate_profiles
**Purpose:**
Stores candidate-specific data.

**Access Rules:**
* Candidates can read and update only their own candidate profile
* Inserts are restricted to the service role
* Deletion is not allowed

**Policies:**
* `SELECT: profile_id = auth.uid()`
* `UPDATE: profile_id = auth.uid()`

### recruiter_profiles
**Purpose:**
Stores recruiter-specific data.

**Access Rules:**
* Recruiters can read and update only their own recruiter profile
* Inserts are restricted to the service role
* Deletion is not allowed

**Policies:**
* `SELECT: profile_id = auth.uid()`
* `UPDATE: profile_id = auth.uid()`

### job_position
**Purpose:**
Represents job postings created and owned by recruiters.

**Access Rules:**
* Anyone can read jobs with status = 'open'
* Recruiters can create, update, and delete only their own jobs

**Policies:**
* `SELECT: status = 'open'`
* `INSERT: recruiter_profile_id = auth.uid()`
* `UPDATE: recruiter_profile_id = auth.uid()`
* `DELETE: recruiter_profile_id = auth.uid()`

### applications
**Purpose:**
Represents applications submitted by candidates to job positions.

**Dual Ownership Model:**
* Candidates own the creation and visibility of their applications
* Recruiters own the visibility of applications related to their jobs

**Access Rules:**
* Candidates can create and read their own applications
* Recruiters can read applications for jobs they own
* Updates and deletions are restricted to system workflows

**Policies:**
* `INSERT: candidate_profile_id = auth.uid()`
* `SELECT (candidate): candidate_profile_id = auth.uid()`
* `SELECT (recruiter):`
    * Application’s job_position_id belongs to a job where
    * job_position.recruiter_profile_id = auth.uid()