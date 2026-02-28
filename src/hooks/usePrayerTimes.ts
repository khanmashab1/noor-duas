import { useState, useEffect, useCallback, useMemo } from 'react';

export interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface PrayerSettings {
  method: number; // 1 = Karachi, 4 = Umm al-Qura
  school: number; // 0 = Shafi, 1 = Hanafi
  city: string;
  latitude: number;
  longitude: number;
  adjustments: Record<string, number>; // per-prayer ± minutes
  locationSource: 'gps' | 'manual';
}

export const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
export type PrayerKey = typeof PRAYER_KEYS[number];

export const PRAYER_INFO: Record<string, { en: string; ar: string; ur: string; icon: string }> = {
  Fajr: { en: 'Fajr', ar: 'الفجر', ur: 'فجر', icon: '🌅' },
  Sunrise: { en: 'Sunrise', ar: 'الشروق', ur: 'طلوع آفتاب', icon: '☀️' },
  Dhuhr: { en: 'Dhuhr', ar: 'الظهر', ur: 'ظہر', icon: '🌤️' },
  Asr: { en: 'Asr', ar: 'العصر', ur: 'عصر', icon: '⛅' },
  Maghrib: { en: 'Maghrib', ar: 'المغرب', ur: 'مغرب', icon: '🌇' },
  Isha: { en: 'Isha', ar: 'العشاء', ur: 'عشاء', icon: '🌙' },
};

export const PAKISTAN_CITIES = [
  { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
  { name: 'Lahore', lat: 31.5204, lng: 74.3587 },
  { name: 'Islamabad', lat: 33.6844, lng: 73.0479 },
  { name: 'Rawalpindi', lat: 33.5651, lng: 73.0169 },
  { name: 'Faisalabad', lat: 31.4187, lng: 73.0791 },
  { name: 'Multan', lat: 30.1575, lng: 71.5249 },
  { name: 'Peshawar', lat: 34.0151, lng: 71.5249 },
  { name: 'Quetta', lat: 30.1798, lng: 66.9750 },
  { name: 'Sialkot', lat: 32.4945, lng: 74.5229 },
  { name: 'Gujranwala', lat: 32.1877, lng: 74.1945 },
  { name: 'Hyderabad', lat: 25.3960, lng: 68.3578 },
  { name: 'Bahawalpur', lat: 29.3956, lng: 71.6836 },
  { name: 'Sargodha', lat: 32.0836, lng: 72.6711 },
  { name: 'Sukkur', lat: 27.7052, lng: 68.8574 },
  { name: 'Larkana', lat: 27.5600, lng: 68.2264 },
  { name: 'Mardan', lat: 34.1986, lng: 72.0404 },
  { name: 'Abbottabad', lat: 34.1463, lng: 73.2117 },
  { name: 'Muzaffarabad', lat: 34.3700, lng: 73.4711 },
  { name: 'Gilgit', lat: 35.9208, lng: 74.3144 },
  { name: 'Dera Ismail Khan', lat: 31.8320, lng: 70.9016 },
  { name: 'Nawabshah', lat: 26.2483, lng: 68.4100 },
  { name: 'Mirpur', lat: 33.1500, lng: 73.7500 },
  { name: 'Jhelum', lat: 32.9425, lng: 73.7257 },
  { name: 'Rahim Yar Khan', lat: 28.4202, lng: 70.2952 },
  { name: 'Swat', lat: 35.2227, lng: 72.3526 },
  { name: 'Chiniot', lat: 31.7167, lng: 72.9833 },
  { name: 'Okara', lat: 30.8138, lng: 73.4534 },
  { name: 'Sahiwal', lat: 30.6682, lng: 73.1114 },
  { name: 'Kasur', lat: 31.1167, lng: 74.4500 },
  { name: 'Gujrat', lat: 32.5839, lng: 74.0862 },
];

const DEFAULT_SETTINGS: PrayerSettings = {
  method: 1, // Karachi
  school: 1, // Hanafi
  city: 'Islamabad',
  latitude: 33.6844,
  longitude: 73.0479,
  adjustments: { Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 },
  locationSource: 'manual',
};

const STORAGE_KEY = 'noor-prayer-settings';

export function loadSettings(): PrayerSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: PrayerSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function applyAdjustment(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m + minutes, 0, 0);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function usePrayerTimes() {
  const [settings, setSettingsState] = useState<PrayerSettings>(loadSettings);
  const [times, setTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateSettings = useCallback((partial: Partial<PrayerSettings>) => {
    setSettingsState(prev => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const fetchTimes = useCallback(async (lat: number, lng: number, method: number, school: number) => {
    setLoading(true);
    setError('');
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`
      );
      const data = await res.json();
      if (data.code === 200) {
        const t = data.data.timings;
        const strip = (v: string) => v?.split(' ')[0] || v;
        setTimes({ Fajr: strip(t.Fajr), Sunrise: strip(t.Sunrise), Dhuhr: strip(t.Dhuhr), Asr: strip(t.Asr), Maghrib: strip(t.Maghrib), Isha: strip(t.Isha) });
      } else {
        setError('Could not fetch prayer times');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch whenever settings change
  useEffect(() => {
    fetchTimes(settings.latitude, settings.longitude, settings.method, settings.school);
  }, [settings.latitude, settings.longitude, settings.method, settings.school, fetchTimes]);

  // Apply adjustments
  const adjustedTimes = useMemo(() => {
    if (!times) return null;
    const result: PrayerTimesData = { ...times };
    for (const key of PRAYER_KEYS) {
      const adj = settings.adjustments[key] || 0;
      if (adj !== 0) {
        result[key] = applyAdjustment(result[key], adj);
      }
    }
    return result;
  }, [times, settings.adjustments]);

  const detectGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setError('GPS not supported');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let cityName = 'Your Location';
        try {
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const geo = await geoRes.json();
          cityName = geo.city || geo.locality || 'Your Location';
        } catch { /* ignore */ }
        updateSettings({ latitude, longitude, city: cityName, locationSource: 'gps' });
      },
      () => { setLoading(false); setError('Location permission denied'); }
    );
  }, [updateSettings]);

  // Current & next prayer calculation
  const { currentPrayer, nextPrayer, nextPrayerTime } = useMemo(() => {
    if (!adjustedTimes) return { currentPrayer: '', nextPrayer: '', nextPrayerTime: null as Date | null };
    const now = new Date();
    const prayerOnly = PRAYER_KEYS.filter(k => k !== 'Sunrise');
    let current = '';
    let next = '';
    let nextTime: Date | null = null;

    for (let i = 0; i < prayerOnly.length; i++) {
      const key = prayerOnly[i];
      const [h, m] = adjustedTimes[key].split(':').map(Number);
      const pt = new Date(); pt.setHours(h, m, 0, 0);
      if (pt > now) {
        next = key;
        nextTime = pt;
        current = i > 0 ? prayerOnly[i - 1] : 'Isha';
        break;
      }
    }
    if (!next) {
      current = 'Isha';
      next = 'Fajr';
      const [h, m] = adjustedTimes.Fajr.split(':').map(Number);
      const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1); tmrw.setHours(h, m, 0, 0);
      nextTime = tmrw;
    }
    return { currentPrayer: current, nextPrayer: next, nextPrayerTime: nextTime };
  }, [adjustedTimes]);

  return {
    settings, updateSettings, times: adjustedTimes, loading, error, detectGPS,
    currentPrayer, nextPrayer, nextPrayerTime,
  };
}

export async function fetchMonthlyTimes(lat: number, lng: number, method: number, school: number, month: number, year: number) {
  const res = await fetch(
    `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`
  );
  const data = await res.json();
  if (data.code === 200) {
    return data.data.map((day: any) => ({
      date: day.date.readable,
      Fajr: day.timings.Fajr?.split(' ')[0],
      Sunrise: day.timings.Sunrise?.split(' ')[0],
      Dhuhr: day.timings.Dhuhr?.split(' ')[0],
      Asr: day.timings.Asr?.split(' ')[0],
      Maghrib: day.timings.Maghrib?.split(' ')[0],
      Isha: day.timings.Isha?.split(' ')[0],
    }));
  }
  return [];
}
