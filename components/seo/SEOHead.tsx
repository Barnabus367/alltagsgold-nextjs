/**
 * SEO Head Component für Next.js Pages Router
 * Integriert mit React Helmet für dynamische Meta-Tags
 */

import { Helmet } from 'react-helmet-async';
import { SEOMetadata } from '../../lib/seo';
import { generateCanonicalUrl, SITE_URL } from '../../lib/canonical';

interface SEOHeadProps {
  seo: SEOMetadata;
  canonicalUrl?: string;
}

export function SEOHead({ seo, canonicalUrl }: SEOHeadProps) {
  // Generiere optimierte Canonical URL
  const fullCanonicalUrl = canonicalUrl 
    ? generateCanonicalUrl(canonicalUrl.startsWith('/') ? canonicalUrl.slice(1) : canonicalUrl)
    : SITE_URL;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={seo.openGraph?.title || seo.title} />
      <meta property="og:description" content={seo.openGraph?.description || seo.description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={seo.openGraph?.url ? generateCanonicalUrl(seo.openGraph.url) : fullCanonicalUrl} />
      <meta property="og:site_name" content="AlltagsGold" />
      <meta property="og:locale" content="de_CH" />
      {seo.openGraph?.image && (
        <>
          <meta property="og:image" content={seo.openGraph.image} />
          <meta property="og:image:alt" content={seo.title} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
        </>
      )}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={seo.twitter?.card || 'summary'} />
      <meta name="twitter:title" content={seo.twitter?.title || seo.title} />
      <meta name="twitter:description" content={seo.twitter?.description || seo.description} />
      {seo.twitter?.image && <meta name="twitter:image" content={seo.twitter.image} />}
      
      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="AlltagsGold" />
      <meta name="language" content="de" />
      
      {/* Structured Data for Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "AlltagsGold",
          "url": SITE_URL,
          "logo": `${SITE_URL}/logo.png`,
          "description": "Moderne Alltagsprodukte für die Schweiz",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "CH"
          }
        })}
      </script>
    </Helmet>
  );
}