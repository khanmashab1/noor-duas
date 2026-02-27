
-- Add a content column to islamic_books for storing book text directly
ALTER TABLE public.islamic_books ADD COLUMN IF NOT EXISTS content text;

-- Remove external_link values so books open from internal content
-- (keeping the column for future use)
