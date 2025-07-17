import { useState, useEffect, useRef } from 'react';
import { OptimizedImage } from './OptimizedImage';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  cloudinaryEffects?: string;
  threshold?: number;
}

export function LazyImage({
  src,
  alt,
  className = '',
  width = 800,
  height = 600,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  cloudinaryEffects = 'w_800,q_auto,f_auto,r_12,e_shadow:10,bo_2px_solid_rgb:e0e0e0',
  threshold = 0.1,
}: LazyImageProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, threshold]);

  return (
    <div ref={imgRef} className={className} style={{ width, height }}>
      {isIntersecting ? (
        <OptimizedImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          cloudinaryEffects={cloudinaryEffects}
          className="w-full h-full"
        />
      ) : (
        <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Lädt...</div>
        </div>
      )}
    </div>
  );
}