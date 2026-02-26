import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';

interface PrayerTimesData {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const prayerNames: Record<string, { en: string; ar: string; ur: string; icon: string }> = {
  Fajr: { en: 'Fajr', ar: 'الفجر', ur: 'فجر', icon: '🌅' },
  Dhuhr: { en: 'Dhuhr', ar: 'الظهر', ur: 'ظہر', icon: '🌤️' },
  Asr: { en: 'Asr', ar: 'العصر', ur: 'عصر', icon: '⛅' },
  Maghrib: { en: 'Maghrib', ar: 'المغرب', ur: 'مغرب', icon: '🌇' },
  Isha: { en: 'Isha', ar: 'العشاء', ur: 'عشاء', icon: '🌙' },
};

const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export const NextPrayerCountdown = () => {
  const { lang } = useI18n();
  const [times, setTimes] = useState<PrayerTimesData | null>(null);
  const [city, setCity] = useState('');
  const [nextPrayer, setNextPrayer] = useState('');
  const [countdown, setCountdown] = useState('');
  const [loaded, setLoaded] = useState(false);

  const fetchTimes = useCallback(async (lat: number, lng: number) => {
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=2`
      );
      const data = await res.json();
      if (data.code === 200) {
        const t = data.data.timings;
        setTimes({ Fajr: t.Fajr, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha });
      }
      // reverse geocode
      try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        const geo = await geoRes.json();
        setCity(geo.city || geo.locality || '');
      } catch { /* ignore */ }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  const fetchByCity = useCallback(async (cityName: string) => {
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity/${dd}-${mm}-${yyyy}?city=${encodeURIComponent(cityName)}&country=&method=2`
      );
      const data = await res.json();
      if (data.code === 200) {
        const t = data.data.timings;
        setTimes({ Fajr: t.Fajr, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha });
        setCity(cityName);
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    const savedCity = localStorage.getItem('noor-prayer-city');
    if (savedCity) {
      fetchByCity(savedCity);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchTimes(pos.coords.latitude, pos.coords.longitude),
        () => setLoaded(true)
      );
    } else {
      setLoaded(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate next prayer & countdown
  useEffect(() => {
    if (!times) return;
    const tick = () => {
      const now = new Date();
      let found = false;
      for (const key of PRAYER_KEYS) {
        const [h, m] = times[key].split(':').map(Number);
        const pt = new Date();
        pt.setHours(h, m, 0, 0);
        if (pt > now) {
          setNextPrayer(key);
          const diff = pt.getTime() - now.getTime();
          const hrs = Math.floor(diff / 3600000);
          const mins = Math.floor((diff % 3600000) / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setCountdown(
            hrs > 0
              ? `${hrs}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
              : `${mins}m ${String(secs).padStart(2, '0')}s`
          );
          found = true;
          break;
        }
      }
      if (!found) {
        setNextPrayer('Fajr');
        // Tomorrow's Fajr
        const [h, m] = times.Fajr.split(':').map(Number);
        const tmrw = new Date();
        tmrw.setDate(tmrw.getDate() + 1);
        tmrw.setHours(h, m, 0, 0);
        const diff = tmrw.getTime() - now.getTime();
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setCountdown(`${hrs}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [times]);

  if (!loaded || !times || !nextPrayer) return null;

  const prayer = prayerNames[nextPrayer];
  const labels = {
    nextPrayer: { en: 'Next Prayer', ar: 'الصلاة القادمة', ur: 'اگلی نماز' },
    at: { en: 'at', ar: 'في', ur: 'بجے' },
    viewAll: { en: 'View All Times', ar: 'عرض جميع الأوقات', ur: 'تمام اوقات دیکھیں' },
  };

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <Link to="/namaz" className="block">
        <div className="bg-primary/5 border-b border-primary/10 hover:bg-primary/10 transition-colors">
          <div className="container px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{prayer.icon}</span>
              <div>
                <p className="text-xs text-muted-foreground">{labels.nextPrayer[lang]}</p>
                <p className="font-display font-bold text-foreground">
                  {prayer[lang]} <span className="text-muted-foreground font-normal text-sm">{labels.at[lang]} {times[nextPrayer as keyof PrayerTimesData]}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-end">
                <div className="font-mono text-lg sm:text-xl font-bold text-primary tabular-nums">
                  {countdown}
                </div>
                {city && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end">
                    <MapPin className="h-2.5 w-2.5" /> {city}
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
