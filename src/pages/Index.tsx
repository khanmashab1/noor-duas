import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';
import { useCategories, useAllDuas } from '@/hooks/useDuas';
import { useIslamicBooks } from '@/hooks/useIslamicBooks';
import { useRandomHadith } from '@/hooks/useHadiths';
import { loadSettings } from '@/hooks/usePrayerTimes';
import { useStories } from '@/hooks/useStories';
import { DuaCard } from '@/components/DuaCard';
import { HadithCard } from '@/components/HadithCard';
import { NextPrayerCountdown } from '@/components/NextPrayerCountdown';
import { Sunrise, Sunset, Shield, Plane, Heart, Moon as MoonIcon, Coins, Gem, BookOpen, Library } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useDailyNotifications } from '@/hooks/useDailyNotifications';

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

const HomePage = () => {
  const { t, lang } = useI18n();
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [hijriDate, setHijriDate] = useState<{ day: string; weekday: string; weekdayAr: string; month: string; monthAr: string; year: string } | null>(null);
  useDailyNotifications();

  useEffect(() => {
    const { latitude, longitude } = loadSettings();
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).formatToParts(new Date());

    const dd = parts.find((p) => p.type === 'day')?.value ?? '01';
    const mm = parts.find((p) => p.type === 'month')?.value ?? '01';
    const yyyy = parts.find((p) => p.type === 'year')?.value ?? String(new Date().getFullYear());

    fetch(
      `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${latitude}&longitude=${longitude}&method=1`
    )
      .then(r => r.json())
      .then(d => {
        if (d.code === 200) {
          const h = d.data.date.hijri;
          // Pakistan moon sighting is typically 1 day behind the calculated Hijri date
          const adjustedDay = String(Math.max(1, parseInt(h.day) - 1));
          setHijriDate({ day: adjustedDay, weekday: h.weekday.en, weekdayAr: h.weekday.ar, month: h.month.en, monthAr: h.month.ar, year: h.year });
        }
      })
      .catch(() => {});
  }, []);
  const { data: categories } = useCategories();
  const { data: allDuas } = useAllDuas();
  const { data: dailyHadith } = useRandomHadith();
  const { data: allStories } = useStories();
  const { data: islamicBooks } = useIslamicBooks();

  const dailyStory = useMemo(() => {
    if (!allStories?.length) return null;
    const idx = Math.floor(new Date().getDate() % allStories.length);
    return allStories[idx];
  }, [allStories]);

  const randomDua = useMemo(() => {
    if (!allDuas?.length) return null;
    const idx = Math.floor(new Date().getDate() % allDuas.length);
    return allDuas[idx];
  }, [allDuas]);

  const popularDuas = useMemo(() => allDuas?.slice(0, 4) ?? [], [allDuas]);

  const getCategoryName = (cat: { name: string; name_ar: string | null; name_ur: string | null }) => {
    if (lang === 'ar' && cat.name_ar) return cat.name_ar;
    if (lang === 'ur' && cat.name_ur) return cat.name_ur;
    return cat.name;
  };

  return (
    <div className="min-h-screen">
      {/* Next Prayer Countdown */}
      <NextPrayerCountdown />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-12 sm:py-20 text-primary-foreground islamic-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="container relative z-10 px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {hijriDate && (
              <div className="mb-5 inline-flex flex-wrap items-center justify-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-5 py-2.5 text-sm sm:text-base border border-white/20 shadow-lg">
                <span>🌙</span>
                <span className="font-semibold">{hijriDate.weekday}, {hijriDate.day} {hijriDate.month} {hijriDate.year} AH</span>
                <span className="opacity-40">|</span>
                <span className="font-arabic text-base">{hijriDate.weekdayAr} — {hijriDate.monthAr}</span>
              </div>
            )}
            <div>
              <span className="mb-4 inline-block text-4xl sm:text-5xl">🕌</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold leading-tight">{t('heroTitle')}</h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl opacity-90">{t('heroSubtitle')}</p>
          </motion.div>

          {/* Quick Access Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 sm:mt-10 flex flex-wrap justify-center gap-2 sm:gap-3"
          >
            {categories?.slice(0, 5).map((cat) => (
              <Link key={cat.id} to={`/categories/${cat.id}`}>
                <Button variant="secondary" size="sm" className="gap-1.5 sm:gap-2 shadow-md text-xs sm:text-sm sm:h-10 sm:px-4">
                  {categoryIcons[cat.icon || ''] || <Heart className="h-4 w-4 sm:h-5 sm:w-5" />}
                  {getCategoryName(cat)}
                </Button>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Daily Dua */}
      {randomDua && (
        <section className="container px-4 sm:px-6 py-8 sm:py-12">
          <h2 className="mb-4 sm:mb-6 font-display text-xl sm:text-2xl font-bold text-foreground">{t('dailyDua')}</h2>
          <DuaCard dua={randomDua} />
        </section>
      )}

      {/* Hadith of the Day */}
      {dailyHadith && (
        <section className="container px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">{t('hadithOfTheDay')}</h2>
            <Link to="/hadith">
              <Button variant="outline" size="sm">{t('viewAll')}</Button>
            </Link>
          </div>
          <HadithCard hadith={dailyHadith} />
        </section>
      )}

      {/* Story of the Day */}
      {dailyStory && (
        <section className="container px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {lang === 'ar' ? 'قصة اليوم' : lang === 'ur' ? 'آج کا واقعہ' : 'Story of the Day'}
            </h2>
            <Link to="/stories">
              <Button variant="outline" size="sm">{t('viewAll')}</Button>
            </Link>
          </div>
          <Card className="border-border/50 hover:shadow-md transition-all">
            <CardContent className="p-5 sm:p-6">
              {dailyStory.story_categories && (
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-3">
                  {lang === 'ar' && (dailyStory.story_categories as any).name_ar
                    ? (dailyStory.story_categories as any).name_ar
                    : lang === 'ur' && (dailyStory.story_categories as any).name_ur
                    ? (dailyStory.story_categories as any).name_ur
                    : (dailyStory.story_categories as any).name}
                </span>
              )}
              <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-3">
                {lang === 'ar' && dailyStory.title_ar ? dailyStory.title_ar : lang === 'ur' && dailyStory.title_ur ? dailyStory.title_ur : dailyStory.title}
              </h3>
              <p className={`text-sm sm:text-base text-muted-foreground leading-relaxed ${lang !== 'en' ? 'font-arabic' : ''}`} dir={lang === 'en' ? 'ltr' : 'rtl'}>
                {(() => {
                  const content = lang === 'ar' && dailyStory.content_ar ? dailyStory.content_ar : lang === 'ur' && dailyStory.content_ur ? dailyStory.content_ur : dailyStory.content;
                  if (!storyExpanded && content.length > 300) {
                    return (
                      <>
                        {content.slice(0, 300)}...
                        <button onClick={() => setStoryExpanded(true)} className="text-primary font-medium ml-1 hover:underline">
                          {lang === 'ur' ? 'مزید پڑھیں' : lang === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                        </button>
                      </>
                    );
                  }
                  return (
                    <>
                      {content}
                      {content.length > 300 && (
                        <button onClick={() => setStoryExpanded(false)} className="text-primary font-medium ml-1 hover:underline block mt-2">
                          {lang === 'ur' ? 'کم پڑھیں' : lang === 'ar' ? 'أقل' : 'Read Less'}
                        </button>
                      )}
                    </>
                  );
                })()}
              </p>
              {dailyStory.source && (
                <p className="mt-3 text-xs text-accent-foreground">📖 {dailyStory.source}</p>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      <section className="bg-muted/30 py-8 sm:py-12 islamic-pattern dark:islamic-pattern-dark">
        <div className="container px-4 sm:px-6">
          <h2 className="mb-6 sm:mb-8 font-display text-xl sm:text-2xl font-bold text-foreground">{t('categories')}</h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {categories?.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/categories/${cat.id}`}>
                  <Card className="cursor-pointer border-border/50 transition-all hover:border-primary/30 hover:shadow-lg">
                    <CardContent className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {categoryIcons[cat.icon || ''] || <Heart className="h-5 w-5 sm:h-6 sm:w-6" />}
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-foreground">{getCategoryName(cat)}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Duas */}
      {popularDuas.length > 0 && (
        <section className="container px-4 sm:px-6 py-8 sm:py-12">
          <h2 className="mb-4 sm:mb-6 font-display text-xl sm:text-2xl font-bold text-foreground">{t('popularDuas')}</h2>
          <div className="space-y-4">
            {popularDuas.map((dua) => (
              <DuaCard key={dua.id} dua={dua} />
            ))}
          </div>
        </section>
      )}

      {/* Islamic Books Preview */}
      {islamicBooks && islamicBooks.length > 0 && (
        <section className="container px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Library className="h-5 w-5 text-primary" />
              {lang === 'ar' ? 'الكتب الإسلامية' : lang === 'ur' ? 'اسلامی کتابیں' : 'Islamic Books'}
            </h2>
            <Link to="/books">
              <Button variant="outline" size="sm">{t('viewAll')}</Button>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {islamicBooks.slice(0, 3).map((book) => (
              <Card key={book.id} className="border-border/50 hover:shadow-md transition-all">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={`font-display text-sm sm:text-base font-bold text-foreground ${lang !== 'en' ? 'font-arabic' : ''}`}>
                        {lang === 'ar' && book.title_ar ? book.title_ar : lang === 'ur' && book.title_ur ? book.title_ur : book.title}
                      </h3>
                      {book.author && (
                        <p className={`text-xs text-muted-foreground mt-0.5 ${lang !== 'en' ? 'font-arabic' : ''}`}>
                          ✍️ {lang === 'ar' && book.author_ar ? book.author_ar : lang === 'ur' && book.author_ur ? book.author_ur : book.author}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Tasbeeh Preview */}
      <section className="bg-primary/5 py-8 sm:py-12">
        <div className="container px-4 sm:px-6 text-center">
          <h2 className="mb-3 sm:mb-4 font-display text-xl sm:text-2xl font-bold text-foreground">{t('tasbeeh')}</h2>
          <p className="mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground">Digital Tasbeeh Counter for daily dhikr</p>
          <Link to="/tasbeeh">
            <Button size="lg" className="gap-2">📿 {t('tasbeeh')} {t('counter')}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
