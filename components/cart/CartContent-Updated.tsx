import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { formatPrice, formatSwissPrice, roundToSwissFrancs } from '@/lib/shopify';
import { formatPriceSafe, getPriceAmountSafe } from '@/lib/type-guards';
import { getCloudinaryUrl } from '@/lib/cloudinary-optimized';
import { trackViewCart, trackInitiateCheckout } from '@/lib/analytics';
import { announceToScreenReader } from '@/lib/accessibility';
import { useMobileUX } from '@/hooks/useMobileUX';

function CartContent() {
  const { 
    cart, 
    isCartLoading, 
    cartItemCount, 
    cartTotal, 
    cartSubtotal,
    updateItemQuantity, 
    removeItem,
    isUpdatingCart,
    isRemovingFromCart
  } = useCart();
  
  const { proceedToCheckout, isRedirecting, canCheckout } = useCheckout();
  const { capabilities, getTouchClasses } = useMobileUX();

  const freeShippingThreshold = 60; // CHF
  const currentTotal = parseFloat(cartSubtotal);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - currentTotal);
  const hasItem = cartItemCount > 0;
  
  // Calculate correct total including shipping and VAT with Swiss rounding
  const shippingCost = remainingForFreeShipping > 0 ? 8.90 : 0;
  const vatAmount = currentTotal * 0.077;
  const subtotalWithShipping = currentTotal + shippingCost + vatAmount;
  const finalTotal = roundToSwissFrancs(subtotalWithShipping);

  // Track ViewCart when component loads and cart has items
  useEffect(() => {
    if (cart && hasItem) {
      const cartContents = cart.lines.edges.map(edge => ({
        id: edge.node.merchandise.id,
        quantity: edge.node.quantity,
        item_price: getPriceAmountSafe(edge.node.merchandise.price)
      }));

      trackViewCart({
        value: currentTotal,
        currency: 'CHF',
        contents: cartContents
      });
    }
  }, [cart, hasItem, currentTotal]);

  const handleCheckout = async () => {
    if (!canCheckout) return;
    
    try {
      // Track InitiateCheckout before redirect
      if (cart) {
        const cartContents = cart.lines.edges.map(edge => ({
          id: edge.node.merchandise.id,
          quantity: edge.node.quantity,
          item_price: getPriceAmountSafe(edge.node.merchandise.price)
        }));

        trackInitiateCheckout({
          value: currentTotal,
          currency: 'CHF',
          contents: cartContents
        });
      }

      announceToScreenReader('Weiterleitung zum Checkout');
      await proceedToCheckout();
    } catch (error) {
      console.error('Checkout error:', error);
      announceToScreenReader('Fehler beim Checkout. Bitte versuchen Sie es erneut.');
    }
  };

  if (isCartLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg text-gray-600">Warenkorb wird geladen...</span>
        </div>
      </div>
    );
  }

  if (!hasItem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <ShoppingBag className="mx-auto h-24 w-24 text-gray-400" />
        <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-4">
          Ihr Warenkorb ist leer
        </h1>
        <p className="text-gray-600 mb-8">
          Entdecken Sie unsere Produkte und fügen Sie sie zu Ihrem Warenkorb hinzu.
        </p>
        <Link href="/products">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
            Jetzt einkaufen
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 
        id="cart-heading"
        className="text-3xl font-bold text-gray-900 mb-8"
      >
        Warenkorb ({cartItemCount} {cartItemCount === 1 ? 'Artikel' : 'Artikel'})
      </h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
        {/* Cart Items */}
        <section 
          className="lg:col-span-7"
          aria-labelledby="cart-items-heading"
        >
          <h2 id="cart-items-heading" className="sr-only">
            Artikel im Warenkorb
          </h2>
          
          <ul 
            className="border-t border-gray-200 divide-y divide-gray-200"
            role="list"
          >
            {cart?.lines.edges.map(({ node: item }) => {
              const product = item.merchandise.product;
              const variant = item.merchandise;
              const itemId = item.id;
              
              return (
                <li key={itemId} className="flex py-6 sm:py-10">
                  <div className="flex-shrink-0">
                    <Image
                      src={product.featuredImage?.url || '/placeholder-image.jpg'}
                      alt={product.title}
                      width={150}
                      height={150}
                      className="w-24 h-24 rounded-md object-center object-cover sm:w-32 sm:h-32"
                    />
                  </div>

                  <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-sm">
                            <Link 
                              href={`/products/${product.handle}`}
                              className="font-medium text-gray-700 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            >
                              {product.title}
                            </Link>
                          </h3>
                        </div>
                        {variant.title !== 'Default Title' && (
                          <div className="mt-1 flex text-sm">
                            <p className="text-gray-500">{variant.title}</p>
                          </div>
                        )}
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {formatPriceSafe(variant.price)}
                        </p>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            type="button"
                            className={`flex items-center justify-center text-gray-600 hover:text-gray-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                              capabilities.supportsTouch 
                                ? 'w-11 h-11 min-h-[44px] min-w-[44px] touch-manipulation' 
                                : 'w-8 h-8'
                            } ${getTouchClasses()}`}
                            onClick={() => {
                              updateItemQuantity(itemId, Math.max(0, item.quantity - 1));
                              announceToScreenReader(`Menge reduziert auf ${item.quantity - 1}`);
                            }}
                            disabled={isUpdatingCart || item.quantity <= 1}
                            aria-label={`Menge von ${product.title} reduzieren`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div 
                            className="flex-1 text-center py-1 text-sm font-medium text-gray-900"
                            aria-label={`Aktuelle Menge: ${item.quantity}`}
                          >
                            {item.quantity}
                          </div>
                          <button
                            type="button"
                            className={`flex items-center justify-center text-gray-600 hover:text-gray-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                              capabilities.supportsTouch 
                                ? 'w-11 h-11 min-h-[44px] min-w-[44px] touch-manipulation' 
                                : 'w-8 h-8'
                            } ${getTouchClasses()}`}
                            onClick={() => {
                              updateItemQuantity(itemId, item.quantity + 1);
                              announceToScreenReader(`Menge erhöht auf ${item.quantity + 1}`);
                            }}
                            disabled={isUpdatingCart}
                            aria-label={`Menge von ${product.title} erhöhen`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="absolute top-0 right-0">
                          <button
                            type="button"
                            className={`-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                              capabilities.supportsTouch 
                                ? 'min-h-[44px] min-w-[44px] touch-manipulation' 
                                : ''
                            } ${getTouchClasses()}`}
                            onClick={() => {
                              removeItem(itemId);
                              announceToScreenReader(`${product.title} aus dem Warenkorb entfernt`);
                            }}
                            disabled={isRemovingFromCart}
                            aria-label={`${product.title} aus dem Warenkorb entfernen`}
                          >
                            <span className="sr-only">Entfernen</span>
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Order Summary */}
        <section 
          className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
          aria-labelledby="order-summary-heading"
        >
          <h2 
            id="order-summary-heading"
            className="text-lg font-medium text-gray-900"
          >
            Ihre Bestellung
          </h2>

          <dl 
            className="mt-6 space-y-4"
            role="list"
            aria-labelledby="order-summary-heading"
          >
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Zwischensumme</dt>
              <dd className="text-sm font-medium text-gray-900 tabular-nums">
                CHF {currentTotal.toFixed(2)}
              </dd>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="flex items-center text-sm text-gray-600">
                <span>Versand</span>
              </dt>
              <dd className="text-sm font-medium text-gray-900 tabular-nums">
                {shippingCost > 0 ? `CHF ${shippingCost.toFixed(2)}` : 'Kostenlos'}
              </dd>
            </div>

            {remainingForFreeShipping > 0 && (
              <div 
                className="rounded-md bg-blue-50 p-4"
                role="status"
                aria-live="polite"
              >
                <div className="text-sm text-blue-800">
                  <strong>CHF {remainingForFreeShipping.toFixed(2)}</strong> bis zum kostenlosen Versand!
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">MwSt. (7.7%)</dt>
              <dd className="text-sm font-medium text-gray-900 tabular-nums">
                CHF {vatAmount.toFixed(2)}
              </dd>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="text-base font-medium text-gray-900">Gesamtsumme</dt>
              <dd 
                className="text-base font-medium text-gray-900 tabular-nums"
                aria-label={`Gesamtsumme ${formatSwissPrice(finalTotal)}`}
              >
                {formatSwissPrice(finalTotal)}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <Button
              onClick={handleCheckout}
              disabled={!canCheckout || isRedirecting}
              className={`w-full flex items-center justify-center border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                capabilities.supportsTouch 
                  ? 'px-4 py-3 min-h-[44px] text-base touch-manipulation' 
                  : 'px-4 py-3 text-base'
              } ${getTouchClasses()}`}
              aria-describedby="checkout-description"
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
                  <span>Weiterleitung...</span>
                  <span className="sr-only">Checkout wird geladen</span>
                </>
              ) : (
                <>
                  Jetzt bestellen
                  <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
                </>
              )}
            </Button>
            
            <p id="checkout-description" className="sr-only">
              Weiterleitung zum sicheren Shopify Checkout
            </p>
          </div>

          <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
            <p>
              oder{' '}
              <Link 
                href="/products" 
                className="text-blue-600 font-medium hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
              >
                Weiter einkaufen
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </p>
          </div>
        </section>
      </div>
      
      {/* Live region for announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only"></div>
    </div>
  );
}

export default CartContent;
