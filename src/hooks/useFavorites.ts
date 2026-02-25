import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select('*, duas(*)')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addFavorite = useMutation({
    mutationFn: async (duaId: string) => {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user!.id, dua_id: duaId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const removeFavorite = useMutation({
    mutationFn: async (duaId: string) => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user!.id)
        .eq('dua_id', duaId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const isFavorite = (duaId: string) =>
    favoritesQuery.data?.some((f) => f.dua_id === duaId) ?? false;

  return { favorites: favoritesQuery.data ?? [], isFavorite, addFavorite, removeFavorite, loading: favoritesQuery.isLoading };
};
