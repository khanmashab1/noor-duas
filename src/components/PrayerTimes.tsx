import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Locate, Clock, Settings2, ChevronDown, CalendarDays, Bell, Minus, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import {
  usePrayerTimes, fetchMonthlyTimes,
  PRAYER_KEYS, PRAYER_INFO, PAKISTAN_CITIES, PrayerKey,
} from '@/hooks/usePrayerTimes';

const PrayerTimeCard = ({
  prayerKey, time, isCurrent, isNext, lang, countdown,
}: {
  prayerKey: string; time: string; isCurrent: boolean; isNext: boolean; lang: string; countdown?: string;
}) => {
  const info = PRAYER_INFO[prayerKey];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} layout>
      <Card className={`transition-all ${
        isNext ? 'ring-2 ring-primary border-primary shadow-lg scale-[1.02]' :
        isCurrent ? 'border-primary/40 bg-primary/5' :
        'border-border/50 hover:border-primary/20'
      }`}>
        <CardContent className="p-4 text-center relative">
          {isNext && (
            <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {lang === 'ur' ? 'اگلی' : lang === 'ar' ? 'القادمة' : 'Next'}
            </span>
          )}
          {isCurrent && (
            <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-widest text-accent-foreground bg-accent/20 px-2 py-0.5 rounded-full">
              {lang === 'ur' ? 'جاری' : lang === 'ar' ? 'الحالية' : 'Current'}
            </span>
          )}
          <span className="text-2xl">{info.icon}</span>
          <h3 className="font-display text-base font-bold text-foreground mt-1">{info.en}</h3>
          <p className="text-xs text-muted-foreground font-urdu">{info.ur}</p>
          <p className={`text-xl font-bold mt-2 tabular-nums ${isNext ? 'text-primary' : 'text-foreground'}`}>
            {time}
          </p>
          {isNext && countdown && (
            <p className="text-xs text-primary font-mono mt-1 tabular-nums">{countdown}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const PrayerTimes = () => {
  const { lang } = useI18n();
  const {
    settings, updateSettings, times, loading, error, detectGPS,
    currentPrayer, nextPrayer, nextPrayerTime,
  } = usePrayerTimes();

  const [countdown, setCountdown] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Jummah reminder
  const isJummah = new Date().getDay() === 5;

  // Live clock
  useEffect(() => {
    const iv = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Countdown timer
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

  // Notification permission
  const requestNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  // Load monthly timetable
  const loadMonthly = async () => {
    if (monthlyData.length > 0) { setShowMonthly(!showMonthly); return; }
    setMonthlyLoading(true);
    const now = new Date();
    const data = await fetchMonthlyTimes(
      settings.latitude, settings.longitude, settings.method, settings.school,
      now.getMonth() + 1, now.getFullYear()
    );
    setMonthlyData(data);
    setShowMonthly(true);
    setMonthlyLoading(false);
  };

  const selectCity = (cityName: string) => {
    const city = PAKISTAN_CITIES.find(c => c.name === cityName);
    if (city) {
      updateSettings({ city: city.name, latitude: city.lat, longitude: city.lng, locationSource: 'manual' });
    }
  };

  const adjustTime = (prayer: string, delta: number) => {
    const current = settings.adjustments[prayer] || 0;
    updateSettings({
      adjustments: { ...settings.adjustments, [prayer]: current + delta },
    });
  };

  const labels = {
    prayerTimes: { en: 'Prayer Times', ar: 'مواقيت الصلاة', ur: 'نماز کے اوقات' },
    settings: { en: 'Settings', ar: 'الإعدادات', ur: 'ترتیبات' },
    method: { en: 'Calculation Method', ar: 'طريقة الحساب', ur: 'حساب کا طریقہ' },
    karachi: { en: 'University of Islamic Sciences, Karachi', ar: 'جامعة العلوم الإسلامية، كراتشي', ur: 'جامعہ العلوم الاسلامیہ، کراچی' },
    ummAlQura: { en: 'Umm al-Qura, Makkah', ar: 'أم القرى، مكة', ur: 'ام القریٰ، مکہ' },
    asrMethod: { en: 'Asr Calculation', ar: 'حساب العصر', ur: 'عصر کا حساب' },
    hanafi: { en: 'Hanafi', ar: 'حنفي', ur: 'حنفی' },
    shafi: { en: 'Standard (Shafi)', ar: 'شافعي', ur: 'شافعی' },
    city: { en: 'City', ar: 'المدينة', ur: 'شہر' },
    detectGPS: { en: 'Detect via GPS', ar: 'تحديد عبر GPS', ur: 'GPS سے تلاش کریں' },
    adjustments: { en: 'Time Adjustments (± min)', ar: 'تعديل الوقت (± دقيقة)', ur: 'وقت کی ایڈجسٹمنٹ (± منٹ)' },
    monthly: { en: 'Monthly Timetable', ar: 'الجدول الشهري', ur: 'ماہانہ ٹائم ٹیبل' },
    jummah: { en: '🕌 Jummah Mubarak! Don\'t forget Jummah prayer today.', ar: '🕌 جمعة مباركة! لا تنسَ صلاة الجمعة اليوم.', ur: '🕌 جمعہ مبارک! آج جمعہ کی نماز مت بھولیں۔' },
    notifications: { en: 'Enable Notifications', ar: 'تفعيل الإشعارات', ur: 'نوٹیفکیشنز آن کریں' },
    date: { en: 'Date', ar: 'التاريخ', ur: 'تاریخ' },
  };

  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <section className="container px-4 sm:px-6 py-8 sm:py-12">
      {/* Jummah Reminder */}
      {isJummah && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
          <p className="font-display font-bold text-foreground">{labels.jummah[lang]}</p>
        </motion.div>
      )}

      {/* Header with clock */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {labels.prayerTimes[lang]}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{settings.city}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm font-mono text-primary tabular-nums">{timeStr}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={detectGPS} disabled={loading} className="gap-1.5">
            <Locate className="h-4 w-4" />
            <span className="hidden sm:inline">GPS</span>
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowSettings(!showSettings)} className="gap-1.5">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">{labels.settings[lang]}</span>
          </Button>
          <Button size="sm" variant="outline" onClick={loadMonthly} disabled={monthlyLoading} className="gap-1.5">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">{labels.monthly[lang]}</span>
          </Button>
          {'Notification' in window && Notification.permission !== 'granted' && (
            <Button size="sm" variant="outline" onClick={requestNotification} className="gap-1.5">
              <Bell className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Next prayer countdown banner */}
      {times && nextPrayer && countdown && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{PRAYER_INFO[nextPrayer]?.icon}</span>
            <div>
              <p className="text-xs text-muted-foreground">{lang === 'ur' ? 'اگلی نماز' : 'Next Prayer'}</p>
              <p className="font-display font-bold text-lg text-foreground">
                {PRAYER_INFO[nextPrayer]?.en}
                <span className="text-muted-foreground font-normal text-sm ml-2">
                  {times[nextPrayer as PrayerKey]}
                </span>
              </p>
            </div>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-primary tabular-nums">
            {countdown}
          </div>
        </motion.div>
      )}

      {error && (
        <div className="text-sm text-destructive mb-4 p-3 rounded-lg bg-destructive/10">{error}</div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <Card className="border-border/50">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-primary" />
                  {labels.settings[lang]}
                </h3>

                {/* City Selection */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">{labels.city[lang]}</label>
                  <Select value={settings.city} onValueChange={selectCity}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {PAKISTAN_CITIES.map(c => (
                        <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Calculation Method */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">{labels.method[lang]}</label>
                    <Select value={String(settings.method)} onValueChange={(v) => updateSettings({ method: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">{labels.karachi[lang]}</SelectItem>
                        <SelectItem value="4">{labels.ummAlQura[lang]}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Asr Method */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">{labels.asrMethod[lang]}</label>
                    <Select value={String(settings.school)} onValueChange={(v) => updateSettings({ school: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">{labels.hanafi[lang]}</SelectItem>
                        <SelectItem value="0">{labels.shafi[lang]}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Time Adjustments */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">{labels.adjustments[lang]}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRAYER_KEYS.map(key => (
                      <div key={key} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
                        <span className="text-xs font-medium text-foreground">{PRAYER_INFO[key].en}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => adjustTime(key, -1)} className="h-6 w-6 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-mono w-6 text-center tabular-nums">
                            {settings.adjustments[key] > 0 ? '+' : ''}{settings.adjustments[key] || 0}
                          </span>
                          <button onClick={() => adjustTime(key, 1)} className="h-6 w-6 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prayer Time Cards */}
      {times && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PRAYER_KEYS.map((key) => (
            <PrayerTimeCard
              key={key}
              prayerKey={key}
              time={times[key]}
              isCurrent={key === currentPrayer}
              isNext={key === nextPrayer}
              lang={lang}
              countdown={key === nextPrayer ? countdown : undefined}
            />
          ))}
        </div>
      )}

      {loading && !times && (
        <div className="text-center py-12 text-muted-foreground">
          {lang === 'ur' ? 'نماز اوقات لوڈ ہو رہے ہیں...' : 'Loading prayer times...'}
        </div>
      )}

      {/* Monthly Timetable */}
      <AnimatePresence>
        {showMonthly && monthlyData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-6"
          >
            <Card className="border-border/50">
              <CardContent className="p-4 overflow-x-auto">
                <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {labels.monthly[lang]} — {settings.city}
                </h3>
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-2 text-left text-xs font-semibold text-muted-foreground">{labels.date[lang]}</th>
                      {PRAYER_KEYS.map(k => (
                        <th key={k} className="py-2 px-2 text-center text-xs font-semibold text-muted-foreground">
                          {PRAYER_INFO[k].en}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((day, i) => (
                      <tr key={i} className={`border-b border-border/30 ${i === new Date().getDate() - 1 ? 'bg-primary/5 font-semibold' : ''}`}>
                        <td className="py-2 px-2 text-xs text-foreground">{day.date}</td>
                        {PRAYER_KEYS.map(k => (
                          <td key={k} className="py-2 px-2 text-center text-xs tabular-nums text-foreground">{day[k]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
