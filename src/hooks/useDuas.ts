import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Category = Tables<'categories'>;
export type Dua = Tables<'duas'>;

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as Category[];
    },
  });

export const useDuasByCategory = (categoryId: string | undefined) =>
  useQuery({
    queryKey: ['duas', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('duas')
        .select('*')
        .eq('category_id', categoryId!)
        .order('sort_order');
      if (error) throw error;
      return data as Dua[];
    },
    enabled: !!categoryId,
  });

export const useDua = (id: string | undefined) =>
  useQuery({
    queryKey: ['dua', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('duas')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Dua;
    },
    enabled: !!id,
  });

export const useAllDuas = () =>
  useQuery({
    queryKey: ['all-duas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('duas')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as Dua[];
    },
  });

export const useSearchDuas = (query: string) =>
  useQuery({
    queryKey: ['search-duas', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('duas')
        .select('*')
        .or(`arabic_text.ilike.%${query}%,english_translation.ilike.%${query}%,urdu_translation.ilike.%${query}%`)
        .order('sort_order');
      if (error) throw error;
      return data as Dua[];
    },
    enabled: query.length > 2,
  });
