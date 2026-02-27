import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Locate, Clock, Settings2, ChevronDown, CalendarDays, Bell, BellOff, BellRing, Minus, Plus, Download, Volume2, VolumeX } from 'lucide-react';

function to12Hr(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
}
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import {
  usePrayerTimes, fetchMonthlyTimes,
  PRAYER_KEYS, PRAYER_INFO, PAKISTAN_CITIES, PrayerKey,
} from '@/hooks/usePrayerTimes';
import { usePrayerNotifications, REMINDER_OPTIONS, ReminderMinutes } from '@/hooks/usePrayerNotifications';
import { Switch } from '@/components/ui/switch';

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
            {to12Hr(time)}
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
  const { notificationsEnabled, toggleNotifications, notifSettings, updatePrayerNotif, adhanEnabled, toggleAdhan } = usePrayerNotifications(times);

  const [countdown, setCountdown] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const monthlyRef = useRef<HTMLDivElement>(null);
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

  // Notification is now handled by usePrayerNotifications hook

  // Load monthly timetable
  const loadMonthly = async () => {
    if (monthlyData.length > 0) { setShowMonthly(!showMonthly); return; }
    setMonthlyLoading(true);
    const now = new Date();
    const todayDate = now.getDate();
    // Fetch current month
    const currentMonth = await fetchMonthlyTimes(
      settings.latitude, settings.longitude, settings.method, settings.school,
      now.getMonth() + 1, now.getFullYear()
    );
    // Fetch next month
    const nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonth = await fetchMonthlyTimes(
      settings.latitude, settings.longitude, settings.method, settings.school,
      nextDate.getMonth() + 1, nextDate.getFullYear()
    );
    // Slice from today, take 30 days
    const combined = [...currentMonth.slice(todayDate - 1), ...nextMonth].slice(0, 30);
    setMonthlyData(combined);
    setShowMonthly(true);
    setMonthlyLoading(false);
    setTimeout(() => monthlyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  };

  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default || autoTableModule.autoTable;
      const doc = new jsPDF({ orientation: 'landscape' });
      const w = doc.internal.pageSize.getWidth();
      const h = doc.internal.pageSize.getHeight();
      const now = new Date();
      const monthName = now.toLocaleString('en', { month: 'long', year: 'numeric' });

      // Colors
      const green: [number, number, number] = [34, 120, 74];
      const darkGreen: [number, number, number] = [20, 80, 50];
      const gold: [number, number, number] = [184, 148, 68];
      const lightGreen: [number, number, number] = [240, 248, 243];

      // Header banner
      doc.setFillColor(...green);
      doc.rect(0, 0, w, 42, 'F');
      doc.setFillColor(...gold);
      doc.rect(0, 42, w, 2, 'F');

      // Decorative corner lines
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.5);
      doc.line(10, 6, 30, 6); doc.line(10, 6, 10, 16);
      doc.line(w - 10, 6, w - 30, 6); doc.line(w - 10, 6, w - 10, 16);

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('Prayer Timetable', w / 2, 16, { align: 'center' });
      doc.setFontSize(14);
      doc.text('\u2726 Noor Duas \u2726', w / 2, 25, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`${settings.city} \u2022 ${monthName} \u2022 ${settings.method === 1 ? 'Karachi Method' : 'Umm al-Qura'} \u2022 ${settings.school === 1 ? 'Hanafi' : 'Shafi'}`, w / 2, 34, { align: 'center' });

      // Quran quote
      doc.setTextColor(...darkGreen);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('"Indeed, prayer has been decreed upon the believers at specified times." \u2014 Quran 4:103', w / 2, 52, { align: 'center' });
      doc.setFont('helvetica', 'normal');

      // Table
      autoTable(doc, {
        startY: 58,
        head: [['Date', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']],
        body: monthlyData.map(day => [day.date, to12Hr(day.Fajr), to12Hr(day.Sunrise), to12Hr(day.Dhuhr), to12Hr(day.Asr), to12Hr(day.Maghrib), to12Hr(day.Isha)]),
        styles: { fontSize: 8.5, cellPadding: 3, textColor: [40, 40, 40] },
        headStyles: { fillColor: green, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, halign: 'center' },
        alternateRowStyles: { fillColor: lightGreen },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' },
          4: { halign: 'center' }, 5: { halign: 'center' }, 6: { halign: 'center' },
        },
        margin: { left: 14, right: 14 },
      });

      const finalY = (doc as any).lastAutoTable?.finalY || h - 50;
      const footerY = Math.min(finalY + 10, h - 30);

      doc.setFillColor(...gold);
      doc.rect(14, footerY, w - 28, 0.8, 'F');

      doc.setTextColor(...darkGreen);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Essential Daily Duas', 14, footerY + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);

      const duas = [
        'Before eating: Bismillah (In the name of Allah)',
        'After eating: Alhamdulillahil-ladhi at\'amana wa saqana wa ja\'alana Muslimin',
        'Entering home: Allahumma inni as\'aluka khairal-mawliji wa khairal-makhraji',
        'Before sleeping: Bismika Allahumma amutu wa ahya',
      ];
      duas.forEach((dua, i) => {
        doc.text(`\u2726 ${dua}`, 14, footerY + 14 + (i * 5));
      });

      doc.setTextColor(...darkGreen);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('"The first matter that the slave will be brought to account for', w - 14, footerY + 14, { align: 'right' });
      doc.text('on the Day of Judgment is the prayer." \u2014 Tirmidhi', w - 14, footerY + 19, { align: 'right' });

      doc.setFillColor(...green);
      doc.rect(0, h - 8, w, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Generated by Noor Duas', w / 2, h - 3, { align: 'center' });

      doc.save(`prayer-times-${settings.city}-${now.getMonth() + 1}-${now.getFullYear()}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setPdfLoading(false);
    }
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
        {'Notification' in window && (
            <>
              <Button size="sm" variant={notificationsEnabled ? 'default' : 'outline'} onClick={notificationsEnabled ? () => setShowNotifSettings(!showNotifSettings) : toggleNotifications} className="gap-1.5">
                {notificationsEnabled ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                <span className="hidden sm:inline">{notificationsEnabled ? (lang === 'ur' ? 'ترتیبات' : 'Alerts') : (lang === 'ur' ? 'نوٹیفکیشن' : 'Notify')}</span>
              </Button>
              {notificationsEnabled && (
                <Button size="sm" variant="ghost" onClick={toggleNotifications} className="gap-1 text-destructive hover:text-destructive">
                  <BellOff className="h-4 w-4" />
                </Button>
              )}
            </>
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
                  {to12Hr(times[nextPrayer as PrayerKey])}
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

      {/* Notification Settings Panel */}
      <AnimatePresence>
        {showNotifSettings && notificationsEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <Card className="border-border/50">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-primary" />
                  {lang === 'ur' ? 'نوٹیفکیشن کی ترتیبات' : lang === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {lang === 'ur' ? 'ہر نماز کے لیے الرٹ اور یاددہانی کا وقت منتخب کریں' : 'Toggle alerts and set reminder time for each prayer'}
                </p>

                {/* Adhan Toggle */}
                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔊</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {lang === 'ur' ? 'اذان کی آواز' : lang === 'ar' ? 'صوت الأذان' : 'Adhan Sound'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lang === 'ur' ? 'نماز کے وقت اذان بجائیں' : 'Play adhan audio at prayer time'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { const a = new Audio('/audio/adhan.mp3'); a.volume = 0.5; a.play().catch(() => {}); setTimeout(() => { a.pause(); a.currentTime = 0; }, 8000); }}>
                      {adhanEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                    <Switch
                      checked={adhanEnabled}
                      onCheckedChange={toggleAdhan}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {PRAYER_KEYS.filter(k => k !== 'Sunrise').map(key => {
                    const info = PRAYER_INFO[key];
                    const ps = notifSettings[key];
                    return (
                      <div key={key} className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{info.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{info.en}</p>
                            <p className="text-xs text-muted-foreground font-urdu">{info.ur}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Select
                            value={String(ps?.reminderMinutes ?? 5)}
                            onValueChange={(v) => updatePrayerNotif(key, { reminderMinutes: Number(v) as ReminderMinutes })}
                            disabled={!ps?.enabled}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {REMINDER_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={String(opt.value)}>
                                  {lang === 'ur' ? opt.label.ur : opt.label.en}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Switch
                            checked={ps?.enabled ?? true}
                            onCheckedChange={(checked) => updatePrayerNotif(key, { enabled: checked })}
                          />
                        </div>
                      </div>
                    );
                  })}
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
            ref={monthlyRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-6"
          >
            <Card className="border-border/50">
              <CardContent className="p-4 overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {labels.monthly[lang]} — {settings.city}
                  </h3>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => downloadPDF()} disabled={pdfLoading}>
                    {pdfLoading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {pdfLoading ? (lang === 'ur' ? 'بن رہا ہے...' : 'Generating...') : 'PDF'}
                  </Button>
                </div>
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
                      <tr key={i} className={`border-b border-border/30 ${i === 0 ? 'bg-primary/10 font-semibold ring-1 ring-primary/30' : ''}`}>
                        <td className="py-2 px-2 text-xs text-foreground">{day.date}</td>
                        {PRAYER_KEYS.map(k => (
                          <td key={k} className="py-2 px-2 text-center text-xs tabular-nums text-foreground">{to12Hr(day[k])}</td>
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
