import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface IslamicBook {
  id: string;
  title: string;
  title_ar: string | null;
  title_ur: string | null;
  author: string | null;
  author_ar: string | null;
  author_ur: string | null;
  description: string | null;
  description_ar: string | null;
  description_ur: string | null;
  cover_image_url: string | null;
  pdf_url: string | null;
  external_link: string | null;
  category: string | null;
  sort_order: number | null;
  content: string | null;
}

export const useIslamicBooks = () =>
  useQuery({
    queryKey: ['islamic-books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('islamic_books' as any)
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as unknown as IslamicBook[];
    },
  });
