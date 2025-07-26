/**
 * Resilient Analytics System
 * Handles failed requests, retries, and offline tracking
 */

interface AnalyticsEvent {
  name: string;
  value?: number;
  id?: string;
  url?: string;
  [key: string]: any;
}

class ResilientAnalytics {
  private queue: AnalyticsEvent[] = [];
  private retryAttempts = new Map<string, number>();
  private maxRetries = 3;
  private isOnline = true;

  constructor() {
    if (typeof window !== 'undefined') {
      // Monitor online status
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processQueue();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
      
      // Process queue on page load
      this.processQueue();
    }
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    const eventId = this.generateEventId(event);
    
    try {
      if (!this.isOnline) {
        this.queueForLater(event);
        return;
      }

      await this.sendWithRetry(event, eventId);
    } catch (error) {
      console.warn('Analytics event failed, queuing for later:', error);
      this.queueForLater(event);
    }
  }

  private async sendWithRetry(event: AnalyticsEvent, eventId: string, attempt: number = 1): Promise<void> {
    const backoffDelay = Math.pow(2, attempt) * 1000; // Exponential backoff
    
    try {
      // Try sendBeacon first for better reliability
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const success = navigator.sendBeacon(
          '/api/analytics/web-vitals',
          JSON.stringify(event)
        );
        
        if (success) {
          this.retryAttempts.delete(eventId);
          return;
        }
      }

      // Fallback to fetch if sendBeacon fails or unavailable
      const response = await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(event),
        // Add timeout
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          // Auth issues - don't retry
          console.warn('Analytics authentication failed');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Success - remove from retry map
      this.retryAttempts.delete(eventId);
      return;

    } catch (error) {
      const currentAttempts = this.retryAttempts.get(eventId) || 0;
      
      if (currentAttempts < this.maxRetries) {
        this.retryAttempts.set(eventId, currentAttempts + 1);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return this.sendWithRetry(event, eventId, attempt + 1);
      }
      
      // Max retries reached
      this.retryAttempts.delete(eventId);
      throw error;
    }
  }

  private queueForLater(event: AnalyticsEvent): void {
    this.queue.push({
      ...event,
      timestamp: Date.now()
    });

    // Store in localStorage as backup
    if (typeof window !== 'undefined') {
      try {
        const existingQueue = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
        existingQueue.push(event);
        
        // Keep only last 50 events to prevent storage bloat
        const trimmedQueue = existingQueue.slice(-50);
        localStorage.setItem('analytics_queue', JSON.stringify(trimmedQueue));
      } catch (error) {
        console.warn('Could not store analytics event in localStorage:', error);
      }
    }
  }

  private async processQueue(): Promise<void> {
    if (!this.isOnline || this.queue.length === 0) {
      return;
    }

    // Process queued events
    const eventsToProcess = [...this.queue];
    this.queue = [];

    for (const event of eventsToProcess) {
      try {
        await this.trackEvent(event);
      } catch (error) {
        // If it fails again, it goes back to queue
        console.warn('Failed to process queued analytics event:', error);
      }
    }

    // Also process localStorage queue
    if (typeof window !== 'undefined') {
      try {
        const storedQueue = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
        if (storedQueue.length > 0) {
          localStorage.removeItem('analytics_queue');
          
          for (const event of storedQueue) {
            try {
              await this.trackEvent(event);
            } catch (error) {
              console.warn('Failed to process stored analytics event:', error);
            }
          }
        }
      } catch (error) {
        console.warn('Could not process stored analytics queue:', error);
      }
    }
  }

  private generateEventId(event: AnalyticsEvent): string {
    return `${event.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
const resilientAnalytics = new ResilientAnalytics();

/**
 * Safe analytics wrapper functions
 */
export const trackWebVitalSafe = async (data: AnalyticsEvent): Promise<void> => {
  try {
    await resilientAnalytics.trackEvent(data);
  } catch (error) {
    // Fail silently - analytics should never break the app
    console.warn('Analytics tracking failed:', error);
  }
};

export const trackPageViewSafe = async (url: string): Promise<void> => {
  await trackWebVitalSafe({
    name: 'pageview',
    url: url,
    timestamp: Date.now()
  });
};

export const trackErrorSafe = async (error: Error, context?: string): Promise<void> => {
  await trackWebVitalSafe({
    name: 'error',
    error: error.message,
    stack: error.stack?.slice(0, 500), // Limit stack trace size
    context: context,
    timestamp: Date.now()
  });
};

export default resilientAnalytics;
