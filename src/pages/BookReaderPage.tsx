import { useParams, useNavigate } from 'react-router-dom';
import { useIslamicBooks } from '@/hooks/useIslamicBooks';
import { useI18n } from '@/lib/i18n';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BookReaderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { data: books, isLoading } = useIslamicBooks();

  const book = books?.find(b => b.id === id);

  const getTitle = (b: any) =>
    lang === 'ar' && b.title_ar ? b.title_ar : lang === 'ur' && b.title_ur ? b.title_ur : b.title;
  const getAuthor = (b: any) =>
    lang === 'ar' && b.author_ar ? b.author_ar : lang === 'ur' && b.author_ur ? b.author_ur : b.author;
  const getDesc = (b: any) =>
    lang === 'ar' && b.description_ar ? b.description_ar : lang === 'ur' && b.description_ur ? b.description_ur : b.description;

  if (isLoading) {
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

  const isRtl = lang !== 'en';

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <section className="relative overflow-hidden bg-primary py-8 sm:py-12 text-primary-foreground islamic-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="container relative z-10 px-4 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/books')}
            className="mb-4 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {lang === 'ur' ? 'واپس' : lang === 'ar' ? 'العودة' : 'Back'}
          </Button>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/10">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className={`font-display text-xl sm:text-2xl md:text-3xl font-bold ${isRtl ? 'font-arabic' : ''}`}>
                {getTitle(book)}
              </h1>
              {getAuthor(book) && (
                <p className={`mt-1 text-sm opacity-80 ${isRtl ? 'font-arabic' : ''}`}>
                  ✍️ {getAuthor(book)}
                </p>
              )}
              {getDesc(book) && (
                <p className={`mt-2 text-sm opacity-70 max-w-2xl ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                  {getDesc(book)}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Book content */}
      <div className="container px-4 sm:px-6 py-8">
        {book.content ? (
          <article
            className={`prose prose-lg dark:prose-invert max-w-none ${isRtl ? 'font-arabic' : ''}`}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {book.content.split('\n').map((paragraph, i) => (
              paragraph.trim() ? (
                <p key={i} className="mb-4 leading-relaxed text-foreground/90">
                  {paragraph}
                </p>
              ) : <br key={i} />
            ))}
          </article>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className={`text-muted-foreground ${isRtl ? 'font-arabic' : ''}`}>
              {lang === 'ur'
                ? 'اس کتاب کا مواد ابھی دستیاب نہیں ہے۔ جلد اپ لوڈ کیا جائے گا۔'
                : lang === 'ar'
                ? 'محتوى هذا الكتاب غير متوفر حالياً. سيتم رفعه قريباً.'
                : 'Content for this book is not available yet. It will be uploaded soon.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookReaderPage;
