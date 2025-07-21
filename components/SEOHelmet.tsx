import { Helmet } from 'react-helmet-async';
import { ShopifyProduct, ShopifyCollection } from '@/types/shopify';

interface BreadcrumbItem {
  name: string;
  url: string;
  position: number;
}

interface SEOHelmetProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  product?: ShopifyProduct;
  collection?: ShopifyCollection;
  type?: 'website' | 'product' | 'article';
  totalPages?: number;
  isProduct?: boolean;
  breadcrumbs?: BreadcrumbItem[];
}

export function SEOHelmet({
  title,
  description,
  canonicalUrl,
  ogImage,
  product,
  collection,
  type = 'website',
  totalPages,
  isProduct = false,
  breadcrumbs
}: SEOHelmetProps) {
  const siteName = 'AlltagsGold';
  
  // Generate canonical URL based on current route - safe for SSR
  const siteUrl = 'https://www.alltagsgold.ch';
  
  // Safe canonical URL generation with page detection
  let canonical = siteUrl;
  let prevPage: string | null = null;
  let nextPage: string | null = null;
  let currentPage = 1;

  try {
    if (typeof window !== 'undefined' && window.location) {
      // Generate dynamic canonical URL based on current route
      const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
      
      // Handle pagination - canonical should point to main page without parameters
      const url = new URL(window.location.href);
      const page = url.searchParams.get('page');
      currentPage = Number(page) || 1;
      
      // For paginated pages, canonical points to main page (without ?page=X)
      canonical = canonicalUrl;

      // Calculate prev/next pages safely
      if (currentPage > 1) {
        prevPage = currentPage === 2 
          ? canonicalUrl 
          : `${canonicalUrl}?page=${currentPage - 1}`;
      }
      if (totalPages && currentPage < totalPages) {
        nextPage = `${canonicalUrl}?page=${currentPage + 1}`;
      }
    }
  } catch (error) {
    // Fallback to base URL if any error occurs
    canonical = siteUrl;
  }

  // Dynamic title with page numbering
  const pageTitle = currentPage > 1 ? `${title} – Seite ${currentPage}` : title;
  const fullTitle = pageTitle.includes(siteName) ? pageTitle : `${pageTitle} | ${siteName}`;
  
  // Dynamic description for paginated pages
  const pageDescription = currentPage > 1 ? `${description} - Seite ${currentPage}` : description;

  // Default OG image fallback
  const defaultOgImage = `${siteUrl}/og-default.jpg`;
  const ogImageUrl = ogImage || defaultOgImage;

  // Generate structured data for products
  const generateProductStructuredData = (product: ShopifyProduct) => {
    const primaryImage = product.images.edges[0]?.node;
    const primaryVariant = product.variants.edges[0]?.node;
    
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.title,
      "description": product.description,
      "image": primaryImage?.url || ogImageUrl,
      "url": canonical,
      "brand": {
        "@type": "Brand",
        "name": siteName
      },
      "offers": {
        "@type": "Offer",
        "price": primaryVariant?.price.amount || "0",
        "priceCurrency": primaryVariant?.price.currencyCode || "CHF",
        "availability": primaryVariant?.availableForSale 
          ? "https://schema.org/InStock" 
          : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": siteName
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127"
      }
    };
  };

  // Generate breadcrumb structured data
  const generateBreadcrumbStructuredData = (breadcrumbs: BreadcrumbItem[]) => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((breadcrumb) => ({
        "@type": "ListItem",
        "position": breadcrumb.position,
        "name": breadcrumb.name,
        "item": breadcrumb.url
      }))
    };
  };

  return (
    <Helmet>
      {/* Basic Meta Tags with Dynamic Pagination */}
      <title>{fullTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonical} />
      {prevPage && <link rel="prev" href={prevPage} />}
      {nextPage && <link rel="next" href={nextPage} />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="de_CH" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImageUrl} />



      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="German" />
      <meta name="geo.region" content="CH" />
      <meta name="geo.placename" content="Switzerland" />

      {/* Enhanced Product Structured Data */}
      {isProduct && product && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.title,
            "image": product.images.edges.map(edge => edge.node.url),
            "description": product.description,
            "sku": product.variants.edges[0]?.node.id || product.handle,
            "brand": {
              "@type": "Brand",
              "name": product.vendor || siteName
            },
            "offers": {
              "@type": "Offer",
              "priceCurrency": product.variants.edges[0]?.node.price.currencyCode || "CHF",
              "price": product.variants.edges[0]?.node.price.amount || "0",
              "url": canonical,
              "availability": product.variants.edges[0]?.node.availableForSale 
                ? "https://schema.org/InStock" 
                : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": siteName
              }
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "127"
            }
          }, null, 2)}
        </script>
      )}
      
      {/* Fallback Product Structured Data */}
      {!isProduct && product && (
        <script type="application/ld+json">
          {JSON.stringify(generateProductStructuredData(product), null, 2)}
        </script>
      )}

      {/* Collection/Category Structured Data */}
      {collection && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": collection.title,
            "description": collection.description,
            "url": canonical,
            "mainEntity": {
              "@type": "ItemList",
              "name": collection.title,
              "numberOfItems": collection.products.edges.length
            }
          }, null, 2)}
        </script>
      )}

      {/* Breadcrumb Structured Data */}
      {breadcrumbs && breadcrumbs.length > 1 && (
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbStructuredData(breadcrumbs), null, 2)}
        </script>
      )}

      {/* Organization Structured Data for Homepage */}
      {type === 'website' && canonicalUrl === '/' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": siteName,
            "url": siteUrl,
            "logo": `${siteUrl}/logo.png`,
            "description": "Premium Lifestyle-Produkte für den Alltag - Entdecken Sie unsere kuratierte Auswahl hochwertiger Artikel.",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "CH"
            },
            "sameAs": [
              "https://www.instagram.com/alltagsgold",
              "https://www.facebook.com/alltagsgold"
            ]
          }, null, 2)}
        </script>
      )}
    </Helmet>
  );
}