import { Copy, Share2, Heart, ChevronDown, ChevronUp, Image } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from '@/hooks/use-toast';
import type { Dua } from '@/hooks/useDuas';
import { Link } from 'react-router-dom';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ShareImage } from '@/components/ShareImage';

interface DuaCardProps {
  dua: Dua;
  showExpand?: boolean;
}

export const DuaCard = ({ dua, showExpand = true }: DuaCardProps) => {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [expanded, setExpanded] = useState(false);
  const [showShareImage, setShowShareImage] = useState(false);
  const fav = user ? isFavorite(dua.id) : false;

  const handleCopy = () => {
    const text = `${dua.arabic_text}\n\n${dua.english_translation || ''}\n\n${dua.urdu_translation || ''}\n\n— ${dua.reference || ''}`;
    navigator.clipboard.writeText(text);
    toast({ title: t('copied') });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Noor Duas',
        text: `${dua.arabic_text}\n${dua.english_translation || ''}`,
        url: `${window.location.origin}/dua/${dua.id}`,
      });
    } else {
      handleCopy();
    }
  };

  const handleFavorite = () => {
    if (!user) return;
    if (fav) removeFavorite.mutate(dua.id);
    else addFavorite.mutate(dua.id);
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
          <div className="mb-4 rounded-lg bg-primary/5 p-3 sm:p-5" dir="rtl">
            <p className="font-arabic text-xl sm:text-2xl leading-loose text-foreground">{dua.arabic_text}</p>
          </div>

          {/* Translations */}
          {(lang === 'ur' || lang === 'en') && dua.urdu_translation && (
            <div className="mb-3" dir="rtl">
              <p className="font-urdu text-sm sm:text-base leading-relaxed text-muted-foreground">{dua.urdu_translation}</p>
            </div>
          )}
          {(lang === 'en' || lang === 'ar') && dua.english_translation && (
            <p className="mb-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">{dua.english_translation}</p>
          )}

          {/* Reference */}
          {dua.reference && (
            <div className="mb-4 inline-block rounded-full bg-accent/20 px-3 py-1">
              <span className="text-xs font-medium text-accent-foreground">📖 {dua.reference}</span>
            </div>
          )}

          {/* Audio Player - works with URL or on-demand TTS */}
          <AudioPlayer url={dua.audio_url || undefined} arabicText={!dua.audio_url ? dua.arabic_text : undefined} />

          {/* Expanded Content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {dua.explanation && (
                  <div className="mb-3 rounded-lg bg-muted p-3 sm:p-4">
                    <h4 className="mb-1 text-sm font-semibold">{t('explanation')}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">{dua.explanation}</p>
                  </div>
                )}
                {dua.benefits && (
                  <div className="mb-3 rounded-lg bg-muted p-3 sm:p-4">
                    <h4 className="mb-1 text-sm font-semibold">{t('benefits')}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">{dua.benefits}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs sm:text-sm px-2 sm:px-3">
              <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden xs:inline">{t('copy')}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-xs sm:text-sm px-2 sm:px-3">
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden xs:inline">{t('share')}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowShareImage(true)} className="text-xs sm:text-sm px-2 sm:px-3">
              <Image className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden xs:inline">Status</span>
            </Button>
            {user && (
              <Button variant="ghost" size="sm" onClick={handleFavorite} className={`text-xs sm:text-sm px-2 sm:px-3 ${fav ? 'text-destructive' : ''}`}>
                <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${fav ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{fav ? t('removeFavorite') : t('addFavorite')}</span>
              </Button>
            )}
            {showExpand && (dua.explanation || dua.benefits) && (
              <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="ml-auto rtl:mr-auto rtl:ml-0">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
            <Link to={`/dua/${dua.id}`} className="ml-auto rtl:mr-auto rtl:ml-0">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">{t('viewAll')}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      {showShareImage && <ShareImage content={{ ...dua, source: null, narrator: null }} type="dua" onClose={() => setShowShareImage(false)} />}
    </motion.div>
  );
};
