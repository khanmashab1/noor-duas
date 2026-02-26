
-- Create story categories table
CREATE TABLE public.story_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text,
  name_ur text,
  icon text,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.story_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Story categories are publicly readable" ON public.story_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert story categories" ON public.story_categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update story categories" ON public.story_categories FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete story categories" ON public.story_categories FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create stories table
CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.story_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  title_ar text,
  title_ur text,
  content text NOT NULL,
  content_ar text,
  content_ur text,
  source text,
  image_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stories are publicly readable" ON public.stories FOR SELECT USING (true);
CREATE POLICY "Admins can insert stories" ON public.stories FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update stories" ON public.stories FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete stories" ON public.stories FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed story categories
INSERT INTO public.story_categories (name, name_ar, name_ur, icon, sort_order) VALUES
  ('Stories of Prophet Muhammad ﷺ', 'قصص النبي محمد ﷺ', 'حضرت محمد ﷺ کے واقعات', 'mosque', 1),
  ('Stories of the Prophets', 'قصص الأنبياء', 'انبیاء کے واقعات', 'book', 2),
  ('Stories of the Sahaba', 'قصص الصحابة', 'صحابہ کرام کے واقعات', 'users', 3);

-- Seed a few initial stories (Prophet Muhammad ﷺ)
INSERT INTO public.stories (category_id, title, title_ar, title_ur, content, content_ar, content_ur, source, sort_order) VALUES
(
  (SELECT id FROM public.story_categories WHERE sort_order = 1),
  'The Hijrah to Madinah',
  'الهجرة إلى المدينة',
  'ہجرتِ مدینہ',
  'When persecution in Makkah became unbearable, Allah commanded the Prophet ﷺ and his companions to migrate to Madinah. The Prophet ﷺ left with Abu Bakr (RA), hiding in the Cave of Thawr for three days. The Quraysh sent trackers, but Allah protected them. A spider spun a web and a dove nested at the cave entrance. The Prophet ﷺ said to Abu Bakr: "Do not grieve, indeed Allah is with us." (Quran 9:40). They arrived in Quba, where the first mosque was built, and then entered Madinah to a warm welcome from the Ansar.',
  'عندما أصبح الاضطهاد في مكة لا يُطاق، أمر الله النبي ﷺ وصحابته بالهجرة إلى المدينة. خرج النبي ﷺ مع أبي بكر (رضي الله عنه) واختبأ في غار ثور ثلاثة أيام. أرسلت قريش المتعقبين، لكن الله حماهما. نسجت عنكبوت شبكتها وعششت حمامة عند مدخل الغار. قال النبي ﷺ لأبي بكر: "لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا" (التوبة: ٤٠). وصلا إلى قباء حيث بُني أول مسجد، ثم دخلا المدينة باستقبال حار من الأنصار.',
  'جب مکہ میں ظلم ناقابلِ برداشت ہو گیا تو اللہ نے نبی ﷺ اور صحابہ کو مدینہ ہجرت کا حکم دیا۔ نبی ﷺ حضرت ابوبکر (رضی اللہ عنہ) کے ساتھ نکلے اور غارِ ثور میں تین دن چھپے رہے۔ قریش نے تعاقب کرنے والے بھیجے لیکن اللہ نے حفاظت فرمائی۔ ایک مکڑی نے جالا بُن دیا اور کبوتر نے گھونسلا بنا لیا۔ نبی ﷺ نے فرمایا: "غم نہ کرو، بے شک اللہ ہمارے ساتھ ہے۔" (التوبہ: ٤٠)۔ وہ قبا پہنچے جہاں پہلی مسجد بنائی گئی، پھر مدینہ میں انصار کے پُرتپاک استقبال کے ساتھ داخل ہوئے۔',
  'Sahih Bukhari 3615, Quran 9:40',
  1
),
(
  (SELECT id FROM public.story_categories WHERE sort_order = 1),
  'The Treaty of Hudaybiyyah',
  'صلح الحديبية',
  'صلحِ حدیبیہ',
  'In 6 AH, the Prophet ﷺ set out with 1,400 companions for Umrah. The Quraysh blocked them at Hudaybiyyah. Despite apparent disadvantage, the Prophet ﷺ agreed to a 10-year peace treaty. Many companions were upset, but Allah revealed: "Indeed, We have given you a clear conquest." (Quran 48:1). The treaty allowed peaceful dawah, and within two years, Islam spread rapidly. More people accepted Islam in those two years of peace than in all the previous years of conflict combined.',
  'في السنة السادسة للهجرة، خرج النبي ﷺ مع ١٤٠٠ صحابي لأداء العمرة. منعتهم قريش عند الحديبية. رغم الظروف الصعبة، وافق النبي ﷺ على معاهدة سلام لعشر سنوات. تضايق كثير من الصحابة، لكن الله أنزل: "إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا" (الفتح: ١). سمحت المعاهدة بالدعوة السلمية، وخلال عامين انتشر الإسلام بسرعة.',
  '٦ ہجری میں نبی ﷺ ١٤٠٠ صحابہ کے ساتھ عمرہ کے لیے نکلے۔ قریش نے حدیبیہ پر روک لیا۔ ظاہری نقصان کے باوجود نبی ﷺ نے ١٠ سالہ صلح نامے پر رضامندی ظاہر فرمائی۔ بہت سے صحابہ ناراض ہوئے لیکن اللہ نے نازل فرمایا: "بے شک ہم نے تمہیں کھلی فتح دی۔" (الفتح: ١)۔ اس معاہدے سے پُرامن دعوت ممکن ہوئی اور دو سال میں اسلام تیزی سے پھیلا۔',
  'Sahih Bukhari 2731, Quran 48:1',
  2
),
(
  (SELECT id FROM public.story_categories WHERE sort_order = 2),
  'Prophet Ibrahim (AS) and the Fire',
  'إبراهيم عليه السلام والنار',
  'حضرت ابراہیم علیہ السلام اور آگ',
  'Prophet Ibrahim (AS) broke the idols of his people to prove they were powerless. When confronted, he said: "Rather, this - the largest of them - did it, so ask them, if they should speak." (Quran 21:63). His people were furious and decided to burn him. They built a massive fire and catapulted him into it. But Allah commanded: "O fire, be coolness and safety upon Ibrahim." (Quran 21:69). Ibrahim (AS) emerged unharmed, proving that Allah alone has power over all things.',
  'حطّم النبي إبراهيم عليه السلام أصنام قومه ليثبت أنها عاجزة. عندما واجهوه قال: "بَلْ فَعَلَهُ كَبِيرُهُمْ هَٰذَا فَاسْأَلُوهُمْ إِن كَانُوا يَنطِقُونَ" (الأنبياء: ٦٣). غضب قومه وقرروا حرقه. بنوا نارًا عظيمة وقذفوه فيها. لكن الله أمر: "يَا نَارُ كُونِي بَرْدًا وَسَلَامًا عَلَىٰ إِبْرَاهِيمَ" (الأنبياء: ٦٩). خرج إبراهيم سالمًا.',
  'حضرت ابراہیم علیہ السلام نے اپنی قوم کے بت توڑے تاکہ ثابت کریں کہ وہ بے بس ہیں۔ جب سوال ہوا تو فرمایا: "بلکہ ان کے اس بڑے نے کیا ہے، ان سے پوچھو اگر بول سکتے ہیں۔" (الانبیاء: ٦٣)۔ قوم غصے میں آئی اور انہیں جلانے کا فیصلہ کیا۔ بڑی آگ بنائی اور ان کو اس میں پھینکا۔ لیکن اللہ نے حکم دیا: "اے آگ! ابراہیم پر ٹھنڈی اور سلامتی بن جا۔" (الانبیاء: ٦٩)۔ ابراہیم علیہ السلام محفوظ نکل آئے۔',
  'Quran 21:63-69',
  1
),
(
  (SELECT id FROM public.story_categories WHERE sort_order = 3),
  'Abu Bakr (RA) — The Truest Friend',
  'أبو بكر الصديق رضي الله عنه',
  'حضرت ابوبکر صدیق رضی اللہ عنہ',
  'Abu Bakr (RA) was the first adult male to accept Islam. When the Prophet ﷺ told him about the revelation, he believed immediately without hesitation, earning the title "As-Siddiq" (The Truthful). He spent his wealth freeing Muslim slaves like Bilal (RA). During the Hijrah, he accompanied the Prophet ﷺ and risked his life. When the Prophet ﷺ passed away, Umar (RA) was in shock, but Abu Bakr calmly said: "Whoever worshipped Muhammad, let him know that Muhammad has died. And whoever worshipped Allah, let him know that Allah is Ever-Living and shall never die." (Sahih Bukhari 1242)',
  'كان أبو بكر (رضي الله عنه) أول رجل بالغ يسلم. عندما أخبره النبي ﷺ بالوحي، آمن فورًا دون تردد، فنال لقب "الصديق". أنفق ماله في تحرير العبيد المسلمين كبلال (رضي الله عنه). رافق النبي ﷺ في الهجرة وخاطر بحياته. عندما توفي النبي ﷺ وصُدم عمر (رضي الله عنه)، قال أبو بكر بهدوء: "من كان يعبد محمدًا فإن محمدًا قد مات، ومن كان يعبد الله فإن الله حي لا يموت." (البخاري ١٢٤٢)',
  'حضرت ابوبکر (رضی اللہ عنہ) پہلے بالغ مرد تھے جنہوں نے اسلام قبول کیا۔ جب نبی ﷺ نے وحی کی خبر دی تو بلا تأمل ایمان لے آئے اور "صدیق" کا لقب پایا۔ انہوں نے اپنا مال مسلمان غلاموں جیسے بلال (رضی اللہ عنہ) کو آزاد کرانے میں خرچ کیا۔ ہجرت میں نبی ﷺ کے ساتھ رہے۔ جب نبی ﷺ کی وفات ہوئی اور عمر (رضی اللہ عنہ) صدمے میں تھے تو ابوبکر نے فرمایا: "جو محمد کی عبادت کرتا تھا وہ جان لے کہ محمد وفات پا گئے اور جو اللہ کی عبادت کرتا ہے وہ جان لے کہ اللہ زندہ ہے اور کبھی نہیں مرے گا۔" (بخاری ١٢٤٢)',
  'Sahih Bukhari 1242, 3661',
  1
);
