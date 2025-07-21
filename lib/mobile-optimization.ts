/**
 * Mobile Performance Optimization für AlltagsGold
 * Spezielle Optimierungen für mobile Geräte und Touch-Interaktionen
 */

import { useState, useEffect, useCallback } from 'react';

// Device Detection & Capabilities
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    isMobile: false,
    isTablet: false,
    isLowEnd: false,
    supportsWebP: false,
    supportsAvif: false,
    connectionSpeed: 'unknown' as 'slow' | 'fast' | 'unknown',
    memoryStatus: 'unknown' as 'low' | 'medium' | 'high' | 'unknown',
    batteryLevel: 1,
    isCharging: true
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateCapabilities = async () => {
      // Device Detection
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTablet = /(iPad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(navigator.userAgent);
      
      // Hardware Detection
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;
      const deviceMemory = (navigator as any).deviceMemory || 4;
      const isLowEnd = hardwareConcurrency <= 2 || deviceMemory <= 2;

      // Connection Speed
      const connection = (navigator as any).connection;
      let connectionSpeed: 'slow' | 'fast' | 'unknown' = 'unknown';
      if (connection) {
        const effectiveType = connection.effectiveType;
        connectionSpeed = ['slow-2g', '2g', '3g'].includes(effectiveType) ? 'slow' : 'fast';
      }

      // Memory Status
      let memoryStatus: 'low' | 'medium' | 'high' | 'unknown' = 'unknown';
      if (deviceMemory) {
        if (deviceMemory <= 2) memoryStatus = 'low';
        else if (deviceMemory <= 4) memoryStatus = 'medium';
        else memoryStatus = 'high';
      }

      // Image Format Support
      const supportsWebP = await checkImageSupport('webp');
      const supportsAvif = await checkImageSupport('avif');

      // Battery API
      let batteryLevel = 1;
      let isCharging = true;
      try {
        const battery = await (navigator as any).getBattery?.();
        if (battery) {
          batteryLevel = battery.level;
          isCharging = battery.charging;
        }
      } catch (e) {
        // Battery API not supported
      }

      setCapabilities({
        isMobile,
        isTablet,
        isLowEnd,
        supportsWebP,
        supportsAvif,
        connectionSpeed,
        memoryStatus,
        batteryLevel,
        isCharging
      });
    };

    updateCapabilities();
  }, []);

  return capabilities;
}

// Image Format Support Detection
async function checkImageSupport(format: 'webp' | 'avif'): Promise<boolean> {
  const testImages = {
    webp: 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
    avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
  };

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width === 1 && img.height === 1);
    img.onerror = () => resolve(false);
    img.src = testImages[format];
  });
}

// Mobile-Optimized Image Component
interface MobileOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

// Mobile-Optimized Image Configuration
export interface MobileImageConfig {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function getMobileOptimizedImageSrc(
  src: string, 
  capabilities: ReturnType<typeof useDeviceCapabilities>
): string {
  let optimizedSrc = src;

  // Format Selection based on support
  if (capabilities.supportsAvif && !capabilities.isLowEnd) {
    optimizedSrc = src.replace(/\.(jpg|jpeg|png|webp)$/i, '.avif');
  } else if (capabilities.supportsWebP) {
    optimizedSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  // Quality adjustment for mobile/connection
  const cloudinaryParams = [];
  
  if (capabilities.isMobile) {
    cloudinaryParams.push('q_auto:low'); // Lower quality for mobile
    cloudinaryParams.push('f_auto'); // Auto format
    cloudinaryParams.push('dpr_auto'); // Auto DPR
  }

  if (capabilities.connectionSpeed === 'slow') {
    cloudinaryParams.push('q_30'); // Very low quality for slow connections
    cloudinaryParams.push('w_auto:100:600'); // Limit width
  }

  if (capabilities.isLowEnd) {
    cloudinaryParams.push('q_auto:low');
    cloudinaryParams.push('w_auto:50:400'); // Smaller images for low-end devices
  }

  // Apply Cloudinary transformations
  if (cloudinaryParams.length > 0 && optimizedSrc.includes('cloudinary')) {
    const params = cloudinaryParams.join(',');
    optimizedSrc = optimizedSrc.replace('/upload/', `/upload/${params}/`);
  }

  return optimizedSrc;
}

// Touch Optimization Hook
export function useTouchOptimization() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Disable 300ms click delay on mobile
    const fastClickStyle = document.createElement('style');
    fastClickStyle.textContent = `
      * {
        touch-action: manipulation;
      }
      
      a, button, [role="button"], input, label, select, textarea {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      
      /* Increase touch targets on mobile */
      @media (max-width: 768px) {
        a, button, [role="button"] {
          min-height: 44px;
          min-width: 44px;
          padding: 12px;
        }
        
        input, select, textarea {
          min-height: 44px;
          padding: 12px;
          font-size: 16px; /* Prevent zoom on iOS */
        }
      }
    `;
    document.head.appendChild(fastClickStyle);

    // Passive event listeners for better scroll performance
    const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel'];
    
    passiveEvents.forEach(event => {
      document.addEventListener(event, () => {}, { passive: true });
    });

    return () => {
      document.head.removeChild(fastClickStyle);
    };
  }, []);
}

// Mobile Performance Monitor
export function useMobilePerformanceMonitor() {
  const capabilities = useDeviceCapabilities();

  useEffect(() => {
    if (typeof window === 'undefined' || !capabilities.isMobile) return;

    // Monitor Core Web Vitals specifically for mobile
    const vitalsThresholds = {
      FCP: capabilities.isLowEnd ? 3000 : 1800, // First Contentful Paint
      LCP: capabilities.isLowEnd ? 4000 : 2500, // Largest Contentful Paint
      FID: 100, // First Input Delay
      CLS: 0.1, // Cumulative Layout Shift
      TTFB: capabilities.connectionSpeed === 'slow' ? 1000 : 600 // Time to First Byte
    };

    // Track mobile-specific metrics
    const trackMobileMetric = (name: string, value: number, threshold: number) => {
      const performance = value <= threshold ? 'good' : value <= threshold * 1.5 ? 'needs-improvement' : 'poor';
      
      console.log(`📱 Mobile ${name}: ${Math.round(value)}ms (${performance})`);
      
      if (window.gtag) {
        window.gtag('event', 'mobile_core_web_vital', {
          event_category: 'Mobile Performance',
          metric_name: name,
          metric_value: Math.round(value),
          performance_rating: performance,
          device_type: capabilities.isLowEnd ? 'low-end' : 'standard',
          connection_speed: capabilities.connectionSpeed,
          non_interaction: true
        });
      }
    };

    // Use Web Vitals library or manual measurement
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          trackMobileMetric('TTFB', navEntry.responseStart - navEntry.requestStart, vitalsThresholds.TTFB);
        }
        
        if (entry.entryType === 'paint') {
          if (entry.name === 'first-contentful-paint') {
            trackMobileMetric('FCP', entry.startTime, vitalsThresholds.FCP);
          }
        }
        
        if (entry.entryType === 'largest-contentful-paint') {
          trackMobileMetric('LCP', entry.startTime, vitalsThresholds.LCP);
        }
        
        if (entry.entryType === 'first-input') {
          trackMobileMetric('FID', (entry as any).processingStart - entry.startTime, vitalsThresholds.FID);
        }
        
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          trackMobileMetric('CLS', (entry as any).value, vitalsThresholds.CLS);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      console.warn('Performance Observer not fully supported');
    }

    return () => observer.disconnect();
  }, [capabilities]);
}

// Battery-Aware Performance
export function useBatteryOptimization() {
  const capabilities = useDeviceCapabilities();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const { batteryLevel, isCharging, isLowEnd } = capabilities;

    // Reduce performance features when battery is low
    if (batteryLevel < 0.2 && !isCharging) {
      console.log('🔋 Low battery detected - reducing performance features');
      
      // Disable animations
      document.documentElement.style.setProperty('--animation-duration', '0s');
      
      // Reduce image quality
      document.documentElement.classList.add('battery-saver');
      
      // Disable auto-refresh features
      document.documentElement.setAttribute('data-battery-saver', 'true');
    }

    // Low-end device optimizations
    if (isLowEnd) {
      console.log('📱 Low-end device detected - applying optimizations');
      
      // Reduce visual effects
      document.documentElement.classList.add('reduced-motion');
      
      // Simplify animations
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }
  }, [capabilities]);
}

// Mobile Performance Utilities
