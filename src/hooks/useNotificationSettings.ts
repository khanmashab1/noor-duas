import { useState, useCallback } from 'react';

export interface NotificationPreferences {
  hadithToast: boolean;
  duaToast: boolean;
  hadithPush: boolean;
  duaPush: boolean;
}

const STORAGE_KEY = 'noor-notification-prefs';

const DEFAULT_PREFS: NotificationPreferences = {
  hadithToast: true,
  duaToast: true,
  hadithPush: true,
  duaPush: true,
};

export function loadNotificationPrefs(): NotificationPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return DEFAULT_PREFS;
}

export function saveNotificationPrefs(prefs: NotificationPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function useNotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(loadNotificationPrefs);

  const updatePref = useCallback((key: keyof NotificationPreferences, value: boolean) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: value };
      saveNotificationPrefs(next);
      return next;
    });
  }, []);

  return { prefs, updatePref };
}
