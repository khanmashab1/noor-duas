import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass, Navigation } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function calculateQiblaDirection(lat: number, lng: number): number {
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA_LAT * Math.PI) / 180;
  const Δλ = ((KAABA_LNG - lng) * Math.PI) / 180;
  const x = Math.sin(Δλ);
  const y = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
  let qibla = (Math.atan2(x, y) * 180) / Math.PI;
  return (qibla + 360) % 360;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface QiblaCompassProps {
  latitude: number;
  longitude: number;
  city: string;
}

export const QiblaCompass = ({ latitude, longitude, city }: QiblaCompassProps) => {
  const { lang } = useI18n();
  const [heading, setHeading] = useState<number | null>(null);
  const [compassSupported, setCompassSupported] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [listening, setListening] = useState(false);

  const qiblaAngle = calculateQiblaDirection(latitude, longitude);
  const distance = calculateDistance(latitude, longitude, KAABA_LAT, KAABA_LNG);

  const startCompass = useCallback(async () => {
    if (!('DeviceOrientationEvent' in window)) {
      setCompassSupported(false);
      return;
    }

    // iOS 13+ requires permission
    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE.requestPermission === 'function') {
      try {
        const perm = await DOE.requestPermission();
        if (perm !== 'granted') {
          setPermissionDenied(true);
          return;
        }
      } catch {
        setPermissionDenied(true);
        return;
      }
    }

    setListening(true);
  }, []);

  useEffect(() => {
    if (!listening) return;

    const handler = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading for iOS, alpha for Android
      const h = (e as any).webkitCompassHeading ?? (e.alpha != null ? (360 - e.alpha) : null);
      if (h != null) setHeading(h);
    };

    window.addEventListener('deviceorientation', handler, true);
    return () => window.removeEventListener('deviceorientation', handler, true);
  }, [listening]);

  // The needle rotation: if we have device heading, rotate so qibla points up
  // Without heading, show static qibla bearing
  const needleRotation = heading != null ? qiblaAngle - heading : qiblaAngle;

  const labels = {
    title: { en: 'Qibla Direction', ur: 'قبلہ کی سمت', ar: 'اتجاه القبلة' },
    distance: { en: 'Distance to Kaaba', ur: 'کعبہ سے فاصلہ', ar: 'المسافة إلى الكعبة' },
    bearing: { en: 'Bearing', ur: 'زاویہ', ar: 'الاتجاه' },
    enableCompass: { en: 'Enable Compass', ur: 'کمپاس فعال کریں', ar: 'تفعيل البوصلة' },
    noCompass: { en: 'Compass not supported on this device. Qibla bearing shown below.', ur: 'اس ڈیوائس پر کمپاس دستیاب نہیں۔ قبلہ کا زاویہ نیچے دکھایا گیا ہے۔', ar: 'البوصلة غير مدعومة. يظهر الاتجاه أدناه.' },
    permDenied: { en: 'Compass permission denied. Qibla bearing shown below.', ur: 'کمپاس کی اجازت نہیں دی گئی۔ قبلہ کا زاویہ نیچے دکھایا گیا ہے۔', ar: 'تم رفض إذن البوصلة. يظهر الاتجاه أدناه.' },
    from: { en: 'from', ur: 'سے', ar: 'من' },
    compassActive: { en: 'Point your phone to find Qibla', ur: 'قبلہ تلاش کرنے کے لیے فون کو گھمائیں', ar: 'وجّه هاتفك للعثور على القبلة' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mb-6"
    >
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-5">
          <h3 className="font-display font-bold text-foreground flex items-center gap-2 mb-4">
            <Compass className="h-4 w-4 text-primary" />
            {labels.title[lang]}
          </h3>

          <div className="flex flex-col items-center gap-6">
            {/* Compass Visual */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-border/30 bg-background/50" />
              
              {/* Cardinal directions */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="absolute top-3 text-xs font-bold text-muted-foreground">N</span>
                <span className="absolute bottom-3 text-xs font-bold text-muted-foreground">S</span>
                <span className="absolute left-3 text-xs font-bold text-muted-foreground">W</span>
                <span className="absolute right-3 text-xs font-bold text-muted-foreground">E</span>
              </div>

              {/* Degree marks */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                {Array.from({ length: 72 }).map((_, i) => {
                  const angle = i * 5;
                  const isMajor = angle % 30 === 0;
                  const r1 = isMajor ? 88 : 92;
                  const r2 = 96;
                  const rad = (angle * Math.PI) / 180;
                  return (
                    <line
                      key={i}
                      x1={100 + r1 * Math.sin(rad)}
                      y1={100 - r1 * Math.cos(rad)}
                      x2={100 + r2 * Math.sin(rad)}
                      y2={100 - r2 * Math.cos(rad)}
                      stroke="currentColor"
                      className={isMajor ? 'text-muted-foreground' : 'text-border'}
                      strokeWidth={isMajor ? 1.5 : 0.5}
                    />
                  );
                })}
              </svg>

              {/* Qibla needle */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: needleRotation }}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
              >
                <svg width="200" height="200" viewBox="0 0 200 200" className="w-full h-full">
                  {/* Needle pointing up (toward Qibla) */}
                  <polygon
                    points="100,25 93,100 107,100"
                    className="fill-primary"
                  />
                  <polygon
                    points="100,175 93,100 107,100"
                    className="fill-muted-foreground/30"
                  />
                  {/* Center dot */}
                  <circle cx="100" cy="100" r="6" className="fill-primary" />
                  <circle cx="100" cy="100" r="3" className="fill-background" />
                </svg>
              </motion.div>

              {/* Kaaba icon at needle tip */}
              <motion.div
                className="absolute inset-0 flex justify-center"
                animate={{ rotate: needleRotation }}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
              >
                <div className="mt-2">
                  <motion.span
                    className="text-lg"
                    animate={{ rotate: -needleRotation }}
                    transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                  >
                    🕋
                  </motion.span>
                </div>
              </motion.div>
            </div>

            {/* Status message */}
            {listening && heading != null && (
              <p className="text-xs text-primary font-medium animate-pulse">
                {labels.compassActive[lang]}
              </p>
            )}

            {/* Compass controls */}
            {!listening && !permissionDenied && compassSupported && (
              <Button size="sm" variant="outline" onClick={startCompass} className="gap-2">
                <Navigation className="h-4 w-4" />
                {labels.enableCompass[lang]}
              </Button>
            )}

            {!compassSupported && (
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                {labels.noCompass[lang]}
              </p>
            )}

            {permissionDenied && (
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                {labels.permDenied[lang]}
              </p>
            )}

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-center">
                <p className="text-xs text-muted-foreground">{labels.bearing[lang]}</p>
                <p className="text-lg font-bold text-primary font-mono tabular-nums">
                  {qiblaAngle.toFixed(1)}°
                </p>
              </div>
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-center">
                <p className="text-xs text-muted-foreground">{labels.distance[lang]}</p>
                <p className="text-lg font-bold text-primary font-mono tabular-nums">
                  {distance.toFixed(0)} km
                </p>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              {labels.from[lang]} {city} → 🕋 Makkah
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
