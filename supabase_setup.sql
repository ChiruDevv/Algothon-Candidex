CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    job_title TEXT,
    candidate_name TEXT,
    overall_score NUMERIC,
    skills_score NUMERIC,
    experience_score NUMERIC,
    education_score NUMERIC,
    keyword_score NUMERIC,
    culture_score NUMERIC,
    trust_score NUMERIC,
    analysis_data JSONB
);

-- Note: Because we use the Supabase Service Role Key on the backend, 
-- we do not need to enable Row Level Security (RLS) policies for the backend to read/write.
-- The user isolation is handled automatically by our Node.js server.
