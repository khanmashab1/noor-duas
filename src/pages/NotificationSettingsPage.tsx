import { SEO } from '@/components/SEO';
import { motion } from 'framer-motion';
import { Bell, BellOff, Smartphone, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useState } from 'react';

const NotificationSettingsPage = () => {
  const { lang } = useI18n();
  const { prefs, updatePref } = useNotificationSettings();
  const [pushStatus, setPushStatus] = useState<string>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  const requestPush = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setPushStatus(perm);
  };

  const labels = {
    title: { en: 'Notification Settings', ar: 'إعدادات الإشعارات', ur: 'نوٹیفکیشن کی ترتیبات' },
    inApp: { en: 'In-App Notifications', ar: 'إشعارات التطبيق', ur: 'ایپ میں اطلاعات' },
    inAppDesc: { en: 'Toast messages shown when you visit the app', ar: 'رسائل تظهر عند فتح التطبيق', ur: 'ایپ کھولنے پر ظاہر ہونے والے پیغامات' },
    push: { en: 'Browser Push Notifications', ar: 'إشعارات المتصفح', ur: 'براؤزر پش نوٹیفکیشنز' },
    pushDesc: { en: 'System notifications from your browser', ar: 'إشعارات النظام من المتصفح', ur: 'براؤزر سے سسٹم نوٹیفکیشنز' },
    hadith: { en: 'Hadith of the Day', ar: 'حديث اليوم', ur: 'آج کی حدیث' },
    dua: { en: 'Dua of the Day', ar: 'دعاء اليوم', ur: 'آج کی دعا' },
    hadithDesc: { en: 'Daily hadith reminder', ar: 'تذكير يومي بالحديث', ur: 'روزانہ حدیث کی یاد دہانی' },
    duaDesc: { en: 'Daily dua reminder', ar: 'تذكير يومي بالدعاء', ur: 'روزانہ دعا کی یاد دہانی' },
    enablePush: { en: 'Enable Push Notifications', ar: 'تفعيل الإشعارات', ur: 'پش نوٹیفکیشنز فعال کریں' },
    pushGranted: { en: 'Push notifications enabled ✓', ar: 'الإشعارات مفعّلة ✓', ur: 'پش نوٹیفکیشنز فعال ہیں ✓' },
    pushDenied: { en: 'Push notifications blocked. Please enable in browser settings.', ar: 'تم حظر الإشعارات. يرجى التفعيل من إعدادات المتصفح.', ur: 'پش نوٹیفکیشنز بلاک ہیں۔ براؤزر سیٹنگز سے فعال کریں۔' },
    pushUnsupported: { en: 'Push notifications not supported in this browser', ar: 'الإشعارات غير مدعومة في هذا المتصفح', ur: 'اس براؤزر میں پش نوٹیفکیشنز دستیاب نہیں' },
  };

  const l = (key: keyof typeof labels) => labels[key][lang] || labels[key].en;

  const SettingRow = ({ icon, title, description, checked, onToggle }: {
    icon: React.ReactNode; title: string; description: string; checked: boolean; onToggle: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  );

  return (
    <div className="container px-4 sm:px-6 py-8 sm:py-12 max-w-2xl">
      <SEO title="Notification Settings" description="Configure daily hadith and dua reminders" path="/notifications" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
          <Bell className="h-5 w-5 text-primary" />
          {l('title')}
        </h1>

        {/* In-App Notifications */}
        <Card className="border-border/50 mb-4">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="font-display font-bold text-foreground text-sm">{l('inApp')}</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{l('inAppDesc')}</p>
            <div className="divide-y divide-border/50">
              <SettingRow
                icon={<span className="text-base">📖</span>}
                title={l('hadith')}
                description={l('hadithDesc')}
                checked={prefs.hadithToast}
                onToggle={(v) => updatePref('hadithToast', v)}
              />
              <SettingRow
                icon={<span className="text-base">🤲</span>}
                title={l('dua')}
                description={l('duaDesc')}
                checked={prefs.duaToast}
                onToggle={(v) => updatePref('duaToast', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-4 w-4 text-primary" />
              <h2 className="font-display font-bold text-foreground text-sm">{l('push')}</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{l('pushDesc')}</p>

            {/* Push permission status */}
            {pushStatus === 'unsupported' && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs mb-3 flex items-center gap-2">
                <BellOff className="h-4 w-4" />
                {l('pushUnsupported')}
              </div>
            )}
            {pushStatus === 'denied' && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs mb-3 flex items-center gap-2">
                <BellOff className="h-4 w-4" />
                {l('pushDenied')}
              </div>
            )}
            {pushStatus === 'granted' && (
              <div className="p-3 rounded-lg bg-primary/10 text-primary text-xs mb-3 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {l('pushGranted')}
              </div>
            )}
            {pushStatus === 'default' && (
              <Button size="sm" onClick={requestPush} className="mb-3 gap-1.5">
                <Bell className="h-4 w-4" />
                {l('enablePush')}
              </Button>
            )}

            <div className="divide-y divide-border/50">
              <SettingRow
                icon={<span className="text-base">📖</span>}
                title={l('hadith')}
                description={l('hadithDesc')}
                checked={prefs.hadithPush}
                onToggle={(v) => updatePref('hadithPush', v)}
              />
              <SettingRow
                icon={<span className="text-base">🤲</span>}
                title={l('dua')}
                description={l('duaDesc')}
                checked={prefs.duaPush}
                onToggle={(v) => updatePref('duaPush', v)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NotificationSettingsPage;
