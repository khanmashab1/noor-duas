import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';
import { useHadithCategories, useHadithsByCategory } from '@/hooks/useHadiths';
import { HadithCard } from '@/components/HadithCard';

const HadithPage = () => {
  const { t, lang } = useI18n();
  const { data: categories } = useHadithCategories();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const { data: hadiths } = useHadithsByCategory(selectedCat || undefined);

  const getCatName = (cat: { name: string; name_ar: string | null; name_ur: string | null }) => {
    if (lang === 'ar' && cat.name_ar) return cat.name_ar;
    if (lang === 'ur' && cat.name_ur) return cat.name_ur;
    return cat.name;
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary py-10 sm:py-16 text-primary-foreground islamic-pattern relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="container relative z-10 px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-4xl mb-2 inline-block">📖</span>
            <h1 className="font-display text-2xl sm:text-4xl font-bold">{t('hadith')}</h1>
            <p className="mt-2 text-sm sm:text-lg opacity-90">{t('hadithSubtitle')}</p>
          </motion.div>
        </div>
      </section>

      <div className="container px-4 sm:px-6 py-8 sm:py-12">
        {/* Category Grid */}
        <h2 className="mb-6 font-display text-xl sm:text-2xl font-bold text-foreground">{t('hadithCategories')}</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-8">
          {categories?.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedCat === cat.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border/50'
                }`}
                onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
              >
                <CardContent className="flex flex-col items-center gap-1 p-3 sm:p-4 text-center">
                  <span className="text-2xl">{cat.icon || '📖'}</span>
                  <span className="text-xs sm:text-sm font-medium text-foreground">{getCatName(cat)}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Hadiths List */}
        {selectedCat && (
          <div className="space-y-4">
            <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground">
              {categories?.find(c => c.id === selectedCat)?.icon}{' '}
              {categories && getCatName(categories.find(c => c.id === selectedCat)!)}
            </h3>
            {hadiths?.map((h) => (
              <HadithCard key={h.id} hadith={h} />
            ))}
            {hadiths?.length === 0 && (
              <p className="text-center text-muted-foreground py-8">{t('noResults')}</p>
            )}
          </div>
        )}

        {!selectedCat && (
          <p className="text-center text-muted-foreground py-8">{t('selectCategory')}</p>
        )}
      </div>
    </div>
  );
};

export default HadithPage;
