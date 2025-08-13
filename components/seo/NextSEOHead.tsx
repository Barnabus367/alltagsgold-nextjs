/**
 * Next.js Native SEO Head Component mit Rich Snippets
 * Ersetzt React Helmet für bessere SSR-Kompatibilität
 */

import Head from 'next/head';
import { useRouter } from 'next/router';
import { SEOMetadata } from '../../lib/seo';
import { generateCanonicalUrl, SITE_URL, cleanCanonicalPath } from '../../lib/canonical';
import { 
  generateOrganizationStructuredData, 
  generateWebSiteStructuredData,
  generateStructuredDataScript
} from '../../lib/structured-data';

interface NextSEOHeadProps {
  seo: SEOMetadata;
  canonicalUrl?: string; // Kann override sein oder automatisch aus router.asPath
  structuredData?: any | any[]; // Zusätzliche Schema.org Daten (z.B. Product, Breadcrumb)
  includeOrganization?: boolean; // Standard Organization Schema inkludieren
  includeWebSite?: boolean; // Standard WebSite Schema inkludieren
  useRouterPath?: boolean; // Nutze router.asPath für dynamische Canonicals (default: true)
  robots?: string; // Optional override robots content
  hreflangAlternates?: Array<{ hrefLang: string; href: string }>; // Optional: nur rendern, wenn echte Alternates existieren
}

export function NextSEOHead({ 
  seo, 
  canonicalUrl, 
  structuredData, 
  includeOrganization = true, 
  includeWebSite = false,
  useRouterPath = true,
  robots,
  hreflangAlternates
}: NextSEOHeadProps) {
  const router = useRouter();
  
  // Intelligente Canonical URL Generierung
  let fullCanonicalUrl: string;
  
  if (canonicalUrl) {
    // Explizit übergebene Canonical URL verwenden
    fullCanonicalUrl = generateCanonicalUrl(
      canonicalUrl.startsWith('/') ? canonicalUrl.slice(1) : canonicalUrl
    );
  } else if (useRouterPath && router.asPath) {
    // Dynamisch aus router.asPath generieren (entfernt Varianten-Parameter etc.)
    const cleanPath = cleanCanonicalPath(router.asPath);
    fullCanonicalUrl = generateCanonicalUrl(
      cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath
    );
  } else {
    // Fallback zu Homepage
    fullCanonicalUrl = SITE_URL;
  }

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
  <meta property="og:type" content={seo.openGraph?.type || 'website'} key="og:type" />
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
      
      {/* hreflang Alternates (opt-in) */}
      {Array.isArray(hreflangAlternates) && hreflangAlternates.length > 0 && (
        hreflangAlternates.map((alt, i) => (
          <link rel="alternate" hrefLang={alt.hrefLang} href={alt.href} key={`hreflang-${alt.hrefLang}-${i}`} />
        ))
      )}
      
      {/* Additional SEO Meta Tags mit Keys */}
  <meta name="robots" content={robots || 'index, follow'} key="robots" />
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
