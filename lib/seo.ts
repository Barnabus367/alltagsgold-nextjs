/**
 * Zentrale SEO-Logik für AlltagsGold
 * Generiert optimierte Meta-Descriptions für alle Seitentypen
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  openGraph?: {
    title: string;
    description: string;
    image?: string;
    url?: string;
  };
  twitter?: {
    card: 'summary' | 'summary_large_image';
    title: string;
    description: string;
    image?: string;
  };
}

/**
 * Fallback-Descriptions für verschiedene Seitentypen
 */
const FALLBACK_DESCRIPTIONS = {
  default: "AlltagsGold – Dein Shop für moderne Alltagsprodukte in der Schweiz.",
  products: "Entdecke praktische Haushalts-Gadgets bei AlltagsGold – funktional, modern & schnell geliefert.",
  collections: "Hochwertige Produkte für deinen Alltag – entdecke unsere kuratierten Kollektionen bei AlltagsGold.",
  home: "AlltagsGold bietet innovative Haushalts- und Lifestyle-Produkte für einen modernen Alltag in der Schweiz.",
  contact: "Kontaktiere AlltagsGold – dein Schweizer Shop für moderne Alltagsprodukte. Schnelle Hilfe und Beratung.",
  blog: "Tipps und Inspiration für einen modernen Alltag – der AlltagsGold Blog mit nützlichen Produktratgebern."
};

/**
 * Bereinigt und optimiert Description-Text
 */
function sanitizeDescription(text: string, maxLength: number = 160): string {
  if (!text) return '';
  
  // HTML-Tags entfernen
  const cleanText = text.replace(/<[^>]*>/g, '');
  
  // Mehrfache Leerzeichen reduzieren
  const normalizedText = cleanText.replace(/\s+/g, ' ').trim();
  
  // Auf maximale Länge kürzen (aber bei Wortgrenzen)
  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }
  
  const truncated = normalizedText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

/**
 * Generiert SEO-Metadata für Produktseiten
 */
export function generateProductSEO(product: any): SEOMetadata {
  const title = product?.title || 'Produkt';
  const baseDescription = product?.description || product?.excerpt || '';
  
  let description = sanitizeDescription(baseDescription);
  
  // Fallback mit Produktname falls keine Description vorhanden
  if (!description) {
    description = `${title} bei AlltagsGold kaufen – moderne Qualitätsprodukte für deinen Alltag in der Schweiz.`;
    description = sanitizeDescription(description);
  }
  
  // Fallback falls immer noch zu lang
  if (!description || description.length < 50) {
    description = FALLBACK_DESCRIPTIONS.products;
  }

  const imageUrl = product?.image?.url || product?.featuredImage?.url;
  
  return {
    title,
    description,
    keywords: product?.tags?.join(', '),
    openGraph: {
      title,
      description,
      image: imageUrl,
      url: `/products/${product?.handle}`
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      image: imageUrl
    }
  };
}

/**
 * Generiert SEO-Metadata für Collection-Seiten
 */
export function generateCollectionSEO(collection: any): SEOMetadata {
  const title = collection?.title || 'Kollektion';
  const baseDescription = collection?.description || '';
  
  let description = sanitizeDescription(baseDescription);
  
  // Fallback mit Collection-Name
  if (!description) {
    description = `${title} – Entdecke hochwertige Produkte in dieser Kategorie bei AlltagsGold.`;
    description = sanitizeDescription(description);
  }
  
  // Fallback falls immer noch nicht passend
  if (!description || description.length < 50) {
    description = FALLBACK_DESCRIPTIONS.collections;
  }

  const imageUrl = collection?.image?.url || collection?.featuredImage?.url;
  
  return {
    title,
    description,
    keywords: collection?.handle,
    openGraph: {
      title,
      description,
      image: imageUrl,
      url: `/collections/${collection?.handle}`
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      image: imageUrl
    }
  };
}

/**
 * Generiert SEO-Metadata für statische Seiten
 */
export function generateStaticPageSEO(pageType: string, customTitle?: string, customDescription?: string): SEOMetadata {
  const staticPageData: Record<string, { title: string; description: string }> = {
    home: {
      title: "AlltagsGold – Moderne Alltagsprodukte für die Schweiz",
      description: FALLBACK_DESCRIPTIONS.home
    },
    contact: {
      title: "Kontakt – AlltagsGold",
      description: FALLBACK_DESCRIPTIONS.contact
    },
    impressum: {
      title: "Impressum – AlltagsGold",
      description: "Rechtliche Informationen und Impressum von AlltagsGold, deinem Schweizer Shop für moderne Alltagsprodukte."
    },
    datenschutz: {
      title: "Datenschutz – AlltagsGold", 
      description: "Datenschutzerklärung von AlltagsGold – Transparente Informationen zum Umgang mit deinen Daten."
    },
    agb: {
      title: "AGB – AlltagsGold",
      description: "Allgemeine Geschäftsbedingungen von AlltagsGold – Alle wichtigen Infos zu Bestellung und Versand."
    },
    blog: {
      title: "Blog – AlltagsGold",
      description: FALLBACK_DESCRIPTIONS.blog
    },
    products: {
      title: "Alle Produkte – AlltagsGold",
      description: FALLBACK_DESCRIPTIONS.products
    },
    collections: {
      title: "Kategorien – AlltagsGold", 
      description: FALLBACK_DESCRIPTIONS.collections
    }
  };

  const pageData = staticPageData[pageType] || {
    title: customTitle || "AlltagsGold",
    description: customDescription || FALLBACK_DESCRIPTIONS.default
  };

  return {
    title: pageData.title,
    description: sanitizeDescription(pageData.description),
    openGraph: {
      title: pageData.title,
      description: pageData.description,
      url: pageType === 'home' ? '/' : `/${pageType}`
    },
    twitter: {
      card: 'summary',
      title: pageData.title,
      description: pageData.description
    }
  };
}

/**
 * Generiert vollständige Metadata für Next.js generateMetadata()
 */
export function generatePageMetadata(seoData: SEOMetadata) {
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    openGraph: {
      title: seoData.openGraph?.title || seoData.title,
      description: seoData.openGraph?.description || seoData.description,
      images: seoData.openGraph?.image ? [seoData.openGraph.image] : undefined,
      url: seoData.openGraph?.url
    },
    twitter: {
      card: seoData.twitter?.card || 'summary',
      title: seoData.twitter?.title || seoData.title,
      description: seoData.twitter?.description || seoData.description,
      images: seoData.twitter?.image ? [seoData.twitter.image] : undefined
    }
  };
}

/**
 * Validierung für Build-Zeit: Prüft ob alle wichtigen SEO-Felder vorhanden sind
 */
export function validateSEOMetadata(metadata: SEOMetadata, pagePath: string): boolean {
  const issues: string[] = [];
  
  if (!metadata.title) {
    issues.push('Missing title');
  }
  
  if (!metadata.description) {
    issues.push('Missing description');
  } else if (metadata.description.length > 160) {
    issues.push(`Description too long (${metadata.description.length} chars, max 160)`);
  } else if (metadata.description.length < 50) {
    issues.push(`Description too short (${metadata.description.length} chars, min 50)`);
  }
  
  if (issues.length > 0) {
    console.warn(`SEO issues for ${pagePath}:`, issues.join(', '));
    return false;
  }
  
  return true;
}