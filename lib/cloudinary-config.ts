/**
 * CLOUDINARY CONFIGURATION
 * Zentrale Konfiguration für Cloudinary Integration
 */

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'do7yh4dll',
  apiKey: process.env.CLOUDINARY_API_KEY || '594974357421936',
  apiSecret: process.env.CLOUDINARY_API_SECRET || 'HzFguz2h0acwmXf8-YNnbXA-3hI',
  
  // Public URL für Image Transformations
  baseUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'do7yh4dll'}/image`,
  
  // Standard-Transformationen
  transformations: {
    hero: 'w_1920,h_1080,c_fill,g_center,q_auto:best,f_webp,dpr_auto',
    detail: 'w_800,h_800,c_pad,q_90,f_auto,r_8',
    card: 'w_400,h_400,c_fill,g_center,q_auto,f_webp',
    thumbnail: 'w_150,h_150,c_fill,g_center,q_auto,f_webp'
  }
};

/**
 * Generiere optimierte Cloudinary-URL mit neuen Credentials
 */
export function getNewCloudinaryUrl(
  originalUrl: string | null | undefined,
  context: 'hero' | 'card' | 'thumbnail' | 'detail' = 'card'
): string {
  if (!originalUrl || originalUrl.includes('placeholder')) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Invalid URL for Cloudinary optimization:', originalUrl);
    }
    return '';
  }

  const transformation = CLOUDINARY_CONFIG.transformations[context];
  
  // Für externe URLs (Shopify) - fetch API verwenden
  if (originalUrl.includes('shopify') || originalUrl.includes('http')) {
    const optimizedUrl = `${CLOUDINARY_CONFIG.baseUrl}/fetch/${transformation}/${encodeURIComponent(originalUrl)}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ New Cloudinary URL generated:', { original: originalUrl, optimized: optimizedUrl });
    }
    
    return optimizedUrl;
  }
  
  // Für interne Cloudinary-Assets - upload API
  const optimizedUrl = `${CLOUDINARY_CONFIG.baseUrl}/upload/${transformation}/v1/${originalUrl}`;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ New Cloudinary internal URL:', optimizedUrl);
  }
  
  return optimizedUrl;
}

/**
 * Direkte Upload-URL für bereits hochgeladene Assets
 */
export function getCloudinaryAssetUrl(assetId: string, context: 'hero' | 'card' | 'thumbnail' | 'detail' = 'card'): string {
  const transformation = CLOUDINARY_CONFIG.transformations[context];
  return `${CLOUDINARY_CONFIG.baseUrl}/upload/${transformation}/v1/${assetId}`;
}
