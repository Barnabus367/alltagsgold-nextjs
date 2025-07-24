// Optimierte Version von cloudinary.ts - Entfernt aggressive DOM-Manipulation

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'alltagsgold';

// Basis-Transformation-Presets - VERBESSERTE QUALITÄT
const TRANSFORM_PRESETS = {
  thumbnail: 'w_150,h_150,c_fill,q_85,f_webp',
  product: 'w_400,h_400,c_fit,q_90,f_webp',
  productZoom: 'w_800,h_800,c_fit,q_95,f_webp',
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

// Haupt-URL-Transformation (ohne DOM-Manipulation)
export function getCloudinaryUrl(
  originalUrl?: string, 
  preset: TransformPreset | string = 'product'
): string {
  if (!originalUrl || typeof originalUrl !== 'string') {
    return '/images/placeholder.jpg';
  }

  // Bereits optimiert
  if (originalUrl.includes('res.cloudinary.com')) {
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

  // Verwende Preset oder benutzerdefinierte Transformation
  const transform = TRANSFORM_PRESETS[preset as TransformPreset] || preset;
  
  try {
    const encodedUrl = encodeURIComponent(originalUrl);
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transform}/${encodedUrl}`;
  } catch (error) {
    console.warn('Cloudinary URL generation failed:', error);
    return originalUrl;
  }
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

// Helper-Funktionen
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
