import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';
import { useIslamicBooks } from '@/hooks/useIslamicBooks';
import { BookOpen, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const categoryLabels: Record<string, { en: string; ur: string; ar: string }> = {
  hadith: { en: 'Hadith', ur: 'حدیث', ar: 'حديث' },
  dua: { en: 'Duas & Supplications', ur: 'دعائیں', ar: 'أدعية' },
  fiqh: { en: 'Fiqh & Jurisprudence', ur: 'فقہ', ar: 'فقه' },
  tafsir: { en: 'Tafsir & Commentary', ur: 'تفسیر', ar: 'تفسير' },
  seerah: { en: 'Seerah & Biography', ur: 'سیرت', ar: 'سيرة' },
  general: { en: 'General', ur: 'عمومی', ar: 'عام' },
};

const BooksPage = () => {
  const { t, lang } = useI18n();
  const { data: books, isLoading } = useIslamicBooks();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(books?.map(b => b.category || 'general') ?? [])];
  const filtered = selectedCategory
    ? books?.filter(b => (b.category || 'general') === selectedCategory)
    : books;

  const getTitle = (b: any) => (lang === 'ar' && b.title_ar ? b.title_ar : lang === 'ur' && b.title_ur ? b.title_ur : b.title);
  const getAuthor = (b: any) => (lang === 'ar' && b.author_ar ? b.author_ar : lang === 'ur' && b.author_ur ? b.author_ur : b.author);
  const getDesc = (b: any) => (lang === 'ar' && b.description_ar ? b.description_ar : lang === 'ur' && b.description_ur ? b.description_ur : b.description);
  const getCatLabel = (cat: string) => categoryLabels[cat]?.[lang] ?? categoryLabels[cat]?.en ?? cat;

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-primary py-10 sm:py-16 text-primary-foreground islamic-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="container relative z-10 px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <BookOpen className="mx-auto h-10 w-10 mb-3" />
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
              {lang === 'ar' ? 'الكتب الإسلامية' : lang === 'ur' ? 'اسلامی کتابیں' : 'Islamic Books'}
            </h1>
            <p className="mt-2 text-sm sm:text-base opacity-90">
              {lang === 'ar' ? 'مجموعة من أهم الكتب الإسلامية' : lang === 'ur' ? 'اہم اسلامی کتابوں کا مجموعہ' : 'A collection of essential Islamic books'}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container px-4 sm:px-6 py-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            {lang === 'ur' ? 'سب' : lang === 'ar' ? 'الكل' : 'All'}
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {getCatLabel(cat)}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered?.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full border-border/50 hover:shadow-lg hover:border-primary/30 transition-all">
                  <CardContent className="p-5 flex flex-col h-full">
                    <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-3 self-start">
                      {getCatLabel(book.category || 'general')}
                    </span>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className={`font-display text-base sm:text-lg font-bold text-foreground ${lang !== 'en' ? 'font-arabic' : ''}`}>
                          {getTitle(book)}
                        </h3>
                        {getAuthor(book) && (
                          <p className={`text-xs text-muted-foreground mt-0.5 ${lang !== 'en' ? 'font-arabic' : ''}`}>
                            ✍️ {getAuthor(book)}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm text-muted-foreground leading-relaxed flex-1 ${lang !== 'en' ? 'font-arabic' : ''}`} dir={lang === 'en' ? 'ltr' : 'rtl'}>
                      {getDesc(book)}
                    </p>
                    {book.external_link && (
                      <a href={book.external_link} target="_blank" rel="noopener noreferrer" className="mt-3">
                        <Button variant="outline" size="sm" className="gap-1.5 w-full">
                          <ExternalLink className="h-3.5 w-3.5" />
                          {lang === 'ur' ? 'پڑھیں' : lang === 'ar' ? 'اقرأ' : 'Read Online'}
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BooksPage;
