import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;
  chapter_id: string | null;
  last_read_position: number;
  updated_at: string;
}

export const useReadingProgress = (bookId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reading-progress', bookId, user?.id],
    queryFn: async () => {
      if (!user || !bookId) return null;
      const { data, error } = await supabase
        .from('reading_progress' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as ReadingProgress | null;
    },
    enabled: !!user && !!bookId,
  });
};

export const useAllReadingProgress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-reading-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('reading_progress' as any)
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data as unknown as ReadingProgress[];
    },
    enabled: !!user,
  });
};

export const useSaveProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, chapterId, position }: { bookId: string; chapterId: string | null; position: number }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('reading_progress' as any)
        .upsert(
          {
            user_id: user.id,
            book_id: bookId,
            chapter_id: chapterId,
            last_read_position: position,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,book_id' }
        );
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress', vars.bookId] });
      queryClient.invalidateQueries({ queryKey: ['all-reading-progress'] });
    },
  });
};
