import { useEffect, useCallback } from 'react';
import { useRandomHadith } from '@/hooks/useHadiths';
import { useAllDuas } from '@/hooks/useDuas';
import { toast } from '@/hooks/use-toast';

const TOAST_SHOWN_KEY = 'noor-daily-toast-shown';
const PUSH_PERMISSION_KEY = 'noor-push-permission-asked';

function getDailyDua(allDuas: any[] | undefined) {
  if (!allDuas?.length) return null;
  const idx = Math.floor(new Date().getDate() % allDuas.length);
  return allDuas[idx];
}

function truncate(text: string, max = 120): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '…';
}

export function useDailyNotifications() {
  const { data: dailyHadith } = useRandomHadith();
  const { data: allDuas } = useAllDuas();

  // In-app toast notifications
  useEffect(() => {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem(TOAST_SHOWN_KEY);
    if (lastShown === today) return;
    if (!dailyHadith && !allDuas?.length) return;

    localStorage.setItem(TOAST_SHOWN_KEY, today);

    const dailyDua = getDailyDua(allDuas);

    // Show Hadith toast
    if (dailyHadith) {
      setTimeout(() => {
        toast({
          title: '📖 Hadith of the Day',
          description: truncate(
            dailyHadith.english_translation || dailyHadith.urdu_translation || dailyHadith.arabic_text
          ),
          duration: 8000,
        });
      }, 1500);
    }

    // Show Dua toast
    if (dailyDua) {
      setTimeout(() => {
        toast({
          title: '🤲 Dua of the Day',
          description: truncate(
            dailyDua.english_translation || dailyDua.urdu_translation || dailyDua.title || dailyDua.arabic_text
          ),
          duration: 8000,
        });
      }, 4000);
    }
  }, [dailyHadith, allDuas]);

  // Browser push notification
  const sendPushNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.png',
        badge: '/favicon.png',
      });
    }
  }, []);

  // Request permission & send daily push notification
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (!dailyHadith && !allDuas?.length) return;

    const today = new Date().toDateString();
    const pushKey = `noor-push-sent-${today}`;
    if (localStorage.getItem(pushKey)) return;

    const sendDailyPush = () => {
      localStorage.setItem(pushKey, 'true');
      
      if (dailyHadith) {
        sendPushNotification(
          '📖 Hadith of the Day',
          truncate(dailyHadith.english_translation || dailyHadith.urdu_translation || dailyHadith.arabic_text, 200)
        );
      }

      const dailyDua = getDailyDua(allDuas);
      if (dailyDua) {
        setTimeout(() => {
          sendPushNotification(
            '🤲 Dua of the Day',
            truncate(dailyDua.english_translation || dailyDua.urdu_translation || dailyDua.title || dailyDua.arabic_text, 200)
          );
        }, 2000);
      }
    };

    if (Notification.permission === 'granted') {
      sendDailyPush();
    } else if (Notification.permission !== 'denied') {
      // Ask permission after a delay so it's not intrusive
      const alreadyAsked = localStorage.getItem(PUSH_PERMISSION_KEY);
      if (!alreadyAsked) {
        setTimeout(() => {
          Notification.requestPermission().then((perm) => {
            localStorage.setItem(PUSH_PERMISSION_KEY, 'true');
            if (perm === 'granted') {
              sendDailyPush();
            }
          });
        }, 6000);
      }
    }
  }, [dailyHadith, allDuas, sendPushNotification]);
}
