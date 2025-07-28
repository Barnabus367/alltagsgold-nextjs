// Next.js-optimierte Cloudinary-Integration mit Auto-Upload Support
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'do7yh4dll';

// Debug-Logging für Produktionsumgebung
const DEBUG_CLOUDINARY = process.env.NODE_ENV === 'development' || process.env.DEBUG_IMAGES === 'true';

function debugLog(message: string, data?: any) {
  if (DEBUG_CLOUDINARY) {
    console.log(`[CLOUDINARY DEBUG] ${message}`, data || '');
  }
}

// Vordefinierte Transformationen für verschiedene Anwendungen
export const CLOUDINARY_TRANSFORMS = {
  // Basis-Transformationen
  thumbnail: 'w_300,h_300,c_fill,q_auto,f_webp',
  medium: 'w_800,h_800,c_fit,q_auto,f_webp', 
  large: 'w_1200,h_1200,c_fit,q_auto:best,f_webp',
  hero: 'w_1920,h_1080,c_fill,q_auto:best,f_webp',
  
  // E-Commerce spezifisch
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

export type TransformType = keyof typeof CLOUDINARY_TRANSFORMS;

export function getCloudinaryUrl(originalUrl: string, transform: string | TransformType = 'medium'): string {
  // URL-Validierung
  if (!originalUrl || typeof originalUrl !== 'string') {
    debugLog('Invalid URL provided:', originalUrl);
    return 'https://via.placeholder.com/800x800?text=Bild+nicht+verfügbar';
  }

  debugLog('Processing URL:', originalUrl);

  // Bereits optimierte Cloudinary-URLs überspringen
  if (originalUrl.includes('res.cloudinary.com')) {
    debugLog('Already Cloudinary URL, skipping');
    return originalUrl;
  }
  
  // Lokale Assets und Placeholders überspringen
  if (originalUrl.startsWith('/') || 
      originalUrl.includes('localhost') || 
      originalUrl.includes('replit') || 
      originalUrl.includes('placeholder') ||
      originalUrl.includes('data:image')) {
    debugLog('Local/placeholder URL, skipping');
    return originalUrl;
  }
  
  // Transform-String aus Preset oder direkt verwenden
  const transformString = typeof transform === 'string' && transform.includes(',') 
    ? transform 
    : CLOUDINARY_TRANSFORMS[transform as TransformType] || CLOUDINARY_TRANSFORMS.medium;
  
  // Cloudinary Fetch API für externe URLs (jetzt aktiviert!)
  if (originalUrl.startsWith('http')) {
    const encodedUrl = encodeURIComponent(originalUrl);
    const cloudinaryUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transformString}/${encodedUrl}`;
    
    debugLog('Generated Cloudinary Fetch URL:', {
      original: originalUrl,
      cloudinary: cloudinaryUrl,
      transform: transformString,
      account: CLOUDINARY_CLOUD_NAME,
      status: 'FETCH_ENABLED'
    });
    
    return cloudinaryUrl;
  }
  
  debugLog('No transformation applied, returning original');
  return originalUrl;
}

// Globale Überschreibung der Image-src Eigenschaften  
export function forceCloudinaryOptimization() {
  if (typeof window === 'undefined') return;
  
  // Stabilere MutationObserver Implementation
  let observerTimeout: NodeJS.Timeout;
  
  const observer = new MutationObserver((mutations) => {
    // Debounce mutations to prevent HMR conflicts
    clearTimeout(observerTimeout);
    observerTimeout = setTimeout(() => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as Element;
            
            // Überprüfe img-Tags direkt
            if (element.tagName === 'IMG') {
            const img = element as HTMLImageElement;
            if (img.src && img.src.includes('cdn.shopify.com')) {
              const optimizedUrl = getCloudinaryUrl(img.src);
              if (img.src !== optimizedUrl) {
                img.src = optimizedUrl;
                // ⚠️ Debug: DOM-Überschreibung
              }
            }
          }
          
          // Überprüfe verschachtelte img-Tags
          const imgElements = element.querySelectorAll('img');
          imgElements.forEach((img) => {
            if (img.src && img.src.includes('cdn.shopify.com')) {
              const optimizedUrl = getCloudinaryUrl(img.src);
              if (img.src !== optimizedUrl) {
                img.src = optimizedUrl;
                // ⚠️ Debug: DOM-Überschreibung (verschachtelt)
              }
            }
          });
        }
      });
      }, 100); // 100ms debounce
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Einmalige Überprüfung aller bestehenden Bilder
  setTimeout(() => {
    const allImages = document.querySelectorAll('img');
    allImages.forEach((img) => {
      if (img.src && img.src.includes('cdn.shopify.com')) {
        const optimizedUrl = getCloudinaryUrl(img.src);
        if (img.src !== optimizedUrl) {
          img.src = optimizedUrl;
          // ⚠️ Debug: Initiale DOM-Überschreibung
        }
      }
    });
  }, 1000);
}

// Video-Unterstützung für Cloudinary
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

// Praktische Helper-Funktionen
export function getProductImage(originalUrl: string, zoom: boolean = false): string {
  return getCloudinaryUrl(originalUrl, zoom ? 'productZoom' : 'product');
}

export function getThumbnailImage(originalUrl: string): string {
  return getCloudinaryUrl(originalUrl, 'thumbnail');
}

export function getBlogImage(originalUrl: string, isHero: boolean = false): string {
  return getCloudinaryUrl(originalUrl, isHero ? 'blogHero' : 'blogThumbnail');
}

export function getMobileOptimizedImage(originalUrl: string, isThumb: boolean = false): string {
  return getCloudinaryUrl(originalUrl, isThumb ? 'mobileThumb' : 'mobile');
}

// Responsive Breakpoint-Generation für Next.js Image
export function generateResponsiveSizes(originalUrl: string) {
  return {
    mobile: getCloudinaryUrl(originalUrl, 'w_600,q_auto,f_webp'),
    tablet: getCloudinaryUrl(originalUrl, 'w_1024,q_auto,f_webp'),
    desktop: getCloudinaryUrl(originalUrl, 'w_1920,q_auto,f_webp')
  };
}

// SEO-optimierte Alt-Text Generation
export function generateImageAlt(productTitle?: string, imageIndex?: number): string {
  if (!productTitle) return 'Produktbild';
  
  const baseAlt = `${productTitle} - AlltagsGold`;
  return imageIndex ? `${baseAlt} (Bild ${imageIndex + 1})` : baseAlt;
}

// Cloudinary-Optimierung-Status prüfen
export function isCloudinaryOptimized(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes('res.cloudinary.com') || 
         url.includes('placeholder') || 
         url.includes('via.placeholder.com') ||
         url.startsWith('/') ||
         url.includes('data:image');
}