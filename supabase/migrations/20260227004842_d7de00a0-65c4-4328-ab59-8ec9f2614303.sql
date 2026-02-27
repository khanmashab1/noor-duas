
-- Create islamic_books table
CREATE TABLE public.islamic_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT,
  title_ur TEXT,
  author TEXT,
  author_ar TEXT,
  author_ur TEXT,
  description TEXT,
  description_ar TEXT,
  description_ur TEXT,
  cover_image_url TEXT,
  pdf_url TEXT,
  external_link TEXT,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.islamic_books ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Islamic books are publicly readable"
ON public.islamic_books FOR SELECT USING (true);

-- Admin write
CREATE POLICY "Admins can insert islamic books"
ON public.islamic_books FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update islamic books"
ON public.islamic_books FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete islamic books"
ON public.islamic_books FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed some popular Islamic books
INSERT INTO public.islamic_books (title, title_ur, title_ar, author, author_ar, author_ur, description, description_ur, category, sort_order) VALUES
('Riyadh us Saliheen', 'ریاض الصالحین', 'رياض الصالحين', 'Imam An-Nawawi', 'الإمام النووي', 'امام نووی', 'A compilation of verses from the Quran and hadith by Imam an-Nawawi. One of the most widely read books of hadith.', 'قرآن و حدیث کی آیات کا مجموعہ، امام نووی کی تالیف۔', 'hadith', 1),
('Sahih Al-Bukhari', 'صحیح البخاری', 'صحيح البخاري', 'Imam Al-Bukhari', 'الإمام البخاري', 'امام بخاری', 'The most authentic collection of hadith, compiled by Imam Muhammad ibn Ismail al-Bukhari.', 'سب سے مستند حدیث کا مجموعہ، امام بخاری کی تالیف۔', 'hadith', 2),
('Sahih Muslim', 'صحیح مسلم', 'صحيح مسلم', 'Imam Muslim', 'الإمام مسلم', 'امام مسلم', 'Second most authentic hadith collection after Sahih al-Bukhari.', 'صحیح بخاری کے بعد دوسرا مستند حدیث کا مجموعہ۔', 'hadith', 3),
('Hisnul Muslim (Fortress of the Muslim)', 'حصن المسلم', 'حصن المسلم', 'Said bin Ali bin Wahf Al-Qahtani', 'سعيد بن علي بن وهف القحطاني', 'سعید بن علی بن وہف القحطانی', 'A comprehensive collection of authentic duas and supplications from the Quran and Sunnah.', 'قرآن و سنت سے مستند دعاؤں کا جامع مجموعہ۔', 'dua', 4),
('Fazail-e-Amaal', 'فضائل اعمال', 'فضائل الأعمال', 'Maulana Muhammad Zakariya Kandhlawi', 'محمد زكريا الكاندهلوي', 'مولانا محمد زکریا کاندھلوی', 'A well-known book on the virtues of good deeds widely used in Tablighi Jamaat.', 'نیک اعمال کی فضیلت پر مشہور کتاب۔', 'general', 5),
('Bahishti Zewar', 'بہشتی زیور', 'بهشتي زيور', 'Maulana Ashraf Ali Thanvi', 'أشرف علي التهانوي', 'مولانا اشرف علی تھانوی', 'A comprehensive guide to Islamic practices especially popular in South Asia.', 'اسلامی احکام کی جامع کتاب، خاص طور پر جنوبی ایشیا میں مقبول۔', 'fiqh', 6),
('Tafsir Ibn Kathir', 'تفسیر ابن کثیر', 'تفسير ابن كثير', 'Ibn Kathir', 'ابن كثير', 'ابن کثیر', 'One of the most respected and widely used Quran commentaries.', 'قرآن مجید کی سب سے مقبول تفسیر۔', 'tafsir', 7),
('Al-Shifa', 'الشفاء', 'الشفاء', 'Qadi Iyad', 'القاضي عياض', 'قاضی عیاض', 'A comprehensive work on the life and virtues of Prophet Muhammad ﷺ.', 'نبی کریم ﷺ کی سیرت اور فضائل پر جامع کتاب۔', 'seerah', 8),
('Seerat un Nabi ﷺ', 'سیرت النبی ﷺ', 'سيرة النبي ﷺ', 'Allama Shibli Nomani & Syed Sulaiman Nadvi', 'شبلي النعماني وسليمان الندوي', 'علامہ شبلی نعمانی اور سید سلیمان ندوی', 'A detailed biography of Prophet Muhammad ﷺ in Urdu literature.', 'اردو ادب میں نبی کریم ﷺ کی تفصیلی سوانح عمری۔', 'seerah', 9),
('Maariful Quran', 'معارف القرآن', 'معارف القرآن', 'Mufti Muhammad Shafi', 'مفتي محمد شفيع', 'مفتی محمد شفیع', 'A comprehensive Tafsir of the Quran widely studied in South Asia.', 'قرآن مجید کی جامع تفسیر جو جنوبی ایشیا میں بہت پڑھی جاتی ہے۔', 'tafsir', 10);
