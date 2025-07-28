import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { getCloudinaryUrl, getProductImage, getThumbnailImage } from '@/lib/cloudinary';

interface PremiumImageProps {
  src: string;
  alt: string;
  className?: string;
  productTitle?: string;
  context?: 'hero' | 'card' | 'thumbnail' | 'detail';
  fallbackSrc?: string;
  // NEU: Shopify Produkt-ID für direkte Cloudinary-URL-Generierung
  productId?: string;
  imageIndex?: number;
}

export function PremiumImage({ 
  src, 
  alt, 
  className = "", 
  productTitle = "",
  context = 'card',
  fallbackSrc,
  productId,
  imageIndex = 0
}: PremiumImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Stabile Fallback URL mit useMemo
  const developmentFallback = useMemo(() => {
    const width = context === 'detail' ? 800 : context === 'hero' ? 1200 : 400;
    const height = context === 'detail' ? 600 : context === 'hero' ? 600 : 400;
    return `https://res.cloudinary.com/do7yh4dll/image/upload/c_pad,w_${width},h_${height},b_auto/v1/sample.jpg`;
  }, [context]);

  // Stabile Bild-URL mit useMemo - PRIORISIERT HOCHGELADENE BILDER
  const imageUrl = useMemo(() => {
    if (!src || src.includes('placeholder') || src.trim() === '') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('🖼️ No valid image source provided:', src);
      }
      return fallbackSrc || developmentFallback;
    }
    
    // SCHRITT 1: Wenn productId vorhanden ist, verwende Cloudinary-URL direkt
    if (productId) {
      const cloudinaryUrl = getCloudinaryUrl(src);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 DIREKTE CLOUDINARY URL - Using optimized image:', { 
          productId: productId,
          imageIndex: imageIndex,
          cloudinaryUrl: cloudinaryUrl,
          context: context 
        });
      }
      
      return cloudinaryUrl;
    }

    if (src.includes('shopify.com') || src.includes('shopifycdn.com')) {
      // SCHRITT 2: Standardmäßige Cloudinary-Optimierung für Shopify-Bilder
      let optimizedUrl: string;
      if (context === 'detail') {
        optimizedUrl = getProductImage(src, false);
      } else if (context === 'thumbnail') {
        optimizedUrl = getThumbnailImage(src);
      } else if (context === 'hero') {
        optimizedUrl = getCloudinaryUrl(src, 'hero');
      } else {
        optimizedUrl = getCloudinaryUrl(src, 'product');
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 SHOPIFY IMAGE OPTIMIZED:', { 
          original: src, 
          optimized: optimizedUrl,
          context: context 
        });
      }
      return optimizedUrl;
    }
    
    // SCHRITT 3: Fallback für andere Bildquellen - verwende immer Cloudinary Fetch
    const finalUrl = getCloudinaryUrl(src, context);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🖼️ Using Cloudinary optimized URL:', { original: src, optimized: finalUrl });
    }
    return finalUrl;
  }, [src, fallbackSrc, context, developmentFallback, productId, imageIndex]);
  
  const isValidUrl = imageUrl && !imageError;

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Image loaded successfully:', imageUrl);
    }
  };

  const handleImageError = () => {
    console.warn('Image failed to load:', imageUrl);
    // Only set error for actual failures, not empty URLs
    if (imageUrl && !imageUrl.includes('placeholder')) {
      setImageError(true);
    }
    setImageLoaded(true);
  };

  return (
    <div className={`relative ${className}`}>
      {isValidUrl && !imageError ? (
        <>
          <Image
            src={imageUrl}
            alt={alt || `${productTitle} Produktbild`}
            width={800}
            height={800}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            className={`object-cover rounded-lg transition-all duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
          )}
        </>
      ) : (
        // Development-safe fallback with Cloudinary placeholder
        <>
          <Image
            src={developmentFallback}
            alt={alt || `${productTitle} Fallback-Bild`}
            width={800}
            height={800}
            onLoad={handleImageLoad}
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={75}
            className={`object-cover rounded-lg transition-all duration-300 opacity-60 ${className}`}
          />
          <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-center text-gray-500">
              <svg className="w-8 h-8 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Placeholder</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PremiumImage;
