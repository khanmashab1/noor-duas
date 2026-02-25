
-- Hadith categories
CREATE TABLE public.hadith_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text,
  name_ur text,
  icon text,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hadith_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hadith categories are publicly readable"
ON public.hadith_categories FOR SELECT
USING (true);

CREATE POLICY "Admins can insert hadith categories"
ON public.hadith_categories FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update hadith categories"
ON public.hadith_categories FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete hadith categories"
ON public.hadith_categories FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Hadiths table
CREATE TABLE public.hadiths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.hadith_categories(id) ON DELETE CASCADE,
  arabic_text text NOT NULL,
  english_translation text,
  urdu_translation text,
  narrator text,
  source text NOT NULL,
  hadith_number text,
  explanation text,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hadiths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hadiths are publicly readable"
ON public.hadiths FOR SELECT
USING (true);

CREATE POLICY "Admins can insert hadiths"
ON public.hadiths FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update hadiths"
ON public.hadiths FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete hadiths"
ON public.hadiths FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_hadiths_updated_at
BEFORE UPDATE ON public.hadiths
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
