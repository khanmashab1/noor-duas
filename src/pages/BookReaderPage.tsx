import { useParams, useNavigate } from 'react-router-dom';
import { useIslamicBooks } from '@/hooks/useIslamicBooks';
import { useI18n } from '@/lib/i18n';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BookReaderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { data: books, isLoading } = useIslamicBooks();

  const book = books?.find(b => b.id === id);

  const getTitle = (b: any) =>
    lang === 'ar' && b.title_ar ? b.title_ar : lang === 'ur' && b.title_ur ? b.title_ur : b.title;

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex items-center gap-3 px-4 py-2.5">
          <Button variant="ghost" size="icon" onClick={() => navigate('/books')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className={`text-sm sm:text-base font-semibold truncate ${lang !== 'en' ? 'font-arabic' : ''}`}>
            {getTitle(book)}
          </h1>
          {book.external_link && (
            <a
              href={book.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto shrink-0"
            >
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ExternalLink className="h-3.5 w-3.5" />
                {lang === 'ur' ? 'نئی ٹیب' : lang === 'ar' ? 'تبويب جديد' : 'New Tab'}
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      {book.external_link ? (
        <iframe
          src={book.external_link}
          className="flex-1 w-full border-0"
          title={book.title}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          style={{ minHeight: 'calc(100vh - 120px)' }}
        />
      ) : (
        <div className="container px-4 py-10 text-center">
          <p className={`text-muted-foreground ${lang !== 'en' ? 'font-arabic' : ''}`}>
            {lang === 'ur'
              ? 'اس کتاب کا آن لائن لنک دستیاب نہیں ہے۔'
              : lang === 'ar'
              ? 'رابط هذا الكتاب غير متوفر حالياً.'
              : 'Online reading is not available for this book yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookReaderPage;
