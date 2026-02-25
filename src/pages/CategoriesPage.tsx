import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useCategories, useDuasByCategory } from '@/hooks/useDuas';
import { DuaCard } from '@/components/DuaCard';
import { useI18n } from '@/lib/i18n';
import { Sunrise, Sunset, Shield, Plane, Heart, Moon as MoonIcon, Coins, Gem } from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  sunrise: <Sunrise className="h-6 w-6" />,
  sunset: <Sunset className="h-6 w-6" />,
  moon: <MoonIcon className="h-6 w-6" />,
  shield: <Shield className="h-6 w-6" />,
  plane: <Plane className="h-6 w-6" />,
  kaaba: <Gem className="h-6 w-6" />,
  heart: <Heart className="h-6 w-6" />,
  coins: <Coins className="h-6 w-6" />,
  rings: <Heart className="h-6 w-6" />,
};

const CategoriesPage = () => {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const { data: categories } = useCategories();
  const { data: duas, isLoading } = useDuasByCategory(id);

  const getCategoryName = (cat: { name: string; name_ar: string | null; name_ur: string | null }) => {
    if (lang === 'ar' && cat.name_ar) return cat.name_ar;
    if (lang === 'ur' && cat.name_ur) return cat.name_ur;
    return cat.name;
  };

  const currentCategory = categories?.find((c) => c.id === id);

  if (id && duas) {
    return (
      <div className="container py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link to="/categories" className="mb-4 inline-block text-sm text-primary hover:underline">
            ← {t('categories')}
          </Link>
          <h1 className="mb-6 font-display text-3xl font-bold text-foreground">
            {currentCategory ? getCategoryName(currentCategory) : t('loading')}
          </h1>
          <div className="space-y-4">
            {duas.map((dua) => (
              <DuaCard key={dua.id} dua={dua} />
            ))}
            {duas.length === 0 && <p className="text-center text-muted-foreground">{t('noResults')}</p>}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 font-display text-3xl font-bold text-foreground">{t('categories')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories?.map((cat, i) => (
          <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/categories/${cat.id}`}>
              <Card className="cursor-pointer border-border/50 transition-all hover:border-primary/30 hover:shadow-lg">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {categoryIcons[cat.icon || ''] || <Heart className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{getCategoryName(cat)}</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
