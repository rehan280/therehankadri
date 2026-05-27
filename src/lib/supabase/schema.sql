-- Run this in your Supabase SQL Editor to create the tool_ratings table

CREATE TABLE IF NOT EXISTS public.tool_ratings (
    tool_slug text PRIMARY KEY,
    total_stars integer NOT NULL DEFAULT 0,
    rating_count integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security) but allow anyone to read and update
-- Since we are doing it via a Server Action, the Service Role or authenticated client handles it,
-- but for simplicity if accessing from client directly, you'd need policies.
-- In our case, the Next.js Server Action runs server-side, so it bypasses RLS if using Service Role,
-- or uses the anon key. Let's just make it publicly readable/writable for anon if needed,
-- but the Server Action will handle it.
ALTER TABLE public.tool_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.tool_ratings
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.tool_ratings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.tool_ratings
    FOR UPDATE USING (true);
