import { SEO } from '@/components/SEO';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';
import { useHadithCategories, useHadithsByCategory, useAllHadiths } from '@/hooks/useHadiths';
import { HadithCard } from '@/components/HadithCard';
import type { Hadith } from '@/hooks/useHadiths';

const HadithPage = () => {
  const { t, lang } = useI18n();
  const { data: categories } = useHadithCategories();
  const { data: allHadiths } = useAllHadiths();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const { data: catHadiths } = useHadithsByCategory(selectedCat || undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const getCatName = (cat: { name: string; name_ar: string | null; name_ur: string | null }) => {
    if (lang === 'ar' && cat.name_ar) return cat.name_ar;
    if (lang === 'ur' && cat.name_ur) return cat.name_ur;
    return cat.name;
  };

  // Search filtering
  const searchResults: Hadith[] | null = searchQuery.length > 2 && allHadiths
    ? allHadiths.filter(h =>
        h.arabic_text.includes(searchQuery) ||
        h.english_translation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.urdu_translation?.includes(searchQuery) ||
        h.narrator?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.source?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const displayHadiths = searchResults || catHadiths;
  const selectedCategory = categories?.find(c => c.id === selectedCat);

  return (
    <div className="min-h-screen">
      <SEO title="Authentic Hadith Collection – Sahih Bukhari & Muslim" description="Browse authentic Hadiths from Sahih Bukhari, Sahih Muslim & Hisnul Muslim with Arabic, Urdu & English translations" path="/hadith" breadcrumbs={[{ name: 'Hadith', path: '/hadith' }]} article={{ datePublished: '2025-01-01' }} keywords="sahih bukhari hadith, sahih muslim, authentic hadith collection, hadith in urdu, hadith in english" />
      {/* Hero */}
      <section className="bg-primary py-10 sm:py-14 text-primary-foreground islamic-pattern relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="container relative z-10 px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-4xl sm:text-5xl mb-3 inline-block">📖</span>
            <h1 className="font-display text-2xl sm:text-4xl font-bold">{t('hadith')}</h1>
            <p className="mt-2 text-sm sm:text-lg opacity-90 max-w-xl mx-auto">{t('hadithSubtitle')}</p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-md mx-auto relative"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/50 rtl:left-auto rtl:right-3" />
            <Input
              placeholder={t('searchHadith')}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) setSelectedCat(null); }}
              className="pl-10 rtl:pr-10 rtl:pl-3 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:bg-primary-foreground/15"
            />
          </motion.div>
        </div>
      </section>

      <div className="container px-4 sm:px-6 py-8 sm:py-10">
        {/* Search results notice */}
        {searchResults && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{searchQuery}"
            </p>
            <button onClick={() => setSearchQuery('')} className="text-sm text-primary hover:underline">Clear</button>
          </div>
        )}

        {/* Category Pills */}
        {!searchResults && (
          <>
            <h2 className="mb-4 font-display text-lg sm:text-xl font-bold text-foreground">{t('hadithCategories')}</h2>
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setSelectedCat(null)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  !selectedCat
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all flex items-center gap-1.5 ${
                    selectedCat === cat.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <span>{cat.icon || '📖'}</span>
                  {getCatName(cat)}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Hadiths List */}
        <AnimatePresence mode="wait">
          {selectedCat && selectedCategory && !searchResults && (
            <motion.div
              key={selectedCat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <span className="text-3xl">{selectedCategory.icon || '📖'}</span>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{getCatName(selectedCategory)}</h3>
                  <p className="text-xs text-muted-foreground">{catHadiths?.length || 0} hadiths</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {displayHadiths && displayHadiths.length > 0 ? (
          <div className="space-y-4">
            {displayHadiths.map((h) => (
              <HadithCard key={h.id} hadith={h} />
            ))}
          </div>
        ) : selectedCat || searchResults ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground">{t('noResults')}</p>
          </div>
        ) : (
          /* Show all hadiths when no category selected and no search */
          <div className="space-y-4">
            {allHadiths?.map((h) => (
              <HadithCard key={h.id} hadith={h} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HadithPage;
