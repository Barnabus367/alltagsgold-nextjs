/**
 * Mobile UX Hook für Touch-optimierte Bedienung
 * Erkennt Geräte-Capabilities und passt UX entsprechend an
 */

import { useState, useEffect, useCallback } from 'react';

interface TouchCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  supportsTouch: boolean;
  screenSize: 'small' | 'medium' | 'large';
  orientation: 'portrait' | 'landscape';
  isLowEnd: boolean;
  hasVibration: boolean;
}

interface TouchGesture {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
}

export function useMobileUX() {
  const [capabilities, setCapabilities] = useState<TouchCapabilities>({
    isMobile: false,
    isTablet: false,
    supportsTouch: false,
    screenSize: 'large',
    orientation: 'landscape',
    isLowEnd: false,
    hasVibration: false,
  });

  const [touchGesture, setTouchGesture] = useState<TouchGesture | null>(null);

  // Device Detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateCapabilities = () => {
      const userAgent = navigator.userAgent;
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTablet = /(iPad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(userAgent);
      const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const screenSize: 'small' | 'medium' | 'large' = 
        width < 640 ? 'small' : 
        width < 1024 ? 'medium' : 'large';
      
      const orientation: 'portrait' | 'landscape' = height > width ? 'portrait' : 'landscape';
      
      // Performance Detection
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;
      const deviceMemory = (navigator as any).deviceMemory || 4;
      const isLowEnd = hardwareConcurrency <= 2 || deviceMemory <= 2;
      
      // Vibration Support
      const hasVibration = 'vibrate' in navigator;

      setCapabilities({
        isMobile,
        isTablet,
        supportsTouch,
        screenSize,
        orientation,
        isLowEnd,
        hasVibration,
      });
    };

    updateCapabilities();
    window.addEventListener('resize', updateCapabilities);
    window.addEventListener('orientationchange', updateCapabilities);

    return () => {
      window.removeEventListener('resize', updateCapabilities);
      window.removeEventListener('orientationchange', updateCapabilities);
    };
  }, []);

  // Touch Gesture Detection
  const handleTouchGesture = useCallback((element: HTMLElement) => {
    let startTouch: Touch | null = null;
    let startTime: number = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startTouch = e.touches[0];
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startTouch) return;

      const endTouch = e.changedTouches[0];
      const endTime = Date.now();
      
      const deltaX = endTouch.clientX - startTouch.clientX;
      const deltaY = endTouch.clientY - startTouch.clientY;
      const duration = endTime - startTime;
      
      // Mindest-Swipe-Distanz
      const minSwipeDistance = 50;
      const maxSwipeTime = 1000;
      
      if (duration > maxSwipeTime) return;
      
      let direction: 'left' | 'right' | 'up' | 'down' | null = null;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontale Bewegung
        if (Math.abs(deltaX) > minSwipeDistance) {
          direction = deltaX > 0 ? 'right' : 'left';
        }
      } else {
        // Vertikale Bewegung
        if (Math.abs(deltaY) > minSwipeDistance) {
          direction = deltaY > 0 ? 'down' : 'up';
        }
      }

      if (direction) {
        const gesture: TouchGesture = {
          startX: startTouch.clientX,
          startY: startTouch.clientY,
          endX: endTouch.clientX,
          endY: endTouch.clientY,
          duration,
          direction,
        };
        
        setTouchGesture(gesture);
        
        // Haptic Feedback
        if (capabilities.hasVibration) {
          navigator.vibrate(50);
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [capabilities.hasVibration]);

  // Touch Target Validation
  const validateTouchTarget = useCallback((element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    const minSize = capabilities.isMobile ? 44 : 40; // iOS/Android Guidelines
    
    return rect.width >= minSize && rect.height >= minSize;
  }, [capabilities.isMobile]);

  // Optimized Touch CSS Classes
  const getTouchClasses = useCallback(() => {
    const classes = [];
    
    if (capabilities.supportsTouch) {
      classes.push('touch-device');
    }
    
    if (capabilities.isMobile) {
      classes.push('mobile-device');
    }
    
    if (capabilities.isTablet) {
      classes.push('tablet-device');
    }
    
    if (capabilities.isLowEnd) {
      classes.push('low-end-device');
    }
    
    classes.push(`screen-${capabilities.screenSize}`);
    classes.push(`orientation-${capabilities.orientation}`);
    
    return classes.join(' ');
  }, [capabilities]);

  // Safe Area Support (iPhone Notch etc.)
  const getSafeAreaInsets = useCallback(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      top: style.getPropertyValue('--safe-area-inset-top') || '0px',
      right: style.getPropertyValue('--safe-area-inset-right') || '0px',
      bottom: style.getPropertyValue('--safe-area-inset-bottom') || '0px',
      left: style.getPropertyValue('--safe-area-inset-left') || '0px',
    };
  }, []);

  // Pull-to-Refresh Detection
  const handlePullToRefresh = useCallback((onRefresh: () => void) => {
    if (!capabilities.isMobile) return;

    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      
      currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;
      
      if (pullDistance > 100 && window.scrollY === 0) {
        e.preventDefault();
        // Visual feedback für Pull-to-Refresh
        document.body.style.transform = `translateY(${Math.min(pullDistance / 3, 50)}px)`;
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling) return;
      
      const pullDistance = currentY - startY;
      
      if (pullDistance > 100) {
        onRefresh();
        if (capabilities.hasVibration) {
          navigator.vibrate(100);
        }
      }
      
      document.body.style.transform = '';
      isPulling = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [capabilities.isMobile, capabilities.hasVibration]);

  return {
    capabilities,
    touchGesture,
    handleTouchGesture,
    validateTouchTarget,
    getTouchClasses,
    getSafeAreaInsets,
    handlePullToRefresh,
  };
}
