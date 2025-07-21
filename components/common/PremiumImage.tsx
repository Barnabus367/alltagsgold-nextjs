import { useState } from 'react';
import Image from 'next/image';

interface PremiumImageProps {
  src: string;
  alt: string;
  className?: string;
  productTitle?: string;
}

export function PremiumImage({ src, alt, className = "", productTitle = "" }: PremiumImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Apply new Cloudinary optimization with effects: rounded corners, shadow, border
  const getOptimizedImageUrl = (originalUrl: string) => {
    if (!originalUrl) return '';
    
    // If already a Cloudinary URL, use fetch transformation
    if (originalUrl.includes('res.cloudinary.com')) {
      return `https://res.cloudinary.com/dwrk3iihw/image/fetch/w_800,q_auto,f_auto,r_12,e_shadow:10,bo_2px_solid_rgb:e0e0e0/${encodeURIComponent(originalUrl)}`;
    }
    
    // For any other URL (including Shopify), use fetch transformation
    return `https://res.cloudinary.com/dwrk3iihw/image/fetch/w_800,q_auto,f_auto,r_12,e_shadow:10,bo_2px_solid_rgb:e0e0e0/${encodeURIComponent(originalUrl)}`;
  };
  
  const imageUrl = getOptimizedImageUrl(src);
  const isValidUrl = imageUrl && !src.includes('placeholder');

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
            className="w-full h-full object-cover"
            priority={true}
          />
          
          {/* Loading state */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center p-8 text-gray-400">
            <div className="w-16 h-16 border-2 border-gray-300 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm">Bild nicht verfügbar</span>
          </div>
        </div>
      )}
    </div>
  );
}