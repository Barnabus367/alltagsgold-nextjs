/**
 * Web Vitals Integration für Next.js Performance-Monitoring
 * Trackt Core Web Vitals und sendet sie an Meta Pixel und Vercel Analytics
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

// Use web-vitals Metric type
export type WebVitalsMetric = Metric;

/**
 * Sendet Web Vitals Metriken an Analytics-Plattformen
 */
function sendToAnalytics(metric: WebVitalsMetric) {
  if (typeof window === 'undefined') return;



  // Send to Meta Pixel (Custom Event)
  if (window.fbq && typeof window.fbq === 'function') {
    window.fbq('trackCustom', 'WebVitals', {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
    });
  }

  // Send to Vercel Analytics (Web Vitals are automatically tracked by @vercel/analytics/next)
  // Vercel Analytics captures Web Vitals automatically when using the Analytics component

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`Web Vitals [${metric.name}]:`, {
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    });
  }
}

/**
 * Initialisiert Web Vitals-Tracking
 * Wird in _app.js aufgerufen
 */
export function reportWebVitals(metric: WebVitalsMetric) {
  sendToAnalytics(metric);
}

/**
 * Manuelle Web Vitals-Erfassung
 * Für zusätzliche Performance-Überwachung
 */
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);

  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals tracking initialized');
  }
}

/**
 * Performance Timing für Custom Events
 */
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;

  sendToAnalytics({
    id: `custom-${Date.now()}`,
    name: 'CLS', // Fallback to valid metric name
    value: duration,
    rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor',
    delta: duration,
  } as WebVitalsMetric);

  if (process.env.NODE_ENV === 'development') {
    console.log(`Performance [${name}]: ${duration.toFixed(2)}ms`);
  }
}