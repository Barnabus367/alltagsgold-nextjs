/**
 * Smart Retry Handler für alltagsgold.ch
 * Backward Compatible - Wrapper um bestehende Funktionen
 */

import { errorService, ErrorAction, RetryConfig, ErrorContext } from './error-service';

// Types
interface RetryOptions {
  maxAttempts?: number;
  backoffMultiplier?: number;
  initialDelay?: number;
  maxDelay?: number;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
  onMaxAttemptsReached?: (error: Error) => void;
}

interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

// Default Retry Configurations
export const DEFAULT_RETRY_CONFIGS = {
  network: {
    maxAttempts: 3,
    backoffMultiplier: 1.5,
    initialDelay: 500,
    maxDelay: 5000,
    retryCondition: (error: Error) => {
      const message = error.message.toLowerCase();
      return message.includes('fetch') || 
             message.includes('network') || 
             message.includes('timeout') ||
             !navigator.onLine;
    }
  },
  shopify: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 1000,
    maxDelay: 10000,
    retryCondition: (error: Error) => {
      const message = error.message.toLowerCase();
      return message.includes('429') || 
             message.includes('rate limit') ||
             message.includes('temporary');
    }
  },
  general: {
    maxAttempts: 2,
    backoffMultiplier: 1.5,
    initialDelay: 300,
    maxDelay: 2000,
    retryCondition: (error: Error) => {
      // Retry für temporäre Fehler
      const message = error.message.toLowerCase();
      return !message.includes('validation') && 
             !message.includes('unauthorized') &&
             !message.includes('forbidden');
    }
  }
} as const;

// Utility function to delay execution
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main Retry Handler Class
class RetryHandler {
  /**
   * Execute a function with retry logic
   * SAFE: Never throws - returns result object instead
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    const config = this.buildRetryConfig(options);
    
    let lastError: Error = new Error('Unknown error');
    let attempts = 0;

    for (attempts = 1; attempts <= config.maxAttempts; attempts++) {
      try {
        const result = await operation();
        
        return {
          success: true,
          data: result,
          attempts,
          totalTime: Date.now() - startTime
        };
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Report error for analytics (simplified)
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Retry attempt ${attempts}/${config.maxAttempts} failed:`, lastError.message);
        }

        // Check if we should retry
        if (attempts < config.maxAttempts && config.retryCondition(lastError)) {
          const delayTime = this.calculateDelay(attempts, config);
          
          // Call onRetry callback if provided
          if (options.onRetry) {
            try {
              options.onRetry(attempts, lastError);
            } catch (callbackError) {
              // Don't let callback errors break retry logic
              console.warn('Retry callback error:', callbackError);
            }
          }
          
          await delay(delayTime);
          continue;
        }
        
        // Max attempts reached or shouldn't retry
        break;
      }
    }

    // Call onMaxAttemptsReached callback if provided
    if (options.onMaxAttemptsReached) {
      try {
        options.onMaxAttemptsReached(lastError);
      } catch (callbackError) {
        console.warn('Max attempts callback error:', callbackError);
      }
    }

    return {
      success: false,
      error: lastError,
      attempts,
      totalTime: Date.now() - startTime
    };
  }

  /**
   * Wrapper for existing functions to add retry capability
   * SAFE: Maintains original function signature
   */
  withRetry<T extends (...args: any[]) => Promise<any>>(
    originalFunction: T,
    retryOptions: RetryOptions = {}
  ): T {
    return ((...args: Parameters<T>) => {
      return this.executeWithRetry(
        () => originalFunction(...args),
        retryOptions
      ).then(result => {
        if (result.success) {
          return result.data;
        }
        throw result.error;
      });
    }) as T;
  }

  private buildRetryConfig(options: RetryOptions): Required<RetryConfig> {
    return {
      maxAttempts: options.maxAttempts || DEFAULT_RETRY_CONFIGS.general.maxAttempts,
      backoffMultiplier: options.backoffMultiplier || DEFAULT_RETRY_CONFIGS.general.backoffMultiplier,
      initialDelay: options.initialDelay || DEFAULT_RETRY_CONFIGS.general.initialDelay,
      maxDelay: options.maxDelay || DEFAULT_RETRY_CONFIGS.general.maxDelay,
      retryCondition: options.retryCondition || DEFAULT_RETRY_CONFIGS.general.retryCondition
    };
  }

  private calculateDelay(attempt: number, config: Required<RetryConfig>): number {
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1; // ±10% jitter
    const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    const jitteredDelay = delay * (1 + jitter);
    
    return Math.min(jitteredDelay, config.maxDelay);
  }

  private categorizeError(error: Error): 'network' | 'shopify' | 'validation' | 'runtime' {
    const message = error.message.toLowerCase();
    
    if (message.includes('shopify') || message.includes('graphql') || message.includes('storefront')) {
      return 'shopify';
    }
    
    if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
      return 'network';
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    
    return 'runtime';
  }

  private getOperationContext(): Partial<ErrorContext> {
    return {
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      route: typeof window !== 'undefined' ? window.location.pathname : 'ssr',
      additionalData: {
        online: typeof navigator !== 'undefined' ? navigator.onLine : true
      }
    };
  }
}

// Singleton instance
export const retryHandler = new RetryHandler();

// Convenience functions
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: RetryOptions
): T {
  return retryHandler.withRetry(fn, options);
}

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const result = await retryHandler.executeWithRetry(operation, options);
  
  if (result.success) {
    return result.data!;
  }
  
  throw result.error;
}

// Safe wrapper that never throws
export async function safeExecuteWithRetry<T>(
  operation: () => Promise<T>,
  options?: RetryOptions
): Promise<RetryResult<T>> {
  return retryHandler.executeWithRetry(operation, options);
}

// Predefined retry configurations for common use cases
export const retryConfigs = {
  /**
   * For Shopify API calls
   */
  shopify: (options?: Partial<RetryOptions>): RetryOptions => ({
    ...DEFAULT_RETRY_CONFIGS.shopify,
    ...options
  }),

  /**
   * For network requests
   */
  network: (options?: Partial<RetryOptions>): RetryOptions => ({
    ...DEFAULT_RETRY_CONFIGS.network,
    ...options
  }),

  /**
   * For general operations
   */
  general: (options?: Partial<RetryOptions>): RetryOptions => ({
    ...DEFAULT_RETRY_CONFIGS.general,
    ...options
  }),

  /**
   * Custom configuration builder
   */
  custom: (config: RetryOptions): RetryOptions => config
};
