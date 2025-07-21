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
 * Brand-optimierte SEO-Templates nach neuem Schema
 */
const SEO_TEMPLATES = {
  brand: "AlltagsGold",
  productTitleSuffix: "2024 ✓ CH Versand ✓ Top Bewertungen",
  collectionTitleSuffix: "Schweiz ✓ Sofort lieferbar ✓ Top Qualität",
  productDescriptionSuffix: "⭐ 4.8/5 Bewertungen ⭐ Gratis Versand ab CHF 50 ⭐ 30 Tage Rückgabe ⭐ Schweizer Shop",
  collectionDescriptionTemplate: (name: string) => `${name} günstig kaufen Schweiz ✓ Sofort lieferbar ✓ Top Bewertungen ✓ Gratis Versand`,
  fallbacks: {
    default: "AlltagsGold Schweiz ✓ Premium Haushaltsware ✓ Gratis Versand ✓ 4.8★ Bewertungen ✓ Sofort lieferbar",
    products: "Haushaltsware günstig kaufen ✓ Schweizer Shop ✓ Gratis Versand ✓ Top Bewertungen ✓ 30 Tage Rückgabe",
    collections: "Premium Haushaltsgeräte Schweiz ✓ Sofort lieferbar ✓ Top Qualität ✓ Gratis Versand ab CHF 50",
    home: "AlltagsGold - Haushaltsware Schweiz ✓ Gratis Versand ✓ 4.8★ Bewertungen ✓ Sofort lieferbar ✓ Top Preise",
    contact: "AlltagsGold Kontakt Schweiz ✓ Schnelle Hilfe ✓ Kostenlose Beratung ✓ Haushaltsware Experten",
    blog: "Haushalt Tipps & Tricks ✓ Schweizer Ratgeber ✓ Produkttests ✓ Haushaltsware Guide ✓ AlltagsGold Blog"
  }
};

/**
 * Generiert Brand-konformen Title mit Pipe-Trennung
 */
function generateBrandTitle(pageName: string, suffix?: string): string {
  if (!suffix) {
    return `${SEO_TEMPLATES.brand} | ${pageName}`;
  }
  return `${SEO_TEMPLATES.brand} | ${pageName} | ${suffix}`;
}

/**
 * Bereinigt und optimiert Description-Text (auf 150 Zeichen reduziert)
 */
function sanitizeDescription(text: string, maxLength: number = 150): string {
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
 * Erstellt optimierte Product-Description mit Brand-Suffix
 */
function createProductDescription(productDescription: string, productTitle: string): string {
  if (!productDescription) {
    return `${productTitle}. ${SEO_TEMPLATES.productDescriptionSuffix}`;
  }
  
  const cleanDesc = sanitizeDescription(productDescription, 100); // Platz für Suffix lassen
  const suffixLength = SEO_TEMPLATES.productDescriptionSuffix.length + 2; // +2 für ". "
  
  if ((cleanDesc.length + suffixLength) <= 150) {
    return `${cleanDesc}. ${SEO_TEMPLATES.productDescriptionSuffix}`;
  }
  
  // Kürze Description um Platz für Suffix zu schaffen
  const maxDescLength = 150 - suffixLength;
  const shortenedDesc = sanitizeDescription(productDescription, maxDescLength);
  return `${shortenedDesc}. ${SEO_TEMPLATES.productDescriptionSuffix}`;
}

/**
 * Generiert SEO-Metadata für Produktseiten (neues Schema)
 */
export function generateProductSEO(product: any): SEOMetadata {
  const productTitle = product?.title || 'Produkt';
  
  // Neues Title-Schema: alltagsgold | {Produktname} | Jetzt entdecken
  const title = generateBrandTitle(productTitle, SEO_TEMPLATES.productTitleSuffix);
  
  const baseDescription = product?.description || product?.excerpt || '';
  
  // Neue Description mit Brand-Suffix
  let description = createProductDescription(baseDescription, productTitle);
  
  // Fallback falls keine sinnvolle Description erstellt werden kann
  if (!description || description.length < 50) {
    description = SEO_TEMPLATES.fallbacks.products;
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
 * Generiert SEO-Metadata für Collection-Seiten (neues Schema)
 */
export function generateCollectionSEO(collection: any): SEOMetadata {
  const collectionTitle = collection?.title || 'Kollektion';
  
  // Neues Title-Schema: alltagsgold | {Kollektionsname} | Clever & stilvoll
  const title = generateBrandTitle(collectionTitle, SEO_TEMPLATES.collectionTitleSuffix);
  
  const baseDescription = collection?.description || '';
  
  let description: string;
  
  // Prüfe ob eigene Description vorhanden und sinnvoll nutzbar
  if (baseDescription && baseDescription.length > 20) {
    const cleanDesc = sanitizeDescription(baseDescription, 100);
    const template = SEO_TEMPLATES.collectionDescriptionTemplate(collectionTitle);
    
    // Wenn Template + Description zu lang, nutze nur Template
    if ((cleanDesc.length + template.length + 3) <= 150) {
      description = `${cleanDesc}. ${template}`;
    } else {
      description = template;
    }
  } else {
    // Verwende Template mit Collection-Name
    description = SEO_TEMPLATES.collectionDescriptionTemplate(collectionTitle);
  }
  
  // Fallback falls Template zu lang
  if (description.length > 150) {
    description = sanitizeDescription(description, 150);
  }
  
  // Final fallback
  if (!description || description.length < 50) {
    description = SEO_TEMPLATES.fallbacks.collections;
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
 * Generiert SEO-Metadata für statische Seiten (neues Schema)
 */
export function generateStaticPageSEO(pageType: string, customTitle?: string, customDescription?: string): SEOMetadata {
  const staticPageData: Record<string, { pageName: string; description: string; suffix?: string }> = {
    home: {
      pageName: "Haushaltsware günstig kaufen Schweiz ✓ Gratis Versand ✓ Top Bewertungen",
      description: "Haushaltsware & Küchenhelfer günstig kaufen ✓ Schweizer Online Shop ✓ Gratis Versand ab CHF 50 ✓ 4.8★ Bewertungen ✓ 30 Tage Rückgabe ✓ Sofort lieferbar"
    },
    contact: {
      pageName: "Kontakt Haushaltsware Schweiz ✓ Kostenlose Beratung",
      description: SEO_TEMPLATES.fallbacks.contact
    },
    impressum: {
      pageName: "Impressum AlltagsGold Schweiz ✓ Haushaltsware Shop",
      description: "Impressum AlltagsGold - Schweizer Online Shop für Haushaltsware ✓ Premium Küchenhelfer ✓ Rechtliche Informationen"
    },
    datenschutz: {
      pageName: "Datenschutz AlltagsGold ✓ Sichere Daten ✓ Schweizer Standard", 
      description: "Datenschutz AlltagsGold Schweiz ✓ Sichere Datenverarbeitung ✓ DSGVO konform ✓ Transparenter Umgang mit Kundendaten"
    },
    agb: {
      pageName: "AGB Haushaltsware Schweiz ✓ Faire Bedingungen ✓ Schneller Versand",
      description: "AGB AlltagsGold ✓ Faire Geschäftsbedingungen ✓ Gratis Versand ab CHF 50 ✓ 30 Tage Rückgabe ✓ Schweizer Shop"
    },
    blog: {
      pageName: "Haushalt Blog Schweiz ✓ Tipps & Tricks ✓ Produkttests",
      description: SEO_TEMPLATES.fallbacks.blog
    },
    products: {
      pageName: "Alle Haushaltsware Schweiz ✓ Günstig kaufen ✓ Top Qualität",
      description: "Alle Haushaltsware & Küchenhelfer ✓ Schweizer Online Shop ✓ Günstige Preise ✓ Premium Qualität ✓ Gratis Versand ab CHF 50"
    },
    collections: {
      pageName: "Haushaltsware Kategorien Schweiz ✓ Große Auswahl ✓ Top Preise", 
      description: "Haushaltsware Kategorien ✓ Küchenhelfer ✓ Reinigung ✓ Beleuchtung ✓ Schweizer Shop ✓ Günstige Preise ✓ Gratis Versand"
    }
  };

  const pageData = staticPageData[pageType] || {
    pageName: customTitle || "Seite",
    description: customDescription || SEO_TEMPLATES.fallbacks.default
  };

  // Generiere Title nach neuem Schema
  const title = pageType === 'home' 
    ? generateBrandTitle(pageData.pageName) // Startseite ohne Suffix
    : generateBrandTitle(pageData.pageName, pageData.suffix);

  return {
    title,
    description: sanitizeDescription(pageData.description),
    openGraph: {
      title,
      description: pageData.description,
      url: pageType === 'home' ? '/' : `/${pageType}`
    },
    twitter: {
      card: 'summary',
      title,
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
 * Validierung für Build-Zeit: Prüft neues SEO-Schema (150 Zeichen Limit)
 */
export function validateSEOMetadata(metadata: SEOMetadata, pagePath: string): boolean {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  if (!metadata.title) {
    issues.push('Missing title');
  } else {
    // Prüfe Brand-Schema: alltagsgold | Inhalt | Suffix
    if (!metadata.title.startsWith('alltagsgold |')) {
      warnings.push('Title should follow brand schema: alltagsgold | Content | Suffix');
    }
    if (metadata.title.length > 60) {
      warnings.push(`Title long (${metadata.title.length} chars, optimal < 60)`);
    }
  }
  
  if (!metadata.description) {
    issues.push('Missing description');
  } else if (metadata.description.length > 150) {
    issues.push(`Description too long (${metadata.description.length} chars, max 150)`);
  } else if (metadata.description.length < 50) {
    issues.push(`Description too short (${metadata.description.length} chars, min 50)`);
  }
  
  if (warnings.length > 0) {
    console.log(`SEO warnings for ${pagePath}:`, warnings.join(', '));
  }
  
  if (issues.length > 0) {
    console.warn(`SEO issues for ${pagePath}:`, issues.join(', '));
    return false;
  }
  
  return true;
}