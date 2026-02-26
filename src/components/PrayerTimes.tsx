import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, RefreshCw, Search, Locate, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';

interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface LocationInfo {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

const prayerNames: Record<string, { en: string; ar: string; ur: string; icon: string }> = {
  Fajr: { en: 'Fajr', ar: 'الفجر', ur: 'فجر', icon: '🌅' },
  Sunrise: { en: 'Sunrise', ar: 'الشروق', ur: 'طلوع آفتاب', icon: '☀️' },
  Dhuhr: { en: 'Dhuhr', ar: 'الظهر', ur: 'ظہر', icon: '🌤️' },
  Asr: { en: 'Asr', ar: 'العصر', ur: 'عصر', icon: '⛅' },
  Maghrib: { en: 'Maghrib', ar: 'المغرب', ur: 'مغرب', icon: '🌇' },
  Isha: { en: 'Isha', ar: 'العشاء', ur: 'عشاء', icon: '🌙' },
};

const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export const PrayerTimes = () => {
  const { lang } = useI18n();
  const [times, setTimes] = useState<PrayerTimesData | null>(null);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [nextPrayer, setNextPrayer] = useState('');

  const fetchByCoords = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError('');
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
        setTimes({ Fajr: t.Fajr, Sunrise: t.Sunrise, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha });

        // Reverse geocode for city name
        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          );
          const geo = await geoRes.json();
          setLocation({
            city: geo.city || geo.locality || 'Unknown',
            country: geo.countryName || '',
            latitude: lat,
            longitude: lng,
          });
        } catch {
          setLocation({ city: 'Your Location', country: '', latitude: lat, longitude: lng });
        }
      } else {
        setError(lang === 'ur' ? 'نماز اوقات حاصل نہیں ہو سکے' : 'Could not fetch prayer times');
      }
    } catch {
      setError(lang === 'ur' ? 'نیٹ ورک خرابی' : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [lang]);

  const fetchByCity = useCallback(async (city: string) => {
    setLoading(true);
    setError('');
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();

      const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity/${dd}-${mm}-${yyyy}?city=${encodeURIComponent(city)}&country=&method=2`
      );
      const data = await res.json();
      if (data.code === 200) {
        const t = data.data.timings;
        setTimes({ Fajr: t.Fajr, Sunrise: t.Sunrise, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha });
        setLocation({
          city: data.data.meta?.timezone?.split('/')?.pop()?.replace(/_/g, ' ') || city,
          country: '',
          latitude: data.data.meta?.latitude || 0,
          longitude: data.data.meta?.longitude || 0,
        });
      } else {
        setError(lang === 'ur' ? 'شہر نہیں ملا' : 'City not found');
      }
    } catch {
      setError(lang === 'ur' ? 'نیٹ ورک خرابی' : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [lang]);

  const detectGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setError(lang === 'ur' ? 'آپ کا براؤزر GPS سپورٹ نہیں کرتا' : 'GPS not supported');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        setLoading(false);
        setError(lang === 'ur' ? 'مقام کی اجازت نہیں دی گئی' : 'Location permission denied');
      }
    );
  }, [lang, fetchByCoords]);

  // Calculate next prayer
  useEffect(() => {
    if (!times) return;
    const now = new Date();
    for (const key of PRAYER_KEYS) {
      if (key === 'Sunrise') continue;
      const [h, m] = times[key].split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(h, m, 0, 0);
      if (prayerTime > now) {
        setNextPrayer(key);
        return;
      }
    }
    setNextPrayer('Fajr'); // tomorrow's Fajr
  }, [times]);

  // Auto-detect on mount
  useEffect(() => {
    const savedCity = localStorage.getItem('noor-prayer-city');
    if (savedCity) {
      fetchByCity(savedCity);
    } else {
      detectGPS();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 1) {
      localStorage.setItem('noor-prayer-city', searchQuery.trim());
      fetchByCity(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const handleGPS = () => {
    localStorage.removeItem('noor-prayer-city');
    detectGPS();
  };

  const labels = {
    title: { en: 'Prayer Times', ar: 'مواقيت الصلاة', ur: 'نماز کے اوقات' },
    searchPlaceholder: { en: 'Search city...', ar: 'ابحث عن مدينة...', ur: 'شہر تلاش کریں...' },
    detectLocation: { en: 'Detect', ar: 'تحديد', ur: 'تلاش' },
    next: { en: 'Next', ar: 'القادمة', ur: 'اگلی' },
  };

  return (
    <section className="container px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          {labels.title[lang]}
        </h2>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
              <Input
                placeholder={labels.searchPlaceholder[lang]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rtl:pr-9 rtl:pl-3 h-9 text-sm"
              />
            </div>
            <Button type="submit" size="sm" variant="outline" disabled={loading || searchQuery.trim().length < 2}>
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <Button size="sm" variant="outline" onClick={handleGPS} disabled={loading} title={labels.detectLocation[lang]}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Location display */}
      {location && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
          <MapPin className="h-3.5 w-3.5" />
          <span>{location.city}{location.country ? `, ${location.country}` : ''}</span>
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive mb-4 p-3 rounded-lg bg-destructive/10">{error}</div>
      )}

      {/* Prayer times grid */}
      {times && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PRAYER_KEYS.map((key, i) => {
            const isNext = key === nextPrayer;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className={`transition-all ${isNext ? 'ring-2 ring-primary border-primary shadow-lg' : 'border-border/50 hover:border-primary/30'}`}>
                  <CardContent className="p-4 text-center">
                    <span className="text-xl">{prayerNames[key].icon}</span>
                    <h3 className="font-display text-sm font-bold text-foreground mt-1">
                      {prayerNames[key][lang]}
                    </h3>
                    <p className="text-lg font-bold text-primary mt-1">{times[key]}</p>
                    {isNext && (
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {labels.next[lang]}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {!times && !loading && !error && (
        <p className="text-sm text-muted-foreground text-center py-8">
          {lang === 'ur' ? 'نماز اوقات لوڈ ہو رہے ہیں...' : 'Loading prayer times...'}
        </p>
      )}
    </section>
  );
};
