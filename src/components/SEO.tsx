import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  type?: string;
  breadcrumbs?: BreadcrumbItem[];
  article?: { datePublished?: string; dateModified?: string; author?: string };
  faq?: Array<{ question: string; answer: string }>;
  keywords?: string;
}

const BASE_URL = 'https://noor-duas.vercel.app';
const DEFAULT_TITLE = 'Noor Duas – Authentic Duas & Hadiths from Quran & Sunnah';
const DEFAULT_DESC = 'Authentic Duas & Hadiths from Quran, Sahih Bukhari & Muslim with Arabic, Urdu & English translations. Morning dua, dua for anxiety, Namaz guide & Tasbeeh counter.';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Noor Duas",
  "url": BASE_URL,
  "logo": `${BASE_URL}/favicon.png`,
  "description": "Authentic Islamic resource for Duas and Hadiths from Quran and Sunnah",
  "sameAs": ["https://www.linkedin.com/in/mashab-jadoon-4b546a320"]
};

const APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Noor Duas",
  "url": BASE_URL,
  "applicationCategory": "ReligiousApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": DEFAULT_DESC,
  "inLanguage": ["en", "ar", "ur"],
  "author": ORG_SCHEMA
};

export const SEO = ({ title, description, path = '/', type = 'website', breadcrumbs, article, faq, keywords }: SEOProps) => {
  const fullTitle = title ? `${title} | Noor Duas` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESC;
  const url = `${BASE_URL}${path}`;

  const breadcrumbSchema = breadcrumbs?.length ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": `${BASE_URL}${item.path}`
    }))
  } : null;

  const articleSchema = article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": fullTitle,
    "description": desc,
    "image": OG_IMAGE,
    "url": url,
    "author": { "@type": "Organization", "name": "Noor Duas" },
    "publisher": ORG_SCHEMA,
    ...(article.datePublished && { datePublished: article.datePublished }),
    ...(article.dateModified && { dateModified: article.dateModified }),
    "inLanguage": "en"
  } : null;

  const faqSchema = faq?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": { "@type": "Answer", "text": item.answer }
    }))
  } : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />

      {/* Hreflang */}
      <link rel="alternate" hrefLang="en" href={url} />
      <link rel="alternate" hrefLang="ur" href={url} />
      <link rel="alternate" hrefLang="ar" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      {/* OpenGraph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Noor Duas" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ur_PK" />
      <meta property="og:locale:alternate" content="ar_SA" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={OG_IMAGE} />

      {/* Structured Data */}
      {path === '/' && (
        <>
          <script type="application/ld+json">{JSON.stringify(APP_SCHEMA)}</script>
          <script type="application/ld+json">{JSON.stringify(ORG_SCHEMA)}</script>
        </>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      )}
      {articleSchema && (
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      )}
      {faqSchema && (
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      )}
    </Helmet>
  );
};
