import { useState, useEffect } from 'react';
import { useBackgroundRemoval } from '@/lib/imageProcessing';

interface ProcessedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  enableBackgroundRemoval?: boolean;
}

export function ProcessedImage({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc,
  enableBackgroundRemoval = true 
}: ProcessedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { processProductImage } = useBackgroundRemoval();

  useEffect(() => {
    // Skip background removal for now due to CORS issues
    // Keep original image display with improved styling
    setImageSrc(src);
    setIsProcessing(false);
  }, [src]);

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    } else if (imageSrc !== src) {
      setImageSrc(src); // Fallback to original
    }
  };

  const handleLoad = () => {
    setHasError(false);
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover ${isProcessing ? 'opacity-90' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
      
      {isProcessing && (
        <div className="absolute inset-0 bg-gray-50/50 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Bild nicht verfügbar</span>
        </div>
      )}
    </div>
  );
}