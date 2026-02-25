import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HadithCategory {
  id: string;
  name: string;
  name_ar: string | null;
  name_ur: string | null;
  icon: string | null;
  sort_order: number | null;
}

export interface Hadith {
  id: string;
  category_id: string;
  arabic_text: string;
  english_translation: string | null;
  urdu_translation: string | null;
  narrator: string | null;
  source: string;
  hadith_number: string | null;
  explanation: string | null;
  sort_order: number | null;
}

export const useHadithCategories = () =>
  useQuery({
    queryKey: ['hadith-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hadith_categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as HadithCategory[];
    },
  });

export const useHadithsByCategory = (categoryId: string | undefined) =>
  useQuery({
    queryKey: ['hadiths', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hadiths')
        .select('*')
        .eq('category_id', categoryId!)
        .order('sort_order');
      if (error) throw error;
      return data as Hadith[];
    },
    enabled: !!categoryId,
  });

export const useAllHadiths = () =>
  useQuery({
    queryKey: ['all-hadiths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hadiths')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as Hadith[];
    },
  });

export const useRandomHadith = () =>
  useQuery({
    queryKey: ['random-hadith', new Date().toDateString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hadiths')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      if (!data?.length) return null;
      const idx = Math.floor(new Date().getDate() % data.length);
      return data[idx] as Hadith;
    },
  });
