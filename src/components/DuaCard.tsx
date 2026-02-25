import { Copy, Share2, Heart, ChevronDown, ChevronUp } from 'lucide-react';
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

interface DuaCardProps {
  dua: Dua;
  showExpand?: boolean;
}

export const DuaCard = ({ dua, showExpand = true }: DuaCardProps) => {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [expanded, setExpanded] = useState(false);
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
        <CardContent className="p-6">
          {/* Arabic Text */}
          <div className="mb-4 rounded-lg bg-primary/5 p-5" dir="rtl">
            <p className="font-arabic text-2xl leading-loose text-foreground">{dua.arabic_text}</p>
          </div>

          {/* Translations */}
          {(lang === 'ur' || lang === 'en') && dua.urdu_translation && (
            <div className="mb-3" dir="rtl">
              <p className="font-urdu text-base leading-relaxed text-muted-foreground">{dua.urdu_translation}</p>
            </div>
          )}
          {(lang === 'en' || lang === 'ar') && dua.english_translation && (
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{dua.english_translation}</p>
          )}

          {/* Reference */}
          {dua.reference && (
            <div className="mb-4 inline-block rounded-full bg-accent/20 px-3 py-1">
              <span className="text-xs font-medium text-accent-foreground">📖 {dua.reference}</span>
            </div>
          )}

          {/* Audio Player */}
          {dua.audio_url && <AudioPlayer url={dua.audio_url} />}

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
                  <div className="mb-3 rounded-lg bg-muted p-4">
                    <h4 className="mb-1 text-sm font-semibold">{t('explanation')}</h4>
                    <p className="text-sm text-muted-foreground">{dua.explanation}</p>
                  </div>
                )}
                {dua.benefits && (
                  <div className="mb-3 rounded-lg bg-muted p-4">
                    <h4 className="mb-1 text-sm font-semibold">{t('benefits')}</h4>
                    <p className="text-sm text-muted-foreground">{dua.benefits}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4" /> {t('copy')}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> {t('share')}
            </Button>
            {user && (
              <Button variant="ghost" size="sm" onClick={handleFavorite} className={fav ? 'text-destructive' : ''}>
                <Heart className={`h-4 w-4 ${fav ? 'fill-current' : ''}`} />
                {fav ? t('removeFavorite') : t('addFavorite')}
              </Button>
            )}
            {showExpand && (dua.explanation || dua.benefits) && (
              <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="ml-auto rtl:mr-auto rtl:ml-0">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
            <Link to={`/dua/${dua.id}`} className="ml-auto rtl:mr-auto rtl:ml-0">
              <Button variant="outline" size="sm">{t('viewAll')}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
