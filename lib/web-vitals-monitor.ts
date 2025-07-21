/**
 * Core Web Vitals Monitoring System für AlltagsGold
 * Detailliertes Performance-Tracking für Business-Metriken
 */

// Core Web Vitals Thresholds
const VITALS_THRESHOLDS = {
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
  INP: { good: 200, needsImprovement: 500 },   // Interaction to Next Paint
} as const;

// Business Impact Mapping
const BUSINESS_IMPACT = {
  LCP: {
    good: 'conversion_rate_boost_high',
    needsImprovement: 'conversion_rate_neutral', 
    poor: 'conversion_rate_loss'
  },
  FID: {
    good: 'user_engagement_high',
    needsImprovement: 'user_engagement_medium',
    poor: 'user_engagement_low'
  },
  CLS: {
    good: 'user_experience_excellent',
    needsImprovement: 'user_experience_fair',
    poor: 'user_experience_poor'
  }
} as const;

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  entries: PerformanceEntry[];
}

interface BusinessMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  bounceRateIndicator: 'low' | 'medium' | 'high';
  conversionOptimizationScore: number;
  mobilePerformanceScore: number;
  seoPerformanceScore: number;
}

class WebVitalsMonitor {
  private metrics: Map<string, VitalMetric> = new Map();
  private businessMetrics: BusinessMetrics | null = null;
  private observers: PerformanceObserver[] = [];
  private startTime: number = performance.now();

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined') return;

    // FCP (First Contentful Paint)
    this.observePaintMetrics();
    
    // LCP (Largest Contentful Paint) 
    this.observeLCP();
    
    // FID (First Input Delay)
    this.observeFID();
    
    // CLS (Cumulative Layout Shift)
    this.observeCLS();
    
    // TTFB (Time to First Byte)
    this.observeNavigation();
    
    // INP (Interaction to Next Paint) - Experimental
    this.observeINP();

    // Business Metrics
    this.calculateBusinessMetrics();
  }

  private observePaintMetrics() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('FCP', {
              name: 'FCP',
              value: entry.startTime,
              rating: this.getRating('FCP', entry.startTime),
              delta: entry.startTime,
              id: this.generateId(),
              navigationType: this.getNavigationType(),
              entries: [entry]
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('Paint metrics not supported');
    }
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.recordMetric('LCP', {
          name: 'LCP',
          value: lastEntry.startTime,
          rating: this.getRating('LCP', lastEntry.startTime),
          delta: lastEntry.startTime,
          id: this.generateId(),
          navigationType: this.getNavigationType(),
          entries: entries
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('LCP not supported');
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;
          
          this.recordMetric('FID', {
            name: 'FID',
            value: fid,
            rating: this.getRating('FID', fid),
            delta: fid,
            id: this.generateId(),
            navigationType: this.getNavigationType(),
            entries: [entry]
          });
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('FID not supported');
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0;
      let clsEntries: PerformanceEntry[] = [];

      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        });

        this.recordMetric('CLS', {
          name: 'CLS',
          value: clsValue,
          rating: this.getRating('CLS', clsValue),
          delta: clsValue,
          id: this.generateId(),
          navigationType: this.getNavigationType(),
          entries: clsEntries
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('CLS not supported');
    }
  }

  private observeNavigation() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          const ttfb = entry.responseStart - entry.requestStart;
          
          this.recordMetric('TTFB', {
            name: 'TTFB',
            value: ttfb,
            rating: this.getRating('TTFB', ttfb),
            delta: ttfb,
            id: this.generateId(),
            navigationType: entry.type,
            entries: [entry]
          });
        });
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('Navigation timing not supported');
    }
  }

  private observeINP() {
    // Experimental - Interaction to Next Paint
    if ('PerformanceEventTiming' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (entry.duration > 40) { // Only track slow interactions
              this.recordMetric('INP', {
                name: 'INP',
                value: entry.duration,
                rating: this.getRating('INP', entry.duration),
                delta: entry.duration,
                id: this.generateId(),
                navigationType: this.getNavigationType(),
                entries: [entry]
              });
            }
          });
        });
        
        observer.observe({ entryTypes: ['event'] });
        this.observers.push(observer);
      } catch (e) {
        console.warn('INP not supported');
      }
    }
  }

  private calculateBusinessMetrics() {
    setTimeout(() => {
      const now = performance.now();
      const pageLoadTime = now - this.startTime;
      
      // Time to Interactive (approximation)
      const timeToInteractive = this.estimateTimeToInteractive();
      
      // Bounce Rate Indicator based on performance
      const bounceRateIndicator = this.calculateBounceRateIndicator();
      
      // Conversion Optimization Score
      const conversionOptimizationScore = this.calculateConversionScore();
      
      // Mobile Performance Score
      const mobilePerformanceScore = this.calculateMobileScore();
      
      // SEO Performance Score
      const seoPerformanceScore = this.calculateSEOScore();

      this.businessMetrics = {
        pageLoadTime,
        timeToInteractive,
        bounceRateIndicator,
        conversionOptimizationScore,
        mobilePerformanceScore,
        seoPerformanceScore
      };

      this.reportBusinessMetrics();
    }, 5000); // Wait 5 seconds for metrics to stabilize
  }

  private estimateTimeToInteractive(): number {
    // Simplified TTI calculation
    const fcp = this.metrics.get('FCP')?.value || 0;
    const fid = this.metrics.get('FID')?.value || 0;
    return fcp + fid + 500; // Rough approximation
  }

  private calculateBounceRateIndicator(): 'low' | 'medium' | 'high' {
    const lcp = this.metrics.get('LCP')?.value || 0;
    const cls = this.metrics.get('CLS')?.value || 0;
    
    if (lcp > 4000 || cls > 0.25) return 'high';
    if (lcp > 2500 || cls > 0.1) return 'medium';
    return 'low';
  }

  private calculateConversionScore(): number {
    let score = 100;
    
    // Penalize based on Core Web Vitals
    const lcp = this.metrics.get('LCP')?.value || 0;
    const fid = this.metrics.get('FID')?.value || 0;
    const cls = this.metrics.get('CLS')?.value || 0;
    
    if (lcp > VITALS_THRESHOLDS.LCP.good) score -= 20;
    if (lcp > VITALS_THRESHOLDS.LCP.needsImprovement) score -= 30;
    
    if (fid > VITALS_THRESHOLDS.FID.good) score -= 15;
    if (fid > VITALS_THRESHOLDS.FID.needsImprovement) score -= 25;
    
    if (cls > VITALS_THRESHOLDS.CLS.good) score -= 15;
    if (cls > VITALS_THRESHOLDS.CLS.needsImprovement) score -= 25;
    
    return Math.max(0, score);
  }

  private calculateMobileScore(): number {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return 100;
    
    let score = 100;
    const fcp = this.metrics.get('FCP')?.value || 0;
    const lcp = this.metrics.get('LCP')?.value || 0;
    
    // Stricter thresholds for mobile
    if (fcp > 1800) score -= 15;
    if (fcp > 3000) score -= 25;
    if (lcp > 2500) score -= 20;
    if (lcp > 4000) score -= 35;
    
    return Math.max(0, score);
  }

  private calculateSEOScore(): number {
    let score = 100;
    
    // Core Web Vitals impact on SEO
    const lcp = this.metrics.get('LCP')?.rating;
    const fid = this.metrics.get('FID')?.rating;
    const cls = this.metrics.get('CLS')?.rating;
    
    if (lcp === 'poor') score -= 30;
    else if (lcp === 'needs-improvement') score -= 15;
    
    if (fid === 'poor') score -= 20;
    else if (fid === 'needs-improvement') score -= 10;
    
    if (cls === 'poor') score -= 25;
    else if (cls === 'needs-improvement') score -= 12;
    
    return Math.max(0, score);
  }

  private recordMetric(name: string, metric: VitalMetric) {
    this.metrics.set(name, metric);
    this.reportMetric(metric);
  }

  private reportMetric(metric: VitalMetric) {
    console.log(`📊 ${metric.name}: ${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'} (${metric.rating})`);
    
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        metric_rating: metric.rating,
        navigation_type: metric.navigationType,
        non_interaction: true,
        // Business context
        business_impact: this.getBusinessImpact(metric.name, metric.rating),
      });
    }

    // Send to custom analytics endpoint
    this.sendToAnalytics(metric);
  }

  private reportBusinessMetrics() {
    if (!this.businessMetrics) return;

    console.log('💼 Business Metrics:', {
      'Page Load Time': `${Math.round(this.businessMetrics.pageLoadTime)}ms`,
      'Time to Interactive': `${Math.round(this.businessMetrics.timeToInteractive)}ms`,
      'Bounce Rate Risk': this.businessMetrics.bounceRateIndicator,
      'Conversion Score': `${this.businessMetrics.conversionOptimizationScore}/100`,
      'Mobile Score': `${this.businessMetrics.mobilePerformanceScore}/100`,
      'SEO Score': `${this.businessMetrics.seoPerformanceScore}/100`
    });

    if (window.gtag) {
      window.gtag('event', 'business_metrics', {
        event_category: 'Performance',
        page_load_time: Math.round(this.businessMetrics.pageLoadTime),
        time_to_interactive: Math.round(this.businessMetrics.timeToInteractive),
        bounce_rate_indicator: this.businessMetrics.bounceRateIndicator,
        conversion_score: this.businessMetrics.conversionOptimizationScore,
        mobile_score: this.businessMetrics.mobilePerformanceScore,
        seo_score: this.businessMetrics.seoPerformanceScore,
        non_interaction: true
      });
    }
  }

  private sendToAnalytics(metric: VitalMetric) {
    // Send to your analytics service
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        businessMetrics: this.businessMetrics
      })
    }).catch(() => {
      // Fail silently for analytics
    });
  }

  private getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = VITALS_THRESHOLDS[metricName as keyof typeof VITALS_THRESHOLDS];
    if (!thresholds) return 'poor';
    
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  private getBusinessImpact(metricName: string, rating: string): string {
    const impact = BUSINESS_IMPACT[metricName as keyof typeof BUSINESS_IMPACT];
    return impact?.[rating as keyof typeof impact] || 'unknown';
  }

  private getNavigationType(): string {
    if (typeof window !== 'undefined' && 'navigation' in performance) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navEntry?.type || 'unknown';
    }
    return 'unknown';
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public getMetrics(): Map<string, VitalMetric> {
    return this.metrics;
  }

  public getBusinessMetrics(): BusinessMetrics | null {
    return this.businessMetrics;
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global monitoring instance
let globalMonitor: WebVitalsMonitor | null = null;

export function initializeWebVitalsMonitoring(): WebVitalsMonitor {
  if (typeof window === 'undefined') {
    return {} as WebVitalsMonitor;
  }

  if (!globalMonitor) {
    globalMonitor = new WebVitalsMonitor();
  }
  
  return globalMonitor;
}

export function getWebVitalsMetrics() {
  return globalMonitor?.getMetrics() || new Map();
}

export function getBusinessMetrics() {
  return globalMonitor?.getBusinessMetrics() || null;
}

export { WebVitalsMonitor, VITALS_THRESHOLDS, BUSINESS_IMPACT };
export type { VitalMetric, BusinessMetrics };
