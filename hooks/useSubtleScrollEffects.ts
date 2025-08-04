import { useEffect, useState, useRef } from 'react';

interface SubtleScrollValues {
  // Nur die wichtigsten Effekte
  scrollProgress: number;
  isNearBottom: boolean;
  headerCompact: boolean;
}

/**
 * Optimierter Scroll-Hook
 * Fokus: Performance und Subtilität
 */
export function useSubtleScrollEffects() {
  const [effects, setEffects] = useState<SubtleScrollValues>({
    scrollProgress: 0,
    isNearBottom: false,
    headerCompact: false
  });

  const rafId = useRef<number>();
  const lastUpdateTime = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const calculateEffects = () => {
      const now = Date.now();
      // Throttle: Max 60fps
      if (now - lastUpdateTime.current < 16) return;
      
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      
      // Basis-Metriken
      const scrollProgress = Math.min(100, (scrollY / maxScroll) * 100);
      const isNearBottom = scrollY > maxScroll - 200;
      const headerCompact = scrollY > 100;

      setEffects({
        scrollProgress,
        isNearBottom,
        headerCompact
      });

      lastUpdateTime.current = now;
    };

    const handleScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(calculateEffects);
    };

    // Initial
    calculateEffects();

    // Passive listener für bessere Performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return effects;
}

/**
 * Hook für einmalige Reveal-Animation
 * Keine kontinuierlichen Animationen
 */
export function useRevealOnce(threshold = 0.1) {
  const elementRef = useRef<HTMLElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const hasRevealed = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasRevealed.current) return;

    // Respektiere User-Präferenzen
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsRevealed(true);
      hasRevealed.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRevealed.current) {
          setIsRevealed(true);
          hasRevealed.current = true;
          observer.disconnect(); // Wichtig: Disconnecten nach Reveal
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' } // Trigger etwas früher
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return { elementRef, isRevealed };
}

/**
 * Hook für Image Loading mit Fade-In
 * Verhindert Layout-Shifts
 */
export function useImageLoader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Bereits geladen?
    if (img.complete) {
      setIsLoaded(true);
      return;
    }

    const handleLoad = () => setIsLoaded(true);
    img.addEventListener('load', handleLoad);

    return () => img.removeEventListener('load', handleLoad);
  }, []);

  return { imgRef, isLoaded };
}