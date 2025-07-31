/**
 * Optimized Performance Monitoring with Memory Leak Prevention
 * Replaces the original performance-monitor.ts with better cleanup
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

// Performance Thresholds (Google Standards)
const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
  FID: { good: 100, poor: 300 },        // First Input Delay  
  CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }       // Time to First Byte
};

interface ExtendedMetric extends Metric {
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold?: number;
  recommendations?: string[];
  details?: any;
}

// Singleton instance to prevent multiple initializations
let performanceMonitorInstance: PerformanceMonitor | null = null;

class PerformanceMonitor {
  private metrics: ExtendedMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;
  private cleanupCallbacks: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && !this.isInitialized) {
      this.initialize();
    }
  }

  private initialize() {
    this.setupCoreWebVitals();
    this.setupCustomMetrics();
    this.setupResourceTiming();
    this.isInitialized = true;
    
    // Cleanup on page unload
    const cleanup = () => this.cleanup();
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
    
    // Store cleanup callback for manual cleanup if needed
    this.cleanupCallbacks.push(() => {
      window.removeEventListener('beforeunload', cleanup);
      window.removeEventListener('pagehide', cleanup);
    });
  }

  private cleanup() {
    // Disconnect all observers
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (e) {
        console.warn('Failed to disconnect observer:', e);
      }
    });
    
    // Execute all cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (e) {
        console.warn('Cleanup callback failed:', e);
      }
    });
    
    // Clear arrays
    this.observers = [];
    this.metrics = [];
    this.cleanupCallbacks = [];
    this.isInitialized = false;
  }

  private setupCoreWebVitals() {
    // Core Web Vitals with callbacks that auto-cleanup
    const vitalsCallbacks = [
      getCLS(this.handleMetric.bind(this), { reportAllChanges: true }),
      getFID(this.handleMetric.bind(this)),
      getFCP(this.handleMetric.bind(this)),
      getLCP(this.handleMetric.bind(this), { reportAllChanges: true }),
      getTTFB(this.handleMetric.bind(this))
    ];
    
    // Store cleanup for web-vitals (they auto-cleanup on navigation)
    this.cleanupCallbacks.push(() => {
      // Web vitals library handles its own cleanup
    });
  }

  private handleMetric(metric: Metric) {
    const enhancedMetric = this.enhanceMetric(metric);
    this.metrics.push(enhancedMetric);
    
    // Send to analytics
    this.reportMetric(enhancedMetric);
    
    if (process.env.NODE_ENV === 'development') {
      this.logMetric(enhancedMetric);
    }
    
    // Performance Alerts für kritische Metriken
    if (enhancedMetric.rating === 'poor') {
      this.handlePoorPerformance(enhancedMetric);
    }
  }

  private enhanceMetric(metric: Metric): ExtendedMetric {
    const threshold = PERFORMANCE_THRESHOLDS[metric.name as keyof typeof PERFORMANCE_THRESHOLDS];
    
    const rating = threshold 
      ? this.getRating(metric.value, threshold)
      : 'good';
    
    const recommendations = this.getRecommendations(metric.name, rating);

    return {
      ...metric,
      rating,
      threshold: threshold?.good,
      recommendations
    };
  }

  private getRating(value: number, threshold: { good: number; poor: number }): ExtendedMetric['rating'] {
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private getRecommendations(metricName: string, rating: string): string[] {
    if (rating === 'good') return [];

    const recommendations: Record<string, string[]> = {
      LCP: [
        'Optimiere Serverantwortzeiten',
        'Reduziere render-blocking Ressourcen',  
        'Nutze Cloudinary Transformationen optimal',
        'Implementiere Preloading für kritische Bilder'
      ],
      FID: [
        'Reduziere JavaScript Bundle Size',
        'Implementiere Code Splitting',
        'Nutze Web Workers für schwere Berechnungen',
        'Optimiere Event Handler'
      ],
      CLS: [
        'Definiere explizite Bildgrößen',
        'Vermeide dynamische Content-Injections',
        'Nutze CSS Transform statt Layout-Änderungen',
        'Implementiere Skeleton Screens'
      ],
      FCP: [
        'Optimiere kritisches CSS',
        'Reduziere Server Response Time',
        'Nutze Resource Hints (preconnect, dns-prefetch)',
        'Minimiere Render-Blocking Ressourcen'
      ],
      TTFB: [
        'Optimiere Server-Konfiguration',
        'Implementiere effizientes Caching',
        'Nutze CDN für statische Assets',
        'Reduziere Redirects'
      ]
    };

    return recommendations[metricName] || [];
  }

  private setupCustomMetrics() {
    // Only setup if PerformanceObserver is available
    if (!('PerformanceObserver' in window)) return;

    // Zeit bis First Product Visible
    this.measureFirstProductVisible();
    
    // Shopping Cart Performance
    this.measureCartPerformance();
    
    // Shopify API Performance
    this.measureShopifyApiCalls();
    
    // Bundle Load Performance
    this.measureBundleLoading();
  }

  private createSafeObserver(callback: PerformanceObserverCallback, options: PerformanceObserverInit): PerformanceObserver | null {
    try {
      const observer = new PerformanceObserver(callback);
      observer.observe(options);
      this.observers.push(observer);
      return observer;
    } catch (e) {
      console.warn('Failed to create PerformanceObserver:', e);
      return null;
    }
  }

  private measureFirstProductVisible() {
    this.createSafeObserver((list) => {
      const productCards = document.querySelectorAll('[data-product-card]');
      if (productCards.length > 0) {
        const firstProductTime = performance.now();
        this.reportCustomMetric('first-product-visible', firstProductTime);
      }
    }, { entryTypes: ['paint'] });
  }

  private measureCartPerformance() {
    // Measure cart operations
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const url = args[0]?.toString() || '';
        if (url.includes('/cart')) {
          const startTime = performance.now();
          try {
            const response = await originalFetch(...args);
            const duration = performance.now() - startTime;
            this.reportCustomMetric('cart-operation', duration);
            return response;
          } catch (error) {
            const duration = performance.now() - startTime;
            this.reportCustomMetric('cart-operation-error', duration);
            throw error;
          }
        }
        return originalFetch(...args);
      };
      
      // Store original fetch for cleanup
      this.cleanupCallbacks.push(() => {
        window.fetch = originalFetch;
      });
    }
  }

  private measureShopifyApiCalls() {
    this.createSafeObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;
        if (resource.name.includes('myshopify.com')) {
          this.reportCustomMetric('shopify-api-call', resource.duration, {
            endpoint: resource.name,
            size: resource.transferSize
          });
        }
      });
    }, { entryTypes: ['resource'] });
  }

  private measureBundleLoading() {
    this.createSafeObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;
        if (resource.name.includes('_next/static/chunks')) {
          this.reportCustomMetric('bundle-load', resource.duration, {
            bundle: resource.name,
            size: resource.transferSize
          });
        }
      });
    }, { entryTypes: ['resource'] });
  }

  private setupResourceTiming() {
    this.createSafeObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;
        
        // Track large resources
        if (resource.transferSize > 100000) { // 100KB
          this.reportCustomMetric('large-resource', resource.duration, {
            url: resource.name,
            size: resource.transferSize,
            type: this.getResourceType(resource.name)
          });
        }
      });
    }, { entryTypes: ['resource'] });
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(jpg|jpeg|png|webp|avif)/i)) return 'image';
    if (url.match(/\.(js|mjs)/i)) return 'script';
    if (url.match(/\.(css)/i)) return 'stylesheet';
    if (url.match(/\.(woff|woff2|ttf|otf)/i)) return 'font';
    return 'other';
  }

  private reportMetric(metric: ExtendedMetric) {
    // Send to analytics endpoint
    if (typeof window !== 'undefined' && window.fetch) {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: metric.name,
          value: metric.value,
          rating: metric.rating,
          id: metric.id,
          timestamp: Date.now()
        })
      }).catch(() => {
        // Silently fail - don't impact user experience
      });
    }
  }

  private reportCustomMetric(name: string, value: number, details?: any) {
    const metric: ExtendedMetric = {
      name,
      value,
      id: `${name}-${Date.now()}`,
      delta: value,
      rating: 'good',
      details
    };
    
    this.metrics.push(metric);
    this.reportMetric(metric);
  }

  private logMetric(metric: ExtendedMetric) {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(
      `${emoji} ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`,
      metric.recommendations?.length ? '\nRecommendations:' : '',
      ...(metric.recommendations || [])
    );
  }

  private handlePoorPerformance(metric: ExtendedMetric) {
    // In production, könnte hier ein Alert an Monitoring gesendet werden
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Poor performance detected for ${metric.name}:`, metric.value);
    }
  }

  // Public API
  public getMetrics(): ExtendedMetric[] {
    return [...this.metrics];
  }

  public reset() {
    this.cleanup();
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }
}

// Export singleton instance
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor();
  }
  return performanceMonitorInstance;
}

// Auto-initialize on import if in browser
if (typeof window !== 'undefined') {
  getPerformanceMonitor();
}

// Export for use in other modules
export { PerformanceMonitor, PERFORMANCE_THRESHOLDS };
export type { ExtendedMetric };