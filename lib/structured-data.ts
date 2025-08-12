/**
 * Structured Data (Rich Snippets) für Google Search Console
 * Implementiert Schema.org Best Practices für E-Commerce
 */

import { ShopifyProduct, ShopifyCollection } from '../types/shopify';
import { SITE_URL } from './canonical';

// Schema.org Base Types
export interface StructuredDataBase {
  '@context': 'https://schema.org';
  '@type': string;
}

export interface AggregateRating {
  '@type': 'AggregateRating';
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export interface Review {
  '@type': 'Review';
  author: {
    '@type': 'Person';
    name: string;
  };
  reviewRating: {
    '@type': 'Rating';
    ratingValue: number;
    bestRating?: number;
  };
  reviewBody?: string;
}

export interface BreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

export interface BreadcrumbList {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
}

export interface Offer {
  '@type': 'Offer';
  url: string;
  priceCurrency: string;
  price: string;
  availability: string;
  seller: {
    '@type': 'Organization';
    name: string;
  };
  condition?: string;
  shippingDetails?: {
    '@type': 'OfferShippingDetails';
    shippingRate: {
      '@type': 'MonetaryAmount';
      value: string;
      currency: string;
    };
    shippingDestination: {
      '@type': 'DefinedRegion';
      addressCountry: string;
    };
    deliveryTime: {
      '@type': 'ShippingDeliveryTime';
      handlingTime: {
        '@type': 'QuantitativeValue';
        minValue: number;
        maxValue: number;
        unitCode: string;
      };
      transitTime: {
        '@type': 'QuantitativeValue';
        minValue: number;
        maxValue: number;
        unitCode: string;
      };
    };
  };
}

export interface AggregateOffer {
  '@type': 'AggregateOffer';
  lowPrice: string;
  highPrice: string;
  priceCurrency: string;
  offerCount?: number;
  availability?: string;
  url?: string;
  seller?: {
    '@type': 'Organization';
    name: string;
  };
}

export interface ProductStructuredData extends StructuredDataBase {
  '@type': 'Product';
  name: string;
  description: string;
  image: string | string[];
  url: string;
  sku?: string;
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  manufacturer?: {
    '@type': 'Organization';
    name: string;
  };
  category?: string;
  aggregateRating?: AggregateRating;
  review?: Review[];
  offers: Offer | Offer[] | AggregateOffer;
}

export interface OrganizationStructuredData extends StructuredDataBase {
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  address: {
    '@type': 'PostalAddress';
    addressCountry: string;
    addressLocality?: string;
    postalCode?: string;
    streetAddress?: string;
  };
  contactPoint: {
    '@type': 'ContactPoint';
    telephone?: string;
    contactType: string;
    availableLanguage: string[];
  };
  sameAs?: string[];
}

export interface LocalBusinessStructuredData extends StructuredDataBase {
  '@type': 'LocalBusiness';
  '@id': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  address: {
    '@type': 'PostalAddress';
    addressCountry: string;
    addressLocality: string;
    addressRegion: string;
    postalCode?: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification?: Array<{
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
  priceRange?: string;
  paymentAccepted?: string[];
  areaServed?: {
    '@type': 'Country';
    name: string;
  };
}

export interface WebSiteStructuredData extends StructuredDataBase {
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  potentialAction: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
}

export interface BreadcrumbListStructuredData extends StructuredDataBase {
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string; // Optional für letztes Element (current page)
  }>;
}

/**
 * Generiert Product Rich Snippet für Shopify Produkt
 */
export function generateProductStructuredData(product: ShopifyProduct): ProductStructuredData {
  // Basis Produktdaten
  const productUrl = `${SITE_URL}/products/${product.handle}`;
  const images = product.images?.edges?.map(edge => edge.node.url) || [];
  const mainImage = product.featuredImage?.url || images[0] || `${SITE_URL}/placeholder-product.jpg`;
  
  // Preis und Verfügbarkeit
  const minPrice = parseFloat(product.priceRange.minVariantPrice.amount);
  const maxPrice = parseFloat(product.priceRange.maxVariantPrice?.amount || product.priceRange.minVariantPrice.amount);
  const currency = product.priceRange.minVariantPrice.currencyCode;
  const hasInStockVariant = Array.isArray(product?.variants?.edges)
    ? product.variants.edges.some((edge: any) => edge?.node?.availableForSale)
    : false;
  const availability = hasInStockVariant ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  
  
  // Kategorie aus Collections ableiten
  const category = product.collections?.edges?.[0]?.node?.title || product.productType || 'Haushaltsware';
  
  // Build Offer or AggregateOffer
  const baseShippingDetails = {
    '@type': 'OfferShippingDetails' as const,
    shippingRate: {
      '@type': 'MonetaryAmount' as const,
      value: minPrice >= 60 ? '0' : '4.90',
      currency: 'CHF'
    },
    shippingDestination: {
      '@type': 'DefinedRegion' as const,
      addressCountry: 'CH'
    },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime' as const,
      handlingTime: {
        '@type': 'QuantitativeValue' as const,
        minValue: 1,
        maxValue: 2,
        unitCode: 'DAY'
      },
      transitTime: {
        '@type': 'QuantitativeValue' as const,
        minValue: 1,
        maxValue: 3,
        unitCode: 'DAY'
      }
    }
  };

  const hasMultiplePrices = maxPrice > minPrice;
  const offer: any = hasMultiplePrices
    ? {
        '@type': 'AggregateOffer',
        lowPrice: minPrice.toFixed(2),
        highPrice: maxPrice.toFixed(2),
        priceCurrency: currency,
        offerCount: product?.variants?.edges?.length || 1,
        offers: undefined,
        availability,
        url: productUrl,
        seller: {
          '@type': 'Organization',
          name: 'AlltagsGold'
        }
      }
    : {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: currency,
        price: minPrice.toFixed(2),
        availability,
        seller: {
          '@type': 'Organization',
          name: 'AlltagsGold'
        },
        condition: 'https://schema.org/NewCondition',
        shippingDetails: baseShippingDetails
      };

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `${product.title} günstig kaufen bei AlltagsGold`,
  image: images.length > 0 ? images : [mainImage],
    url: productUrl,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: product.vendor || 'AlltagsGold'
    },
  category,
    offers: offer
  };
}

/**
 * Generiert realistische Produktbewertungen basierend auf Produkttyp und Preis
 */
// AggregateRating intentionally omitted unless real review data is available

/**
 * Generiert Organization Schema für AlltagsGold
 */
export function generateOrganizationStructuredData(): OrganizationStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AlltagsGold',
    url: SITE_URL,
    logo: `${SITE_URL}/logo-alltagsgold.png`,
    description: 'Premium Haushaltshelfer online kaufen Schweiz. Innovative Küchenhelfer & Alltagsprodukte direkt aus CH-Lager.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CH',
      addressLocality: 'Zürich'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['German', 'French', 'Italian', 'English']
    },
    sameAs: [
      'https://www.instagram.com/alltagsgold.ch/',
      'https://www.tiktok.com/@alltagsgold.ch'
    ]
  };
}

/**
 * Generiert LocalBusiness Schema für lokale SEO
 */
export function generateLocalBusinessStructuredData(): LocalBusinessStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#business`,
    name: 'AlltagsGold - Haushaltshelfer & Lifestyle Shop',
    url: SITE_URL,
    logo: `${SITE_URL}/logo-alltagsgold.png`,
    description: 'Haushaltsware online shop Zürich. Küchenhelfer Lieferung Basel, Bern. Lifestyle Produkte Versand ganze Deutschschweiz.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CH',
      addressLocality: 'Zürich',
      addressRegion: 'Zürich'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 47.3769, // Zürich
      longitude: 8.5417
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00'
      }
    ],
    priceRange: 'CHF',
    paymentAccepted: ['Kreditkarte', 'PayPal', 'Twint', 'Rechnung'],
    areaServed: {
      '@type': 'Country',
      name: 'Schweiz'
    }
  };
}

/**
 * Generiert WebSite Schema mit Suchfunktion
 */
export function generateWebSiteStructuredData(): WebSiteStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AlltagsGold - Haushaltsware Schweiz',
    url: SITE_URL,
    description: 'Premium Haushaltsware und Küchenhelfer günstig kaufen. Gratis Versand ab CHF 50, 30 Tage Rückgabe, 4.8★ Bewertungen.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Generiert Breadcrumb Schema mit absoluten URLs für Google Search Console
 * Konvertiert relative URLs automatisch zu absoluten URLs
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>): BreadcrumbListStructuredData {
  // Filtere ungültige Items raus und konvertiere zu absoluten URLs
  const validItems = items
    .filter(item => item.name && item.name.trim()) // Name muss vorhanden sein
    .map((item, index) => {
      let absoluteUrl: string;
      
      // Wenn keine URL oder leere URL, skip das letzte Item (current page)
      // Breadcrumbs ohne URL sind nach Schema.org für das letzte Element erlaubt
      if (!item.url || item.url.trim() === '') {
        // Letztes Element darf ohne URL sein (current page indicator)
        if (index === items.length - 1) {
          return {
            '@type': 'ListItem' as const,
            position: index + 1,
            name: item.name
            // Kein 'item' Feld für current page ist Schema.org konform
          };
        }
        // Andere Elemente müssen URL haben
        return null;
      }
      
      // Wenn bereits absolute URL, verwende sie direkt
      if (item.url.startsWith('http://') || item.url.startsWith('https://')) {
        absoluteUrl = item.url;
      } else {
        // Nutze URL Constructor für sauberes Joining (verhindert doppelte Slashes)
        try {
          // Stelle sicher dass relative URLs mit / beginnen für korrektes Joining
          const relativePath = item.url.startsWith('/') ? item.url : `/${item.url}`;
          absoluteUrl = new URL(relativePath, SITE_URL).toString();
        } catch (error) {
          console.error(`Invalid URL in breadcrumb: ${item.url}`, error);
          // Fallback zu SITE_URL wenn URL ungültig
          absoluteUrl = SITE_URL;
        }
      }
      
      return {
        '@type': 'ListItem' as const,
        position: index + 1,
        name: item.name,
        item: absoluteUrl
      };
    })
    .filter(Boolean) as Array<{
      '@type': 'ListItem';
      position: number;
      name: string;
      item?: string;
    }>;
  
  // Nur Breadcrumb generieren wenn mindestens 1 valides Item vorhanden
  if (validItems.length === 0) {
    console.warn('No valid breadcrumb items provided');
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: []
    };
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: validItems
  };
}

/**
 * Generiert Collection List Schema für Kategorieseiten
 */
export function generateCollectionStructuredData(collection: ShopifyCollection): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.description || `${collection.title} - Premium Produkte bei AlltagsGold`,
    url: `${SITE_URL}/collections/${collection.handle}`,
    image: collection.image?.url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'AlltagsGold',
      url: SITE_URL
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: collection.products?.edges?.length || 0,
      itemListElement: collection.products?.edges?.map((edge, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@id': `${SITE_URL}/products/${edge.node.handle}`,
          name: edge.node.title
        }
      })) || []
    }
  };
}

/**
 * Hilfsfunktion: JSON-LD Script Tag generieren
 */
export function generateStructuredDataScript(data: any): string {
  return JSON.stringify(data, null, 0);
}
