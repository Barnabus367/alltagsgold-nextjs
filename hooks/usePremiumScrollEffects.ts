import { useEffect, useState, useRef } from 'react';

interface PremiumScrollValues {
  // Floating Product Effect
  floatY: number;
  floatRotation: number;
  shadowIntensity: number;
  
  // Dynamic Focus Effect
  backgroundBlur: number;
  productScale: number;
  vignetteOpacity: number;
  
  // Glass Morphism
  glassOpacity: number;
  glassBlur: number;
  
  // General
  scrollProgress: number;
  scrollY: number;
}

export function usePremiumScrollEffects() {
  const [effects, setEffects] = useState<PremiumScrollValues>({
    floatY: 0,
    floatRotation: 0,
    shadowIntensity: 0.2,
    backgroundBlur: 0,
    productScale: 1,
    vignetteOpacity: 0,
    glassOpacity: 0.1,
    glassBlur: 8,
    scrollProgress: 0,
    scrollY: 0
  });

  const rafId = useRef<number>();
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const calculateEffects = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      const scrollProgress = Math.min(1, scrollY / maxScroll);
      
      // Floating Product Effect - Sinusförmige Bewegung
      const floatPhase = scrollY * 0.002; // Langsame Phase
      const floatY = Math.sin(floatPhase) * 10; // Max 10px Bewegung (reduziert)
      const floatRotation = Math.sin(floatPhase * 0.5) * 1; // Max 1° Rotation (reduziert)
      
      // Shadow intensity basierend auf Float-Position
      const shadowIntensity = 0.2 + (Math.abs(floatY) / 15) * 0.3;
      
      // Dynamic Focus Effect
      const focusStart = windowHeight * 0.2;
      const focusProgress = Math.max(0, Math.min(1, (scrollY - focusStart) / windowHeight));
      const backgroundBlur = focusProgress * 4; // Max 4px blur
      const productScale = 1 + (focusProgress * 0.02); // Max 2% zoom (reduziert von 5%)
      const vignetteOpacity = focusProgress * 0.3; // Max 30% vignette
      
      // Glass Morphism für Info-Boxen
      const glassStart = windowHeight * 0.5;
      const glassProgress = Math.max(0, Math.min(1, (scrollY - glassStart) / windowHeight));
      const glassOpacity = 0.1 + (glassProgress * 0.15); // 10-25% opacity
      const glassBlur = 8 + (glassProgress * 12); // 8-20px blur

      setEffects({
        floatY,
        floatRotation,
        shadowIntensity,
        backgroundBlur,
        productScale,
        vignetteOpacity,
        glassOpacity,
        glassBlur,
        scrollProgress,
        scrollY
      });

      lastScrollY.current = scrollY;
    };

    const handleScroll = () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      
      rafId.current = requestAnimationFrame(calculateEffects);
    };

    // Initial calculation
    calculateEffects();

    // Scroll event with RAF throttling
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return effects;
}

// Hook für Element-spezifische Premium-Effekte
export function usePremiumElementEffect() {
  const elementRef = useRef<HTMLElement>(null);
  const [inViewProgress, setInViewProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        
        if (entry.isIntersecting) {
          const rect = entry.boundingClientRect;
          const elementHeight = rect.height;
          const viewportHeight = window.innerHeight;
          
          // Berechne wie tief das Element im Viewport ist
          const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
          const progress = visibleHeight / elementHeight;
          
          setInViewProgress(Math.max(0, Math.min(1, progress)));
        }
      },
      { 
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
        rootMargin: '0px'
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, []);

  return { elementRef, inViewProgress, isInView };
}