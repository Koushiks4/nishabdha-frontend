import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  canonical?: string;
  noIndex?: boolean;
}

const defaultSEO = {
  title: "Nishabdha | Premium Acoustic Solutions & Art",
  description: "Nishabdha provides curated acoustic setups, premium merchandise, and architectural sound-absorbing materials designed for creators and aesthetic spaces.",
  keywords: "acoustic panels, sound absorption, studio design, architectural acoustics, creator kit, premium acoustic boards, wood wool boards",
  image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop",
  url: "https://nishabdha.com", // Placeholder URL
  type: "website"
};

export default function SEO({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type, 
  canonical,
  noIndex = false
}: SEOProps) {
  const seoTitle = title ? `${title} | Nishabdha` : defaultSEO.title;
  const seoDescription = description || defaultSEO.description;
  const seoKeywords = keywords || defaultSEO.keywords;
  const seoImage = image || defaultSEO.image;
  const seoUrl = url ? `${defaultSEO.url}${url}` : defaultSEO.url;
  const seoType = type || defaultSEO.type;
  const seoCanonical = canonical ? `${defaultSEO.url}${canonical}` : seoUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow" />}
      <link rel="canonical" href={seoCanonical} />

      {/* Open Graph */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:type" content={seoType} />
      <meta property="og:site_name" content="Nishabdha" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
    </Helmet>
  );
}
