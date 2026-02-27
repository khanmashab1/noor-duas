import { useEffect, useCallback, useState } from 'react';
import { PrayerTimesData, PRAYER_INFO, PrayerKey, PRAYER_KEYS } from './usePrayerTimes';

const NOTIF_STORAGE_KEY = 'noor-prayer-notifications';
const NOTIFIED_KEY = 'noor-notified-today';

export function usePrayerNotifications(times: PrayerTimesData | null) {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(NOTIF_STORAGE_KEY) === 'true';
    } catch { return false; }
  });

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
        if (notified.has(key)) continue;
        const [h, m] = times[key].split(':').map(Number);
        const prayerMinutes = h * 60 + m;

        // Notify if within 1 minute window of prayer time
        if (nowMinutes >= prayerMinutes && nowMinutes <= prayerMinutes + 1) {
          const info = PRAYER_INFO[key];
          new Notification(`🕌 ${info.en} - ${info.ur}`, {
            body: `It's time for ${info.en} prayer (${info.ur} کا وقت ہو گیا ہے)`,
            icon: '/favicon.png',
            tag: `prayer-${key}`,
          });
          notified.add(key);
          saveNotified(notified);
        }

        // Also notify 5 minutes before
        const preKey = `${key}-pre`;
        if (!notified.has(preKey) && nowMinutes === prayerMinutes - 5) {
          const info = PRAYER_INFO[key];
          new Notification(`⏰ ${info.en} in 5 minutes`, {
            body: `${info.ur} کی نماز میں 5 منٹ باقی ہیں`,
            icon: '/favicon.png',
            tag: `prayer-pre-${key}`,
          });
          notified.add(preKey);
          saveNotified(notified);
        }
      }
    };

    checkAndNotify();
    const interval = setInterval(checkAndNotify, 30000); // check every 30s
    return () => clearInterval(interval);
  }, [enabled, times]);

  return { notificationsEnabled: enabled, toggleNotifications };
}
