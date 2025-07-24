/**
 * Analytics Debug & Validation System
 * Ensures all custom events are properly tracked to Vercel Analytics
 */

import { track } from '@vercel/analytics';

interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
}

class AnalyticsValidator {
  private eventQueue: AnalyticsEvent[] = [];
  private isEnabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      // Monitor Vercel Analytics availability
      this.checkVercelAnalytics();
      
      // Log all events for debugging
      window.addEventListener('beforeunload', () => {
        this.logEventSummary();
      });
    }
  }

  private checkVercelAnalytics() {
    if (typeof window !== 'undefined') {
      let retries = 0;
      const maxRetries = 10;
      
      const checkInterval = setInterval(() => {
        // Check if Vercel Analytics is loaded
        if (window.va || window.vaq) {
          console.log('✅ Vercel Analytics loaded successfully');
          clearInterval(checkInterval);
          return;
        }
        
        retries++;
        if (retries >= maxRetries) {
          console.warn('⚠️ Vercel Analytics not detected after 10 attempts');
          clearInterval(checkInterval);
        }
      }, 1000);
    }
  }

  trackEvent(eventName: string, properties: Record<string, any>) {
    if (!this.isEnabled) return;

    const eventData: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now()
    };

    this.eventQueue.push(eventData);

    try {
      // Send to Vercel Analytics with enhanced reliability
      track(eventName, properties);
      
      console.log(`📊 Analytics Event: ${eventName}`, properties);
      
      // Store for debugging
      if (typeof window !== 'undefined') {
        const existingEvents = JSON.parse(localStorage.getItem('analytics_debug') || '[]');
        existingEvents.push(eventData);
        
        // Keep only last 50 events
        if (existingEvents.length > 50) {
          existingEvents.shift();
        }
        
        localStorage.setItem('analytics_debug', JSON.stringify(existingEvents));
      }
      
    } catch (error) {
      console.error(`❌ Analytics Error for ${eventName}:`, error);
      
      // Retry after delay
      setTimeout(() => {
        try {
          track(eventName, properties);
          console.log(`🔄 Analytics Retry Success: ${eventName}`);
        } catch (retryError) {
          console.error(`❌ Analytics Retry Failed: ${eventName}`, retryError);
        }
      }, 2000);
    }
  }

  private logEventSummary() {
    if (this.eventQueue.length > 0) {
      const eventTypes = Array.from(new Set(this.eventQueue.map(e => e.name)));
      console.log('📈 Analytics Session Summary:', {
        total_events: this.eventQueue.length,
        event_types: eventTypes,
        session_duration: Date.now() - this.eventQueue[0].timestamp
      });
    }
  }

  getDebugInfo() {
    if (typeof window === 'undefined') return null;
    
    const storedEvents = JSON.parse(localStorage.getItem('analytics_debug') || '[]');
    const uniqueEvents = Array.from(new Set(storedEvents.map((e: AnalyticsEvent) => e.name)));
    
    return {
      current_session: this.eventQueue,
      stored_events: storedEvents,
      total_tracked: storedEvents.length,
      unique_events: uniqueEvents
    };
  }

  clearDebugData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('analytics_debug');
      this.eventQueue = [];
      console.log('🗑️ Analytics debug data cleared');
    }
  }
}

// Singleton instance
export const analyticsValidator = new AnalyticsValidator();

// Enhanced tracking function that replaces the basic track()
export const enhancedTrack = (eventName: string, properties: Record<string, any> = {}) => {
  analyticsValidator.trackEvent(eventName, properties);
};

// Debug utilities for development
export const getAnalyticsDebugInfo = () => analyticsValidator.getDebugInfo();
export const clearAnalyticsDebug = () => analyticsValidator.clearDebugData();

// Global debug access (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).analyticsDebug = {
    getInfo: getAnalyticsDebugInfo,
    clear: clearAnalyticsDebug,
    validator: analyticsValidator
  };
}
