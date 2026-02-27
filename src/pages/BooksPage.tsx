import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';
import { useIslamicBooks } from '@/hooks/useIslamicBooks';
import { useAllReadingProgress } from '@/hooks/useReadingProgress';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const categoryLabels: Record<string, { en: string; ur: string; ar: string }> = {
  hadith: { en: 'Hadith', ur: 'حدیث', ar: 'حديث' },
  dua: { en: 'Duas & Supplications', ur: 'دعائیں', ar: 'أدعية' },
  fiqh: { en: 'Fiqh & Jurisprudence', ur: 'فقہ', ar: 'فقه' },
  tafsir: { en: 'Tafsir & Commentary', ur: 'تفسیر', ar: 'تفسير' },
  seerah: { en: 'Seerah & Biography', ur: 'سیرت', ar: 'سيرة' },
  general: { en: 'General', ur: 'عمومی', ar: 'عام' },
};

const BooksPage = () => {
  const { lang } = useI18n();
  const { user } = useAuth();
  const { data: books, isLoading } = useIslamicBooks();
  const { data: progressList } = useAllReadingProgress();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const isRtl = lang !== 'en';
  const categories = [...new Set(books?.map(b => b.category || 'general') ?? [])];

  const getLocalized = (b: any, field: string) => {
    if (lang === 'ar' && b[`${field}_ar`]) return b[`${field}_ar`];
    if (lang === 'ur' && b[`${field}_ur`]) return b[`${field}_ur`];
    return b[field] || '';
  };

  const getCatLabel = (cat: string) => categoryLabels[cat]?.[lang] ?? categoryLabels[cat]?.en ?? cat;

  const filtered = books?.filter(b => {
    const catMatch = !selectedCategory || (b.category || 'general') === selectedCategory;
    if (!searchQuery.trim()) return catMatch;
    const q = searchQuery.toLowerCase();
    return catMatch && (
      getLocalized(b, 'title').toLowerCase().includes(q) ||
      getLocalized(b, 'author').toLowerCase().includes(q) ||
      getLocalized(b, 'description').toLowerCase().includes(q)
    );
  });

  // Books with reading progress (continue reading)
  const continueBooks = progressList?.length
    ? books?.filter(b => progressList.some(p => p.book_id === b.id))
    : [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-10 sm:py-16 text-primary-foreground islamic-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="container relative z-10 px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <BookOpen className="mx-auto h-10 w-10 mb-3" />
            <h1 className={`font-display text-2xl sm:text-3xl md:text-4xl font-bold ${isRtl ? 'font-arabic' : ''}`}>
              {lang === 'ar' ? 'الكتب الإسلامية' : lang === 'ur' ? 'اسلامی کتابیں' : 'Islamic Books'}
            </h1>
            <p className="mt-2 text-sm sm:text-base opacity-90">
              {lang === 'ar' ? 'مجموعة من أهم الكتب الإسلامية' : lang === 'ur' ? 'اہم اسلامی کتابوں کا مجموعہ' : 'A collection of essential Islamic books'}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container px-4 sm:px-6 py-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ur' ? 'کتابیں تلاش کریں...' : lang === 'ar' ? 'ابحث عن كتب...' : 'Search books...'}
            className="pl-10"
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant={selectedCategory === null ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(null)}>
            {lang === 'ur' ? 'سب' : lang === 'ar' ? 'الكل' : 'All'}
          </Button>
          {categories.map(cat => (
            <Button key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(cat)}>
              {getCatLabel(cat)}
            </Button>
          ))}
        </div>

        {/* Continue Reading */}
        {user && continueBooks && continueBooks.length > 0 && (
          <div className="mb-8">
            <h2 className={`text-lg font-bold mb-3 ${isRtl ? 'font-arabic' : ''}`}>
              {lang === 'ur' ? '📖 پڑھنا جاری رکھیں' : lang === 'ar' ? '📖 تابع القراءة' : '📖 Continue Reading'}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {continueBooks.map(book => (
                <Card
                  key={book.id}
                  className="min-w-[200px] max-w-[250px] cursor-pointer border-primary/30 hover:shadow-md transition-all shrink-0"
                  onClick={() => navigate(`/books/${book.id}`)}
                >
                  <CardContent className="p-4">
                    <h3 className={`font-semibold text-sm truncate ${isRtl ? 'font-arabic' : ''}`}>{getLocalized(book, 'title')}</h3>
                    <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                      <ArrowRight className="h-3 w-3" />
                      {lang === 'ur' ? 'جاری رکھیں' : lang === 'ar' ? 'تابع' : 'Continue'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Book Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered?.map((book, i) => (
              <motion.div key={book.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card
                  className="h-full border-border/50 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => navigate(`/books/${book.id}`)}
                >
                  <CardContent className="p-5 flex flex-col h-full">
                    <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-3 self-start">
                      {getCatLabel(book.category || 'general')}
                    </span>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className={`font-display text-base sm:text-lg font-bold text-foreground ${isRtl ? 'font-arabic' : ''}`}>
                          {getLocalized(book, 'title')}
                        </h3>
                        {getLocalized(book, 'author') && (
                          <p className={`text-xs text-muted-foreground mt-0.5 ${isRtl ? 'font-arabic' : ''}`}>
                            ✍️ {getLocalized(book, 'author')}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                      {getLocalized(book, 'description')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {filtered?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {lang === 'ur' ? 'کوئی کتاب نہیں ملی' : lang === 'ar' ? 'لم يتم العثور على كتب' : 'No books found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BooksPage;
