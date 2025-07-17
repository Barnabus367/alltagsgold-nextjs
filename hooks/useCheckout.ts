import { useState, useCallback } from 'react';
import { useCart } from './useCart';
import { generateCheckoutUrl, redirectToCheckout } from '@/lib/checkout';
// Toast import blockiert - verwende console.log für Debugging
// import { useToast } from './use-toast';

export function useCheckout() {
  const { cart } = useCart();
  // Toast komplett entfernt - verwende console.log stattdessen
  const toast = (options: any) => console.log('Toast:', options.title || options.description);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const proceedToCheckout = useCallback(async () => {
    if (isRedirecting) return;

    try {
      setIsRedirecting(true);

      // Validate cart is not empty
      if (!cart || !cart.lines.edges.length) {
        toast({
          variant: "destructive",
          title: "Warenkorb ist leer",
          description: "Fügen Sie Produkte hinzu, bevor Sie zur Kasse gehen."
        });
        return;
      }

      // Generate checkout URL with current cart items
      const checkoutUrl = generateCheckoutUrl(cart);
      
      // Show loading toast
      toast({
        title: "Weiterleitung zum Checkout...",
        description: "Sie werden zu unserem sicheren Checkout weitergeleitet."
      });

      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to Shopify checkout
      redirectToCheckout(checkoutUrl);

    } catch (error) {
      console.error('Checkout error:', error);
      
      toast({
        variant: "destructive",
        title: "Checkout-Fehler",
        description: error instanceof Error ? error.message : "Unbekannter Fehler beim Checkout"
      });
    } finally {
      // Reset after a delay in case redirect fails
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