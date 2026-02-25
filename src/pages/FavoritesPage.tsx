import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { DuaCard } from '@/components/DuaCard';
import { useI18n } from '@/lib/i18n';
import { Navigate } from 'react-router-dom';
import type { Dua } from '@/hooks/useDuas';

const FavoritesPage = () => {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { favorites, loading } = useFavorites();

  if (authLoading) return <div className="container py-20 text-center text-muted-foreground">{t('loading')}</div>;
  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="container py-8">
      <h1 className="mb-8 font-display text-3xl font-bold text-foreground">{t('favorites')}</h1>
      {loading ? (
        <p className="text-center text-muted-foreground">{t('loading')}</p>
      ) : favorites.length === 0 ? (
        <p className="text-center text-muted-foreground">{t('noResults')}</p>
      ) : (
        <div className="space-y-4">
          {favorites.map((fav: any) => (
            <DuaCard key={fav.id} dua={fav.duas as Dua} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
