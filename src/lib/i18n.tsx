import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Language = 'en' | 'ar' | 'ur';

interface Translations {
  [key: string]: { en: string; ar: string; ur: string };
}

const translations: Translations = {
  appName: { en: 'Noor Duas', ar: 'نور الدعاء', ur: 'نورِ دعا' },
  subtitle: { en: 'Authentic Duas from Quran & Sunnah', ar: 'أدعية صحيحة من القرآن والسنة', ur: 'قرآن و سنت سے مستند دعائیں' },
  home: { en: 'Home', ar: 'الرئيسية', ur: 'ہوم' },
  categories: { en: 'Categories', ar: 'الأقسام', ur: 'زمرے' },
  favorites: { en: 'Favorites', ar: 'المفضلة', ur: 'پسندیدہ' },
  tasbeeh: { en: 'Tasbeeh', ar: 'تسبيح', ur: 'تسبیح' },
  login: { en: 'Login', ar: 'تسجيل الدخول', ur: 'لاگ ان' },
  register: { en: 'Register', ar: 'إنشاء حساب', ur: 'رجسٹر' },
  logout: { en: 'Logout', ar: 'تسجيل الخروج', ur: 'لاگ آؤٹ' },
  search: { en: 'Search duas...', ar: 'ابحث عن دعاء...', ur: 'دعا تلاش کریں...' },
  dailyDua: { en: 'Daily Dua', ar: 'دعاء اليوم', ur: 'آج کی دعا' },
  popularDuas: { en: 'Popular Duas', ar: 'الأدعية الشائعة', ur: 'مقبول دعائیں' },
  morningDuas: { en: 'Morning Duas', ar: 'أذكار الصباح', ur: 'صبح کی دعائیں' },
  eveningDuas: { en: 'Evening Duas', ar: 'أذكار المساء', ur: 'شام کی دعائیں' },
  hajjDuas: { en: 'Hajj & Umrah', ar: 'الحج والعمرة', ur: 'حج و عمرہ' },
  travelDuas: { en: 'Travel Duas', ar: 'أدعية السفر', ur: 'سفر کی دعائیں' },
  protectionDuas: { en: 'Protection Duas', ar: 'أدعية الحماية', ur: 'حفاظت کی دعائیں' },
  reference: { en: 'Reference', ar: 'المرجع', ur: 'حوالہ' },
  benefits: { en: 'Benefits', ar: 'الفوائد', ur: 'فوائد' },
  explanation: { en: 'Explanation', ar: 'الشرح', ur: 'تشریح' },
  copy: { en: 'Copy', ar: 'نسخ', ur: 'کاپی' },
  share: { en: 'Share', ar: 'مشاركة', ur: 'شیئر' },
  addFavorite: { en: 'Add to Favorites', ar: 'إضافة للمفضلة', ur: 'پسندیدہ میں شامل کریں' },
  removeFavorite: { en: 'Remove from Favorites', ar: 'إزالة من المفضلة', ur: 'پسندیدہ سے ہٹائیں' },
  darkMode: { en: 'Dark Mode', ar: 'الوضع الداكن', ur: 'ڈارک موڈ' },
  lightMode: { en: 'Light Mode', ar: 'الوضع الفاتح', ur: 'لائٹ موڈ' },
  about: { en: 'About', ar: 'حول', ur: 'ہمارے بارے میں' },
  contact: { en: 'Contact', ar: 'اتصل بنا', ur: 'رابطہ' },
  privacy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية', ur: 'رازداری کی پالیسی' },
  heroTitle: { en: 'Noor Duas – Authentic Duas from Quran & Sunnah', ar: 'نور الدعاء – أدعية صحيحة من القرآن والسنة', ur: 'نورِ دعا – قرآن و سنت سے مستند دعائیں' },
  heroSubtitle: { en: 'Learn, Save, and Share Daily Duas', ar: 'تعلّم، احفظ، وشارك الأدعية اليومية', ur: 'روزانہ دعائیں سیکھیں، محفوظ کریں اور شیئر کریں' },
  counter: { en: 'Counter', ar: 'عداد', ur: 'کاؤنٹر' },
  reset: { en: 'Reset', ar: 'إعادة', ur: 'ری سیٹ' },
  profile: { en: 'Profile', ar: 'الملف الشخصي', ur: 'پروفائل' },
  admin: { en: 'Admin', ar: 'الإدارة', ur: 'ایڈمن' },
  email: { en: 'Email', ar: 'البريد الإلكتروني', ur: 'ای میل' },
  password: { en: 'Password', ar: 'كلمة المرور', ur: 'پاس ورڈ' },
  name: { en: 'Name', ar: 'الاسم', ur: 'نام' },
  relatedDuas: { en: 'Related Duas', ar: 'أدعية ذات صلة', ur: 'متعلقہ دعائیں' },
  viewAll: { en: 'View All', ar: 'عرض الكل', ur: 'سب دیکھیں' },
  noResults: { en: 'No results found', ar: 'لم يتم العثور على نتائج', ur: 'کوئی نتیجہ نہیں ملا' },
  loading: { en: 'Loading...', ar: 'جارٍ التحميل...', ur: 'لوڈ ہو رہا ہے...' },
  copied: { en: 'Copied!', ar: 'تم النسخ!', ur: 'کاپی ہو گیا!' },
  forgotPassword: { en: 'Forgot Password?', ar: 'نسيت كلمة المرور؟', ur: 'پاس ورڈ بھول گئے؟' },
  resetPassword: { en: 'Reset Password', ar: 'إعادة تعيين كلمة المرور', ur: 'پاس ورڈ ری سیٹ کریں' },
  wordByWord: { en: 'Word by Word', ar: 'كلمة بكلمة', ur: 'لفظ بہ لفظ' },
  listen: { en: 'Listen', ar: 'استمع', ur: 'سنیں' },
  hadith: { en: 'Hadith', ar: 'الحديث', ur: 'حدیث' },
  hadithSubtitle: { en: 'Authentic Hadiths from Sahih Bukhari & Muslim', ar: 'أحاديث صحيحة من البخاري ومسلم', ur: 'صحیح بخاری اور مسلم سے مستند احادیث' },
  hadithCategories: { en: 'Hadith Categories', ar: 'أقسام الأحاديث', ur: 'حدیث کے زمرے' },
  hadithOfTheDay: { en: 'Hadith of the Day', ar: 'حديث اليوم', ur: 'آج کی حدیث' },
  selectCategory: { en: 'Select a category to view hadiths', ar: 'اختر قسمًا لعرض الأحاديث', ur: 'احادیث دیکھنے کے لیے زمرہ منتخب کریں' },
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  fontClass: string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
  dir: 'ltr',
  fontClass: '',
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem('noor-lang');
    return (stored as Language) || 'en';
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('noor-lang', newLang);
  }, []);

  const t = useCallback((key: string) => {
    return translations[key]?.[lang] || key;
  }, [lang]);

  const dir = lang === 'en' ? 'ltr' : 'rtl';
  const fontClass = lang === 'ar' ? 'font-arabic' : lang === 'ur' ? 'font-urdu' : '';

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir, fontClass }}>
      <div dir={dir} className={fontClass}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};
