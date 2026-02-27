import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BookChapter {
  id: string;
  book_id: string;
  chapter_number: number;
  chapter_title: string;
  chapter_title_ar: string | null;
  chapter_title_ur: string | null;
  content: string;
  content_ar: string | null;
  content_ur: string | null;
  created_at: string;
}

export const useBookChapters = (bookId: string | undefined) =>
  useQuery({
    queryKey: ['book-chapters', bookId],
    queryFn: async () => {
      if (!bookId) return [];
      const { data, error } = await supabase
        .from('book_chapters' as any)
        .select('*')
        .eq('book_id', bookId)
        .order('chapter_number');
      if (error) throw error;
      return data as unknown as BookChapter[];
    },
    enabled: !!bookId,
  });
