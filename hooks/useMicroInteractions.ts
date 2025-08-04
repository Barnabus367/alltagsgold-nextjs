import { useEffect, useRef, useState } from 'react';

/**
 * Hook für Magnetic Button Effect
 * Buttons folgen leicht dem Mauszeiger für einen Premium-Feel
 */
export function useMagneticButton(strength: number = 0.3) {
  const buttonRef = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    let animationFrame: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) return;

      const rect = button.getBoundingClientRect();
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - buttonCenterX) * strength;
      const deltaY = (e.clientY - buttonCenterY) * strength;
      
      // Limitiere die Bewegung
      const maxMove = 10;
      const limitedX = Math.max(-maxMove, Math.min(maxMove, deltaX));
      const limitedY = Math.max(-maxMove, Math.min(maxMove, deltaY));
      
      animationFrame = requestAnimationFrame(() => {
        button.style.transform = `translate3d(${limitedX}px, ${limitedY}px, 0)`;
      });
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
      button.style.transition = 'transform 0.1s ease-out';
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      button.style.transform = 'translate3d(0, 0, 0)';
      button.style.transition = 'transform 0.3s ease-out';
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isHovered, strength]);

  return buttonRef;
}

/**
 * Hook für Ripple Effect bei Klicks
 * Material Design inspirierter Ripple-Effekt
 */
export function useRippleEffect() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const ripple = document.createElement('span');
      
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;
      
      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - rect.left - radius}px`;
      ripple.style.top = `${e.clientY - rect.top - radius}px`;
      ripple.classList.add('ripple-effect');
      
      container.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    };

    container.addEventListener('click', handleClick);
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, []);

  return containerRef;
}

/**
 * Hook für Tilt Effect
 * 3D-Tilt-Effekt bei Hover für Karten
 */
export function useTiltEffect(maxTilt: number = 10) {
  const elementRef = useRef<HTMLElement>(null);
  const [tiltValues, setTiltValues] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const percentX = (e.clientX - centerX) / (rect.width / 2);
      const percentY = (e.clientY - centerY) / (rect.height / 2);
      
      const tiltX = percentY * maxTilt;
      const tiltY = -percentX * maxTilt;
      
      setTiltValues({ x: tiltX, y: tiltY });
      
      element.style.transform = `
        perspective(1000px) 
        rotateX(${tiltX}deg) 
        rotateY(${tiltY}deg)
        scale3d(1.02, 1.02, 1)
      `;
    };

    const handleMouseLeave = () => {
      setTiltValues({ x: 0, y: 0 });
      element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.style.transition = 'transform 0.2s ease-out';
    element.style.transformStyle = 'preserve-3d';

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxTilt]);

  return { elementRef, tiltValues };
}

/**
 * Hook für Smooth Counter Animation
 * Animiert Zahlen smooth von 0 zum Zielwert
 */
export function useCountAnimation(
  end: number,
  duration: number = 1000,
  startOnView: boolean = true
) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!startOnView) {
      animateCount();
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animateCount();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [end, duration, startOnView]);

  const animateCount = () => {
    const startTime = Date.now();
    const startValue = 0;
    
    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (end - startValue) * easeOutQuart);
      
      setCount(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };
    
    requestAnimationFrame(updateCount);
  };

  return { count, elementRef };
}

/**
 * Hook für Typewriter Effect
 * Schreibmaschinen-Effekt für Text
 */
export function useTypewriter(
  text: string,
  speed: number = 50,
  startOnView: boolean = true
) {
  const [displayedText, setDisplayedText] = useState('');
  const elementRef = useRef<HTMLElement>(null);
  const hasTyped = useRef(false);

  useEffect(() => {
    if (!startOnView) {
      typeText();
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTyped.current) {
          hasTyped.current = true;
          typeText();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [text, speed, startOnView]);

  const typeText = () => {
    let currentIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, speed);
    
    return () => clearInterval(typeInterval);
  };

  return { displayedText, elementRef };
}