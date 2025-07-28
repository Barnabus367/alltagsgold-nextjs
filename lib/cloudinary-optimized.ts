// Optimierte Version von cloudinary.ts - Entfernt aggressive DOM-Manipulation

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'do7yh4dll';

// Basis-Transformation-Presets - SELEKTIVE OPTIMIERUNG
const TRANSFORM_PRESETS = {
  // PRODUKTBILDER - Mit einheitlichem weißen Hintergrund (ohne Background Removal)
  thumbnail: 'c_pad,w_150,h_150,ar_1:1,b_white,q_85,f_webp',
  product: 'c_pad,w_400,h_400,ar_1:1,b_white,q_90,f_webp',
  productZoom: 'c_pad,w_800,h_800,ar_1:1,b_white,q_95,f_webp',
  
  // CONTENT BILDER - Bleiben unverändert (natürliche Hintergründe)
  mobile: 'w_375,q_85,f_webp',
  mobileThumb: 'w_150,h_150,c_fill,q_85,f_webp',
  blogThumbnail: 'w_300,h_200,c_fill,q_85,f_webp',
  blogHero: 'w_1200,h_400,c_fill,q_90,f_webp',
  category: 'w_350,h_250,c_fill,q_90,f_webp',
  hero: 'w_1920,h_600,c_fill,q_95,f_webp',
  collection: 'w_600,h_400,c_fill,q_90,f_webp',
  avatar: 'w_80,h_80,c_fill,q_85,f_webp,g_face',
  banner: 'w_1200,h_300,c_fill,q_90,f_webp'
} as const;

export type TransformPreset = keyof typeof TRANSFORM_PRESETS;

// PERFORMANCE OPTIMIERUNG: URL-Caching um parallele Prozesse zu reduzieren
const urlCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

// PERFORMANCE MONITORING: Verhindert 300 parallele Prozesse
let activeTransformations = 0;
let cacheHits = 0;
let cacheMisses = 0;

// Performance Stats für Debugging
export function getCloudinaryStats() {
  return {
    activeTransformations,
    cacheSize: urlCache.size,
    cacheHitRate: cacheHits / (cacheHits + cacheMisses) * 100,
    cacheHits,
    cacheMisses
  };
}

// Cache-aware URL Generation für externe URLs (fetch)
function getCachedCloudinaryUrl(originalUrl: string, preset: string): string {
  const cacheKey = `${originalUrl}:${preset}`;
  
  // Cache Hit
  if (urlCache.has(cacheKey)) {
    cacheHits++;
    return urlCache.get(cacheKey)!;
  }
  
  // Cache Miss - Generate URL
  cacheMisses++;
  activeTransformations++;
  
  const transform = TRANSFORM_PRESETS[preset as TransformPreset] || preset;
  
  try {
    const encodedUrl = encodeURIComponent(originalUrl);
    const result = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transform}/${encodedUrl}`;
    
    // Cache Management (LRU-style)
    if (urlCache.size >= MAX_CACHE_SIZE) {
      const firstKey = urlCache.keys().next().value;
      if (firstKey) urlCache.delete(firstKey);
    }
    
    urlCache.set(cacheKey, result);
    activeTransformations--;
    return result;
  } catch (error) {
    activeTransformations--;
    console.warn('Cloudinary URL generation failed:', error);
    return originalUrl;
  }
}

// Spezielle Funktion für bereits hochgeladene Cloudinary-Bilder (upload)
function getCloudinaryUploadUrl(cloudinaryUrl: string, preset: string): string {
  const transform = TRANSFORM_PRESETS[preset as TransformPreset] || preset;
  
  // URL-Struktur: https://res.cloudinary.com/do7yh4dll/image/upload/v1753735171/alltagsgold/products/...
  // Ergebnis: https://res.cloudinary.com/do7yh4dll/image/upload/c_pad,w_400,h_400.../alltagsgold/products/...
  
  const urlParts = cloudinaryUrl.split('/');
  const cloudIndex = urlParts.findIndex(part => part === 'image');
  
  if (cloudIndex !== -1 && urlParts[cloudIndex + 1] === 'upload') {
    // Einfügen der Transformation nach "upload"
    urlParts.splice(cloudIndex + 2, 0, transform);
    return urlParts.join('/');
  }
  
  return cloudinaryUrl; // Fallback
}

// Spezielle Funktion für hochgeladene Produkt-Bilder (direkte Upload URLs)
export function getProductCloudinaryUrl(productId: string, imageIndex: number = 0, preset: TransformPreset = 'product'): string {
  const transform = TRANSFORM_PRESETS[preset] || preset;
  
  // Public ID Schema das bei der Sync verwendet wird
  const publicId = `shopify-products/product_${productId}_image_${imageIndex}`;
  
  // Direkte Upload URL für bereits hochgeladene Bilder
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transform}/alltagsgold/products/${publicId}.jpg`;
}

// Verbesserte Haupt-URL-Transformation mit produktspezifischer Logik
export function getCloudinaryUrl(
  originalUrl?: string, 
  preset: TransformPreset | string = 'product',
  productId?: string,
  imageIndex?: number
): string {
  if (!originalUrl || typeof originalUrl !== 'string') {
    return '/images/placeholder.jpg';
  }

  // PRIORITÄT 1: Wenn productId verfügbar ist, verwende direkte Upload URL
  if (productId) {
    return getProductCloudinaryUrl(productId, imageIndex || 0, preset as TransformPreset);
  }

  // PRIORITÄT 2: Bereits hochgeladene Cloudinary-Bilder (upload URLs)
  if (originalUrl.includes('res.cloudinary.com') && originalUrl.includes('/image/upload/')) {
    return getCloudinaryUploadUrl(originalUrl, preset);
  }

  // PRIORITÄT 3: Bereits optimierte fetch URLs
  if (originalUrl.includes('res.cloudinary.com') && originalUrl.includes('/image/fetch/')) {
    return originalUrl;
  }

  // Lokale oder relative URLs
  if (originalUrl.startsWith('/') || originalUrl.startsWith('data:')) {
    return originalUrl;
  }

  // Placeholder URLs
  if (originalUrl.includes('placeholder') || originalUrl.includes('via.placeholder.com')) {
    return originalUrl;
  }

  // PERFORMANCE: Verwende gecachte URL-Generation
  return getCachedCloudinaryUrl(originalUrl, preset);
}

// ENTFERNT: forceCloudinaryOptimization() - keine DOM-Manipulation mehr

// Video-Unterstützung
export function getCloudinaryVideoUrl(originalUrl: string, transform: string = 'w_800,q_auto,f_auto'): string {
  if (!originalUrl || typeof originalUrl !== 'string') {
    return '';
  }

  if (originalUrl.includes('res.cloudinary.com')) {
    return originalUrl;
  }
  
  if (originalUrl.startsWith('http')) {
    const encodedUrl = encodeURIComponent(originalUrl);
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/fetch/${transform}/${encodedUrl}`;
  }
  
  return originalUrl;
}

// Helper-Funktionen - OPTIMIERT für selektive Transformation
export function getProductImage(originalUrl: string, zoom: boolean = false): string {
  // Verwendet automatisch die neuen einheitlichen Produkt-Presets mit weißem Hintergrund
  return getCloudinaryUrl(originalUrl, zoom ? 'productZoom' : 'product');
}

export function getThumbnailImage(originalUrl: string): string {
  // Thumbnail für Produktbilder - mit weißem Hintergrund
  return getCloudinaryUrl(originalUrl, 'thumbnail');
}

export function getBlogImage(originalUrl: string, isHero: boolean = false): string {
  // Blog-Bilder behalten natürliche Hintergründe
  return getCloudinaryUrl(originalUrl, isHero ? 'blogHero' : 'blogThumbnail');
}

export function getMobileOptimizedImage(originalUrl: string, isThumb: boolean = false): string {
  // Mobile-Bilder behalten natürliche Hintergründe  
  return getCloudinaryUrl(originalUrl, isThumb ? 'mobileThumb' : 'mobile');
}

// Neue Funktion: Explizit für Content-Bilder OHNE Background Removal
export function getContentImage(originalUrl: string, context: 'hero' | 'banner' | 'category' | 'collection' = 'category'): string {
  // Content-Bilder (Hero, Banner, etc.) behalten natürliche Hintergründe
  return getCloudinaryUrl(originalUrl, context);
}

// Responsive Breakpoint-Generation
export function generateResponsiveSizes(originalUrl: string) {
  return {
    mobile: getCloudinaryUrl(originalUrl, 'w_600,q_auto,f_webp'),
    tablet: getCloudinaryUrl(originalUrl, 'w_1024,q_auto,f_webp'),
    desktop: getCloudinaryUrl(originalUrl, 'w_1920,q_auto,f_webp')
  };
}

// SEO Alt-Text Generation
export function generateImageAlt(productTitle?: string, imageIndex?: number): string {
  if (!productTitle) return 'Produktbild';
  
  const baseAlt = `${productTitle} - AlltagsGold`;
  return imageIndex ? `${baseAlt} (Bild ${imageIndex + 1})` : baseAlt;
}

// Status-Check
export function isCloudinaryOptimized(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes('res.cloudinary.com') || 
         url.includes('placeholder') || 
         url.includes('via.placeholder.com') ||
         url.startsWith('/') ||
         url.includes('data:image');
}

// Smart Detection: Bestimmt ob ein Bild ein Produktbild ist
export function isProductImage(context: string | undefined, url?: string): boolean {
  if (!context) return false;
  
  // Eindeutige Produkt-Kontexte
  const productContexts = ['product', 'thumbnail', 'productZoom', 'card', 'detail'];
  if (productContexts.includes(context)) return true;
  
  // URL-basierte Erkennung (Shopify Produktbilder)
  if (url && (url.includes('shopify') || url.includes('product'))) return true;
  
  return false;
}

// Intelligente Bildoptimierung basierend auf Kontext
export function getSmartOptimizedImage(
  originalUrl: string, 
  context: string = 'product',
  forceBackgroundRemoval?: boolean
): string {
  // Explizite Kontrolle über Background Removal
  if (forceBackgroundRemoval === false) {
    return getContentImage(originalUrl, context as any);
  }
  
  // Auto-Detection für Produktbilder
  if (forceBackgroundRemoval === true || isProductImage(context, originalUrl)) {
    if (context.includes('zoom')) return getProductImage(originalUrl, true);
    if (context.includes('thumb')) return getThumbnailImage(originalUrl);
    return getProductImage(originalUrl, false);
  }
  
  // Fallback für Content-Bilder
  return getContentImage(originalUrl, context as any);
}

// Next.js Image Component Props Generator
export function getNextImageProps(originalUrl: string, alt: string, preset: TransformPreset = 'product') {
  return {
    src: getCloudinaryUrl(originalUrl, preset),
    alt: alt,
    loading: 'lazy' as const,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLli5GFb9gx5I4/wCmpFf/2Q==',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  };
}
