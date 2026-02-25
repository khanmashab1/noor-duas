import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';

const defaultDhikrs = [
  { label: 'سُبْحَانَ اللَّهِ', transliteration: 'SubhanAllah' },
  { label: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah' },
  { label: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar' },
  { label: 'لَا إِلَهَ إِلَّا اللَّهُ', transliteration: 'La ilaha illAllah' },
  { label: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah' },
];

const TasbeehPage = () => {
  const { t } = useI18n();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [selectedDhikr, setSelectedDhikr] = useState(defaultDhikrs[0]);
  const [customDhikr, setCustomDhikr] = useState('');
  const [history, setHistory] = useState<Array<{ dhikr: string; count: number; date: string }>>(() => {
    const stored = localStorage.getItem('tasbeeh-history');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('tasbeeh-history', JSON.stringify(history));
  }, [history]);

  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  const handleReset = () => {
    if (count > 0) {
      setHistory((prev) => [
        { dhikr: customDhikr || selectedDhikr.transliteration, count, date: new Date().toISOString() },
        ...prev.slice(0, 19),
      ]);
    }
    setCount(0);
  };

  const progress = target > 0 ? Math.min((count / target) * 100, 100) : 0;

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-center font-display text-3xl font-bold text-foreground">{t('tasbeeh')} {t('counter')}</h1>

      <div className="mx-auto max-w-md space-y-6">
        {/* Dhikr Selection */}
        <div className="flex flex-wrap justify-center gap-2">
          {defaultDhikrs.map((d) => (
            <Button
              key={d.transliteration}
              variant={selectedDhikr.transliteration === d.transliteration && !customDhikr ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setSelectedDhikr(d); setCustomDhikr(''); }}
            >
              {d.transliteration}
            </Button>
          ))}
        </div>

        <Input
          placeholder="Custom dhikr..."
          value={customDhikr}
          onChange={(e) => setCustomDhikr(e.target.value)}
          className="text-center"
        />

        {/* Counter */}
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center p-8">
            <p className="mb-2 font-arabic text-2xl text-primary" dir="rtl">
              {customDhikr || selectedDhikr.label}
            </p>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={increment}
              className="my-6 flex h-40 w-40 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/30"
            >
              <span className="text-5xl font-bold">{count}</span>
            </motion.button>

            {/* Progress */}
            <div className="mb-4 w-full">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>{count} / {target}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Input
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-20 text-center"
                min={1}
              />
              <Button variant="outline" onClick={handleReset}>{t('reset')}</Button>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 font-semibold">History</h3>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted p-2 text-sm">
                    <span>{h.dhikr}</span>
                    <span className="font-semibold text-primary">{h.count}×</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TasbeehPage;
