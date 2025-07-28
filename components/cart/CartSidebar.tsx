import { X, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useMobileUX } from '@/hooks/useMobileUX';
import { formatPrice } from '@/lib/shopify';
import { getCloudinaryUrl } from '@/lib/cloudinary-optimized';
import { FocusManager, announceToScreenReader } from '@/lib/accessibility';
import { formatPriceSafe } from '@/lib/type-guards';

export function CartSidebar() {
  const {
    cart,
    isCartOpen,
    closeCart,
    cartTotal,
    cartSubtotal,
    updateItemQuantity,
    removeItem,
    isUpdatingCart,
    isRemovingFromCart,
  } = useCart();

  const { capabilities, getTouchClasses } = useMobileUX();
  const focusManager = useRef(new FocusManager());
  const cartContentRef = useRef<HTMLDivElement>(null);

  const cartLines = useMemo(() => cart?.lines.edges || [], [cart?.lines.edges]);

  // Accessibility: Focus Management
  useEffect(() => {
    if (isCartOpen && cartContentRef.current) {
      const cleanup = focusManager.current.trapFocus(cartContentRef.current);
      announceToScreenReader(`Warenkorb geöffnet. ${cartLines.length} Artikel im Warenkorb.`);
      
      return cleanup;
    }
  }, [isCartOpen, cartLines.length]);

  // Accessibility: Cart Updates Announcements
  useEffect(() => {
    if (cartLines.length > 0) {
      const totalItems = cartLines.reduce((sum, { node }) => sum + node.quantity, 0);
      announceToScreenReader(`Warenkorb aktualisiert. ${totalItems} Artikel, Gesamtpreis ${formatPrice(cartTotal, 'CHF')}`);
    }
  }, [cartLines, cartTotal]);

  const handleQuantityUpdate = async (lineId: string, newQuantity: number, productTitle: string) => {
    await updateItemQuantity(lineId, newQuantity);
    announceToScreenReader(`${productTitle} Menge auf ${newQuantity} geändert`);
    
    // Haptic Feedback für Mobile
    if (capabilities.hasVibration) {
      navigator.vibrate(50);
    }
  };

  const handleRemoveItem = async (lineId: string, productTitle: string) => {
    await removeItem(lineId);
    announceToScreenReader(`${productTitle} aus dem Warenkorb entfernt`);
    
    if (capabilities.hasVibration) {
      navigator.vibrate(100);
    }
  };

  const handleCheckout = () => {
    if (cart?.webUrl) {
      announceToScreenReader('Weiterleitung zur Kasse');
      window.location.href = cart.webUrl;
    }
  };

  // Mobile-optimierte Container-Klassen
  const containerClasses = `
    ${getTouchClasses()}
    ${capabilities.isMobile ? 'w-full max-w-none' : 'w-full sm:max-w-md'}
    ${capabilities.isMobile ? 'h-full' : ''}
  `;

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent 
        side="right" 
        className={containerClasses}
        aria-label="Warenkorb"
        ref={cartContentRef}
      >
        <SheetHeader>
          <SheetTitle id="cart-title">
            Warenkorb ({cartLines.length} {cartLines.length === 1 ? 'Artikel' : 'Artikel'})
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-6" role="region" aria-labelledby="cart-title">
            {cartLines.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Ihr Warenkorb ist leer</p>
                <Button onClick={closeCart} variant="outline">
                  Weiter einkaufen
                </Button>
              </div>
            ) : (
              <div className="space-y-4" role="list" aria-label="Artikel im Warenkorb">
                {cartLines.map(({ node: line }) => (
                  <div 
                    key={line.id} 
                    className="flex items-center space-x-4 bg-muted/50 p-4 rounded-lg"
                    role="listitem"
                  >
                    {line.merchandise.product.featuredImage?.url ? (
                      <Image
                        src={line.merchandise.product.featuredImage.url}
                        alt={`Produktbild: ${line.merchandise.product.title}`}
                        width={150}
                        height={150}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500"
                        role="img"
                        aria-label="Kein Produktbild verfügbar"
                      >
                        Kein Bild
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {line.merchandise.product.title}
                      </h4>
                      {line.merchandise.selectedOptions.map((option) => (
                        <p key={option.name} className="text-xs text-muted-foreground">
                          {option.name}: {option.value}
                        </p>
                      ))}
                      <p className="text-sm font-semibold">
                        {formatPriceSafe(line.merchandise?.price)}
                      </p>
                      
                      {/* Mobile-optimierte Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityUpdate(line.id, line.quantity - 1, line.merchandise.product.title)}
                          disabled={line.quantity <= 1 || isUpdatingCart}
                          className={`${capabilities.isMobile ? 'min-h-[48px] min-w-[48px]' : 'h-8 w-8'} p-0 touch-target-small`}
                          aria-label={`Menge von ${line.merchandise.product.title} verringern`}
                        >
                          <Minus className="h-3 w-3" aria-hidden="true" />
                        </Button>
                        <span 
                          className="w-8 text-center text-sm"
                          aria-label={`Aktuelle Menge: ${line.quantity}`}
                        >
                          {line.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityUpdate(line.id, line.quantity + 1, line.merchandise.product.title)}
                          disabled={isUpdatingCart}
                          className={`${capabilities.isMobile ? 'min-h-[48px] min-w-[48px]' : 'h-8 w-8'} p-0 touch-target-small`}
                          aria-label={`Menge von ${line.merchandise.product.title} erhöhen`}
                        >
                          <Plus className="h-3 w-3" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Total Price and Remove */}
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatPrice(line.estimatedCost.totalAmount.amount, line.estimatedCost.totalAmount.currencyCode)}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveItem(line.id, line.merchandise.product.title)}
                        disabled={isRemovingFromCart}
                        className={`${capabilities.isMobile ? 'min-h-[48px] min-w-[48px]' : 'h-8 w-8'} mt-2 p-0 text-muted-foreground hover:text-destructive touch-target-small`}
                        aria-label={`${line.merchandise.product.title} aus dem Warenkorb entfernen`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Cart Footer */}
          {cartLines.length > 0 && (
            <>
              <Separator />
              <div className="py-6 space-y-4" role="region" aria-label="Bestellzusammenfassung">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Zwischensumme:</span>
                    <span aria-label={`Zwischensumme ${formatPrice(cartSubtotal, 'CHF')}`}>
                      {formatPrice(cartSubtotal, 'CHF')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Versand:</span>
                    <span aria-label="Versand kostenlos">Kostenlos</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Gesamt:</span>
                    <span aria-label={`Gesamtpreis ${formatPrice(cartTotal, 'CHF')}`}>
                      {formatPrice(cartTotal, 'CHF')}
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleCheckout}
                  className={`w-full bg-accent hover:bg-accent/90 ${capabilities.isMobile ? 'min-h-[48px] text-lg' : ''}`}
                  size={capabilities.isMobile ? "lg" : "default"}
                  aria-describedby="checkout-total"
                >
                  <span id="checkout-total" className="sr-only">
                    Zur Kasse gehen. Gesamtpreis: {formatPrice(cartTotal, 'CHF')}
                  </span>
                  Zur Kasse ({formatPrice(cartTotal, 'CHF')})
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={closeCart}
                  className={`w-full ${capabilities.isMobile ? 'min-h-[48px]' : ''}`}
                  size={capabilities.isMobile ? "lg" : "default"}
                >
                  Weiter einkaufen
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
