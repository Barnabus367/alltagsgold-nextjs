import { useState, useMemo, useCallback } from 'react';
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

  // Cloudinary-Transformation für einheitlichen Look
  const getUnifiedProductImage = useCallback((originalUrl: string) => {
    // Skip wenn bereits Cloudinary URL oder kein gültiger URL
    if (!originalUrl || originalUrl.includes('res.cloudinary.com') || originalUrl.includes('placeholder')) {
      return originalUrl;
    }
    
    // Cloudinary Fetch API für externe URLs
    // Verwende direkt den Cloud Name, da die env Variable manchmal nicht korrekt geladen wird
    const cloudinaryBase = `https://res.cloudinary.com/do7yh4dll/image/fetch/`;
    
    // Responsive Größen basierend auf Kontext
    let size = 'w_800,h_800';
    if (context === 'thumbnail') {
      size = 'w_150,h_150';
    } else if (context === 'card') {
      size = 'w_400,h_400';
    }
    
    // Einheitliche Transformation: Warm White Style
    const transformations = [
      'b_rgb:FEFAF5',        // Cremefarbener Hintergrund (warm white)
      'c_pad',               // Padding hinzufügen
      size,                  // Responsive Größe
      'e_trim:10',           // Trimme leere Bereiche
      'e_improve:indoor',    // Wärmere, natürlichere Farben
      'e_shadow:25,x_0,y_12', // Subtiler Schatten nach unten
      'fl_progressive',      // Progressive JPEG loading
      'f_auto',              // Auto-Format (WebP/AVIF wenn unterstützt)
      'q_auto:good',         // Gute Qualität
      'dpr_auto'             // Automatische DPR für Retina
    ].join(',');
    
    return `${cloudinaryBase}${transformations}/${encodeURIComponent(originalUrl)}`;
  }, [context]);

  const imageUrl = useMemo(() => {
    // Wenn kein src vorhanden, verwende Fallback
    if (!src || src.includes('placeholder') || src.trim() === '') {
      return fallbackSrc || 'https://via.placeholder.com/400x400?text=Kein+Bild';
    }
    
    // NUR für Shopify-Produktbilder transformieren (erkennbar an cdn.shopify.com)
    // Hero-Bilder und andere Assets bleiben unverändert
    if ((context === 'card' || context === 'detail' || context === 'thumbnail') && 
        src.includes('cdn.shopify.com')) {
      const transformedUrl = getUnifiedProductImage(src);
      return transformedUrl;
    }
    
    return src;
  }, [src, fallbackSrc, context, getUnifiedProductImage]);
  
  const isValidUrl = imageUrl && !imageError;

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    // Image load error handled silently
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
            width={context === 'thumbnail' ? 150 : context === 'card' ? 400 : 800}
            height={context === 'thumbnail' ? 150 : context === 'card' ? 400 : 800}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading={context === 'detail' ? 'eager' : 'lazy'}
            sizes={
              context === 'thumbnail' 
                ? '150px' 
                : context === 'card'
                ? '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
                : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px'
            }
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            className={`object-cover rounded-lg transition-all duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            unoptimized={imageUrl.includes('res.cloudinary.com')}
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
