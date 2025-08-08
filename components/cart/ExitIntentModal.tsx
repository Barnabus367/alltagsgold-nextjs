import { useState, useEffect } from 'react';
import { X, ShoppingBag, Percent } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/shopify';
import { formatPriceSwiss, getSwissRoundingAdjustment } from '@/lib/swiss-formatting';
import { trackCustomEvent } from '@/lib/analytics';

export function ExitIntentModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const { cart, cartItemCount, cartSubtotal } = useCart();

  useEffect(() => {
    // Nur zeigen wenn Warenkorb Artikel hat und noch nicht gezeigt wurde
    if (cartItemCount === 0 || hasShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Nur triggern wenn Maus oben aus dem Fenster geht
      if (e.clientY <= 0) {
        setIsVisible(true);
        setHasShown(true);
        
        // Analytics tracking mit Schweizer Rundung
        const currentTotal = parseFloat(cartSubtotal);
        const roundingInfo = getSwissRoundingAdjustment(currentTotal);
        
        trackCustomEvent('exit_intent_triggered', {
          cart_value: parseFloat(cartSubtotal),
          cart_value_rounded: roundingInfo.roundedAmount,
          cart_items: cartItemCount,
          timestamp: Date.now()
        });
      }
    };

    // Touch-Device Detection für mobile exit-intent
    const handleVisibilityChange = () => {
      if (document.hidden && cartItemCount > 0 && !hasShown) {
        // Mobile User verlässt Tab/App
        setTimeout(() => {
          if (document.hidden) {
            setIsVisible(true);
            setHasShown(true);
            
            const currentTotal = parseFloat(cartSubtotal);
            const roundingInfo = getSwissRoundingAdjustment(currentTotal);
            
            trackCustomEvent('mobile_exit_intent', {
              cart_value: parseFloat(cartSubtotal),
              cart_value_rounded: roundingInfo.roundedAmount,
              cart_items: cartItemCount
            });
          }
        }, 2000);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cartItemCount, cartSubtotal, hasShown]);

  const handleClose = () => {
    setIsVisible(false);
    trackCustomEvent('exit_intent_dismissed', {
      interaction: 'close_button'
    });
  };

  const handleContinueShopping = () => {
    setIsVisible(false);
    trackCustomEvent('exit_intent_continue_shopping', {
      cart_value: parseFloat(cartSubtotal),
      cart_value_rounded: displayTotal
    });
  };

  const handleGoToCart = () => {
    setIsVisible(false);
    window.location.href = '/cart';
    trackCustomEvent('exit_intent_go_to_cart', {
      cart_value: parseFloat(cartSubtotal),
      cart_value_rounded: displayTotal
    });
  };

  if (!isVisible || cartItemCount === 0) return null;

  const freeShippingThreshold = 60;
  const currentTotal = parseFloat(cartSubtotal);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - currentTotal);
  
  // Schweizer Rundung für bessere UX
  const roundingInfo = getSwissRoundingAdjustment(currentTotal);
  const displayTotal = roundingInfo.roundedAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Warten Sie!
          </h2>
          <p className="text-gray-600">
            Sie haben {cartItemCount} {cartItemCount === 1 ? 'Artikel' : 'Artikel'} im Warenkorb
          </p>
        </div>

        {/* Cart Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Warenkorbwert:</span>
            <span className="font-semibold text-lg">{formatPriceSwiss(displayTotal, 'CHF')}</span>
          </div>
          
          {/* Schweizer Rundungshinweis bei Rundung */}
          {Math.abs(roundingInfo.adjustment) > 0.001 && (
            <div className="text-xs text-gray-500 text-center mb-3">
              *Endpreis wird an der Kasse auf 5 Rappen gerundet
            </div>
          )}
          
          {/* Free Shipping Incentive */}
          {remainingForFreeShipping > 0 ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-orange-600 mb-2">
                <Percent className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Nur noch {formatPriceSwiss(remainingForFreeShipping, 'CHF')} für kostenlosen Versand!
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (displayTotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-green-600 font-medium">
              ✅ Kostenloser Versand aktiviert!
            </div>
          )}
        </div>

        {/* Special Offer */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="font-bold text-green-800 mb-1">🎉 Letzter Augenblick!</div>
            <div className="text-sm text-green-700">
              Kostenloser Versand + 30 Tage Rückgaberecht
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleGoToCart}
            className="w-full bg-black hover:bg-gray-800 text-white py-3 text-lg font-semibold"
          >
            Zur Kasse gehen
          </Button>
          <Button
            onClick={handleContinueShopping}
            variant="outline"
            className="w-full py-3"
          >
            Weiter einkaufen
          </Button>
        </div>

        {/* Trust Signals */}
        <div className="mt-6 text-center text-xs text-gray-500">
          🔒 Sichere Zahlung • 🚚 Schneller Versand • 🇨🇭 Schweizer Qualität
        </div>
      </div>
    </div>
  );
}
