import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { formatPrice } from '@/lib/shopify';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { trackViewCart, trackInitiateCheckout } from '@/lib/analytics';

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

  const freeShippingThreshold = 60; // CHF
  const currentTotal = parseFloat(cartSubtotal);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - currentTotal);
  const hasItem = cartItemCount > 0;
  
  // Calculate correct total including shipping and VAT
  const shippingCost = remainingForFreeShipping > 0 ? 8.90 : 0;
  const vatAmount = currentTotal * 0.077;
  const finalTotal = currentTotal + shippingCost + vatAmount;

  // Track ViewCart when component loads and cart has items
  useEffect(() => {
    if (cart && hasItem) {
      const cartContents = cart.lines.edges.map(edge => ({
        id: edge.node.merchandise.id,
        quantity: edge.node.quantity,
        item_price: parseFloat(edge.node.merchandise.price.amount)
      }));

      trackViewCart({
        value: currentTotal,
        currency: 'CHF',
        contents: cartContents
      });
    }
  }, [cart, hasItem, currentTotal]);

  const handleCheckout = () => {
    if (cart && hasItem) {
      const cartContents = cart.lines.edges.map(edge => ({
        id: edge.node.merchandise.id,
        quantity: edge.node.quantity,
        item_price: parseFloat(edge.node.merchandise.price.amount)
      }));

      // Track InitiateCheckout
      trackInitiateCheckout({
        value: currentTotal,
        currency: 'CHF',
        contents: cartContents
      });
    }
    
    proceedToCheckout();
  };

  // Loading state
  if (isCartLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Warenkorb wird geladen...</span>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!hasItem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ihr Warenkorb ist leer</h1>
          <p className="text-gray-600 mb-6">
            Entdecken Sie unsere hochwertigen Produkte und füllen Sie Ihren Warenkorb.
          </p>
          <Link 
            href="/products" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Produkte entdecken
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Warenkorb ({cartItemCount} {cartItemCount === 1 ? 'Artikel' : 'Artikel'})
      </h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
        {/* Cart Items */}
        <div className="lg:col-span-7">
          <ul className="border-t border-gray-200 divide-y divide-gray-200">
            {cart?.lines.edges.map(({ node: item }) => {
              const product = item.merchandise.product;
              const variant = item.merchandise;
              const itemId = item.id;
              
              return (
                <li key={itemId} className="flex py-6 sm:py-10">
                  <div className="flex-shrink-0">
                    <Image
                      src={getCloudinaryUrl(product.featuredImage?.url || '')}
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
                              className="font-medium text-gray-700 hover:text-gray-800"
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
                          {formatPrice(variant.price.amount, variant.price.currencyCode)}
                        </p>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            type="button"
                            className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                            onClick={() => updateItemQuantity(itemId, Math.max(0, item.quantity - 1))}
                            disabled={isUpdatingCart || item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="flex-1 text-center py-1 text-sm font-medium text-gray-900">
                            {item.quantity}
                          </div>
                          <button
                            type="button"
                            className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                            onClick={() => updateItemQuantity(itemId, item.quantity + 1)}
                            disabled={isUpdatingCart}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="absolute top-0 right-0">
                          <button
                            type="button"
                            className="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500 disabled:opacity-50"
                            onClick={() => removeItem(itemId)}
                            disabled={isRemovingFromCart}
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
        </div>

        {/* Order Summary */}
        <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
          <h2 className="text-lg font-medium text-gray-900">Bestellübersicht</h2>

          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Zwischensumme</dt>
              <dd className="text-sm font-medium text-gray-900">
                CHF {currentTotal.toFixed(2)}
              </dd>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="flex items-center text-sm text-gray-600">
                <span>Versand</span>
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {shippingCost > 0 ? `CHF ${shippingCost.toFixed(2)}` : 'Kostenlos'}
              </dd>
            </div>

            {remainingForFreeShipping > 0 && (
              <div className="rounded-md bg-blue-50 p-4">
                <div className="text-sm text-blue-800">
                  <strong>CHF {remainingForFreeShipping.toFixed(2)}</strong> bis zum kostenlosen Versand!
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">MwSt. (7.7%)</dt>
              <dd className="text-sm font-medium text-gray-900">
                CHF {vatAmount.toFixed(2)}
              </dd>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="text-base font-medium text-gray-900">Gesamt</dt>
              <dd className="text-base font-medium text-gray-900">
                CHF {finalTotal.toFixed(2)}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <Button
              onClick={handleCheckout}
              disabled={!canCheckout || isRedirecting}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Weiterleitung...
                </>
              ) : (
                <>
                  Zur Kasse gehen
                  <ExternalLink className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
            <p>
              oder{' '}
              <Link href="/products" className="text-blue-600 font-medium hover:text-blue-500">
                Weiter einkaufen
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartContent;
