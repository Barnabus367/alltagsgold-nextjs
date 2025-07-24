import { useState } from 'react';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/categoryImages';

interface PremiumImageProps {
  src: string;
  alt: string;
  className?: string;
  productTitle?: string;
  context?: 'hero' | 'card' | 'thumbnail' | 'detail';
  fallbackSrc?: string;
}

export function PremiumImage({ 
  src, 
  alt, 
  className = "", 
  productTitle = "",
  context = 'card',
  fallbackSrc
}: PremiumImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Intelligente Bildverarbeitung mit Shopify-Priority
  const getImageUrl = (originalUrl: string) => {
    if (!originalUrl || originalUrl.includes('placeholder')) {
      return fallbackSrc || '';
    }
    
    // Wenn es bereits eine Shopify-URL ist, optimiere sie intelligent
    if (originalUrl.includes('shopify.com') || originalUrl.includes('shopifycdn.com')) {
      return getOptimizedImageUrl(originalUrl, context);
    }
    
    // Für alle anderen URLs (inkl. bereits optimierte Cloudinary)
    return originalUrl;
  };
  
  const imageUrl = getImageUrl(src);
  const isValidUrl = imageUrl && !imageError;

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
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
        <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Bild wird geladen...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PremiumImage;
