/**
 * Zentrale SEO-Logik für AlltagsGold
 * Generiert optimierte Meta-Descriptions für alle Seitentypen
 */

import type { BlogPost } from '@/data/blog-posts';

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
  brand: "Alltagsgold",
  homepage: {
    title: "Alltagsgold: Echte Produkte & Schweizer Qualität | Schneller Versand",
    description: "Entdecke einzigartige Produkte direkt aus unserem Schweizer Lager. Bei Alltagsgold findest du Qualität statt Dropshipping. Jetzt stöbern und schnell liefern lassen!"
  },
  productTitleSuffix: "kaufen | Alltagsgold Schweiz",
  collectionTitleSuffix: "| Praktische Produkte bei Alltagsgold",
  productDescriptionTemplate: (productName: string, benefit?: string, price?: string) => {
    const priceText = price ? ` für nur CHF ${price}` : '';
    const base = `${productName}${priceText} bei Alltagsgold kaufen.`;
    const middle = benefit ? ` ${benefit}.` : '';
    const shipping = price && parseFloat(price) >= 50 ? " ✓ Gratis Versand" : " ✓ Versand ab CHF 4.90";
    const suffix = `${shipping} ✓ Schweizer Lager ✓ 1-2 Tage Lieferzeit`;
    return base + middle + suffix;
  },
  collectionDescriptionTemplate: (name: string) => {
    const categoryKeywords: Record<string, string> = {
      'küche': 'Innovative Küchenhelfer & zeitsparende Küchengeräte',
      'haushalt': 'Praktische Haushaltshelfer & Reinigungsgeräte',
      'beauty': 'Selbstpflege Produkte & Beauty Tools',
      'lifestyle': 'Wellness Gadgets & Lifestyle Produkte',
      'aufbewahrung': 'Platzsparende Organizer & Aufbewahrungslösungen'
    };
    const keyword = Object.entries(categoryKeywords).find(([key]) => 
      name.toLowerCase().includes(key)
    )?.[1] || 'Premium Produkte';
    
    return `${keyword} online kaufen Schweiz. ${name} bei Alltagsgold: ✓ Auf Lager ✓ Schneller Versand ✓ Schweizer Shop`;
  },
  fallbacks: {
    default: "Entdecke einzigartige Produkte bei Alltagsgold. Schweizer Qualität, schneller Versand und echte Kundenzufriedenheit.",
    products: "Hochwertige Produkte direkt aus der Schweiz. Bestelle jetzt bei Alltagsgold und profitiere von schnellem Versand.",
    collections: "Entdecke unsere Produktkategorien. Alle Artikel auf Lager in der Schweiz und sofort versandbereit.",
    home: "Entdecke einzigartige Produkte direkt aus unserem Schweizer Lager. Bei Alltagsgold findest du Qualität statt Dropshipping.",
    contact: "Kontaktiere Alltagsgold für Fragen zu deiner Bestellung. Wir helfen dir gerne weiter - schnell und unkompliziert.",
    blog: "Entdecke Tipps, Tricks und Produktneuheiten im Alltagsgold Blog. Praktische Ratschläge für deinen Alltag."
  }
};

/**
 * Generiert Brand-konformen Title mit Pipe-Trennung - ohne Duplikation
 */
function generateBrandTitle(pageName: string, suffix?: string): string {
  // Prüfe ob pageName bereits AlltagsGold enthält
  if (pageName.toLowerCase().includes('alltagsgold')) {
    return suffix ? `${pageName} | ${suffix}` : pageName;
  }
  
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
    return SEO_TEMPLATES.productDescriptionTemplate(productTitle);
  }
  
  const cleanDesc = sanitizeDescription(productDescription, 100); // Platz für Suffix lassen
  const fallbackSuffix = " ✓ Schneller CH-Versand ✓ Kein Dropshipping ✓ 30 Tage Rückgabe";
  const suffixLength = fallbackSuffix.length + 2; // +2 für ". "
  
  if ((cleanDesc.length + suffixLength) <= 150) {
    return `${cleanDesc}. ${fallbackSuffix}`;
  }
  
  // Kürze Description um Platz für Suffix zu schaffen
  const maxDescLength = 150 - suffixLength;
  const shortenedDesc = sanitizeDescription(productDescription, maxDescLength);
  return `${shortenedDesc}. ${fallbackSuffix}`;
}

/**
 * Generiert SEO-Metadata für Produktseiten (neues Schema)
 */
export function generateProductSEO(product: any): SEOMetadata {
  const productTitle = product?.title || 'Produkt';
  
  // Neues Title-Schema: [Produktname] kaufen | Alltagsgold Schweiz
  const title = `${productTitle} ${SEO_TEMPLATES.productTitleSuffix}`;
  
  // Extrahiere Preis
  const price = product?.priceRange?.minVariantPrice?.amount || 
                product?.variants?.edges?.[0]?.node?.price?.amount || 
                null;
  const priceFormatted = price ? parseFloat(price).toFixed(2) : null;
  
  // Extrahiere Hauptvorteil aus der Beschreibung (erste 50 Zeichen)
  const baseDescription = product?.description || product?.excerpt || '';
  const cleanDesc = sanitizeDescription(baseDescription, 50);
  const benefit = cleanDesc.length > 20 ? cleanDesc : undefined;
  
  // Neue Description mit Template und Preis
  let description = SEO_TEMPLATES.productDescriptionTemplate(productTitle, benefit, priceFormatted || undefined);
  
  // Kürze auf 160 Zeichen (Google's empfohlene Länge)
  description = sanitizeDescription(description, 160);
  
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
  
  // Neues Title-Schema: [Kategoriename] | Praktische Produkte bei Alltagsgold
  const title = `${collectionTitle} ${SEO_TEMPLATES.collectionTitleSuffix}`;
  
  // Verwende Template für Description
  let description = SEO_TEMPLATES.collectionDescriptionTemplate(collectionTitle);
  
  // Kürze auf 150 Zeichen falls nötig
  description = sanitizeDescription(description, 150);
  
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
      pageName: SEO_TEMPLATES.homepage.title,
      description: SEO_TEMPLATES.homepage.description
    },
    contact: {
      pageName: "Kontakt Lifestyle-Produkte Schweiz ✓ Kostenlose Beratung",
      description: SEO_TEMPLATES.fallbacks.contact
    },
    impressum: {
      pageName: "Impressum AlltagsGold Schweiz ✓ Lifestyle-Produkte Shop",
      description: "Impressum AlltagsGold - Schweizer Online Shop für Lifestyle-Produkte ✓ Premium Alltagshelfer ✓ Rechtliche Informationen"
    },
    datenschutz: {
      pageName: "Datenschutz AlltagsGold ✓ Sichere Daten ✓ Schweizer Standard", 
      description: "Datenschutz AlltagsGold Schweiz ✓ Sichere Datenverarbeitung ✓ DSGVO konform ✓ Transparenter Umgang mit Kundendaten"
    },
    agb: {
      pageName: "AGB Lifestyle-Produkte Schweiz ✓ Faire Bedingungen ✓ Schneller Versand",
      description: "AGB AlltagsGold ✓ Faire Geschäftsbedingungen ✓ Gratis Versand ab CHF 50 ✓ 30 Tage Rückgabe ✓ Schweizer Shop"
    },
    blog: {
      pageName: "Haushalt Blog Schweiz ✓ Tipps & Tricks ✓ Produkttests",
      description: SEO_TEMPLATES.fallbacks.blog
    },
    products: {
      pageName: "Lifestyle-Produkte & Alltagshelfer Schweiz ✓ Günstig kaufen ✓ Top Qualität",
      description: "Alle Lifestyle-Produkte & Alltagshelfer ✓ Schweizer Online Shop ✓ Günstige Preise ✓ Premium Qualität ✓ Gratis Versand ab CHF 50"
    },
    collections: {
      pageName: "Lifestyle-Produkte Kategorien Schweiz ✓ Große Auswahl ✓ Top Preise", 
      description: "Lifestyle-Produkte Kategorien ✓ Alltagshelfer ✓ Beauty ✓ Auto-Zubehör ✓ Wohndeko ✓ Schweizer Shop ✓ Günstige Preise ✓ Gratis Versand"
    },
    'accessibility-demo': {
      pageName: "Barrierefreiheit Demo ✓ Bessere Zugänglichkeit ✓ Mobile UX",
      description: "Demo der neuen Barrierefreiheit und Mobile UX Features ✓ Verbesserte Zugänglichkeit ✓ Moderne Benutzerfreundlichkeit ✓ AlltagsGold"
    },
    cart: {
      pageName: "Warenkorb ✓ Sichere Bestellung ✓ Lifestyle-Produkte Schweiz",
      description: "Ihr Warenkorb bei AlltagsGold ✓ Sichere Bestellung ✓ Gratis Versand ab CHF 50 ✓ 30 Tage Rückgabe ✓ Schweizer Shop"
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

/**
 * Generiert SEO-Metadata für Homepage
 */
export function generateHomeSEO(): SEOMetadata {
  const title = SEO_TEMPLATES.homepage.title;
  const description = SEO_TEMPLATES.homepage.description;
  
  return {
    title,
    description,
    keywords: 'alltagsgold lifestyle shop, haushaltshelfer schweiz online, premium küchenhelfer shop ch, alltagsprodukte online kaufen schweiz, innovative reinigungsgeräte, praktische alltagshelfer',
    openGraph: {
      title,
      description,
      image: 'https://www.alltagsgold.ch/logo-alltagsgold.png',
      url: '/'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: 'https://www.alltagsgold.ch/logo-alltagsgold.png'
    }
  };
}

/**
 * Generiert SEO-Metadata für Kontaktseite
 */
export function generateContactSEO(): SEOMetadata {
  const title = generateBrandTitle('Kontakt');
  const description = SEO_TEMPLATES.fallbacks.contact;
  
  return {
    title,
    description,
    keywords: 'Kontakt, Kundenservice, AlltagsGold, Schweiz, Beratung',
    openGraph: {
      title,
      description,
      url: '/contact'
    },
    twitter: {
      card: 'summary',
      title,
      description
    }
  };
}

/**
 * Generiert SEO-Metadata für Blog-Liste
 */
export function generateBlogListSEO(): SEOMetadata {
  const title = generateBrandTitle('Blog', 'Tipps & Ratgeber');
  const description = 'Entdecken Sie hilfreiche Tipps, Produktneuheiten und Lifestyle-Inspiration im AlltagsGold Blog. ✓ Expertentipps ✓ Schweizer Qualität';
  
  return {
    title,
    description,
    keywords: 'Blog, Tipps, Ratgeber, Lifestyle, Haushalt, AlltagsGold, Schweiz',
    openGraph: {
      title,
      description,
      url: '/blog'
    },
    twitter: {
      card: 'summary',
      title,
      description
    }
  };
}

/**
 * Generiert SEO-Metadata für Blog-Posts
 */
export function generateBlogSEO(post: any): SEOMetadata {
  const postTitle = post?.title || 'Blog Post';
  const title = generateBrandTitle(postTitle, 'Haushalt Tipps');
  
  const baseDescription = post?.excerpt || post?.description || '';
  let description = sanitizeDescription(baseDescription, 120);
  
  // Blog-spezifisches Suffix hinzufügen
  const blogSuffix = '✓ Expertentipps ✓ AlltagsGold Blog';
  if (description.length + blogSuffix.length + 3 <= 150) {
    description = `${description} | ${blogSuffix}`;
  }
  
  // Fallback
  if (!description || description.length < 50) {
    description = SEO_TEMPLATES.fallbacks.blog;
  }
  
  const imageUrl = post?.featuredImage?.url || post?.image?.url;
  
  return {
    title,
    description,
    keywords: post?.tags?.join(', ') || 'Haushalt, Tipps, Ratgeber, AlltagsGold',
    openGraph: {
      title,
      description,
      image: imageUrl,
      url: `/blog/${post?.handle}`
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
 * Generiert SEO-Metadata für Blog-Posts (typed version)
 */
export function generateBlogPostSEO(post: BlogPost): SEOMetadata {
  const postTitle = post.title;
  const title = `${postTitle} | AlltagsGold Blog`;
  
  // Use excerpt for description
  let description = sanitizeDescription(post.excerpt, 120);
  
  // Add blog-specific suffix if there's room
  const blogSuffix = '✓ Expertentipps ✓ AlltagsGold Schweiz';
  if (description.length + blogSuffix.length + 3 <= 150) {
    description = `${description} | ${blogSuffix}`;
  }
  
  // Fallback if description is too short
  if (!description || description.length < 50) {
    description = SEO_TEMPLATES.fallbacks.blog;
  }
  
  return {
    title,
    description,
    keywords: post.tags.join(', '),
    openGraph: {
      title,
      description,
      image: post.featuredImage,
      url: `/blog/${post.slug}`
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: post.featuredImage
    }
  };
}