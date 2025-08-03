import { useEffect, useRef, useState } from 'react';

interface UseRevealAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useRevealAnimation(options: UseRevealAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    once = true
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof window === 'undefined') return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsRevealed(false);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, once]);

  return { elementRef, isRevealed };
}

// Hook für Parallax-Effekte
export function useParallaxScroll(speed: number = 0.5) {
  const elementRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      const element = elementRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const windowCenter = windowHeight / 2;
      const distance = elementCenter - windowCenter;
      
      // Calculate parallax offset
      const parallaxOffset = distance * speed * 0.1;
      setOffset(parallaxOffset);
    };

    // Initial calculation
    handleScroll();

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [speed]);

  return { elementRef, offset };
}

// Hook für Scroll Progress
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const scrollProgress = (scrollPosition / scrollHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollProgress)));
    };

    // Initial calculation
    handleScroll();

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  return progress;
}