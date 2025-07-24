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
      <meta name="geo.region" content="CH" />
      <meta name="geo.placename" content="Schweiz" />
      
      {/* Structured Data (JSON-LD) */}
      {allStructuredData.map((data, index) => (
        <script
          key={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateStructuredDataScript(data)
          }}
        />
      ))}
    </Head>
  );
}
