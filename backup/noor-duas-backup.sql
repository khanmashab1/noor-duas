-- ============================================================
-- NOOR DUAS - COMPLETE DATABASE BACKUP
-- Generated: 2026-02-25
-- This file contains schema + data for easy migration
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_ur TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Duas
CREATE TABLE IF NOT EXISTS public.duas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  arabic_text TEXT NOT NULL,
  english_translation TEXT,
  urdu_translation TEXT,
  reference TEXT,
  explanation TEXT,
  benefits TEXT,
  audio_url TEXT,
  word_by_word JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hadith Categories
CREATE TABLE IF NOT EXISTS public.hadith_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_ur TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hadiths
CREATE TABLE IF NOT EXISTS public.hadiths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.hadith_categories(id),
  arabic_text TEXT NOT NULL,
  english_translation TEXT,
  urdu_translation TEXT,
  narrator TEXT,
  source TEXT NOT NULL,
  hadith_number TEXT,
  explanation TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dua_id UUID NOT NULL REFERENCES public.duas(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL
);

-- ============================================================
-- 3. DATABASE FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

-- ============================================================
-- 4. TRIGGERS
-- ============================================================

-- Auto-update updated_at on duas
DROP TRIGGER IF EXISTS update_duas_updated_at ON public.duas;
CREATE TRIGGER update_duas_updated_at
  BEFORE UPDATE ON public.duas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update updated_at on hadiths
DROP TRIGGER IF EXISTS update_hadiths_updated_at ON public.hadiths;
CREATE TRIGGER update_hadiths_updated_at
  BEFORE UPDATE ON public.hadiths
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Categories RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories are publicly readable" ON public.categories;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Duas RLS
ALTER TABLE public.duas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Duas are publicly readable" ON public.duas;
CREATE POLICY "Duas are publicly readable" ON public.duas FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert duas" ON public.duas;
CREATE POLICY "Admins can insert duas" ON public.duas FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update duas" ON public.duas;
CREATE POLICY "Admins can update duas" ON public.duas FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete duas" ON public.duas;
CREATE POLICY "Admins can delete duas" ON public.duas FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Hadith Categories RLS
ALTER TABLE public.hadith_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Hadith categories are publicly readable" ON public.hadith_categories;
CREATE POLICY "Hadith categories are publicly readable" ON public.hadith_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert hadith categories" ON public.hadith_categories;
CREATE POLICY "Admins can insert hadith categories" ON public.hadith_categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update hadith categories" ON public.hadith_categories;
CREATE POLICY "Admins can update hadith categories" ON public.hadith_categories FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete hadith categories" ON public.hadith_categories;
CREATE POLICY "Admins can delete hadith categories" ON public.hadith_categories FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Hadiths RLS
ALTER TABLE public.hadiths ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Hadiths are publicly readable" ON public.hadiths;
CREATE POLICY "Hadiths are publicly readable" ON public.hadiths FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert hadiths" ON public.hadiths;
CREATE POLICY "Admins can insert hadiths" ON public.hadiths FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update hadiths" ON public.hadiths;
CREATE POLICY "Admins can update hadiths" ON public.hadiths FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete hadiths" ON public.hadiths;
CREATE POLICY "Admins can delete hadiths" ON public.hadiths FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Favorites RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can add favorites" ON public.favorites;
CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can remove favorites" ON public.favorites;
CREATE POLICY "Users can remove favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- User Roles RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- 6. SEED DATA - CATEGORIES
-- ============================================================

INSERT INTO public.categories (id, name, name_ar, name_ur, icon, sort_order) VALUES
  ('a41d775d-0e19-46a3-b1a4-2af9a2fc33b3', 'Morning Duas', 'أذكار الصباح', 'صبح کی دعائیں', 'sunrise', 1),
  ('8c0e505c-019e-406e-bfe9-3ef2bba95c70', 'Evening Duas', 'أذكار المساء', 'شام کی دعائیں', 'sunset', 2),
  ('b6cbe9ad-2d4c-4640-978e-596ee6d9ecc7', 'Sleeping Duas', 'أذكار النوم', 'سونے کی دعائیں', 'moon', 3),
  ('bd9ef935-0699-48dd-9051-3e945210be73', 'Protection Duas', 'أدعية الحماية', 'حفاظت کی دعائیں', 'shield', 4),
  ('a3a84f33-ebef-463e-8f7f-91e63fa5e216', 'Travel Duas', 'أدعية السفر', 'سفر کی دعائیں', 'plane', 5),
  ('cc8e18ea-b85d-4106-be4c-c427fac3bfff', 'Hajj & Umrah Duas', 'أدعية الحج والعمرة', 'حج و عمرہ کی دعائیں', 'kaaba', 6),
  ('0f646bb2-7c5e-4f5e-8e14-bc1d333482fb', 'Forgiveness Duas', 'أدعية الاستغفار', 'استغفار کی دعائیں', 'heart', 7),
  ('66eb26c0-f0f6-45fd-a634-cbfc7b174797', 'Rizq Duas', 'أدعية الرزق', 'رزق کی دعائیں', 'coins', 8),
  ('8cfbc47c-55b1-4aeb-b71d-540cfa6aa04d', 'Marriage Duas', 'أدعية الزواج', 'شادی کی دعائیں', 'rings', 9)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. SEED DATA - DUAS
-- ============================================================

INSERT INTO public.duas (id, category_id, arabic_text, english_translation, urdu_translation, reference, explanation, benefits, audio_url, word_by_word, sort_order) VALUES

-- Morning Duas
('7a388f4e-1e82-4c30-8363-727b88fb0ade', 'a41d775d-0e19-46a3-b1a4-2af9a2fc33b3',
 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
 'We have reached the morning and at this very time the whole kingdom belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent.',
 'ہم نے صبح کی اور اللہ کی بادشاہی نے صبح کی، تمام تعریفیں اللہ کے لیے ہیں، اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اسی کی بادشاہی ہے اور اسی کے لیے تعریف ہے اور وہ ہر چیز پر قادر ہے',
 'Sahih Muslim 2723',
 'This is a comprehensive morning dhikr that acknowledges Allah''s sovereignty over all creation.',
 'Protection throughout the day, acknowledgment of Allah''s lordship',
 NULL, NULL, 1),

('0991822d-2031-4b11-8bbb-dccb7869103b', 'a41d775d-0e19-46a3-b1a4-2af9a2fc33b3',
 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
 'O Allah, by Your grace we have reached the morning, by Your grace we have reached the evening. By Your will we live and die, and unto You is the resurrection.',
 'اے اللہ! تیری مہربانی سے ہم نے صبح کی اور تیری مہربانی سے ہم نے شام کی، تیرے حکم سے ہم جیتے ہیں اور تیرے حکم سے ہم مرتے ہیں اور تیری طرف اٹھنا ہے',
 'Sunan At-Tirmidhi 3391',
 'A beautiful morning supplication recognizing Allah as the source of life and death.',
 'Starting the day in remembrance of Allah',
 NULL, NULL, 2),

-- Evening Duas
('cd175204-54fd-4370-b25d-6f23afad78ad', '8c0e505c-019e-406e-bfe9-3ef2bba95c70',
 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
 'We have reached the evening and at this very time the whole kingdom belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner.',
 'ہم نے شام کی اور اللہ کی بادشاہی نے شام کی، تمام تعریفیں اللہ کے لیے ہیں، اللہ کے سوا کوئی معبود نہیں وہ اکیلا ہے اس کا کوئی شریک نہیں',
 'Sahih Muslim 2723',
 'Evening version of the morning dhikr.',
 'Protection throughout the night',
 NULL, NULL, 1),

('a312d46b-fff2-4c8f-97c2-9d1679ee7cd2', '8c0e505c-019e-406e-bfe9-3ef2bba95c70',
 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
 'میں اللہ کے مکمل کلمات کے ذریعے اس کی پناہ مانگتا ہوں ہر اس چیز کے شر سے جو اس نے پیدا کی',
 'Sahih Muslim 2708',
 'Said three times in the evening for protection.',
 'Protection from all evil, including jinn and harmful creatures',
 NULL, NULL, 2),

-- Sleeping Duas
('d0040891-2654-46ed-b283-aed7dd115010', 'b6cbe9ad-2d4c-4640-978e-596ee6d9ecc7',
 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
 'In Your name, O Allah, I die and I live.',
 'اے اللہ! تیرے نام سے میں مرتا ہوں اور جیتا ہوں',
 'Sahih Bukhari 6324',
 'Said when going to sleep. Sleep is referred to as the minor death.',
 'Remembering Allah before sleep, seeking His protection',
 NULL, NULL, 1),

('ed46cbfe-e403-498c-b412-f11234779a38', 'b6cbe9ad-2d4c-4640-978e-596ee6d9ecc7',
 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
 'O Allah, save me from Your punishment on the Day You resurrect Your servants.',
 'اے اللہ! مجھے اپنے عذاب سے بچا جس دن تو اپنے بندوں کو اٹھائے گا',
 'Sunan Abu Dawud 5045',
 'The Prophet ﷺ used to place his right hand under his cheek and say this three times before sleeping.',
 'Protection from punishment on the Day of Resurrection.',
 NULL, '[{"arabic":"قِنِي","english":"save me"},{"arabic":"عَذَابَكَ","english":"from Your punishment"},{"arabic":"يَوْمَ","english":"on the Day"},{"arabic":"تَبْعَثُ","english":"You resurrect"},{"arabic":"عِبَادَكَ","english":"Your servants"}]'::jsonb, 2),

-- Protection Duas
('371ce1cb-66d9-4c45-8981-94d60bb7ef94', 'bd9ef935-0699-48dd-9051-3e945210be73',
 'بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
 'In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, All-Knowing.',
 'اللہ کے نام سے جس کے نام کے ساتھ نہ زمین میں کوئی چیز نقصان دے سکتی ہے نہ آسمان میں اور وہ سب کچھ سننے والا جاننے والا ہے',
 'Sunan Abu Dawud 5088',
 'Said three times morning and evening. The Prophet ﷺ said nothing will harm the one who recites this.',
 'Complete protection from all harm',
 NULL, NULL, 1),

('086179a9-5998-4834-bd8e-20c396107fed', 'bd9ef935-0699-48dd-9051-3e945210be73',
 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ',
 'O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.',
 'اے اللہ! میں تیری پناہ مانگتا ہوں فکر اور غم سے، عاجزی اور سستی سے، بزدلی اور کنجوسی سے، قرض کے بوجھ اور لوگوں کے غلبے سے',
 'Sahih Bukhari 6369',
 'A comprehensive dua covering protection from spiritual and worldly difficulties.',
 'Relief from anxiety, depression, debt, and oppression',
 NULL, NULL, 2),

-- Travel Duas
('d28d3aef-0578-44cd-84df-ab98131056ed', 'a3a84f33-ebef-463e-8f7f-91e63fa5e216',
 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ',
 'Glory to Him who has subjected this to us, and we could never have it by our efforts. And verily, to Our Lord we indeed are to return.',
 'پاک ہے وہ ذات جس نے اسے ہمارے لیے مسخر کیا اور ہم اسے قابو میں نہیں لا سکتے تھے اور بلاشبہ ہم اپنے رب کی طرف لوٹنے والے ہیں',
 'Quran 43:13-14',
 'The dua prescribed for when mounting any vehicle or beginning a journey.',
 'Safety during travel, remembrance of return to Allah',
 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/4770.mp3', NULL, 1),

('ae7ddb45-4e87-4f97-9ca1-1b0c65b94c74', 'a3a84f33-ebef-463e-8f7f-91e63fa5e216',
 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى',
 'O Allah, we ask You in this journey of ours for righteousness, taqwa, and deeds which please You.',
 'اے اللہ! ہم تجھ سے اس سفر میں نیکی اور تقویٰ مانگتے ہیں اور ایسے عمل کی توفیق جس سے تو راضی ہو',
 'Sahih Muslim 1342',
 'Part of the comprehensive travel supplication taught by the Prophet ﷺ.',
 'Righteousness and piety during travel.',
 NULL, '[{"arabic":"نَسْأَلُكَ","english":"we ask You"},{"arabic":"سَفَرِنَا","english":"our journey"},{"arabic":"الْبِرَّ","english":"righteousness"},{"arabic":"التَّقْوَى","english":"piety"},{"arabic":"مَا تَرْضَى","english":"what pleases You"}]'::jsonb, 2),

-- Hajj & Umrah Duas
('fb08faec-13c9-4e11-a1a5-0ef412179d4b', 'cc8e18ea-b85d-4106-be4c-c427fac3bfff',
 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ',
 'Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Verily all praise and blessings are Yours, and all sovereignty. You have no partner.',
 'حاضر ہوں اے اللہ حاضر ہوں، حاضر ہوں تیرا کوئی شریک نہیں حاضر ہوں، بے شک تمام تعریف اور نعمت تیرے لیے ہے اور بادشاہی بھی، تیرا کوئی شریک نہیں',
 'Sahih Bukhari 1549',
 'The Talbiyah - recited during Hajj and Umrah.',
 'Essential dhikr of Hajj and Umrah',
 NULL, NULL, 1),

('f7ae477e-a9f0-4c08-b017-ef840d1ac68a', 'cc8e18ea-b85d-4106-be4c-c427fac3bfff',
 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
 'اے ہمارے رب! ہمیں دنیا میں بھی بھلائی دے اور آخرت میں بھی بھلائی دے اور ہمیں آگ کے عذاب سے بچا',
 'Quran 2:201',
 'The most frequently made dua by the Prophet ﷺ, especially between Rukn Yamani and Hajar Aswad during Tawaf.',
 'Comprehensive dua for good in both worlds and protection from Hell.',
 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2735.mp3',
 '[{"arabic":"رَبَّنَا","english":"Our Lord"},{"arabic":"آتِنَا","english":"give us"},{"arabic":"حَسَنَةً","english":"good"},{"arabic":"فِي الدُّنْيَا","english":"in this world"},{"arabic":"فِي الْآخِرَةِ","english":"in the Hereafter"},{"arabic":"عَذَابَ النَّارِ","english":"punishment of Fire"}]'::jsonb, 2),

-- Forgiveness Duas
('bc08b18d-696d-4572-a652-29648a17c2fc', '0f646bb2-7c5e-4f5e-8e14-bc1d333482fb',
 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
 'I seek forgiveness from Allah the Almighty, besides whom there is no deity, the Ever-Living, the Sustainer of existence, and I repent to Him.',
 'میں اللہ عظیم سے بخشش مانگتا ہوں جس کے سوا کوئی معبود نہیں، وہ زندہ ہے اور قائم رکھنے والا ہے اور میں اس کی طرف توبہ کرتا ہوں',
 'Sunan Abu Dawud 1517',
 'The Prophet ﷺ said whoever says this, Allah will forgive him even if he has fled from battle.',
 'Forgiveness of all sins',
 NULL, NULL, 1),

('b134c4e4-2ea0-41a7-a181-0a134ac84ede', '0f646bb2-7c5e-4f5e-8e14-bc1d333482fb',
 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ',
 'O Allah, You are my Lord. None has the right to be worshipped except You. You created me and I am Your servant, and I abide to Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for none forgives sin except You.',
 'اے اللہ! تو میرا رب ہے، تیرے سوا کوئی معبود نہیں، تو نے مجھے پیدا کیا اور میں تیرا بندہ ہوں، میں تیرے عہد اور وعدے پر قائم ہوں جہاں تک مجھ سے ہو سکے، میں اپنے کیے ہوئے کے شر سے تیری پناہ مانگتا ہوں',
 'Sahih Bukhari 6306',
 'Sayyid al-Istighfar - The master of seeking forgiveness. The Prophet ﷺ said whoever says it during the day with firm faith and dies the same day, enters Paradise.',
 'The highest form of seeking forgiveness, a path to Paradise',
 NULL, NULL, 2),

-- Rizq Duas
('00cee80d-9dff-4b61-b638-d63e9f9face3', '66eb26c0-f0f6-45fd-a634-cbfc7b174797',
 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا',
 'O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.',
 'اے اللہ! میں تجھ سے نفع بخش علم، پاکیزہ رزق اور قبول ہونے والا عمل مانگتا ہوں',
 'Sunan Ibn Majah 925',
 'Said after the Fajr prayer. A comprehensive dua for worldly and spiritual success.',
 'Beneficial knowledge, halal sustenance, and accepted worship',
 NULL, NULL, 1),

('5bb33ce2-08ce-4cfd-b33e-7ca30a8ca3f6', '66eb26c0-f0f6-45fd-a634-cbfc7b174797',
 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
 'O Allah, I ask You for guidance, piety, chastity, and self-sufficiency.',
 'اے اللہ! میں تجھ سے ہدایت، تقویٰ، پاکدامنی اور بے نیازی مانگتا ہوں',
 'Sahih Muslim 2721',
 'One of the most frequently made duas of the Prophet ﷺ.',
 'Guidance, piety, modesty and independence from creation.',
 NULL, '[{"arabic":"الْهُدَى","english":"guidance"},{"arabic":"التُّقَى","english":"piety"},{"arabic":"الْعَفَافَ","english":"chastity"},{"arabic":"الْغِنَى","english":"self-sufficiency"}]'::jsonb, 2),

-- Marriage Duas
('513f456e-2229-4637-ab1e-54eed4e51fe4', '8cfbc47c-55b1-4aeb-b71d-540cfa6aa04d',
 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
 'Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous.',
 'اے ہمارے رب! ہمیں ہماری بیویوں اور اولاد سے آنکھوں کی ٹھنڈک عطا فرما اور ہمیں متقین کا امام بنا دے',
 'Quran 25:74',
 'A Quranic dua for a blessed marriage and righteous children.',
 'Blessed family life and righteous offspring',
 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2906.mp3', NULL, 1),

('ab4a4c95-7dad-4865-a7a9-719305210907', '8cfbc47c-55b1-4aeb-b71d-540cfa6aa04d',
 'بَارَكَ اللَّهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
 'May Allah bless you, shower His blessings upon you, and join you both in goodness.',
 'اللہ تمہیں برکت دے، تم پر برکت نازل فرمائے اور تم دونوں کو خیر میں جمع کرے',
 'Sunan Abu Dawud 2130',
 'The dua the Prophet ﷺ would make for newlyweds. Said when congratulating a newly married couple.',
 'Blessings for the marriage and unity in goodness.',
 NULL, '[{"arabic":"بَارَكَ","english":"bless"},{"arabic":"اللَّهُ","english":"Allah"},{"arabic":"لَكَ","english":"you"},{"arabic":"وَجَمَعَ","english":"and join"},{"arabic":"بَيْنَكُمَا","english":"you both"},{"arabic":"فِي خَيْرٍ","english":"in goodness"}]'::jsonb, 2)

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 8. SEED DATA - HADITH CATEGORIES
-- ============================================================

INSERT INTO public.hadith_categories (id, name, name_ar, name_ur, icon, sort_order) VALUES
  ('198f74f7-4469-4856-9f82-e57af5114e6b', 'Prayer & Worship', 'الصلاة والعبادة', 'نماز اور عبادت', '🕌', 1),
  ('88546d99-dc33-43b0-9d4d-f81f98d2ed45', 'Good Manners', 'الأخلاق الحسنة', 'اچھے اخلاق', '🤝', 2),
  ('c665bf08-b633-4d74-9fa9-03f62558bd5e', 'Knowledge', 'العلم', 'علم', '📖', 3),
  ('7c526893-ff06-4c78-8a6f-474a2f665ba5', 'Patience & Gratitude', 'الصبر والشكر', 'صبر اور شکر', '💎', 4),
  ('6ce51f44-6fc3-41b9-bf47-a6946ad3ab92', 'Charity & Kindness', 'الصدقة والإحسان', 'صدقہ اور احسان', '💝', 5),
  ('be42f5f6-567a-4e8d-87b4-b6b4a7932843', 'Family & Relations', 'الأسرة والعلاقات', 'خاندان اور رشتے', '👨‍👩‍👧‍👦', 6),
  ('09532bf0-9231-4e96-9e9c-54f44ccd1452', 'Fasting & Ramadan', 'الصيام ورمضان', 'روزہ اور رمضان', '🌙', 7),
  ('e0354b10-c050-48c4-a267-170f3447ddf5', 'Remembrance of Allah', 'ذكر الله', 'ذکر اللہ', '📿', 8),
  ('8228f214-44ea-49a9-9fd8-1f26528a53ad', 'Day of Judgment', 'يوم القيامة', 'قیامت کا دن', '⚖️', 9),
  ('a36bab5c-34e6-47ed-8098-fce46e15405c', 'Sincerity & Intention', 'الإخلاص والنية', 'اخلاص اور نیت', '❤️', 10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 9. SEED DATA - HADITHS
-- ============================================================

INSERT INTO public.hadiths (id, category_id, arabic_text, english_translation, urdu_translation, narrator, source, hadith_number, explanation, sort_order) VALUES

-- Prayer & Worship
('8b36098a-b3e7-4934-b8d2-72b825f8f84d', '198f74f7-4469-4856-9f82-e57af5114e6b',
 'بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ وَإِقَامِ الصَّلَاةِ وَإِيتَاءِ الزَّكَاةِ وَالْحَجِّ وَصَوْمِ رَمَضَانَ',
 'Islam is built upon five pillars: testifying that there is no god but Allah and Muhammad is the Messenger of Allah, establishing prayer, paying Zakat, Hajj, and fasting Ramadan.',
 'اسلام کی بنیاد پانچ ستونوں پر ہے: اس بات کی گواہی دینا کہ اللہ کے سوا کوئی معبود نہیں اور محمد ﷺ اللہ کے رسول ہیں، نماز قائم کرنا، زکوٰۃ دینا، حج کرنا اور رمضان کے روزے رکھنا۔',
 'Ibn Umar (RA)', 'Sahih Bukhari', '8', NULL, 1),

('66d75c6e-8633-4561-a24a-ff6fa062d097', '198f74f7-4469-4856-9f82-e57af5114e6b',
 'الصَّلَاةُ عِمَادُ الدِّينِ فَمَنْ أَقَامَهَا فَقَدْ أَقَامَ الدِّينَ وَمَنْ هَدَمَهَا فَقَدْ هَدَمَ الدِّينَ',
 'Prayer is the pillar of religion. Whoever establishes it has established the religion, and whoever destroys it has destroyed the religion.',
 'نماز دین کا ستون ہے۔ جس نے اسے قائم کیا اس نے دین کو قائم کیا، اور جس نے اسے ڈھایا اس نے دین کو ڈھایا۔',
 'Umar (RA)', 'Sahih Muslim', NULL, NULL, 2),

('06d255e0-70eb-4ab4-b0e9-d9039a179ca7', '198f74f7-4469-4856-9f82-e57af5114e6b',
 'إِنَّ بَيْنَ الرَّجُلِ وَبَيْنَ الشِّرْكِ وَالْكُفْرِ تَرْكَ الصَّلَاةِ',
 'Between a man and shirk and kufr is the abandonment of prayer.',
 'آدمی اور شرک و کفر کے درمیان فرق نماز چھوڑنا ہے۔',
 'Jabir (RA)', 'Sahih Muslim', '82', NULL, 3),

-- Good Manners
('c54b6ca5-fa91-44c1-9231-2c21af3ab5a2', '88546d99-dc33-43b0-9d4d-f81f98d2ed45',
 'إِنَّمَا بُعِثْتُ لِأُتَمِّمَ صَالِحَ الْأَخْلَاقِ',
 'I was sent to perfect good character.',
 'مجھے اچھے اخلاق کی تکمیل کے لیے بھیجا گیا ہے۔',
 'Abu Hurairah (RA)', 'Sahih Bukhari', NULL, NULL, 1),

('e87a8495-b350-45d7-b78f-ff5f1a405cdd', '88546d99-dc33-43b0-9d4d-f81f98d2ed45',
 'أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا',
 'The most complete of the believers in faith is the one with the best character.',
 'مومنوں میں سب سے کامل ایمان والا وہ ہے جس کے اخلاق سب سے اچھے ہوں۔',
 'Abu Hurairah (RA)', 'Sahih Muslim', NULL, NULL, 2),

('239518b2-16cc-4deb-8fc8-dd6cf89d41aa', '88546d99-dc33-43b0-9d4d-f81f98d2ed45',
 'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ',
 'The strong man is not one who wrestles well, but the strong man is one who controls himself when he is angry.',
 'طاقتور وہ نہیں جو کشتی میں جیتے بلکہ طاقتور وہ ہے جو غصے میں اپنے آپ پر قابو رکھے۔',
 'Abu Hurairah (RA)', 'Sahih Bukhari', '6114', NULL, 3),

-- Knowledge
('2a8d778a-058e-4915-9656-6abedeb20b60', 'c665bf08-b633-4d74-9fa9-03f62558bd5e',
 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ',
 'Whoever takes a path in search of knowledge, Allah will make easy for him a path to Paradise.',
 'جو شخص علم کی تلاش میں کوئی راستہ چلے، اللہ اس کے لیے جنت کا راستہ آسان کر دیتا ہے۔',
 'Abu Hurairah (RA)', 'Sahih Muslim', '2699', NULL, 1),

('a0a876f4-44f0-4038-b7b3-c32ec39bace1', 'c665bf08-b633-4d74-9fa9-03f62558bd5e',
 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
 'Seeking knowledge is an obligation upon every Muslim.',
 'علم حاصل کرنا ہر مسلمان پر فرض ہے۔',
 'Anas (RA)', 'Sahih Bukhari', NULL, NULL, 2),

('7e3dbd05-715e-4823-a8b6-ae7e1cb109f7', 'c665bf08-b633-4d74-9fa9-03f62558bd5e',
 'مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ',
 'When Allah wants good for someone, He gives him understanding of the religion.',
 'اللہ جس کے ساتھ بھلائی چاہتا ہے اسے دین کی سمجھ عطا کرتا ہے۔',
 'Muawiyah (RA)', 'Sahih Bukhari', '71', NULL, 3),

-- Patience & Gratitude
('ad260dc4-d9b4-419e-a814-816fb0a597b9', '7c526893-ff06-4c78-8a6f-474a2f665ba5',
 'عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ وَلَيْسَ ذَاكَ لِأَحَدٍ إِلَّا لِلْمُؤْمِنِ إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ',
 'How wonderful is the affair of the believer, for his affairs are all good. If something good happens to him, he is thankful and that is good for him. If something bad happens, he bears it with patience and that is good for him.',
 'مومن کا معاملہ عجیب ہے، اس کا ہر معاملہ خیر ہی ہے۔ اگر خوشی ملے تو شکر کرتا ہے تو یہ اس کے لیے بہتر ہے، اور اگر تکلیف پہنچے تو صبر کرتا ہے تو یہ بھی اس کے لیے بہتر ہے۔',
 'Suhaib (RA)', 'Sahih Muslim', '2999', NULL, 1),

('1752860b-0026-4ea3-b4d5-03119be077e8', '7c526893-ff06-4c78-8a6f-474a2f665ba5',
 'وَمَا أُعْطِيَ أَحَدٌ عَطَاءً خَيْرًا وَأَوْسَعَ مِنَ الصَّبْرِ',
 'No one is given a gift better and more encompassing than patience.',
 'کسی کو صبر سے بہتر اور وسیع تر نعمت نہیں دی گئی۔',
 'Abu Sa''id Al-Khudri (RA)', 'Sahih Bukhari', '1469', NULL, 2),

-- Charity & Kindness
('db705275-f3b0-4db0-aac4-7f9f809e352a', '6ce51f44-6fc3-41b9-bf47-a6946ad3ab92',
 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
 'Your smiling in the face of your brother is charity.',
 'اپنے بھائی کے سامنے مسکرانا بھی صدقہ ہے۔',
 'Abu Dharr (RA)', 'Sahih Muslim', NULL, NULL, 1),

('ab485edd-9280-4921-b9cc-750cf0768870', '6ce51f44-6fc3-41b9-bf47-a6946ad3ab92',
 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
 'Charity does not decrease wealth.',
 'صدقہ مال میں کمی نہیں کرتا۔',
 'Abu Hurairah (RA)', 'Sahih Muslim', '2588', NULL, 2),

('9deb412f-080d-445d-af51-d99c5ab53d1b', '6ce51f44-6fc3-41b9-bf47-a6946ad3ab92',
 'اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ',
 'Protect yourselves from the Fire even if with half a date in charity.',
 'آگ سے بچو چاہے آدھی کھجور کے صدقے سے ہی سہی۔',
 'Adi bin Hatim (RA)', 'Sahih Bukhari', '1417', NULL, 3),

-- Family & Relations
('a7e56687-fa12-491b-80a4-6293b0c70a6b', 'be42f5f6-567a-4e8d-87b4-b6b4a7932843',
 'خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ وَأَنَا خَيْرُكُمْ لِأَهْلِي',
 'The best of you is the one who is best to his family, and I am the best of you to my family.',
 'تم میں سے بہترین وہ ہے جو اپنے گھر والوں کے لیے بہترین ہو، اور میں تم میں سے اپنے گھر والوں کے لیے سب سے بہتر ہوں۔',
 'Aisha (RA)', 'Sahih Muslim', NULL, NULL, 1),

('d2d59c6b-bb47-491a-8d8e-c82b9955c3b0', 'be42f5f6-567a-4e8d-87b4-b6b4a7932843',
 'الْجَنَّةُ تَحْتَ أَقْدَامِ الْأُمَّهَاتِ',
 'Paradise lies at the feet of mothers.',
 'جنت ماؤں کے قدموں تلے ہے۔',
 'Anas (RA)', 'Sahih Muslim', NULL, NULL, 2),

('3a7f709a-e045-413b-bdff-0f3c7d5170ad', 'be42f5f6-567a-4e8d-87b4-b6b4a7932843',
 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَصِلْ رَحِمَهُ',
 'Whoever believes in Allah and the Last Day, let him maintain his family ties.',
 'جو اللہ اور آخرت کے دن پر ایمان رکھتا ہے وہ رشتے ناطے جوڑے۔',
 'Abu Hurairah (RA)', 'Sahih Bukhari', '6138', NULL, 3),

-- Fasting & Ramadan
('f45d8463-8a57-46a9-96ea-c39c98b2f7ef', '09532bf0-9231-4e96-9e9c-54f44ccd1452',
 'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
 'Whoever fasts Ramadan out of faith and seeking reward, his previous sins will be forgiven.',
 'جو شخص ایمان اور ثواب کی نیت سے رمضان کے روزے رکھے، اس کے پچھلے گناہ معاف کر دیے جاتے ہیں۔',
 'Abu Hurairah (RA)', 'Sahih Bukhari', '38', NULL, 1),

('1e7c9298-bd82-4ced-86b0-ca91eb098358', '09532bf0-9231-4e96-9e9c-54f44ccd1452',
 'الصِّيَامُ جُنَّةٌ',
 'Fasting is a shield.',
 'روزہ ڈھال ہے۔',
 'Abu Hurairah (RA)', 'Sahih Bukhari', '1904', NULL, 2),

('17fff12d-b043-411e-9dcd-676b509d3c67', '09532bf0-9231-4e96-9e9c-54f44ccd1452',
 'مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
 'Whoever stands in prayer during Ramadan out of faith and seeking reward, his previous sins will be forgiven.',
 'جو ایمان اور ثواب کی نیت سے رمضان میں قیام کرے اس کے پچھلے گناہ معاف ہو جاتے ہیں۔',
 'Abu Hurairah (RA)', 'Sahih Bukhari', '37', NULL, 3),

-- Remembrance of Allah
('4f0efc32-338c-4fed-bb1e-47f2fbe9d3f7', 'e0354b10-c050-48c4-a267-170f3447ddf5',
 'أَحَبُّ الْكَلَامِ إِلَى اللَّهِ أَرْبَعٌ سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ',
 'The most beloved words to Allah are four: SubhanAllah, Alhamdulillah, La ilaha illallah, Allahu Akbar.',
 'اللہ کے نزدیک سب سے محبوب کلام چار ہیں: سبحان اللہ، الحمد للہ، لا الہ الا اللہ، اللہ اکبر۔',
 'Abu Hurairah (RA)', 'Sahih Muslim', '2137', NULL, 1),

('1da0f8a9-e16f-445f-a34a-baa605357fd9', 'e0354b10-c050-48c4-a267-170f3447ddf5',
 'كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ ثَقِيلَتَانِ فِي الْمِيزَانِ حَبِيبَتَانِ إِلَى الرَّحْمَنِ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
 'Two words that are light on the tongue, heavy on the Scale, and beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil-Azim.',
 'دو کلمے ایسے ہیں جو زبان پر ہلکے، میزان میں بھاری اور رحمان کو محبوب ہیں: سبحان اللہ وبحمدہ، سبحان اللہ العظیم۔',
 'Abu Hurairah (RA)', 'Sahih Bukhari', '6406', NULL, 2),

('b3b41ce2-3674-402f-9e31-c4c0f2222b1e', 'e0354b10-c050-48c4-a267-170f3447ddf5',
 'مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لَا يَذْكُرُ رَبَّهُ مَثَلُ الْحَيِّ وَالْمَيِّتِ',
 'The example of one who remembers his Lord and one who does not is like the example of the living and the dead.',
 'اپنے رب کو یاد کرنے والے اور نہ کرنے والے کی مثال زندہ اور مردے کی طرح ہے۔',
 'Abu Musa (RA)', 'Sahih Bukhari', '6407', NULL, 3),

-- Day of Judgment
('ccdf8eeb-ddb4-47bd-a6e1-40c6af1672f4', '8228f214-44ea-49a9-9fd8-1f26528a53ad',
 'إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ',
 'Allah does not look at your appearance or wealth, but rather He looks at your hearts and deeds.',
 'اللہ تمہاری شکلوں اور مالوں کو نہیں دیکھتا بلکہ وہ تمہارے دلوں اور اعمال کو دیکھتا ہے۔',
 'Abu Hurairah (RA)', 'Sahih Muslim', '2564', NULL, 1),

('5edcf362-74fb-4c3b-808e-799ae413578c', '8228f214-44ea-49a9-9fd8-1f26528a53ad',
 'يُحْشَرُ النَّاسُ يَوْمَ الْقِيَامَةِ حُفَاةً عُرَاةً غُرْلًا',
 'People will be gathered on the Day of Judgment barefoot, naked, and uncircumcised.',
 'قیامت کے دن لوگ ننگے پاؤں، ننگے بدن اٹھائے جائیں گے۔',
 'Aisha (RA)', 'Sahih Bukhari', '6527', NULL, 2),

('a9f3523f-76ce-420b-8f17-02995ccf796d', '8228f214-44ea-49a9-9fd8-1f26528a53ad',
 'أَوَّلُ مَا يُقْضَى بَيْنَ النَّاسِ يَوْمَ الْقِيَامَةِ فِي الدِّمَاءِ',
 'The first matter to be judged between people on the Day of Judgment will be regarding bloodshed.',
 'قیامت کے دن سب سے پہلے لوگوں کے درمیان خون کا فیصلہ ہوگا۔',
 'Ibn Masud (RA)', 'Sahih Bukhari', '6533', NULL, 3),

-- Sincerity & Intention
('e56e11b9-15e1-4db7-835f-4a4a237659dd', 'a36bab5c-34e6-47ed-8098-fce46e15405c',
 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
 'Actions are judged by intentions, and everyone will be rewarded according to what he intended.',
 'اعمال کا دارومدار نیتوں پر ہے اور ہر شخص کو وہی ملے گا جس کی اس نے نیت کی۔',
 'Umar (RA)', 'Sahih Bukhari', '1', NULL, 1),

('6f75715a-ccbd-44ab-a782-3c3bfe9aed6a', 'a36bab5c-34e6-47ed-8098-fce46e15405c',
 'إِنَّ اللَّهَ كَتَبَ الْحَسَنَاتِ وَالسَّيِّئَاتِ ثُمَّ بَيَّنَ ذَلِكَ فَمَنْ هَمَّ بِحَسَنَةٍ فَلَمْ يَعْمَلْهَا كَتَبَهَا اللَّهُ عِنْدَهُ حَسَنَةً كَامِلَةً',
 'Allah has written good deeds and bad deeds. Whoever intends a good deed but does not do it, Allah writes it as a complete good deed.',
 'اللہ نے نیکیاں اور برائیاں لکھ دیں۔ جو نیکی کا ارادہ کرے لیکن عمل نہ کرے تو اللہ اسے پوری نیکی لکھ دیتا ہے۔',
 'Ibn Abbas (RA)', 'Sahih Bukhari', '6491', NULL, 2)

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- END OF BACKUP
-- ============================================================
