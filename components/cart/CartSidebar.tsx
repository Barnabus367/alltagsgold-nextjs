import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/shopify';
import { getCloudinaryUrl } from '@/lib/cloudinary';

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

  const cartLines = cart?.lines.edges || [];

  const handleCheckout = () => {
    if (cart?.webUrl) {
      window.location.href = cart.webUrl;
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Warenkorb</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-6">
            {cartLines.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Ihr Warenkorb ist leer</p>
                <Button onClick={closeCart} variant="outline">
                  Weiter einkaufen
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartLines.map(({ node: line }) => (
                  <div key={line.id} className="flex items-center space-x-4 bg-muted/50 p-4 rounded-lg">
                    {line.merchandise.product.featuredImage?.url && 
                     getCloudinaryUrl(line.merchandise.product.featuredImage.url).includes('res.cloudinary.com') ? (
                      <img
                        src={getCloudinaryUrl(line.merchandise.product.featuredImage.url)}
                        alt={line.merchandise.product.featuredImage?.altText || line.merchandise.product.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                        Wird optimiert...
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
                        {formatPrice(line.merchandise.price.amount, line.merchandise.price.currencyCode)}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(line.id, line.quantity - 1)}
                          disabled={line.quantity <= 1 || isUpdatingCart}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{line.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(line.id, line.quantity + 1)}
                          disabled={isUpdatingCart}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
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
                        onClick={() => removeItem(line.id)}
                        disabled={isRemovingFromCart}
                        className="mt-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
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
              <div className="py-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Zwischensumme:</span>
                    <span>{formatPrice(cartSubtotal, 'EUR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Versand:</span>
                    <span>Kostenlos</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Gesamt:</span>
                    <span>{formatPrice(cartTotal, 'EUR')}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-accent hover:bg-accent/90"
                  size="lg"
                >
                  Zur Kasse ({formatPrice(cartTotal, 'EUR')})
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={closeCart}
                  className="w-full"
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
