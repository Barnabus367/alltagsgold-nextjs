/**
 * Next.js Native SEO Head Component mit Rich Snippets
 * Ersetzt React Helmet für bessere SSR-Kompatibilität
 */

import Head from 'next/head';
import { SEOMetadata } from '../../lib/seo';
import { generateCanonicalUrl, SITE_URL } from '../../lib/canonical';
import { 
  generateOrganizationStructuredData, 
  generateWebSiteStructuredData,
  generateStructuredDataScript
} from '../../lib/structured-data';

interface NextSEOHeadProps {
  seo: SEOMetadata;
  canonicalUrl?: string;
  structuredData?: any | any[]; // Zusätzliche Schema.org Daten (z.B. Product, Breadcrumb)
  includeOrganization?: boolean; // Standard Organization Schema inkludieren
  includeWebSite?: boolean; // Standard WebSite Schema inkludieren
}

export function NextSEOHead({ 
  seo, 
  canonicalUrl, 
  structuredData, 
  includeOrganization = true, 
  includeWebSite = false 
}: NextSEOHeadProps) {
  // Generiere optimierte Canonical URL
  const fullCanonicalUrl = canonicalUrl 
    ? generateCanonicalUrl(canonicalUrl.startsWith('/') ? canonicalUrl.slice(1) : canonicalUrl)
    : SITE_URL;

  // Sammle alle Structured Data
  const allStructuredData = [];
  
  // Standard Organization Schema (außer bei Produktseiten)
  if (includeOrganization) {
    allStructuredData.push(generateOrganizationStructuredData());
  }
  
  // WebSite Schema (nur auf Homepage)
  if (includeWebSite) {
    allStructuredData.push(generateWebSiteStructuredData());
  }
  
  // Zusätzliche Structured Data (z.B. Product, Breadcrumb)
  if (structuredData) {
    if (Array.isArray(structuredData)) {
      allStructuredData.push(...structuredData);
    } else {
      allStructuredData.push(structuredData);
    }
  }

  return (
    <Head>
      {/* Basic Meta Tags mit Keys für Deduplizierung */}
      <title key="title">{seo.title}</title>
      <meta name="description" content={seo.description} key="description" />
      {seo.keywords && <meta name="keywords" content={seo.keywords} key="keywords" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} key="canonical" />
      
      {/* Open Graph Tags mit Keys */}
      <meta property="og:title" content={seo.openGraph?.title || seo.title} key="og:title" />
      <meta property="og:description" content={seo.openGraph?.description || seo.description} key="og:description" />
      <meta property="og:type" content="website" key="og:type" />
      <meta property="og:url" content={seo.openGraph?.url ? generateCanonicalUrl(seo.openGraph.url) : fullCanonicalUrl} key="og:url" />
      <meta property="og:site_name" content="AlltagsGold" key="og:site_name" />
      <meta property="og:locale" content="de_CH" key="og:locale" />
      {seo.openGraph?.image && (
        <>
          <meta property="og:image" content={seo.openGraph.image} key="og:image" />
          <meta property="og:image:alt" content={seo.title} key="og:image:alt" />
          <meta property="og:image:width" content="1200" key="og:image:width" />
          <meta property="og:image:height" content="630" key="og:image:height" />
        </>
      )}
      
      {/* Twitter Card Tags mit Keys */}
      <meta name="twitter:card" content={seo.twitter?.card || 'summary'} key="twitter:card" />
      <meta name="twitter:title" content={seo.twitter?.title || seo.title} key="twitter:title" />
      <meta name="twitter:description" content={seo.twitter?.description || seo.description} key="twitter:description" />
      {seo.twitter?.image && <meta name="twitter:image" content={seo.twitter.image} key="twitter:image" />}
      
      {/* hreflang Tags for DACH Region */}
      <link rel="alternate" hrefLang="de-CH" href={fullCanonicalUrl} key="hreflang-ch" />
      <link rel="alternate" hrefLang="de-DE" href={fullCanonicalUrl} key="hreflang-de" />
      <link rel="alternate" hrefLang="de-AT" href={fullCanonicalUrl} key="hreflang-at" />
      <link rel="alternate" hrefLang="x-default" href={fullCanonicalUrl} key="hreflang-default" />
      
      {/* Additional SEO Meta Tags mit Keys */}
      <meta name="robots" content="index, follow" key="robots" />
      <meta name="author" content="AlltagsGold" key="author" />
      <meta name="language" content="de" key="language" />
      <meta name="geo.region" content="CH" key="geo:region" />
      <meta name="geo.placename" content="Schweiz" key="geo:placename" />
      
      {/* Structured Data (JSON-LD) mit eindeutigen Keys */}
      {allStructuredData.map((data, index) => (
        <script
          key={`structured-data-${data['@type']}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateStructuredDataScript(data)
          }}
        />
      ))}
    </Head>
  );
}
