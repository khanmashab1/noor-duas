import { useI18n } from '@/lib/i18n';

export const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-muted/30 islamic-pattern dark:islamic-pattern-dark">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌙</span>
              <span className="font-display text-lg font-bold text-primary">{t('appName')}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-foreground">{t('categories')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t('morningDuas')}</li>
              <li>{t('eveningDuas')}</li>
              <li>{t('protectionDuas')}</li>
              <li>{t('travelDuas')}</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-foreground">Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t('about')}</li>
              <li>{t('contact')}</li>
              <li>{t('privacy')}</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Noor Duas. All authentic duas sourced from Quran, Sahih Bukhari, Sahih Muslim & Hisnul Muslim.
        </div>
      </div>
    </footer>
  );
};
