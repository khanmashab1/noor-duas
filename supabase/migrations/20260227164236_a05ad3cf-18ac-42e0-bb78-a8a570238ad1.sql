
-- Add title columns to duas table
ALTER TABLE public.duas ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.duas ADD COLUMN IF NOT EXISTS title_ar text;
ALTER TABLE public.duas ADD COLUMN IF NOT EXISTS title_ur text;
