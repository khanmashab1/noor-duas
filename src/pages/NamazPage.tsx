import { SEO } from '@/components/SEO';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, BookOpen } from 'lucide-react';
import { PrayerTimes } from '@/components/PrayerTimes';


interface PrayerStep {
  id: number;
  name: { en: string; ar: string; ur: string };
  description: { en: string; ar: string; ur: string };
  dua: { arabic: string; transliteration: string; translation: { en: string; ur: string } };
}

const prayerSteps: PrayerStep[] = [
  {
    id: 1,
    name: { en: 'Takbeer (Opening)', ar: 'تكبيرة الإحرام', ur: 'تکبیرِ تحریمہ' },
    
    description: {
      en: 'Stand facing the Qibla. Raise both hands up to the ears (men) or shoulders (women) and say "Allahu Akbar". Then fold hands — right hand over left wrist — below the navel (men) or on the chest (women).',
      ar: 'قف مواجهًا القبلة. ارفع يديك حذو أذنيك (للرجل) أو الكتفين (للمرأة) وقل "الله أكبر". ثم ضع اليد اليمنى على اليسرى تحت السرة (للرجل) أو على الصدر (للمرأة).',
      ur: 'قبلہ رخ کھڑے ہوں۔ دونوں ہاتھ کانوں تک اٹھائیں (مرد) یا کندھوں تک (خواتین) اور "اللہ اکبر" کہیں۔ پھر دایاں ہاتھ بائیں کلائی پر رکھیں — ناف کے نیچے (مرد) یا سینے پر (خواتین)۔'
    },
    dua: {
      arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلٰهَ غَيْرُكَ',
      transliteration: 'Subhanaka Allahumma wa bihamdika wa tabarakasmuka wa ta\'ala jadduka wa la ilaha ghairuk',
      translation: {
        en: 'Glory be to You, O Allah, and praise be to You. Blessed is Your name and exalted is Your majesty. There is no god but You.',
        ur: 'اے اللہ! تو پاک ہے اور تیری حمد کے ساتھ، تیرا نام بابرکت ہے اور تیری شان بلند ہے اور تیرے سوا کوئی معبود نہیں۔'
      }
    }
  },
  {
    id: 2,
    name: { en: 'Qiyam (Standing)', ar: 'القيام', ur: 'قیام' },
    
    description: {
      en: 'While standing, recite Surah Al-Fatiha followed by any short Surah or verses from the Quran. This is done in every rakah of the prayer.',
      ar: 'أثناء الوقوف، اقرأ سورة الفاتحة ثم سورة قصيرة أو آيات من القرآن. يتم ذلك في كل ركعة.',
      ur: 'کھڑے ہو کر سورۃ الفاتحہ پڑھیں اور پھر قرآن کی کوئی چھوٹی سورت یا آیات پڑھیں۔ یہ ہر رکعت میں کیا جاتا ہے۔'
    },
    dua: {
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      transliteration: 'Bismillahir Rahmanir Raheem. Alhamdu lillahi Rabbil \'aalameen. Ar-Rahmanir Raheem. Maliki yawmid-deen. Iyyaka na\'budu wa iyyaka nasta\'een. Ihdinas-siratal mustaqeem. Siratal lazeena an\'amta \'alaihim, ghairil maghdoobi \'alaihim walad-daalleen.',
      translation: {
        en: 'In the name of Allah, the Most Gracious, the Most Merciful. All praise is due to Allah, Lord of the worlds. The Most Gracious, the Most Merciful. Master of the Day of Judgment. You alone we worship, and You alone we ask for help. Guide us on the Straight Path. The path of those You have blessed, not of those who earn Your anger, nor of those who go astray.',
        ur: 'اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے۔ سب تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا پالنے والا ہے۔ بڑا مہربان نہایت رحم والا۔ روزِ جزا کا مالک۔ ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد چاہتے ہیں۔ ہمیں سیدھا راستہ دکھا۔ ان لوگوں کا راستہ جن پر تو نے انعام کیا، نہ ان کا جن پر غضب ہوا اور نہ گمراہوں کا۔'
      }
    }
  },
  {
    id: 3,
    name: { en: 'Surah (After Fatiha)', ar: 'السورة', ur: 'سورت (فاتحہ کے بعد)' },
    description: {
      en: 'After Surah Al-Fatiha, recite any short Surah from the Quran. Here is Surah Al-Ikhlas (Chapter 112) as an example. This is recited in the first two rakaat of every prayer.',
      ar: 'بعد سورة الفاتحة، اقرأ أي سورة قصيرة من القرآن. هنا سورة الإخلاص (الفصل ١١٢) كمثال. تُقرأ في أول ركعتين من كل صلاة.',
      ur: 'سورۃ الفاتحہ کے بعد قرآن کی کوئی چھوٹی سورت پڑھیں۔ یہاں سورۃ الاخلاص (پارہ ٣٠) بطور مثال دی گئی ہے۔ یہ ہر نماز کی پہلی دو رکعتوں میں پڑھی جاتی ہے۔'
    },
    dua: {
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
      transliteration: 'Bismillahir Rahmanir Raheem. Qul huwal lahu ahad. Allahus samad. Lam yalid wa lam yulad. Wa lam yakul lahu kufuwan ahad.',
      translation: {
        en: 'In the name of Allah, the Most Gracious, the Most Merciful. Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent.',
        ur: 'اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے۔ کہو: وہ اللہ ایک ہے۔ اللہ بے نیاز ہے۔ نہ اس سے کوئی پیدا ہوا اور نہ وہ کسی سے پیدا ہوا۔ اور نہ کوئی اس کا ہمسر ہے۔'
      }
    }
  },
  {
    id: 4,
    name: { en: 'Ruku (Bowing)', ar: 'الركوع', ur: 'رکوع' },
    
    description: {
      en: 'Say "Allahu Akbar" and bow down, placing hands on knees with fingers spread. Keep the back straight and head in line with the back. Say the Tasbeeh three times.',
      ar: 'قل "الله أكبر" واركع واضعًا يديك على ركبتيك مع فتح الأصابع. حافظ على استقامة الظهر والرأس. قل التسبيح ثلاث مرات.',
      ur: '"اللہ اکبر" کہیں اور جھکیں، ہاتھ گھٹنوں پر رکھیں انگلیاں کھلی ہوں۔ کمر سیدھی رکھیں اور سر کمر کے برابر۔ تسبیح تین بار پڑھیں۔'
    },
    dua: {
      arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
      transliteration: 'Subhana Rabbiyal Azeem',
      translation: {
        en: 'Glory be to my Lord, the Most Great.',
        ur: 'پاک ہے میرا رب جو بڑی عظمت والا ہے۔'
      }
    }
  },
  {
    id: 5,
    name: { en: 'Sujud (Prostration)', ar: 'السجود', ur: 'سجدہ' },
    
    description: {
      en: 'Say "Allahu Akbar" and go into prostration. Seven body parts touch the ground: forehead with nose, both palms, both knees, and toes of both feet. Say the Tasbeeh three times. Rise saying "Allahu Akbar", sit briefly, then do a second Sujud.',
      ar: 'قل "الله أكبر" واسجد. سبعة أعضاء تلامس الأرض: الجبهة مع الأنف، الكفين، الركبتين، وأطراف القدمين. قل التسبيح ثلاث مرات. ارفع قائلاً "الله أكبر"، اجلس قليلاً، ثم اسجد سجدة ثانية.',
      ur: '"اللہ اکبر" کہیں اور سجدے میں جائیں۔ سات اعضاء زمین پر لگیں: پیشانی ناک کے ساتھ، دونوں ہتھیلیاں، دونوں گھٹنے، اور دونوں پاؤں کی انگلیاں۔ تسبیح تین بار پڑھیں۔ "اللہ اکبر" کہتے ہوئے اٹھیں، تھوڑا بیٹھیں، پھر دوسرا سجدہ کریں۔'
    },
    dua: {
      arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
      transliteration: 'Subhana Rabbiyal A\'la',
      translation: {
        en: 'Glory be to my Lord, the Most High.',
        ur: 'پاک ہے میرا رب جو سب سے بلند ہے۔'
      }
    }
  },
  {
    id: 6,
    name: { en: 'Tashahhud (Sitting)', ar: 'التشهد', ur: 'تشہد / قعدہ' },
    description: {
      en: 'After the 2nd and last rakah, sit and recite Tashahhud (At-Tahiyyat). Point the index finger of the right hand during the declaration of faith.',
      ar: 'بعد الركعة الثانية والأخيرة، اجلس واقرأ التشهد (التحيات). أشر بسبابة اليد اليمنى عند الشهادة.',
      ur: 'دوسری اور آخری رکعت کے بعد بیٹھ کر تشہد (التحیات) پڑھیں۔ شہادت کی انگلی سے اشارہ کریں۔'
    },
    dua: {
      arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
      transliteration: 'At-tahiyyatu lillahi was-salawatu wat-tayyibatu. As-salamu \'alaika ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. As-salamu \'alaina wa \'ala \'ibadillahis-saliheen. Ash-hadu an la ilaha illallahu wa ash-hadu anna Muhammadan \'abduhu wa rasuluh.',
      translation: {
        en: 'All greetings, prayers, and good deeds are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and messenger.',
        ur: 'تمام تعظیمیں، نمازیں اور پاکیزہ باتیں اللہ کے لیے ہیں۔ اے نبی! آپ پر سلام ہو اور اللہ کی رحمت اور برکات۔ ہم پر اور اللہ کے نیک بندوں پر سلام ہو۔ میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں اور محمد ﷺ اس کے بندے اور رسول ہیں۔'
      }
    }
  },
  {
    id: 7,
    name: { en: 'Durood Ibrahim', ar: 'الصلاة الإبراهيمية', ur: 'درود ابراہیمی' },
    description: {
      en: 'In the final sitting (Qa\'dah Akhirah), after reciting Tashahhud, recite Durood Ibrahim (Salawat upon the Prophet ﷺ). This is obligatory in the last rakah.',
      ar: 'في الجلسة الأخيرة (القعدة الأخيرة)، بعد قراءة التشهد، اقرأ الصلاة الإبراهيمية. وهي واجبة في الركعة الأخيرة.',
      ur: 'آخری قعدے میں تشہد کے بعد درود ابراہیمی پڑھیں۔ یہ آخری رکعت میں واجب ہے۔'
    },
    dua: {
      arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
      transliteration: 'Allahumma salli \'ala Muhammadin wa \'ala aali Muhammadin kama sallaita \'ala Ibrahima wa \'ala aali Ibrahima innaka Hameedun Majeed. Allahumma barik \'ala Muhammadin wa \'ala aali Muhammadin kama barakta \'ala Ibrahima wa \'ala aali Ibrahima innaka Hameedun Majeed.',
      translation: {
        en: 'O Allah, send blessings upon Muhammad and upon the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim. Indeed, You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim. Indeed, You are Praiseworthy, Glorious.',
        ur: 'اے اللہ! رحمت نازل فرما محمد ﷺ پر اور آلِ محمد پر جیسے تو نے رحمت نازل فرمائی ابراہیم پر اور آلِ ابراہیم پر، بے شک تو تعریف والا بزرگی والا ہے۔ اے اللہ! برکت نازل فرما محمد ﷺ پر اور آلِ محمد پر جیسے تو نے برکت نازل فرمائی ابراہیم پر اور آلِ ابراہیم پر، بے شک تو تعریف والا بزرگی والا ہے۔'
      }
    }
  },
  {
    id: 8,
    name: { en: 'Dua before Salam', ar: 'الدعاء قبل السلام', ur: 'سلام سے پہلے دعا' },
    description: {
      en: 'After Durood Ibrahim, recite this dua (Dua Masura) before ending the prayer with Salam. This is from Surah Al-Baqarah (2:201) and is authentically reported in Sahih Bukhari & Muslim.',
      ar: 'بعد الصلاة الإبراهيمية، اقرأ هذا الدعاء (دعاء ماثورة) قبل إنهاء الصلاة بالسلام. هذا من سورة البقرة (٢:٢٠١) وثابت في صحيح البخاري ومسلم.',
      ur: 'درود ابراہیمی کے بعد سلام سے پہلے یہ دعا (دعائے ماثورہ) پڑھیں۔ یہ سورۃ البقرہ (٢:٢٠١) سے ہے اور صحیح بخاری و مسلم میں ثابت ہے۔'
    },
    dua: {
      arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina \'adhaban-nar.',
      translation: {
        en: 'Our Lord, give us good in this world and good in the Hereafter, and save us from the punishment of the Fire.',
        ur: 'اے ہمارے رب! ہمیں دنیا میں بھی بھلائی دے اور آخرت میں بھی بھلائی دے اور ہمیں آگ کے عذاب سے بچا۔'
      }
    }
  },
  {
    id: 9,
    name: { en: 'Salam (Ending)', ar: 'السلام', ur: 'سلام' },
    
    description: {
      en: 'Turn your head to the right and say "Assalamu Alaikum wa Rahmatullah", then turn to the left and repeat. This concludes the prayer.',
      ar: 'أدر رأسك إلى اليمين وقل "السلام عليكم ورحمة الله"، ثم أدر إلى اليسار وكرر. بهذا تنتهي الصلاة.',
      ur: 'سر دائیں طرف پھیریں اور کہیں "السلام علیکم ورحمۃ اللہ"، پھر بائیں طرف پھیریں اور دہرائیں۔ اس سے نماز مکمل ہوتی ہے۔'
    },
    dua: {
      arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
      transliteration: 'Assalamu Alaikum wa Rahmatullah',
      translation: {
        en: 'Peace be upon you and the mercy of Allah.',
        ur: 'تم پر سلامتی ہو اور اللہ کی رحمت۔'
      }
    }
  }
];

interface PrayerInfo {
  name: { en: string; ar: string; ur: string };
  time: { en: string; ar: string; ur: string };
  rakaat: string;
  sunnah: { en: string; ar: string; ur: string };
}

const prayers: PrayerInfo[] = [
  {
    name: { en: 'Fajr', ar: 'الفجر', ur: 'فجر' },
    time: { en: 'Before Sunrise', ar: 'قبل الشروق', ur: 'طلوعِ آفتاب سے پہلے' },
    rakaat: '2',
    sunnah: { en: '2 Sunnah before', ar: '٢ سنة قبلية', ur: '2 سنت پہلے' }
  },
  {
    name: { en: 'Dhuhr', ar: 'الظهر', ur: 'ظہر' },
    time: { en: 'After Midday', ar: 'بعد الزوال', ur: 'دوپہر کے بعد' },
    rakaat: '4',
    sunnah: { en: '4 Sunnah before, 2 after', ar: '٤ سنة قبلية، ٢ بعدية', ur: '4 سنت پہلے، 2 بعد' }
  },
  {
    name: { en: 'Asr', ar: 'العصر', ur: 'عصر' },
    time: { en: 'Afternoon', ar: 'العصر', ur: 'دوپہر بعد' },
    rakaat: '4',
    sunnah: { en: '4 Sunnah before (optional)', ar: '٤ سنة قبلية (اختيارية)', ur: '4 سنت پہلے (غیر مؤکدہ)' }
  },
  {
    name: { en: 'Maghrib', ar: 'المغرب', ur: 'مغرب' },
    time: { en: 'After Sunset', ar: 'بعد الغروب', ur: 'غروبِ آفتاب کے بعد' },
    rakaat: '3',
    sunnah: { en: '2 Sunnah after', ar: '٢ سنة بعدية', ur: '2 سنت بعد' }
  },
  {
    name: { en: 'Isha', ar: 'العشاء', ur: 'عشاء' },
    time: { en: 'Night', ar: 'الليل', ur: 'رات' },
    rakaat: '4',
    sunnah: { en: '2 Sunnah after + 3 Witr', ar: '٢ سنة بعدية + ٣ وتر', ur: '2 سنت بعد + 3 وتر' }
  }
];

const NamazPage = () => {
  const { t, lang } = useI18n();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPrayer, setSelectedPrayer] = useState<number | null>(null);

  const step = prayerSteps[activeStep];

  const getName = (obj: { en: string; ar: string; ur: string }) => obj[lang] || obj.en;

  const goNext = () => setActiveStep((s) => Math.min(s + 1, prayerSteps.length - 1));
  const goPrev = () => setActiveStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen">
      <SEO
        title="How to Pray Namaz – Step by Step Guide"
        description="Complete step-by-step Namaz guide with prayer times, Qibla compass & instructions. Learn how to pray Salah in Islam with Arabic, Urdu & English"
        path="/namaz"
        breadcrumbs={[{ name: 'Namaz Guide', path: '/namaz' }]}
        keywords="how to pray namaz, namaz step by step, salah guide, prayer times, qibla direction, how to pray in islam"
        faq={[
          { question: 'How many Rakaat are in each prayer?', answer: 'Fajr: 2, Dhuhr: 4, Asr: 4, Maghrib: 3, Isha: 4 obligatory Rakaat.' },
          { question: 'What is the Qibla direction?', answer: 'Qibla is the direction of the Kaaba in Makkah, Saudi Arabia. Muslims face this direction during prayer.' },
          { question: 'What are the steps of Namaz?', answer: 'Namaz includes Takbeer, Qiyam (standing), Ruku (bowing), Sujud (prostration), Tashahhud (sitting), and Salam (greeting).' },
          { question: 'When are the 5 daily prayer times?', answer: 'Fajr (before sunrise), Dhuhr (after midday), Asr (afternoon), Maghrib (after sunset), Isha (night).' }
        ]}
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-10 sm:py-16 text-primary-foreground islamic-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="container relative z-10 px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="mb-3 inline-block text-4xl">🕌</span>
            <h1 className="font-display text-2xl sm:text-4xl font-bold">{t('namazGuide')}</h1>
            <p className="mt-2 text-sm sm:text-lg opacity-90">{t('namazSubtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* Live Prayer Times */}
      <PrayerTimes />

      {/* Prayer Times Overview */}
      <section className="container px-4 sm:px-6 py-8 sm:py-12">
        <h2 className="mb-6 font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          {t('fivePrayers')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {prayers.map((prayer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg border-border/50 ${selectedPrayer === i ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/30'}`}
                onClick={() => setSelectedPrayer(selectedPrayer === i ? null : i)}
              >
                <CardContent className="p-4 text-center">
                  <h3 className="font-display text-lg font-bold text-foreground">{getName(prayer.name)}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{getName(prayer.time)}</p>
                  <div className="mt-3 text-2xl font-bold text-primary">{prayer.rakaat}</div>
                  <p className="text-xs text-muted-foreground">{lang === 'en' ? 'Fard Rakaat' : lang === 'ar' ? 'ركعات فرض' : 'فرض رکعات'}</p>
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-xs font-medium text-primary/80">{getName(prayer.sunnah)}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Expanded prayer detail */}
        <AnimatePresence>
          {selectedPrayer !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="mt-4 border-primary/20 bg-primary/5">
                <CardContent className="p-5">
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {getName(prayers[selectedPrayer].name)} — {lang === 'en' ? 'Details' : lang === 'ar' ? 'التفاصيل' : 'تفصیلات'}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-foreground">{lang === 'en' ? 'Fard (Obligatory)' : lang === 'ar' ? 'فرض' : 'فرض'}:</span>
                      <span className="text-muted-foreground ml-2">{prayers[selectedPrayer].rakaat} {lang === 'en' ? 'Rakaat' : 'رکعات'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{lang === 'en' ? 'Sunnah' : 'سنت'}:</span>
                      <span className="text-muted-foreground ml-2">{getName(prayers[selectedPrayer].sunnah)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Step-by-step guide */}
      <section className="bg-muted/30 py-8 sm:py-12 islamic-pattern dark:islamic-pattern-dark">
        <div className="container px-4 sm:px-6">
          <h2 className="mb-6 font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {t('stepByStep')}
          </h2>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 flex-wrap">
            {prayerSteps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveStep(i)}
                className={`px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  i === activeStep
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-background text-muted-foreground hover:bg-muted border border-border'
                }`}
              >
                {i + 1}. {getName(s.name)}
              </button>
            ))}
          </div>

          {/* Active step card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border-border/50 shadow-lg">
                <CardContent className="p-0">
                  <div>
                    <div className="p-5 sm:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {step.id}
                        </span>
                        <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                          {getName(step.name)}
                        </h3>
                      </div>

                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                        {step.description[lang] || step.description.en}
                      </p>

                      {/* Dua section */}
                      <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                          {lang === 'en' ? 'Recitation' : lang === 'ar' ? 'الذكر' : 'تلاوت'}
                        </p>
                        <p className="font-arabic text-lg sm:text-xl text-foreground leading-loose mb-2" dir="rtl">
                          {step.dua.arabic}
                        </p>
                        <p className="text-xs text-muted-foreground italic mb-2">
                          {step.dua.transliteration}
                        </p>
                        <p className="text-sm text-foreground/80">
                          {lang === 'ur' ? step.dua.translation.ur : step.dua.translation.en}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={activeStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {lang === 'en' ? 'Previous' : lang === 'ar' ? 'السابق' : 'پچھلا'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {activeStep + 1} / {prayerSteps.length}
            </span>
            <Button
              onClick={goNext}
              disabled={activeStep === prayerSteps.length - 1}
              className="gap-2"
            >
              {lang === 'en' ? 'Next' : lang === 'ar' ? 'التالي' : 'اگلا'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NamazPage;
