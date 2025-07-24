/**
 * Centralized Error Service für alltagsgold.ch
 * Safe Implementation - Erweitert bestehende Funktionalität ohne Breaking Changes
 */

// Error Types & Interfaces
export interface ErrorContext {
  userId?: string;
  sessionId: string;
  route: string;
  userAgent: string;
  timestamp: string;
  buildVersion: string;
  additionalData?: Record<string, any>;
}

export interface ErrorReport {
  error: Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'validation' | 'shopify' | 'runtime' | 'ui' | 'checkout';
  metadata?: Record<string, any>;
  errorId: string;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffMultiplier: number;
  initialDelay: number;
  maxDelay: number;
  retryCondition: (error: Error) => boolean;
}

export enum ErrorAction {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  REDIRECT = 'redirect',
  SHOW_MESSAGE = 'show_message',
  IGNORE = 'ignore',
  MANUAL_INTERVENTION = 'manual_intervention'
}

export interface ErrorRecovery {
  action: ErrorAction;
  message?: string;
  metadata?: Record<string, any>;
  retryConfig?: RetryConfig;
}

// Utility Functions
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getErrorContext(): ErrorContext {
  const now = new Date().toISOString();
  
  return {
    sessionId: getSessionId(),
    route: typeof window !== 'undefined' ? window.location.pathname : 'ssr',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    timestamp: now,
    buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'dev',
  };
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr-session';
  
  let sessionId = sessionStorage.getItem('alltagsgold_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('alltagsgold_session_id', sessionId);
  }
  return sessionId;
}

// Error Classification
export function classifyError(error: Error): {
  category: ErrorReport['category'];
  severity: ErrorReport['severity'];
} {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || '';

  // Shopify-spezifische Errors
  if (message.includes('shopify') || message.includes('storefront') || message.includes('graphql')) {
    return {
      category: 'shopify',
      severity: message.includes('checkout') ? 'critical' : 'high'
    };
  }

  // Network Errors
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return {
      category: 'network',
      severity: 'medium'
    };
  }

  // Checkout Errors
  if (message.includes('checkout') || message.includes('payment') || message.includes('cart')) {
    return {
      category: 'checkout',
      severity: 'critical'
    };
  }

  // Validation Errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return {
      category: 'validation',
      severity: 'low'
    };
  }

  // UI/Runtime Errors
  if (stack.includes('components/') || message.includes('render')) {
    return {
      category: 'ui',
      severity: 'medium'
    };
  }

  // Default
  return {
    category: 'runtime',
    severity: 'medium'
  };
}

// Main Error Service Class
class ErrorService {
  private errorQueue: ErrorReport[] = [];
  private isOnline = true;
  private maxQueueSize = 100;

  constructor() {
    this.initializeNetworkMonitoring();
    this.initializeUnhandledErrorCatching();
  }

  private initializeNetworkMonitoring() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    this.isOnline = navigator.onLine;
  }

  private initializeUnhandledErrorCatching() {
    if (typeof window === 'undefined') return;

    // Globale Error-Handler (Safe - überschreibt keine bestehenden)
    const originalErrorHandler = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (error) {
        this.reportError({
          error,
          context: getErrorContext(),
          ...classifyError(error),
          metadata: { source, lineno, colno }
        });
      }

      // Call original handler if exists
      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error);
      }
      return false;
    };

    // Unhandled Promise Rejections
    const originalUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));

      this.reportError({
        error,
        context: getErrorContext(),
        ...classifyError(error),
        metadata: { type: 'unhandled_promise_rejection' }
      });

      // Call original handler if exists
      if (originalUnhandledRejection) {
        originalUnhandledRejection.call(window, event);
      }
    };
  }

  /**
   * Report an error (Safe - never throws)
   */
  reportError(partialReport: Omit<ErrorReport, 'errorId'>): string {
    try {
      const errorId = generateErrorId();
      const report: ErrorReport = {
        ...partialReport,
        errorId,
        context: {
          ...getErrorContext(),
          ...partialReport.context
        }
      };

      // Add to queue
      this.addToQueue(report);

      // Try to send immediately if online
      if (this.isOnline) {
        this.sendErrorReport(report);
      }

      // Console logging for development
      if (process.env.NODE_ENV === 'development') {
        console.group(`🚨 Error Report [${report.severity.toUpperCase()}]`);
        console.error('Error:', report.error);
        console.log('Context:', report.context);
        console.log('Category:', report.category);
        console.log('Error ID:', report.errorId);
        if (report.metadata) {
          console.log('Metadata:', report.metadata);
        }
        console.groupEnd();
      }

      return errorId;
    } catch (reportingError) {
      // Safe fallback - never let error reporting break the app
      console.error('Error reporting failed:', reportingError);
      return 'reporting_failed';
    }
  }

  private addToQueue(report: ErrorReport) {
    this.errorQueue.push(report);
    
    // Prevent memory leaks
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift(); // Remove oldest
    }
  }

  private async sendErrorReport(report: ErrorReport) {
    try {
      // In production würde hier Sentry, LogRocket, etc. aufgerufen
      // Für jetzt: Safe API call mit Timeout
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Mock API endpoint - würde in production durch echten Service ersetzt
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
          signal: controller.signal
        });
      }

      clearTimeout(timeoutId);
    } catch (error) {
      // Silent fail - Error reporting shouldn't break the app
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send error report:', error);
      }
    }
  }

  private async flushErrorQueue() {
    const queue = [...this.errorQueue];
    this.errorQueue = [];

    for (const report of queue) {
      await this.sendErrorReport(report);
    }
  }

  /**
   * Get recovery strategy for an error
   */
  getRecoveryStrategy(error: Error, context?: Record<string, any>): ErrorRecovery {
    const classification = classifyError(error);
    const message = error.message.toLowerCase();

    // Shopify-spezifische Recovery
    if (classification.category === 'shopify') {
      if (message.includes('rate limit') || message.includes('429')) {
        return {
          action: ErrorAction.RETRY,
          message: 'Shopify API Rate Limit erreicht',
          retryConfig: {
            maxAttempts: 3,
            backoffMultiplier: 2,
            initialDelay: 1000,
            maxDelay: 10000,
            retryCondition: (err) => err.message.includes('429')
          }
        };
      }

      if (message.includes('inventory') || message.includes('stock')) {
        return {
          action: ErrorAction.SHOW_MESSAGE,
          message: 'Artikel nicht verfügbar',
          metadata: { showAlternatives: true }
        };
      }

      if (message.includes('checkout')) {
        return {
          action: ErrorAction.FALLBACK,
          message: 'Checkout-Problem erkannt',
          metadata: { fallbackToManual: true }
        };
      }
    }

    // Network-spezifische Recovery
    if (classification.category === 'network') {
      return {
        action: ErrorAction.RETRY,
        message: 'Netzwerk-Problem erkannt',
        retryConfig: {
          maxAttempts: 3,
          backoffMultiplier: 1.5,
          initialDelay: 500,
          maxDelay: 5000,
          retryCondition: () => navigator.onLine
        }
      };
    }

    // Validation Errors
    if (classification.category === 'validation') {
      return {
        action: ErrorAction.SHOW_MESSAGE,
        message: 'Eingabe-Validierung fehlgeschlagen'
      };
    }

    // Default Recovery
    return {
      action: ErrorAction.SHOW_MESSAGE,
      message: 'Ein unerwarteter Fehler ist aufgetreten'
    };
  }

  /**
   * Check if an error should be retried
   */
  shouldRetry(error: Error, attemptCount: number): boolean {
    const recovery = this.getRecoveryStrategy(error);
    
    if (recovery.action !== ErrorAction.RETRY || !recovery.retryConfig) {
      return false;
    }

    return attemptCount < recovery.retryConfig.maxAttempts;
  }

  /**
   * Calculate delay for retry
   */
  calculateRetryDelay(attempt: number, config: RetryConfig): number {
    const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }
}

// Singleton instance
export const errorService = new ErrorService();

// Convenience functions for backward compatibility
export function reportError(error: Error, additionalContext?: Record<string, any>): string {
  const classification = classifyError(error);
  
  return errorService.reportError({
    error,
    context: {
      ...getErrorContext(),
      ...additionalContext
    },
    ...classification
  });
}

export function getErrorRecovery(error: Error, context?: Record<string, any>): ErrorRecovery {
  return errorService.getRecoveryStrategy(error, context);
}

// Development helper
export function simulateError(type: 'network' | 'shopify' | 'validation' = 'network') {
  if (process.env.NODE_ENV !== 'development') return;

  const errors = {
    network: new Error('Network request failed'),
    shopify: new Error('Shopify GraphQL error: Rate limit exceeded'),
    validation: new Error('Validation failed: Required field missing')
  };

  throw errors[type];
}
