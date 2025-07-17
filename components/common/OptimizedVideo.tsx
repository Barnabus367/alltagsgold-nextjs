import { useState, useRef, useEffect } from 'react';
import { getCloudinaryVideoUrl } from '@/lib/cloudinary';

interface OptimizedVideoProps {
  src: string;
  poster?: string;
  className?: string;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  transform?: string;
}

export function OptimizedVideo({
  src,
  poster,
  className = "",
  width,
  height,
  autoPlay = false,
  muted = true,
  loop = false,
  controls = true,
  transform = 'w_800,q_auto,f_auto'
}: OptimizedVideoProps) {
  const [videoError, setVideoError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cloudinary-optimierte Video-URL
  const optimizedSrc = getCloudinaryVideoUrl(src, transform);
  const optimizedPoster = poster ? getCloudinaryVideoUrl(poster, 'w_800,q_auto,f_jpg') : undefined;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => setIsLoaded(true);
    const handleError = () => setVideoError(true);

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, []);

  if (videoError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="flex flex-col items-center justify-center p-6 text-gray-400">
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">Video nicht verfügbar</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        src={optimizedSrc}
        poster={optimizedPoster}
        width={width}
        height={height}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        className={`w-full h-full transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        preload="metadata"
      >
        Ihr Browser unterstützt keine Videos.
      </video>

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

// Hero-Video mit erweiterten Funktionen
export function HeroVideo({ 
  src, 
  fallbackImage, 
  className = "",
  overlayClassName = ""
}: {
  src: string;
  fallbackImage?: string;
  className?: string;
  overlayClassName?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <OptimizedVideo
        src={src}
        poster={fallbackImage}
        autoPlay={true}
        muted={true}
        loop={true}
        controls={false}
        transform="w_1920,h_1080,c_fill,q_auto,f_auto"
        className="w-full h-full object-cover"
      />
      
      {/* Overlay für Text */}
      {overlayClassName && (
        <div className={`absolute inset-0 ${overlayClassName}`} />
      )}
    </div>
  );
}