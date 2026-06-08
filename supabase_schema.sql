-- ==========================================
-- AI RESUME NAVIGATOR DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor
-- ==========================================

-- 1. PROFILES TABLE
-- Maps to user account profiles in Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    last_login TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);


-- 2. RESUMES TABLE
-- Stores parsed resume information and paths to storage
CREATE TABLE IF NOT EXISTS public.resumes (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    text TEXT,
    skills TEXT[],
    education TEXT[],
    experience TEXT,
    summary TEXT,
    score INT,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Resumes Policies
CREATE POLICY "Users can select own resumes" ON public.resumes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON public.resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON public.resumes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON public.resumes
    FOR DELETE USING (auth.uid() = user_id);


-- 3. SAVED JOBS TABLE
-- Stores job postings saved by users
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Saved Jobs Policies
CREATE POLICY "Users can select own saved jobs" ON public.saved_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved jobs" ON public.saved_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved jobs" ON public.saved_jobs
    FOR DELETE USING (auth.uid() = user_id);


-- ==========================================
-- STORAGE SETUP (resumes bucket)
-- ==========================================

-- Insert bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on storage.objects if not already enabled
-- Note: Supabase enables this by default, but it's safe to verify.

-- Storage Policies for resumes bucket
-- Allow public select/read of objects in resumes bucket
CREATE POLICY "Public Read Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'resumes');

-- Allow authenticated upload to user's folder
CREATE POLICY "Owner Upload Access" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'resumes' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Allow owner to delete their files
CREATE POLICY "Owner Delete Access" ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id = 'resumes' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
