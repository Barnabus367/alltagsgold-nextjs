import { useState, useMemo } from 'react';
import Image from 'next/image';

interface PremiumImageProps {
  src: string;
  alt: string;
  className?: string;
  productTitle?: string;
  context?: 'hero' | 'card' | 'thumbnail' | 'detail';
  fallbackSrc?: string;
  // NEU: Shopify Produkt-ID (nicht mehr verwendet)
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

  // EINFACH: Verwende nur die ursprünglichen Shopify-URLs
  const imageUrl = useMemo(() => {
    console.log('🖼️ PremiumImage received:', { src, context, productTitle });
    
    // Wenn kein src vorhanden, verwende Fallback
    if (!src || src.includes('placeholder') || src.trim() === '') {
      console.log('❌ No valid src, using fallback');
      return fallbackSrc || 'https://via.placeholder.com/400x400?text=Kein+Bild';
    }
    
    console.log('✅ Using original Shopify URL:', src);
    // KEINE OPTIMIERUNGEN - verwende das ursprüngliche Bild direkt
    return src;
  }, [src, fallbackSrc, context, productTitle]);
  
  const isValidUrl = imageUrl && !imageError;

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn('Image failed to load:', imageUrl);
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
        // Verbesserter Fallback mit "Bild offline nicht verfügbar"
        <div className={`bg-gray-200 flex flex-col items-center justify-center rounded-lg ${className}`} style={{ minHeight: '200px' }}>
          <span className="text-gray-600 text-base font-medium">Bild offline</span>
          <span className="text-gray-500 text-sm">nicht verfügbar</span>
        </div>
      )}
    </div>
  );
}

export default PremiumImage;
