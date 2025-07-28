// Optimierte Cloudinary-Integration basierend auf bewährten Patterns

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'do7yh4dll';

// Simplere, bewährte Transformation-Presets (basierend auf alter erfolgreicher Version)
const TRANSFORM_PRESETS = {
  // Basis-Transformationen (wie in alter Version)
  thumbnail: 'w_300,h_300,c_fill,q_auto,f_webp',
  medium: 'w_800,h_800,c_fit,q_auto,f_webp', 
  large: 'w_1200,h_1200,c_fit,q_auto:best,f_webp',
  hero: 'w_1920,h_1080,c_fill,q_auto:best,f_webp',
  
  // E-Commerce spezifisch (ohne problematische e_background_removal)
  product: 'w_800,h_800,c_pad,b_white,q_auto,f_webp',
  productZoom: 'w_1600,h_1600,c_pad,b_white,q_auto:best,f_webp',
  productList: 'w_400,h_400,c_fill,q_auto,f_webp,ar_1:1',
  
  // Blog & Content
  blogHero: 'w_1200,h_600,c_fill,q_auto,f_webp',
  blogThumbnail: 'w_400,h_250,c_fill,q_auto,f_webp',
  
  // Performance-optimiert für mobile
  mobile: 'w_600,q_auto,f_webp,dpr_auto',
  mobileThumb: 'w_200,h_200,c_fill,q_auto,f_webp,dpr_auto'
} as const;

export type TransformPreset = keyof typeof TRANSFORM_PRESETS;

// Simpleres URL-Caching (weniger komplex als vorher)
const urlCache = new Map<string, string>();
const MAX_CACHE_SIZE = 500; // Reduziert von 1000

// Vereinfachte Performance-Stats
export function getCloudinaryStats() {
  return {
    cacheSize: urlCache.size,
    cacheHits: urlCache.size > 0 ? 'active' : 'empty'
  };
}

// Spezielle Funktion für hochgeladene Produkt-Bilder (direkte Upload URLs)
export function getProductCloudinaryUrl(productId: string, imageIndex: number = 0, preset: TransformPreset = 'product'): string {
  const transform = TRANSFORM_PRESETS[preset] || preset;
  
  // KORRIGIERTE Public ID Schema - das tatsächlich bei der Sync verwendet wird
  const publicId = `alltagsgold/products/shopify-products/product_${productId}_image_${imageIndex}`;
  
  // Korrekte Cloudinary Upload URL (ohne Version - Cloudinary findet automatisch die neueste)
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transform}/${publicId}.jpg`;
}

// Hauptfunktion: Cloudinary URL-Generation (basierend auf bewährter alter Logik)
export function getCloudinaryUrl(
  originalUrl?: string, 
  transform: TransformPreset | string = 'medium',
  productId?: string,
  imageIndex?: number
): string {
  // URL-Validierung (wie in alter Version)
  if (!originalUrl || typeof originalUrl !== 'string') {
    return 'https://via.placeholder.com/800x800?text=Bild+nicht+verfügbar';
  }

  // PRIORITÄT 1: ProductId für direkte Upload URLs (verbesserte Version)
  if (productId) {
    return getProductCloudinaryUrl(productId, imageIndex || 0, transform as TransformPreset);
  }

  // Bereits optimierte Cloudinary-URLs überspringen (wie alte Version)
  if (originalUrl.includes('res.cloudinary.com')) {
    return originalUrl;
  }
  
  // Lokale Assets und Placeholders überspringen (wie alte Version)
  if (originalUrl.startsWith('/') || 
      originalUrl.includes('localhost') || 
      originalUrl.includes('replit') || 
      originalUrl.includes('placeholder') ||
      originalUrl.includes('data:image')) {
    return originalUrl;
  }
  
  // Transform-String aus Preset oder direkt verwenden (vereinfacht)
  const transformString = typeof transform === 'string' && transform.includes(',') 
    ? transform 
    : TRANSFORM_PRESETS[transform as TransformPreset] || TRANSFORM_PRESETS.medium;
  
  // Cloudinary Fetch API für externe URLs (wie bewährte alte Version)
  if (originalUrl.startsWith('http')) {
    const cacheKey = `${originalUrl}:${transformString}`;
    
    // Einfaches Caching
    if (urlCache.has(cacheKey)) {
      return urlCache.get(cacheKey)!;
    }
    
    const encodedUrl = encodeURIComponent(originalUrl);
    const result = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transformString}/${encodedUrl}`;
    
    // Cache Management
    if (urlCache.size >= MAX_CACHE_SIZE) {
      const firstKey = urlCache.keys().next().value;
      if (firstKey) urlCache.delete(firstKey);
    }
    
    urlCache.set(cacheKey, result);
    return result;
  }
  
  return originalUrl;
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
