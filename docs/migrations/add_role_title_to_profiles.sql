-- Migration: Add role_title column to profiles table
-- Description: Adds role_title column to store job title/position (e.g., "HR Manager", "Software Developer")

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role_title TEXT NULL;

-- Add comment to column
COMMENT ON COLUMN public.profiles.role_title IS 'Job title or position of the user (e.g., HR Manager, Software Developer)';
