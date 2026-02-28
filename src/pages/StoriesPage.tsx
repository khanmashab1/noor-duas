import { SEO } from '@/components/SEO';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { useStoryCategories, useStories } from '@/hooks/useStories';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight, Users, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';

const categoryIcons: Record<string, React.ReactNode> = {
  mosque: <Landmark className="h-6 w-6" />,
  book: <BookOpen className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
};

const StoriesPage = () => {
  const { lang } = useI18n();
  const { data: categories } = useStoryCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { data: stories } = useStories(selectedCategory);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);

  const getName = (obj: { name: string; name_ar?: string | null; name_ur?: string | null }) => {
    if (lang === 'ar' && obj.name_ar) return obj.name_ar;
    if (lang === 'ur' && obj.name_ur) return obj.name_ur;
    return obj.name;
  };

  const getTitle = (s: { title: string; title_ar?: string | null; title_ur?: string | null }) => {
    if (lang === 'ar' && s.title_ar) return s.title_ar;
    if (lang === 'ur' && s.title_ur) return s.title_ur;
    return s.title;
  };

  const getContent = (s: { content: string; content_ar?: string | null; content_ur?: string | null }) => {
    if (lang === 'ar' && s.content_ar) return s.content_ar;
    if (lang === 'ur' && s.content_ur) return s.content_ur;
    return s.content;
  };

  const labels = {
    title: { en: 'Islamic Stories', ar: 'القصص الإسلامية', ur: 'اسلامی واقعات' },
    subtitle: {
      en: 'Inspiring stories from the Quran, Seerah & lives of the Sahaba',
      ar: 'قصص ملهمة من القرآن والسيرة وحياة الصحابة',
      ur: 'قرآن، سیرت اور صحابہ کرام کی زندگیوں سے سبق آموز واقعات',
    },
    all: { en: 'All', ar: 'الكل', ur: 'سب' },
    source: { en: 'Source', ar: 'المصدر', ur: 'حوالہ' },
    readMore: { en: 'Read More', ar: 'اقرأ المزيد', ur: 'مزید پڑھیں' },
    readLess: { en: 'Read Less', ar: 'أقل', ur: 'کم پڑھیں' },
  };

  return (
    <div className="min-h-screen">
      <SEO title="Islamic Stories – Quran, Seerah & Sahaba" description="Inspiring Islamic stories from the Quran, Prophet's Seerah & lives of the Sahaba. Read in Arabic, Urdu & English" path="/stories" breadcrumbs={[{ name: 'Stories', path: '/stories' }]} article={{ datePublished: '2025-01-01' }} keywords="islamic stories, quran stories, prophet stories, sahaba stories, seerah" />
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-10 sm:py-16 text-primary-foreground islamic-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="container relative z-10 px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="mb-3 inline-block text-4xl">📖</span>
            <h1 className="font-display text-2xl sm:text-4xl font-bold">{labels.title[lang]}</h1>
            <p className="mt-2 text-sm sm:text-lg opacity-90">{labels.subtitle[lang]}</p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="container px-4 sm:px-6 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(undefined)}
          >
            {labels.all[lang]}
          </Button>
          {categories?.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {categoryIcons[cat.icon || ''] || <BookOpen className="h-4 w-4" />}
              {getName(cat)}
            </Button>
          ))}
        </div>

        {/* Stories */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {stories?.map((story, i) => {
              const content = getContent(story);
              const isExpanded = expandedStory === story.id;
              const isLong = content.length > 200;

              return (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.05 }}
                  layout
                >
                  <Card className="border-border/50 hover:border-primary/20 transition-all hover:shadow-md">
                    <CardContent className="p-5 sm:p-6">
                      {/* Category badge */}
                      {story.story_categories && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-3">
                          {categoryIcons[(story.story_categories as any).icon || ''] && (
                            <span className="scale-50">{categoryIcons[(story.story_categories as any).icon || '']}</span>
                          )}
                          {getName(story.story_categories as any)}
                        </span>
                      )}

                      <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-3">
                        {getTitle(story)}
                      </h3>

                      <div className={`text-sm sm:text-base text-muted-foreground leading-relaxed ${lang !== 'en' ? 'font-arabic' : ''}`} dir={lang === 'en' ? 'ltr' : 'rtl'}>
                        {isLong && !isExpanded ? (
                          <>
                            {content.slice(0, 200)}...
                            <button
                              onClick={() => setExpandedStory(story.id)}
                              className="text-primary font-medium ml-1 hover:underline"
                            >
                              {labels.readMore[lang]}
                            </button>
                          </>
                        ) : (
                          <>
                            {content}
                            {isLong && (
                              <button
                                onClick={() => setExpandedStory(null)}
                                className="text-primary font-medium ml-1 hover:underline block mt-2"
                              >
                                {labels.readLess[lang]}
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {story.source && (
                        <p className="mt-3 text-xs text-accent-foreground flex items-center gap-1">
                          📖 <span className="font-medium">{labels.source[lang]}:</span> {story.source}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {stories?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {lang === 'ur' ? 'ابھی کوئی واقعات نہیں ہیں' : 'No stories yet'}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StoriesPage;
