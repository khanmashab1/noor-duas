import { Copy, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';
import { toast } from '@/hooks/use-toast';
import type { Hadith } from '@/hooks/useHadiths';

interface HadithCardProps {
  hadith: Hadith;
}

export const HadithCard = ({ hadith }: HadithCardProps) => {
  const { t, lang } = useI18n();

  const handleCopy = () => {
    const text = `${hadith.arabic_text}\n\n${hadith.english_translation || ''}\n\n— ${hadith.narrator || ''} | ${hadith.source} ${hadith.hadith_number || ''}`;
    navigator.clipboard.writeText(text);
    toast({ title: t('copied') });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Noor Duas - Hadith',
        text: `${hadith.arabic_text}\n${hadith.english_translation || ''}\n— ${hadith.source}`,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-4 sm:p-6">
          {/* Arabic Text */}
          <div className="mb-4 rounded-lg bg-secondary/10 p-3 sm:p-5" dir="rtl">
            <p className="font-arabic text-xl sm:text-2xl leading-loose text-foreground">{hadith.arabic_text}</p>
          </div>

          {/* Translations */}
          {(lang === 'ur' || lang === 'en') && hadith.urdu_translation && (
            <div className="mb-3" dir="rtl">
              <p className="font-urdu text-sm sm:text-base leading-relaxed text-muted-foreground">{hadith.urdu_translation}</p>
            </div>
          )}
          {(lang === 'en' || lang === 'ar') && hadith.english_translation && (
            <p className="mb-3 text-xs sm:text-sm leading-relaxed text-muted-foreground italic">{hadith.english_translation}</p>
          )}

          {/* Source Info */}
          <div className="mb-4 flex flex-wrap gap-2">
            {hadith.narrator && (
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                🧑 {hadith.narrator}
              </span>
            )}
            <span className="inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-foreground">
              📖 {hadith.source} {hadith.hadith_number && `#${hadith.hadith_number}`}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs sm:text-sm px-2 sm:px-3">
              <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden xs:inline">{t('copy')}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-xs sm:text-sm px-2 sm:px-3">
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden xs:inline">{t('share')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
