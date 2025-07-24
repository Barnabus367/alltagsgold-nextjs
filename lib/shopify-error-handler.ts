/**
 * Enhanced Shopify Error Handler für alltagsgold.ch
 * Safe wrapper um bestehende Shopify-Funktionen
 */

import { withRetry, retryConfigs, safeExecuteWithRetry } from './retry-handler';
import { reportError, getErrorRecovery, ErrorAction } from './error-service';

// Enhanced Shopify Types
export interface ShopifyErrorDetails {
  code?: string;
  field?: string;
  message: string;
  extensions?: {
    code?: string;
    documentation_url?: string;
  };
}

export interface ShopifyErrorContext {
  operation: string;
  variables?: Record<string, any>;
  query?: string;
  endpoint?: string;
}

export interface ShopifyRecoveryResult {
  success: boolean;
  data?: any;
  fallbackUsed?: boolean;
  errorMessage?: string;
  action?: ErrorAction;
}

// Error Classification für Shopify
export function classifyShopifyError(error: any): {
  type: 'rate_limit' | 'inventory' | 'checkout' | 'authentication' | 'network' | 'validation' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
} {
  const message = String(error.message || error.toString()).toLowerCase();
  const errors = error.response?.errors || error.errors || [];

  // Rate Limit Errors
  if (message.includes('429') || message.includes('rate limit') || message.includes('throttle')) {
    return {
      type: 'rate_limit',
      severity: 'medium',
      recoverable: true
    };
  }

  // Inventory/Stock Errors
  if (message.includes('inventory') || message.includes('stock') || message.includes('available')) {
    return {
      type: 'inventory',
      severity: 'high',
      recoverable: false
    };
  }

  // Checkout Errors
  if (message.includes('checkout') || message.includes('payment') || message.includes('cart')) {
    return {
      type: 'checkout',
      severity: 'critical',
      recoverable: true
    };
  }

  // Authentication Errors
  if (message.includes('401') || message.includes('unauthorized') || message.includes('token')) {
    return {
      type: 'authentication',
      severity: 'high',
      recoverable: false
    };
  }

  // Network Errors
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return {
      type: 'network',
      severity: 'medium',
      recoverable: true
    };
  }

  // GraphQL Validation Errors
  if (errors.length > 0 || message.includes('validation') || message.includes('invalid')) {
    return {
      type: 'validation',
      severity: 'low',
      recoverable: false
    };
  }

  return {
    type: 'unknown',
    severity: 'medium',
    recoverable: true
  };
}

// Enhanced Shopify Error Handler Class
class ShopifyErrorHandler {
  /**
   * Wrap existing Shopify function with enhanced error handling
   * SAFE: Maintains original function behavior
   */
  wrapShopifyFunction<T extends (...args: any[]) => Promise<any>>(
    originalFunction: T,
    operationName: string
  ): T {
    return ((...args: Parameters<T>) => {
      return this.executeShopifyOperation(
        () => originalFunction(...args),
        { operation: operationName, variables: args[0] }
      );
    }) as T;
  }

  /**
   * Execute Shopify operation with intelligent error handling
   */
  async executeShopifyOperation<T>(
    operation: () => Promise<T>,
    context: ShopifyErrorContext
  ): Promise<T> {
    const result = await safeExecuteWithRetry(
      operation,
      retryConfigs.shopify({
        onRetry: (attempt, error) => {
          const classification = classifyShopifyError(error);
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔄 Shopify retry ${attempt} for ${context.operation}:`, {
              error: error.message,
              type: classification.type,
              recoverable: classification.recoverable
            });
          }
        },
        retryCondition: (error) => {
          const classification = classifyShopifyError(error);
          return classification.recoverable && classification.type !== 'authentication';
        }
      })
    );

    if (result.success) {
      return result.data!;
    }

    // Handle failure with recovery strategies
    const recovery = await this.handleShopifyError(result.error!, context);
    
    if (recovery.success && recovery.data !== undefined) {
      return recovery.data;
    }

    // If no recovery possible, throw original error
    throw result.error;
  }

  /**
   * Handle Shopify errors with recovery strategies
   */
  private async handleShopifyError(
    error: Error,
    context: ShopifyErrorContext
  ): Promise<ShopifyRecoveryResult> {
    const classification = classifyShopifyError(error);
    
    // Report error
    reportError(error, {
      shopifyOperation: context.operation,
      errorType: classification.type,
      severity: classification.severity
    });

    switch (classification.type) {
      case 'rate_limit':
        return this.handleRateLimitError(error, context);
        
      case 'inventory':
        return this.handleInventoryError(error, context);
        
      case 'checkout':
        return this.handleCheckoutError(error, context);
        
      case 'network':
        return this.handleNetworkError(error, context);
        
      default:
        return {
          success: false,
          errorMessage: 'Ein unerwarteter Fehler ist aufgetreten',
          action: ErrorAction.SHOW_MESSAGE
        };
    }
  }

  private async handleRateLimitError(
    error: Error,
    context: ShopifyErrorContext
  ): Promise<ShopifyRecoveryResult> {
    // Extract retry-after from headers if available
    const retryAfter = this.extractRetryAfter(error);
    
    if (retryAfter && retryAfter < 60000) { // Max 1 minute wait
      await new Promise(resolve => setTimeout(resolve, retryAfter));
      
      return {
        success: false, // Will trigger retry in calling code
        errorMessage: `Shopify API überlastet. Warte ${retryAfter/1000}s...`,
        action: ErrorAction.RETRY
      };
    }

    return {
      success: false,
      errorMessage: 'Service vorübergehend überlastet. Bitte versuchen Sie es später erneut.',
      action: ErrorAction.SHOW_MESSAGE
    };
  }

  private async handleInventoryError(
    error: Error,
    context: ShopifyErrorContext
  ): Promise<ShopifyRecoveryResult> {
    // Extract product info if available
    const productId = this.extractProductId(context);
    
    return {
      success: false,
      errorMessage: 'Artikel ist leider nicht mehr verfügbar',
      action: ErrorAction.SHOW_MESSAGE,
      fallbackUsed: false
    };
  }

  private async handleCheckoutError(
    error: Error,
    context: ShopifyErrorContext
  ): Promise<ShopifyRecoveryResult> {
    const message = error.message.toLowerCase();
    
    if (message.includes('expired') || message.includes('invalid')) {
      return {
        success: false,
        errorMessage: 'Checkout-Session abgelaufen. Warenkorb wird aktualisiert...',
        action: ErrorAction.REDIRECT
      };
    }

    return {
      success: false,
      errorMessage: 'Checkout konnte nicht abgeschlossen werden',
      action: ErrorAction.FALLBACK
    };
  }

  private async handleNetworkError(
    error: Error,
    context: ShopifyErrorContext
  ): Promise<ShopifyRecoveryResult> {
    // Check if we're offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        errorMessage: 'Keine Internetverbindung',
        action: ErrorAction.SHOW_MESSAGE
      };
    }

    return {
      success: false,
      errorMessage: 'Verbindungsproblem. Versuche erneut...',
      action: ErrorAction.RETRY
    };
  }

  private extractRetryAfter(error: Error): number | null {
    // Try to extract retry-after from error message or response
    const message = error.message;
    const retryMatch = message.match(/retry.*?(\d+)/i);
    
    if (retryMatch) {
      return parseInt(retryMatch[1]) * 1000; // Convert to milliseconds
    }
    
    return null;
  }

  private extractProductId(context: ShopifyErrorContext): string | null {
    if (context.variables && typeof context.variables === 'object') {
      return context.variables.productId || 
             context.variables.id || 
             context.variables.handle || 
             null;
    }
    return null;
  }
}

// Singleton instance
const shopifyErrorHandler = new ShopifyErrorHandler();

// Convenience functions for wrapping existing Shopify functions
export function wrapShopifyFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string
): T {
  return shopifyErrorHandler.wrapShopifyFunction(fn, operationName);
}

export async function executeShopifyOperation<T>(
  operation: () => Promise<T>,
  context: ShopifyErrorContext
): Promise<T> {
  return shopifyErrorHandler.executeShopifyOperation(operation, context);
}

// Safe Shopify operation that never throws
export async function safeShopifyOperation<T>(
  operation: () => Promise<T>,
  context: ShopifyErrorContext,
  fallbackValue?: T
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await executeShopifyOperation(operation, context);
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      data: fallbackValue,
      error: errorMessage
    };
  }
}

// Export for backward compatibility
export { shopifyErrorHandler };
