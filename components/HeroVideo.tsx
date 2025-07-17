import { useState, useEffect, useRef } from 'react';

interface HeroVideoProps {
  videoSrc: string;
  fallbackImage: string;
}

export function HeroVideo({ videoSrc, fallbackImage }: HeroVideoProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      console.log('Hero video loaded successfully');
    };

    const handleError = (e: Event) => {
      console.error('Hero video failed to load:', e);
      setHasError(true);
    };

    const handleLoadStart = () => {
      console.log('Hero video loading started');
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  if (hasError) {
    return (
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${fallbackImage})`
        }}
      />
    );
  }

  return (
    <>
      <video 
        ref={videoRef}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ pointerEvents: 'none' }}
      />
      {!isLoaded && (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${fallbackImage})`
          }}
        />
      )}
    </>
  );
}