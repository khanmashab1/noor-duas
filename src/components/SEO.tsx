import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  type?: string;
}

const BASE_URL = 'https://noor-duas.vercel.app';
const DEFAULT_TITLE = 'Noor Duas – Quran & Sunnah';
const DEFAULT_DESC = 'Authentic Duas & Hadiths from the Quran and Sahih Hadith with Arabic, Urdu & English translations';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

export const SEO = ({ title, description, path = '/', type = 'website' }: SEOProps) => {
  const fullTitle = title ? `${title} | Noor Duas` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESC;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:site_name" content="Noor Duas" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Helmet>
  );
};
