import { useState } from 'react';
import Image from 'next/image';
import { Loader2 } from '@/lib/icons';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  cloudinaryEffects?: string;
  fallback?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className = '',
  width = 800,
  height = 600,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  cloudinaryEffects = 'w_800,q_auto,f_auto,r_12,e_shadow:10,bo_2px_solid_rgb:e0e0e0',
  fallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zODUgMjUwSDQxNVYzNTBIMzg1VjI1MFoiIGZpbGw9IiNEREREREQiLz4KPHBhdGggZD0iTTM1MCAyODVIMzgwVjMxNUgzNTBWMjg1WiIgZmlsbD0iI0RERERERCIvPgo8cGF0aCBkPSJNNDIwIDI4NUg0NDBWMTA1SDQyMFYyODVaIiBmaWxsPSIjRERERERBIi8+CjxwYXRoIGQ9Ik0zMzAgMzIwSDQ3MFYzNDBIMzMwVjMyMFoiIGZpbGw9IiNEREREREQiLz4KPHN0eWxlPgogICAgLmxvYWRpbmcgewogICAgICAgIGFuaW1hdGlvbjogcHVsc2UgMnMgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC42LCAxKSBpbmZpbml0ZTsKICAgIH0KICAgIEBrZXlmcmFtZXMgcHVsc2UgewogICAgICAgIDAsIDEwMCUgewogICAgICAgICAgICBvcGFjaXR5OiAxOwogICAgICAgIH0KICAgICAgICA1MCUgewogICAgICAgICAgICBvcGFjaXR5OiAuNTsKICAgICAgICB9CiAgICB9Cjwvc3R5bGU+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2IiBjbGFzcz0ibG9hZGluZyIvPgo8L3N2Zz4K'
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cloudinary-optimierte URL mit gewünschten Effekten
  const getOptimizedImageUrl = (originalUrl: string) => {
    if (!originalUrl || imageError) return fallback;
    
    // Bereits optimiert via Cloudinary
    if (originalUrl.includes('res.cloudinary.com')) {
      return originalUrl;
    }
    
    // Neue Optimierung via Cloudinary
    return `https://res.cloudinary.com/do7yh4dll/image/fetch/${cloudinaryEffects}/${encodeURIComponent(originalUrl)}`;
  };

  const optimizedSrc = getOptimizedImageUrl(src);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      )}
      
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}