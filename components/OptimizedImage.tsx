/**
 * Optimized Image Component für AlltagsGold
 * Ersetzt Standard <img> tags mit intelligenter Optimierung
 */

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { useDeviceCapabilities, getMobileOptimizedImageSrc } from '../lib/mobile-optimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onClick?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onClick
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const capabilities = useDeviceCapabilities();

  // Mobile-optimized source
  const optimizedSrc = getMobileOptimizedImageSrc(src, capabilities);

  // Adjust quality based on device capabilities
  const adjustedQuality = capabilities.isLowEnd ? 50 : 
                         capabilities.connectionSpeed === 'slow' ? 60 : 
                         quality;

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setImageError(true);
  }, []);

  // Fallback for error state
  if (imageError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center text-gray-500 text-sm ${className}`}
        style={{ width, height }}
      >
        <span>Bild nicht verfügbar</span>
      </div>
    );
  }

  // Generate blur placeholder if not provided
  const defaultBlurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
    </svg>`
  ).toString('base64')}`;

  const imageProps = {
    src: optimizedSrc,
    alt,
    className: `${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`,
    quality: adjustedQuality,
    onLoad: handleLoad,
    onError: handleError,
    placeholder: placeholder as any,
    blurDataURL: blurDataURL || (placeholder === 'blur' ? defaultBlurDataURL : undefined),
    priority,
    onClick,
    ...(fill ? { fill: true } : { width, height }),
    sizes: capabilities.isMobile ? 
      '(max-width: 768px) 100vw, 50vw' : 
      sizes
  };

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded pointer-events-none"
          style={!fill ? { width, height } : {}}
        />
      )}
      <Image {...imageProps} alt={alt} />
    </div>
  );
}

// Wrapper für Legacy img tags - kann automatisch ersetzt werden
export function LegacyImageWrapper({ 
  src, 
  alt, 
  className, 
  style,
  ...props 
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  // Extrahiere Dimensionen aus style falls vorhanden
  const width = props.width || (style?.width ? parseInt(style.width.toString()) : 400);
  const height = props.height || (style?.height ? parseInt(style.height.toString()) : 300);

  const numWidth = typeof width === 'string' ? parseInt(width) : (width as number);
  const numHeight = typeof height === 'string' ? parseInt(height) : (height as number);

  return (
    <OptimizedImage
      src={src || ''}
      alt={alt || ''}
      width={numWidth}
      height={numHeight}
      className={className}
    />
  );
}

// Cloud-optimized Product Image mit spezifischen Transformationen
export function ProductImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  showBadge = false,
  badgeText = '',
  priority = false
}: OptimizedImageProps & {
  showBadge?: boolean;
  badgeText?: string;
}) {
  return (
    <div className="relative group">
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`rounded-lg object-cover transition-transform duration-300 group-hover:scale-105 ${className}`}
        priority={priority}
        placeholder="blur"
        quality={85}
      />
      
      {showBadge && badgeText && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
          {badgeText}
        </div>
      )}
      
  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-lg pointer-events-none" />
    </div>
  );
}

// Hero Image mit speziellen Optimierungen
export function HeroImage({
  src,
  alt,
  className = '',
  priority = true
}: Pick<OptimizedImageProps, 'src' | 'alt' | 'className' | 'priority'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      priority={priority}
      quality={90}
      sizes="100vw"
      placeholder="blur"
    />
  );
}

export default OptimizedImage;
