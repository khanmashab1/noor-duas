import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface BookBookmark {
  id: string;
  user_id: string;
  book_id: string;
  chapter_id: string | null;
  saved_text: string;
  note: string | null;
  created_at: string;
}

export const useBookBookmarks = (bookId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['book-bookmarks', bookId, user?.id],
    queryFn: async () => {
      if (!user || !bookId) return [];
      const { data, error } = await supabase
        .from('book_bookmarks' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as BookBookmark[];
    },
    enabled: !!user && !!bookId,
  });
};

export const useAddBookmark = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, chapterId, savedText }: { bookId: string; chapterId: string | null; savedText: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('book_bookmarks' as any)
        .insert({
          user_id: user.id,
          book_id: bookId,
          chapter_id: chapterId,
          saved_text: savedText,
        });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['book-bookmarks', vars.bookId] });
    },
  });
};

export const useDeleteBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('book_bookmarks' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-bookmarks'] });
    },
  });
};
