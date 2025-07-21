/**
 * Performance Monitoring und Core Web Vitals für AlltagsGold
 * Erweitert das bestehende web-vitals.ts um umfassende Metriken
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

interface ExtendedMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold?: number;
  recommendations?: string[];
  details?: any;
}

class PerformanceMonitor {
  private metrics: ExtendedMetric[] = [];
  private observers: PerformanceObserver[] = [];
  
  constructor() {
    this.setupCoreWebVitals();
    this.setupCustomMetrics();
    this.setupResourceTiming();
  }

  private setupCoreWebVitals() {
    // Core Web Vitals mit Enhanced Tracking
    getCLS(this.handleMetric.bind(this), true);
    getFID(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this), true);
    getTTFB(this.handleMetric.bind(this));
  }

  private handleMetric(metric: Metric) {
    const enhancedMetric = this.enhanceMetric(metric);
    this.metrics.push(enhancedMetric);
    
    // Sende zu Analytics
    this.sendToAnalytics(enhancedMetric);
    
    // Console Logging für Development
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
    
    if (!threshold) {
      return { ...metric };
    }

    const rating = this.getRating(metric.value, threshold);
    const recommendations = this.getRecommendations(metric.name, rating);

    return {
      ...metric,
      rating,
      threshold: threshold.good,
      recommendations
    };
  }

  private getRating(value: number, threshold: { good: number; poor: number }) {
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
        'Reserviere Platz für dynamische Inhalte',
        'Vermeide das Einfügen von Inhalten oberhalb existing content',
        'Nutze font-display: swap für Web Fonts'
      ],
      FCP: [
        'Optimiere Server Response Time',
        'Eliminiere render-blocking CSS',
        'Nutze Resource Hints (preload, preconnect)',
        'Minimiere kritisches CSS'
      ],
      TTFB: [
        'Optimiere Server-Performance',
        'Nutze CDN für statische Assets',
        'Implementiere Caching-Strategien',
        'Reduziere Datenbankabfragen'
      ]
    };

    return recommendations[metricName] || [];
  }

  private setupCustomMetrics() {
    // Zeit bis First Product Visible
    this.measureFirstProductVisible();
    
    // Shopping Cart Performance
    this.measureCartPerformance();
    
    // Shopify API Response Times
    this.measureShopifyApiTimes();
    
    // Bundle Load Times
    this.measureBundleLoading();
  }

  private measureFirstProductVisible() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const metric = {
            name: 'first-product-visible',
            value: performance.now(),
            rating: 'good'
          };
          this.handleCustomMetric(metric);
          observer.disconnect();
        }
      });
    });

    // Observe first product card
    setTimeout(() => {
      const firstProduct = document.querySelector('[data-product-card]');
      if (firstProduct) {
        observer.observe(firstProduct);
      }
    }, 100);
  }

  private measureCartPerformance() {
    // Messe Zeit für Cart-Operationen
    const originalFetch = window.fetch;
    
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : (input as Request).url;
      
      if (url.includes('cart') || url.includes('checkout')) {
        const startTime = performance.now();
        
        try {
          const response = await originalFetch(input, init);
          const endTime = performance.now();
          
          this.handleCustomMetric({
            name: 'cart-api-response',
            value: endTime - startTime,
            rating: endTime - startTime < 1000 ? 'good' : 'poor'
          });
          
          return response;
        } catch (error) {
          this.handleCustomMetric({
            name: 'cart-api-error',
            value: performance.now() - startTime,
            rating: 'poor'
          });
          throw error;
        }
      }
      
      return originalFetch(input, init);
    };
  }

  private measureShopifyApiTimes() {
    // Verfolge Shopify Storefront API Performance
    if (typeof window !== 'undefined') {
      const shopifyObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name.includes('shopify.com')) {
            this.handleCustomMetric({
              name: 'shopify-api-timing',
              value: entry.duration,
              rating: entry.duration < 800 ? 'good' : entry.duration < 1500 ? 'needs-improvement' : 'poor'
            });
          }
        });
      });
      
      shopifyObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(shopifyObserver);
    }
  }

  private measureBundleLoading() {
    // Messe Bundle Load Performance
    if (typeof window !== 'undefined') {
      const bundleObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name.includes('/_next/static/chunks/')) {
            this.handleCustomMetric({
              name: 'bundle-load-time',
              value: entry.duration,
              rating: entry.duration < 500 ? 'good' : entry.duration < 1000 ? 'needs-improvement' : 'poor'
            });
          }
        });
      });
      
      bundleObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(bundleObserver);
    }
  }

  private setupResourceTiming() {
    if (typeof window !== 'undefined') {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resource = entry as PerformanceResourceTiming;
          
          // Track größere Ressourcen
          if (resource.transferSize > 100000) { // > 100KB
            this.handleCustomMetric({
              name: 'large-resource-load',
              value: resource.duration,
              rating: resource.duration < 1000 ? 'good' : 'poor',
              details: {
                url: resource.name,
                size: resource.transferSize,
                type: this.getResourceType(resource.name)
              }
            });
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.jpg') || url.includes('.png') || url.includes('.webp')) return 'image';
    if (url.includes('.woff') || url.includes('.woff2')) return 'font';
    return 'other';
  }

  private handleCustomMetric(metric: any) {
    this.metrics.push(metric);
    
    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
        metric_rating: metric.rating
      });
    }
    
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance Metric: ${metric.name}`, metric);
    }
  }

  private sendToAnalytics(metric: ExtendedMetric) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.value),
        metric_rating: metric.rating,
        non_interaction: true
      });
    }

    // Optional: Send to additional monitoring services
    // this.sendToDatadog(metric);
    // this.sendToSentry(metric);
  }

  private logMetric(metric: ExtendedMetric) {
    const emoji = {
      'good': '✅',
      'needs-improvement': '⚠️',
      'poor': '❌'
    }[metric.rating || 'good'];
    
    console.log(`${emoji} ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`);
    
    if (metric.recommendations && metric.recommendations.length > 0) {
      console.log(`💡 Empfehlungen:`, metric.recommendations);
    }
  }

  private handlePoorPerformance(metric: ExtendedMetric) {
    // Critical Performance Alert
    console.warn(`🚨 Poor Performance Detected: ${metric.name}`, metric);
    
    // Optional: Send alert to monitoring service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_alert', {
        event_category: 'Performance Issues',
        event_label: metric.name,
        value: Math.round(metric.value)
      });
    }
  }

  // Public API
  getMetrics() {
    return this.metrics;
  }

  getPerformanceScore() {
    const coreMetrics = this.metrics.filter(m => 
      ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].includes(m.name)
    );
    
    if (coreMetrics.length === 0) return null;
    
    const scores: number[] = coreMetrics.map(metric => {
      if (metric.rating === 'good') return 100;
      if (metric.rating === 'needs-improvement') return 50;
      return 0;
    });
    
    const total = scores.reduce((a, b) => a + b, 0);
    return Math.round(total / scores.length);
  }

  generateReport() {
    const score = this.getPerformanceScore();
    const issues = this.metrics.filter(m => m.rating === 'poor');
    
    return {
      score,
      totalMetrics: this.metrics.length,
      issues: issues.length,
      recommendations: issues.flatMap(m => m.recommendations || [])
    };
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Initialize performance monitoring
export const performanceMonitor = new PerformanceMonitor();

// Enhanced reportWebVitals function
export function reportWebVitals(onPerfEntry?: (metric: Metric) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup();
  });
}
