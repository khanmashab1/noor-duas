import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIslamicBooks } from '@/hooks/useIslamicBooks';
import { useBookChapters, BookChapter } from '@/hooks/useBookChapters';
import { useReadingProgress, useSaveProgress } from '@/hooks/useReadingProgress';
import { useBookBookmarks, useAddBookmark, useDeleteBookmark } from '@/hooks/useBookBookmarks';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Plus, Minus, Search, X, Trash2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';

const BookReaderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { user } = useAuth();
  const { data: books, isLoading: booksLoading } = useIslamicBooks();
  const { data: chapters, isLoading: chaptersLoading } = useBookChapters(id);
  const { data: progress } = useReadingProgress(id);
  const { data: bookmarks } = useBookBookmarks(id);
  const saveProgress = useSaveProgress();
  const addBookmark = useAddBookmark();
  const deleteBookmark = useDeleteBookmark();

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const book = books?.find(b => b.id === id);
  const isRtl = lang !== 'en';
  const hasChapters = chapters && chapters.length > 0;
  const currentChapter = hasChapters ? chapters[currentChapterIndex] : null;

  // Restore progress on load
  useEffect(() => {
    if (progress && chapters && chapters.length > 0) {
      const idx = chapters.findIndex(c => c.id === progress.chapter_id);
      if (idx >= 0) setCurrentChapterIndex(idx);
    }
  }, [progress, chapters]);

  // Auto-save progress
  const saveCurrentProgress = useCallback(() => {
    if (user && id && currentChapter) {
      saveProgress.mutate({
        bookId: id,
        chapterId: currentChapter.id,
        position: currentChapterIndex,
      });
    }
  }, [user, id, currentChapter, currentChapterIndex, saveProgress]);

  useEffect(() => {
    if (currentChapter) {
      const timer = setTimeout(saveCurrentProgress, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentChapterIndex, currentChapter, saveCurrentProgress]);

  const getLocalized = (obj: any, field: string) => {
    if (!obj) return '';
    if (lang === 'ar' && obj[`${field}_ar`]) return obj[`${field}_ar`];
    if (lang === 'ur' && obj[`${field}_ur`]) return obj[`${field}_ur`];
    return obj[field] || '';
  };

  const goToChapter = (index: number) => {
    setCurrentChapterIndex(index);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookmark = () => {
    if (!user) {
      toast({ title: lang === 'ur' ? 'پہلے لاگ ان کریں' : 'Please log in first', variant: 'destructive' });
      return;
    }
    const selection = window.getSelection()?.toString();
    const text = selection || getLocalized(currentChapter, 'chapter_title');
    addBookmark.mutate(
      { bookId: id!, chapterId: currentChapter?.id || null, savedText: text },
      { onSuccess: () => toast({ title: lang === 'ur' ? 'بک مارک محفوظ ہو گیا' : lang === 'ar' ? 'تم حفظ الإشارة المرجعية' : 'Bookmark saved!' }) }
    );
  };

  // Search within chapter content
  const searchResults = searchQuery.trim()
    ? chapters?.filter(ch => {
        const content = getLocalized(ch, 'content').toLowerCase();
        const title = getLocalized(ch, 'chapter_title').toLowerCase();
        return content.includes(searchQuery.toLowerCase()) || title.includes(searchQuery.toLowerCase());
      })
    : [];

  if (booksLoading || chaptersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Book not found</p>
        <Button variant="outline" onClick={() => navigate('/books')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {lang === 'ur' ? 'واپس جائیں' : lang === 'ar' ? 'العودة' : 'Go Back'}
        </Button>
      </div>
    );
  }

  const contentToRender = hasChapters
    ? getLocalized(currentChapter, 'content')
    : getLocalized(book, 'content');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-lg">
        <div className="container px-4 sm:px-6 py-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/books')}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {hasChapters && (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 shrink-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRtl ? 'right' : 'left'} className="w-80 p-0">
                <SheetHeader className="p-4 border-b border-border">
                  <SheetTitle className={`text-base ${isRtl ? 'font-arabic text-right' : ''}`}>
                    {lang === 'ur' ? 'ابواب' : lang === 'ar' ? 'الفصول' : 'Chapters'}
                  </SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
                  {chapters?.map((ch, i) => (
                    <button
                      key={ch.id}
                      onClick={() => goToChapter(i)}
                      className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors hover:bg-accent/50 ${
                        i === currentChapterIndex ? 'bg-primary/10 border-l-4 border-l-primary font-semibold' : ''
                      } ${isRtl ? 'text-right font-arabic' : ''}`}
                    >
                      <span className="text-xs text-muted-foreground">
                        {lang === 'ur' ? `باب ${ch.chapter_number}` : lang === 'ar' ? `الفصل ${ch.chapter_number}` : `Chapter ${ch.chapter_number}`}
                      </span>
                      <p className="text-sm mt-0.5">{getLocalized(ch, 'chapter_title')}</p>
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          )}

          <div className="flex-1 min-w-0">
            <h1 className={`font-display text-sm sm:text-base font-bold truncate ${isRtl ? 'font-arabic' : ''}`}>
              {getLocalized(book, 'title')}
            </h1>
            {currentChapter && (
              <p className={`text-xs opacity-70 truncate ${isRtl ? 'font-arabic' : ''}`}>
                {getLocalized(currentChapter, 'chapter_title')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
            >
              {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFontSize(s => Math.max(14, s - 2))}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-xs w-6 text-center">{fontSize}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFontSize(s => Math.min(32, s + 2))}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-primary-foreground/10"
            >
              <div className="container px-4 sm:px-6 py-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'ur' ? 'کتاب میں تلاش کریں...' : lang === 'ar' ? 'ابحث في الكتاب...' : 'Search in book...'}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                  dir={isRtl ? 'rtl' : 'ltr'}
                />
                {searchQuery && searchResults && searchResults.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-md bg-background text-foreground">
                    {searchResults.map((ch, i) => (
                      <button
                        key={ch.id}
                        onClick={() => {
                          const idx = chapters?.findIndex(c => c.id === ch.id) ?? 0;
                          goToChapter(idx);
                          setShowSearch(false);
                          setSearchQuery('');
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-accent border-b border-border/30 ${isRtl ? 'text-right font-arabic' : ''}`}
                      >
                        {getLocalized(ch, 'chapter_title')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Content area */}
      <div className="container px-4 sm:px-6 py-6 max-w-4xl mx-auto">
        {/* Bookmarks panel */}
        {bookmarks && bookmarks.length > 0 && (
          <details className="mb-6 rounded-lg border border-border bg-card">
            <summary className={`px-4 py-3 cursor-pointer text-sm font-semibold flex items-center gap-2 ${isRtl ? 'font-arabic' : ''}`}>
              <BookmarkCheck className="h-4 w-4 text-primary" />
              {lang === 'ur' ? `بک مارکس (${bookmarks.length})` : lang === 'ar' ? `الإشارات المرجعية (${bookmarks.length})` : `Bookmarks (${bookmarks.length})`}
            </summary>
            <div className="px-4 pb-3 space-y-2">
              {bookmarks.map(bm => (
                <div key={bm.id} className={`flex items-start gap-2 p-2 rounded bg-muted/50 text-sm ${isRtl ? 'font-arabic' : ''}`}>
                  <p className="flex-1 line-clamp-2">{bm.saved_text}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive" onClick={() => deleteBookmark.mutate(bm.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Main reading content */}
        <AnimatePresence mode="wait">
          <motion.article
            key={currentChapter?.id || 'main'}
            initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            className={`prose dark:prose-invert max-w-none ${isRtl ? 'font-arabic' : ''}`}
            dir={isRtl ? 'rtl' : 'ltr'}
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
          >
            {currentChapter && (
              <h2 className="text-xl sm:text-2xl font-bold text-primary mb-6 pb-3 border-b border-border">
                {getLocalized(currentChapter, 'chapter_title')}
              </h2>
            )}
            {contentToRender ? (
              contentToRender.split('\n').map((paragraph: string, i: number) =>
                paragraph.trim() ? (
                  <p key={i} className="mb-4 leading-relaxed text-foreground/90">
                    {paragraph}
                  </p>
                ) : (
                  <br key={i} />
                )
              )
            ) : (
              <div className="text-center py-16">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">
                  {lang === 'ur' ? 'مواد ابھی دستیاب نہیں ہے۔' : lang === 'ar' ? 'المحتوى غير متوفر حالياً.' : 'Content not available yet.'}
                </p>
              </div>
            )}
          </motion.article>
        </AnimatePresence>

        {/* Chapter navigation */}
        {hasChapters && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => goToChapter(currentChapterIndex - 1)}
              disabled={currentChapterIndex === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              {lang === 'ur' ? 'پچھلا' : lang === 'ar' ? 'السابق' : 'Previous'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentChapterIndex + 1} / {chapters?.length}
            </span>
            <Button
              variant="outline"
              onClick={() => goToChapter(currentChapterIndex + 1)}
              disabled={currentChapterIndex >= (chapters?.length ?? 1) - 1}
              className="gap-1.5"
            >
              {lang === 'ur' ? 'اگلا' : lang === 'ar' ? 'التالي' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookReaderPage;
