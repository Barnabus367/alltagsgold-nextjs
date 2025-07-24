/**
 * Enhanced useCheckout Hook mit Smart Error Handling
 * SAFE: Fallback zu original Implementation bei Fehlern
 */

import { useState, useCallback } from 'react';
import { useCart } from './useCart';
import { generateCheckoutUrl, redirectToCheckout } from '@/lib/checkout';
import { useToast } from './use-toast';
import { checkoutService } from '@/lib/shopify-enhanced';
import { reportError } from '@/lib/error-service';

export function useEnhancedCheckout() {
  const { cart } = useCart();
  const { toast, dismiss } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const proceedToCheckout = useCallback(async () => {
    if (isRedirecting) return;

    try {
      setIsRedirecting(true);

      // Validate cart is not empty
      if (!cart || !cart.lines.edges.length) {
        toast.error(
          "Warenkorb ist leer",
          "Fügen Sie Produkte hinzu, bevor Sie zur Kasse gehen."
        );
        return;
      }

      // Show initial loading toast
      const loadingToastId = toast.info(
        "Checkout wird vorbereitet...",
        "Einen Moment bitte...",
        { duration: 0 } // Don't auto-dismiss
      );

      // Enhanced checkout processing
      const result = await checkoutService.processCheckout(cart.id);

      // Dismiss loading toast
      dismiss(loadingToastId);

      if (result.success && result.checkoutUrl) {
        // Success - show success message and redirect
        toast.success(
          "Weiterleitung zum Checkout",
          "Sie werden zu unserem sicheren Checkout weitergeleitet.",
          { duration: 2000 }
        );

        // Small delay to show success message
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Redirect to checkout
        redirectToCheckout(result.checkoutUrl);

      } else {
        // Handle different error scenarios
        await handleCheckoutError(result.error || 'Unbekannter Fehler', result.action);
      }

    } catch (error) {
      // Fallback to original implementation for critical errors
      await handleCriticalCheckoutError(error);
    } finally {
      // Reset after a delay in case redirect fails
      setTimeout(() => {
        setIsRedirecting(false);
        setRetryCount(0);
      }, 3000);
    }
  }, [cart, isRedirecting, retryCount, toast]);

  const handleCheckoutError = async (
    errorMessage: string, 
    action?: 'retry' | 'manual' | 'redirect'
  ) => {
    // Report error for analytics
    reportError(new Error(`Checkout Error: ${errorMessage}`), {
      cartId: cart?.id,
      cartItemCount: cart?.lines.edges.length || 0,
      retryCount,
      action
    });

    switch (action) {
      case 'retry':
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          
          toast.warning(
            "Checkout wird wiederholt...",
            `Versuch ${retryCount + 1} von ${maxRetries}`,
            {
              duration: 2000,
              action: {
                label: "Abbrechen",
                onClick: () => setIsRedirecting(false)
              }
            }
          );

          // Exponential backoff
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Retry checkout
          return proceedToCheckout();
        } else {
          // Max retries reached - fallback to manual
          return handleCheckoutError(errorMessage, 'manual');
        }

      case 'redirect':
        toast.warning(
          "Checkout-Session erneuert",
          "Warenkorb wird aktualisiert...",
          {
            action: {
              label: "Warenkorb anzeigen",
              onClick: () => window.location.href = '/cart'
            }
          }
        );
        
        // Refresh page to get new cart state
        setTimeout(() => window.location.reload(), 2000);
        break;

      case 'manual':
      default:
        toast.error(
          "Checkout nicht möglich",
          errorMessage,
          {
            duration: 8000,
            action: {
              label: "Warenkorb prüfen",
              onClick: () => window.location.href = '/cart'
            }
          }
        );
        break;
    }
  };

  const handleCriticalCheckoutError = async (error: unknown) => {
    // Log critical error
    const errorMessage = error instanceof Error ? error.message : 'Kritischer Checkout-Fehler';
    
    reportError(
      error instanceof Error ? error : new Error(errorMessage),
      {
        cartId: cart?.id,
        cartItemCount: cart?.lines.edges.length || 0,
        isCritical: true,
        fallbackUsed: true
      }
    );

    try {
      // Fallback to original checkout implementation
      const checkoutUrl = generateCheckoutUrl(cart!);
      
      toast.warning(
        "Checkout-Fallback aktiviert",
        "Verwende vereinfachten Checkout-Prozess",
        { duration: 3000 }
      );

      await new Promise(resolve => setTimeout(resolve, 1000));
      redirectToCheckout(checkoutUrl);

    } catch (fallbackError) {
      // Last resort - show manual instructions
      toast.error(
        "Checkout vorübergehend nicht verfügbar",
        "Bitte versuchen Sie es in wenigen Minuten erneut oder kontaktieren Sie uns.",
        {
          duration: 10000,
          action: {
            label: "Support kontaktieren",
            onClick: () => window.location.href = '/contact'
          }
        }
      );
    }
  };

  const getCheckoutUrl = useCallback((): string | null => {
    if (!cart || !cart.lines.edges.length) {
      return null;
    }

    try {
      return generateCheckoutUrl(cart);
    } catch (error) {
      // Silent fallback - log but don't break functionality
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error generating checkout URL:', error);
      }
      return null;
    }
  }, [cart]);

  const canCheckout = cart && cart.lines.edges.length > 0 && !isRedirecting;

  return {
    proceedToCheckout,
    getCheckoutUrl,
    isRedirecting,
    canCheckout,
    retryCount,
    maxRetries
  };
}

// Backward compatible export - gradually migrate by changing imports
export function useCheckout() {
  // Feature flag for gradual rollout
  const useEnhancedVersion = process.env.NODE_ENV === 'development' || 
                            process.env.NEXT_PUBLIC_ENHANCED_CHECKOUT === 'true';

  if (useEnhancedVersion) {
    return useEnhancedCheckout();
  }

  // Fallback to original implementation
  const { cart } = useCart();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const proceedToCheckout = useCallback(async () => {
    if (isRedirecting) return;

    try {
      setIsRedirecting(true);

      if (!cart || !cart.lines.edges.length) {
        toast.error(
          "Warenkorb ist leer",
          "Fügen Sie Produkte hinzu, bevor Sie zur Kasse gehen."
        );
        return;
      }

      const checkoutUrl = generateCheckoutUrl(cart);
      
      toast.info(
        "Weiterleitung zum Checkout...",
        "Sie werden zu unserem sicheren Checkout weitergeleitet."
      );

      await new Promise(resolve => setTimeout(resolve, 500));
      redirectToCheckout(checkoutUrl);

    } catch (error) {
      console.error('Checkout error:', error);
      
      toast.error(
        "Checkout-Fehler",
        error instanceof Error ? error.message : "Unbekannter Fehler beim Checkout"
      );
    } finally {
      setTimeout(() => setIsRedirecting(false), 2000);
    }
  }, [cart, isRedirecting, toast]);

  const getCheckoutUrl = useCallback((): string | null => {
    if (!cart || !cart.lines.edges.length) {
      return null;
    }

    try {
      return generateCheckoutUrl(cart);
    } catch (error) {
      console.error('Error generating checkout URL:', error);
      return null;
    }
  }, [cart]);

  const canCheckout = cart && cart.lines.edges.length > 0;

  return {
    proceedToCheckout,
    getCheckoutUrl,
    isRedirecting,
    canCheckout
  };
}
