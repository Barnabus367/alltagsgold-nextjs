import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ExternalLink, Loader2 } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { formatPrice, formatSwissPrice, roundToSwissFrancs } from '@/lib/shopify';
import { formatPriceSafe, getPriceAmountSafe } from '@/lib/type-guards';
import { getCloudinaryUrl } from '@/lib/cloudinary-optimized';
import { trackViewCart, trackInitiateCheckout } from '@/lib/analytics';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { Layout } from '@/components/layout/Layout';
import { generateStaticPageSEO } from '@/lib/seo';

function Cart() {
  const [mounted, setMounted] = useState(false);
  const seoData = generateStaticPageSEO('cart');

  // Verhindert Hydration-Fehler durch client-only rendering
  useEffect(() => {
    setMounted(true);
  }, []);
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
  
  // Calculate correct total including shipping and VAT with Swiss rounding
  const shippingCost = remainingForFreeShipping > 0 ? 8.90 : 0;
  const vatAmount = currentTotal * 0.077;
  const subtotalWithShipping = currentTotal + shippingCost + vatAmount;
  const finalTotal = roundToSwissFrancs(subtotalWithShipping);
  
  // Fallback für Gesamtsumme wenn finalTotal ungültig ist
  const displayTotal = finalTotal && !isNaN(finalTotal) ? finalTotal : currentTotal;
  
  // Debug logging für Entwicklung
  if (process.env.NODE_ENV === 'development') {
    console.log('Cart totals debug:', {
      currentTotal,
      shippingCost,
      vatAmount,
      subtotalWithShipping,
      finalTotal,
      displayTotal,
      cartSubtotal
    });
  }

  // Track ViewCart when component loads and cart has items
  useEffect(() => {
    if (cart && hasItem) {
      const cartContents = cart.lines.edges.map(edge => ({
        id: edge.node.merchandise.id,
        quantity: edge.node.quantity,
        item_price: getPriceAmountSafe(edge.node.merchandise.price)
      }));

      trackViewCart({
        value: displayTotal,
        currency: 'CHF',
        contents: cartContents
      });
    }
  }, [cart, hasItem, displayTotal]);

  const handleCheckout = () => {
    if (cart && hasItem) {
      const cartContents = cart.lines.edges.map(edge => ({
        id: edge.node.merchandise.id,
        quantity: edge.node.quantity,
        item_price: getPriceAmountSafe(edge.node.merchandise.price)
      }));

      // Track InitiateCheckout
      trackInitiateCheckout({
        value: displayTotal,
        currency: 'CHF',
        contents: cartContents
      });
    }
    
    proceedToCheckout();
  };

  // Zeige Loading während der Hydration um Fehler zu vermeiden
  if (!mounted || isCartLoading) {
    return (
      <>
        <NextSEOHead 
          seo={seoData}
          canonicalUrl="/cart"
          robots="noindex, nofollow"
        />
      <div className="min-h-screen bg-white pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <NextSEOHead 
        seo={seoData}
        canonicalUrl="/cart"
        robots="noindex, nofollow"
      />
      <div className="min-h-screen bg-white pt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-6 gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Warenkorb</h1>
              <p className="text-gray-600 text-base sm:text-lg">
                {hasItem ? `${cartItemCount} ${cartItemCount === 1 ? 'Artikel' : 'Artikel'} in Ihrem Warenkorb` : 'Entdecken Sie unsere Premium-Kollektion'}
              </p>
            </div>
            {hasItem && (
              <div className="flex-shrink-0 text-left sm:text-right">
                <p className="text-sm text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                  {displayTotal ? formatSwissPrice(displayTotal) : formatPrice(cartTotal, 'CHF')}
                </p>
              </div>
            )}
          </div>
        </div>

        {!hasItem ? (
          /* Empty Cart State */
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <ShoppingBag className="w-12 h-12 text-gray-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Bereit für Ihren nächsten Einkauf?</h2>
            <p className="text-gray-600 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              Entdecken Sie unsere sorgfältig kuratierten Premium-Produkte für den anspruchsvollen Alltag.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild className="bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-800 text-white px-10 py-4 rounded-full text-lg font-medium shadow-lg transform hover:scale-105 transition-all duration-200">
                <Link href="/collections">
                  Premium Kollektionen
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-2 border-gray-300 hover:border-gray-900 px-10 py-4 rounded-full text-lg font-medium">
                <Link href="/products">
                  Beliebte Produkte
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Free Shipping Progress */}
              {remainingForFreeShipping > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          Nur noch {formatPrice(remainingForFreeShipping.toString(), 'CHF')} für kostenlosen Versand
                        </p>
                        <p className="text-xs text-blue-700">
                          Ersparnis: {formatPrice('8.90', 'CHF')} Versandkosten
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-blue-700 bg-blue-200 px-3 py-1 rounded-full">
                      {Math.round((currentTotal / freeShippingThreshold) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(100, (currentTotal / freeShippingThreshold) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {remainingForFreeShipping === 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-900">Gratisversand erhalten!</p>
                      <p className="text-sm text-green-700">Ersparnis: {formatPrice('8.90', 'CHF')} Versandkosten</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-6">
                {cart?.lines.edges.map(({ node: item }) => (
                  <div key={item.id} className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-28 h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
                        {item.merchandise.product.featuredImage?.url ? (
                          <Image
                            src={item.merchandise.product.featuredImage.url}
                            alt={item.merchandise.product.title || "Produktbild"}
                            width={150}
                            height={150}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            <div className="text-center">
                              <div className="w-8 h-8 bg-gray-300 rounded mx-auto mb-2"></div>
                              Kein Bild
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-2 pr-4">
                              <Link href={`/products/${item.merchandise.product.handle}`} className="hover:text-gray-700 transition-colors">
                                {item.merchandise.product.title}
                              </Link>
                            </h3>
                            
                            {item.merchandise.selectedOptions.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {item.merchandise.selectedOptions.map((option) => (
                                  <span key={option.name} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {option.name}: {option.value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Remove Button - Mobile-optimiert */}
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={isRemovingFromCart}
                            className="text-gray-400 hover:text-red-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-red-50 rounded-lg group touch-manipulation"
                            title="Artikel entfernen"
                          >
                            {isRemovingFromCart ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            )}
                          </button>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">Menge:</span>
                            {/* Quantity Controls - Mobile-optimiert */}
                            <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white shadow-sm">
                              <button
                                onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                                disabled={isUpdatingCart || item.quantity <= 1}
                                className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-xl transition-colors touch-manipulation"
                              >
                                <Minus className="w-5 h-5" />
                              </button>
                              <span className="w-16 text-center text-base font-semibold bg-gray-50 min-h-[44px] flex items-center justify-center">
                                {isUpdatingCart ? (
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <button
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                disabled={isUpdatingCart}
                                className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-xl transition-colors touch-manipulation"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900 mb-1">
                              {formatPrice(item.estimatedCost.totalAmount.amount, item.estimatedCost.totalAmount.currencyCode)}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-sm text-gray-500">
                                {formatPriceSafe(item.merchandise.price)} pro Stück
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 lg:p-8 sticky top-24 shadow-lg border border-gray-200 overflow-hidden">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Ihre Bestellung</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full mx-auto"></div>
                </div>
                
                <div className="space-y-0 mb-6 sm:mb-8 relative">
                  <div className="w-full py-3 sm:py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-gray-700 font-medium text-sm sm:text-base flex-shrink-0">Zwischensumme</span>
                      <span className="font-semibold text-base sm:text-lg text-gray-900 text-right min-w-0">{formatPrice(cartSubtotal, 'CHF')}</span>
                    </div>
                  </div>
                  
                  <div className="w-full py-3 sm:py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-gray-700 font-medium text-sm sm:text-base flex-shrink-0">Versand</span>
                      <span className="font-semibold text-base sm:text-lg text-right min-w-0">
                        {remainingForFreeShipping > 0 ? (
                          <span className="text-red-600">CHF 8.90</span>
                        ) : (
                          <span className="text-green-600 flex items-center justify-end gap-1">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="truncate">Kostenlos</span>
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full py-3 sm:py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-gray-700 font-medium text-sm sm:text-base flex-shrink-0">MwSt (7.7%)</span>
                      <span className="font-semibold text-base sm:text-lg text-gray-900 text-right min-w-0">
                        {formatPrice((currentTotal * 0.077).toFixed(2), 'CHF')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm border-2 border-gray-300 overflow-hidden">
                  <div className="w-full">
                    <div className="flex flex-col gap-1 mb-2">
                      <span className="text-lg sm:text-xl font-bold text-gray-900 text-center">Gesamtsumme</span>
                      <span className="text-xl sm:text-2xl font-bold text-gray-900 text-center whitespace-nowrap">
                        {displayTotal ? formatSwissPrice(displayTotal) : formatPrice(cartTotal, 'CHF')}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 text-center mt-2">inkl. MwSt und Versandkosten</p>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={!canCheckout || isRedirecting || !hasItem}
                  className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-800 text-white py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold flex items-center justify-center gap-2 sm:gap-3 shadow-lg transform hover:scale-105 transition-all duration-200 min-h-[44px]"
                >
                  {isRedirecting ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin flex-shrink-0" />
                      <span className="truncate">Weiterleitung zur sicheren Kasse...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Jetzt bestellen</span>
                    </>
                  )}
                </Button>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-300">
                  <div className="grid grid-cols-1 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium truncate">Sichere SSL-Verschlüsselung</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium truncate">30 Tage Geld-zurück-Garantie</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium truncate">Premium-Versand aus der Schweiz</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Continue Shopping */}
        <div className="mt-12 pt-8 border-t-2 border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild variant="outline" className="border-2 border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 px-8 py-3 rounded-xl font-medium transition-all duration-200">
              <Link href="/collections">
                ← Zurück zu Kollektionen
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-2 border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 px-8 py-3 rounded-xl font-medium transition-all duration-200">
              <Link href="/products">
                Weiter einkaufen →
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default function CartPage() {
  return (
    <Layout>
      <Cart />
    </Layout>
  );
}
