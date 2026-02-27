
-- Book chapters table for chapter-based reading
CREATE TABLE public.book_chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.islamic_books(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL DEFAULT 1,
  chapter_title TEXT NOT NULL,
  chapter_title_ar TEXT,
  chapter_title_ur TEXT,
  content TEXT NOT NULL DEFAULT '',
  content_ar TEXT,
  content_ur TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(book_id, chapter_number)
);

ALTER TABLE public.book_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Book chapters are publicly readable" ON public.book_chapters
FOR SELECT USING (true);

CREATE POLICY "Admins can insert book chapters" ON public.book_chapters
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update book chapters" ON public.book_chapters
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete book chapters" ON public.book_chapters
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_book_chapters_book_id ON public.book_chapters(book_id, chapter_number);

-- Reading progress table
CREATE TABLE public.reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL REFERENCES public.islamic_books(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.book_chapters(id) ON DELETE SET NULL,
  last_read_position INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading progress" ON public.reading_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading progress" ON public.reading_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading progress" ON public.reading_progress
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading progress" ON public.reading_progress
FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks table
CREATE TABLE public.book_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL REFERENCES public.islamic_books(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.book_chapters(id) ON DELETE CASCADE,
  saved_text TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.book_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON public.book_bookmarks
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON public.book_bookmarks
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON public.book_bookmarks
FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_reading_progress_user ON public.reading_progress(user_id);
CREATE INDEX idx_book_bookmarks_user ON public.book_bookmarks(user_id, book_id);
