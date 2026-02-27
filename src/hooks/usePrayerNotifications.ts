import { useEffect, useCallback, useState } from 'react';
import { PrayerTimesData, PRAYER_INFO, PrayerKey, PRAYER_KEYS } from './usePrayerTimes';

const NOTIF_STORAGE_KEY = 'noor-prayer-notifications';
const NOTIF_SETTINGS_KEY = 'noor-prayer-notif-settings';
const NOTIFIED_KEY = 'noor-notified-today';

export type ReminderMinutes = 0 | 5 | 10 | 15 | 20 | 30;
export const REMINDER_OPTIONS: { value: ReminderMinutes; label: { en: string; ur: string } }[] = [
  { value: 0, label: { en: 'At prayer time', ur: 'نماز کے وقت' } },
  { value: 5, label: { en: '5 min before', ur: '5 منٹ پہلے' } },
  { value: 10, label: { en: '10 min before', ur: '10 منٹ پہلے' } },
  { value: 15, label: { en: '15 min before', ur: '15 منٹ پہلے' } },
  { value: 20, label: { en: '20 min before', ur: '20 منٹ پہلے' } },
  { value: 30, label: { en: '30 min before', ur: '30 منٹ پہلے' } },
];

export interface NotifPrayerSettings {
  enabled: boolean;
  reminderMinutes: ReminderMinutes;
}

export type NotifSettings = Record<string, NotifPrayerSettings>;

const DEFAULT_SETTINGS: NotifSettings = Object.fromEntries(
  PRAYER_KEYS.filter(k => k !== 'Sunrise').map(k => [k, { enabled: true, reminderMinutes: 5 as ReminderMinutes }])
);

function loadSettings(): NotifSettings {
  try {
    const stored = localStorage.getItem(NOTIF_SETTINGS_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_SETTINGS;
}

const ADHAN_STORAGE_KEY = 'noor-adhan-enabled';

function playAdhan() {
  try {
    const audio = new Audio('/audio/adhan.mp3');
    audio.volume = 0.7;
    audio.play().catch(() => {});
  } catch {}
}

export function usePrayerNotifications(times: PrayerTimesData | null) {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(NOTIF_STORAGE_KEY) === 'true';
    } catch { return false; }
  });

  const [adhanEnabled, setAdhanEnabled] = useState(() => {
    try {
      return localStorage.getItem(ADHAN_STORAGE_KEY) !== 'false'; // default true
    } catch { return true; }
  });

  const [notifSettings, setNotifSettings] = useState<NotifSettings>(loadSettings);

  const toggleNotifications = useCallback(async () => {
    if (!enabled) {
      if (!('Notification' in window)) return;
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setEnabled(true);
        localStorage.setItem(NOTIF_STORAGE_KEY, 'true');
      }
    } else {
      setEnabled(false);
      localStorage.setItem(NOTIF_STORAGE_KEY, 'false');
    }
  }, [enabled]);

  const toggleAdhan = useCallback(() => {
    setAdhanEnabled(prev => {
      const next = !prev;
      localStorage.setItem(ADHAN_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const updatePrayerNotif = useCallback((prayer: string, updates: Partial<NotifPrayerSettings>) => {
    setNotifSettings(prev => {
      const next = { ...prev, [prayer]: { ...prev[prayer], ...updates } };
      localStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if (!enabled || !times || !('Notification' in window) || Notification.permission !== 'granted') return;

    const getNotifiedSet = (): Set<string> => {
      try {
        const today = new Date().toDateString();
        const stored = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '{}');
        if (stored.date !== today) return new Set();
        return new Set(stored.prayers || []);
      } catch { return new Set(); }
    };

    const saveNotified = (set: Set<string>) => {
      localStorage.setItem(NOTIFIED_KEY, JSON.stringify({
        date: new Date().toDateString(),
        prayers: Array.from(set),
      }));
    };

    const checkAndNotify = () => {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const notified = getNotifiedSet();

      const prayerOnly = PRAYER_KEYS.filter(k => k !== 'Sunrise');

      for (const key of prayerOnly) {
        const prayerSettings = notifSettings[key];
        if (!prayerSettings?.enabled) continue;

        const [h, m] = times[key].split(':').map(Number);
        const prayerMinutes = h * 60 + m;
        const info = PRAYER_INFO[key];

        // Notify at prayer time
        const atTimeKey = `${key}-at`;
        if (!notified.has(atTimeKey) && nowMinutes >= prayerMinutes && nowMinutes <= prayerMinutes + 1) {
          new Notification(`🕌 ${info.en} - ${info.ur}`, {
            body: `It's time for ${info.en} prayer (${info.ur} کا وقت ہو گیا ہے)`,
            icon: '/favicon.png',
            tag: `prayer-${key}`,
          });
          if (adhanEnabled) playAdhan();
          notified.add(atTimeKey);
          saveNotified(notified);
        }

        // Notify at custom reminder time
        const reminder = prayerSettings.reminderMinutes;
        if (reminder > 0) {
          const preKey = `${key}-pre-${reminder}`;
          const reminderTime = prayerMinutes - reminder;
          if (!notified.has(preKey) && nowMinutes >= reminderTime && nowMinutes <= reminderTime + 1) {
            new Notification(`⏰ ${info.en} in ${reminder} minutes`, {
              body: `${info.ur} کی نماز میں ${reminder} منٹ باقی ہیں`,
              icon: '/favicon.png',
              tag: `prayer-pre-${key}`,
            });
            notified.add(preKey);
            saveNotified(notified);
          }
        }
      }
    };

    checkAndNotify();
    const interval = setInterval(checkAndNotify, 30000);
    return () => clearInterval(interval);
  }, [enabled, times, notifSettings, adhanEnabled]);

  return { notificationsEnabled: enabled, toggleNotifications, notifSettings, updatePrayerNotif, adhanEnabled, toggleAdhan };
}
