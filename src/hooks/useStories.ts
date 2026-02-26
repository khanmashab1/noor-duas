import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStoryCategories = () =>
  useQuery({
    queryKey: ['story-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

export const useStories = (categoryId?: string) =>
  useQuery({
    queryKey: ['stories', categoryId],
    queryFn: async () => {
      let q = supabase.from('stories').select('*, story_categories(*)').order('sort_order');
      if (categoryId) q = q.eq('category_id', categoryId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const useStory = (id?: string) =>
  useQuery({
    queryKey: ['story', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*, story_categories(*)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
  });
