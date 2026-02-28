import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass, Navigation } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
const ALIGNMENT_THRESHOLD = 10; // degrees

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
    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE.requestPermission === 'function') {
      try {
        const perm = await DOE.requestPermission();
        if (perm !== 'granted') { setPermissionDenied(true); return; }
      } catch { setPermissionDenied(true); return; }
    }
    setListening(true);
  }, []);

  useEffect(() => {
    if (!listening) return;

    let usingAbsolute = false;

    const handler = (e: DeviceOrientationEvent) => {
      // iOS provides webkitCompassHeading directly
      const webkit = (e as any).webkitCompassHeading;
      if (webkit != null) {
        setHeading(webkit);
        return;
      }
      // For absolute orientation (Android), alpha is degrees from North
      if ((e as any).absolute && e.alpha != null) {
        setHeading((360 - e.alpha) % 360);
      }
    };

    // Try absolute orientation first (Android)
    const absHandler = (e: DeviceOrientationEvent) => {
      usingAbsolute = true;
      handler(e);
    };

    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute' as any, absHandler, true);
    }
    // Also listen to regular event for iOS webkitCompassHeading
    window.addEventListener('deviceorientation', (e) => {
      if (!usingAbsolute) handler(e);
    }, true);

    return () => {
      window.removeEventListener('deviceorientationabsolute' as any, absHandler, true);
      window.removeEventListener('deviceorientation', handler, true);
    };
  }, [listening]);

  const needleRotation = heading != null ? qiblaAngle - heading : qiblaAngle;

  // Check if phone is aligned with Qibla direction
  const isAligned = useMemo(() => {
    if (heading == null) return false;
    const diff = Math.abs(((qiblaAngle - heading) % 360 + 360) % 360);
    return diff < ALIGNMENT_THRESHOLD || diff > (360 - ALIGNMENT_THRESHOLD);
  }, [heading, qiblaAngle]);

  const labels = {
    title: { en: 'Qibla Direction', ur: 'قبلہ کی سمت', ar: 'اتجاه القبلة' },
    distance: { en: 'Distance to Kaaba', ur: 'کعبہ سے فاصلہ', ar: 'المسافة إلى الكعبة' },
    bearing: { en: 'Bearing', ur: 'زاویہ', ar: 'الاتجاه' },
    enableCompass: { en: 'Enable Compass', ur: 'کمپاس فعال کریں', ar: 'تفعيل البوصلة' },
    noCompass: { en: 'Compass not supported on this device. Qibla bearing shown below.', ur: 'اس ڈیوائس پر کمپاس دستیاب نہیں۔ قبلہ کا زاویہ نیچے دکھایا گیا ہے۔', ar: 'البوصلة غير مدعومة. يظهر الاتجاه أدناه.' },
    permDenied: { en: 'Compass permission denied. Qibla bearing shown below.', ur: 'کمپاس کی اجازت نہیں دی گئی۔ قبلہ کا زاویہ نیچے دکھایا گیا ہے۔', ar: 'تم رفض إذن البوصلة. يظهر الاتجاه أدناه.' },
    from: { en: 'from', ur: 'سے', ar: 'من' },
    compassActive: { en: 'Point your phone to find Qibla', ur: 'قبلہ تلاش کرنے کے لیے فون کو گھمائیں', ar: 'وجّه هاتفك للعثور على القبلة' },
    aligned: { en: '✅ You are facing Qibla!', ur: '✅ آپ قبلہ رُخ ہیں!', ar: '✅ أنت تواجه القبلة!' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mb-6"
    >
      <Card className={`border-border/50 overflow-hidden transition-all duration-500 ${isAligned ? 'ring-2 ring-primary shadow-[0_0_30px_hsl(var(--primary)/0.3)]' : ''}`}>
        <CardContent className="p-5">
          <h3 className="font-display font-bold text-foreground flex items-center gap-2 mb-4">
            <Compass className="h-4 w-4 text-primary" />
            {labels.title[lang]}
          </h3>

          <div className="flex flex-col items-center gap-6">
            {/* Compass Visual */}
            <div className={`relative w-64 h-64 sm:w-72 sm:h-72 transition-all duration-700 ${isAligned ? 'scale-105' : ''}`}>
              {/* Glow ring when aligned */}
              <div className={`absolute inset-[-4px] rounded-full transition-all duration-700 ${
                isAligned 
                  ? 'bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 animate-[spin_4s_linear_infinite] blur-md' 
                  : 'opacity-0'
              }`} />

              {/* Outer ring */}
              <div className={`absolute inset-0 rounded-full border-2 bg-background/50 transition-colors duration-500 ${
                isAligned ? 'border-primary/60' : 'border-border/30'
              }`} />

              {/* Inner glow when aligned */}
              <AnimatePresence>
                {isAligned && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-4 rounded-full bg-primary/5"
                  />
                )}
              </AnimatePresence>
              
              {/* Cardinal directions */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`absolute top-3 text-xs font-bold transition-colors ${isAligned ? 'text-primary' : 'text-muted-foreground'}`}>N</span>
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
                      className={isMajor ? (isAligned ? 'text-primary' : 'text-muted-foreground') : 'text-border'}
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
                  {/* Glow filter */}
                  <defs>
                    <filter id="needle-glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <polygon
                    points="100,25 93,100 107,100"
                    className="fill-primary"
                    filter={isAligned ? 'url(#needle-glow)' : undefined}
                  />
                  <polygon
                    points="100,175 93,100 107,100"
                    className="fill-muted-foreground/30"
                  />
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
                <div className="mt-1">
                  <motion.span
                    className={`text-xl transition-all ${isAligned ? 'drop-shadow-[0_0_8px_hsl(var(--primary)/0.8)]' : ''}`}
                    animate={{ rotate: -needleRotation, scale: isAligned ? [1, 1.2, 1] : 1 }}
                    transition={isAligned ? { scale: { repeat: Infinity, duration: 1.5 } } : { type: 'spring', stiffness: 50, damping: 15 }}
                  >
                    🕋
                  </motion.span>
                </div>
              </motion.div>
            </div>

            {/* Status messages */}
            <AnimatePresence mode="wait">
              {isAligned ? (
                <motion.p
                  key="aligned"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm font-bold text-primary text-center"
                >
                  {labels.aligned[lang]}
                </motion.p>
              ) : listening && heading != null ? (
                <motion.p
                  key="active"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-primary font-medium animate-pulse"
                >
                  {labels.compassActive[lang]}
                </motion.p>
              ) : null}
            </AnimatePresence>

            {/* Compass controls */}
            {!listening && !permissionDenied && compassSupported && (
              <Button size="sm" variant="outline" onClick={startCompass} className="gap-2">
                <Navigation className="h-4 w-4" />
                {labels.enableCompass[lang]}
              </Button>
            )}

            {!compassSupported && (
              <p className="text-xs text-muted-foreground text-center max-w-xs">{labels.noCompass[lang]}</p>
            )}
            {permissionDenied && (
              <p className="text-xs text-muted-foreground text-center max-w-xs">{labels.permDenied[lang]}</p>
            )}

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              <div className={`rounded-xl border p-3 text-center transition-all duration-500 ${
                isAligned ? 'bg-primary/10 border-primary/30' : 'bg-primary/5 border-primary/10'
              }`}>
                <p className="text-xs text-muted-foreground">{labels.bearing[lang]}</p>
                <p className="text-lg font-bold text-primary font-mono tabular-nums">
                  {qiblaAngle.toFixed(1)}°
                </p>
              </div>
              <div className={`rounded-xl border p-3 text-center transition-all duration-500 ${
                isAligned ? 'bg-primary/10 border-primary/30' : 'bg-primary/5 border-primary/10'
              }`}>
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
