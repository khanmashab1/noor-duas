import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { usePrayerTimes, PRAYER_INFO, PrayerKey } from '@/hooks/usePrayerTimes';

export const NextPrayerCountdown = () => {
  const { lang } = useI18n();
  const { times, nextPrayer, nextPrayerTime, settings } = usePrayerTimes();
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!nextPrayerTime) return;
    const tick = () => {
      const now = new Date();
      const diff = nextPrayerTime.getTime() - now.getTime();
      if (diff <= 0) { setCountdown('00:00'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(h > 0 ? `${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s` : `${m}m ${String(s).padStart(2,'0')}s`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [nextPrayerTime]);

  if (!times || !nextPrayer || !countdown) return null;

  const prayer = PRAYER_INFO[nextPrayer];

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <Link to="/namaz" className="block">
        <div className="bg-primary/5 border-b border-primary/10 hover:bg-primary/10 transition-colors">
          <div className="container px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{prayer.icon}</span>
              <div>
                <p className="text-xs text-muted-foreground">{lang === 'ur' ? 'اگلی نماز' : lang === 'ar' ? 'الصلاة القادمة' : 'Next Prayer'}</p>
                <p className="font-display font-bold text-foreground">
                  {prayer[lang]} <span className="text-muted-foreground font-normal text-sm">{times[nextPrayer as PrayerKey]}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-end">
                <div className="font-mono text-lg sm:text-xl font-bold text-primary tabular-nums">{countdown}</div>
                {settings.city && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end">
                    <MapPin className="h-2.5 w-2.5" /> {settings.city}
                  </p>
                )}
              </div>
              <Clock className="h-4 w-4 text-muted-foreground hidden sm:block" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
