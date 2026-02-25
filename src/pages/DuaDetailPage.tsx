import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDua, useDuasByCategory } from '@/hooks/useDuas';
import { DuaCard } from '@/components/DuaCard';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';

const DuaDetailPage = () => {
  const { id } = useParams();
  const { t } = useI18n();
  const { data: dua, isLoading } = useDua(id);
  const { data: relatedDuas } = useDuasByCategory(dua?.category_id);

  if (isLoading) return <div className="container py-20 text-center text-muted-foreground">{t('loading')}</div>;
  if (!dua) return <div className="container py-20 text-center text-muted-foreground">{t('noResults')}</div>;

  const related = relatedDuas?.filter((d) => d.id !== dua.id).slice(0, 3) ?? [];
  const wordByWord = dua.word_by_word as Array<{ arabic: string; english: string }> | null;

  return (
    <div className="container px-4 sm:px-6 py-6 sm:py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Link to={`/categories/${dua.category_id}`} className="mb-4 inline-block text-sm text-primary hover:underline">
          ← {t('categories')}
        </Link>

        <DuaCard dua={dua} showExpand={false} />

        {/* Word by Word */}
        {wordByWord && wordByWord.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4 sm:p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">{t('wordByWord')}</h3>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {wordByWord.map((w, i) => (
                  <div key={i} className="rounded-lg bg-primary/5 p-2 sm:p-3 text-center">
                    <p className="font-arabic text-base sm:text-lg" dir="rtl">{w.arabic}</p>
                    <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{w.english}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Explanation & Benefits */}
        {dua.explanation && (
          <Card className="mt-6">
            <CardContent className="p-4 sm:p-6">
              <h3 className="mb-2 font-display text-lg font-semibold">{t('explanation')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{dua.explanation}</p>
            </CardContent>
          </Card>
        )}
        {dua.benefits && (
          <Card className="mt-6">
            <CardContent className="p-4 sm:p-6">
              <h3 className="mb-2 font-display text-lg font-semibold">{t('benefits')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{dua.benefits}</p>
            </CardContent>
          </Card>
        )}

        {/* Related Duas */}
        {related.length > 0 && (
          <div className="mt-8 sm:mt-10">
            <h3 className="mb-4 font-display text-xl font-semibold">{t('relatedDuas')}</h3>
            <div className="space-y-4">
              {related.map((d) => (
                <DuaCard key={d.id} dua={d} />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DuaDetailPage;
