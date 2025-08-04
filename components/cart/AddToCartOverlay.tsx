import { useEffect } from 'react';
import Image from 'next/image';
import { Check, X, ShoppingBag } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { getCloudinaryUrl } from '@/lib/cloudinary-optimized';
import { formatPrice } from '@/lib/shopify';
import { formatPriceSafe } from '@/lib/type-guards';

export function AddToCartOverlay() {
  const {
    isAddToCartOverlayOpen,
    closeAddToCartOverlay,
    openCartFromOverlay,
    lastAddedItem,
  } = useCart();

  // Auto-close overlay after 3 seconds
  useEffect(() => {
    if (isAddToCartOverlayOpen) {
      const timer = setTimeout(() => {
        closeAddToCartOverlay();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isAddToCartOverlayOpen, closeAddToCartOverlay]);

  if (!isAddToCartOverlayOpen || !lastAddedItem) {
    return null;
  }

  const { merchandise, quantity } = lastAddedItem;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 transition-opacity" 
        onClick={closeAddToCartOverlay}
      />
      
      {/* Overlay Content */}
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6 transform transition-all">
        {/* Close Button */}
        <button
          onClick={closeAddToCartOverlay}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Success Icon */}
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-center mb-4">
          Zum Warenkorb hinzugefügt
        </h3>

        {/* Product Info */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {merchandise.product.featuredImage?.url ? (
              <Image
                src={merchandise.product.featuredImage.url}
                alt={merchandise.product.title}
                width={150}
                height={150}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                Kein Bild
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{merchandise.product.title}</h4>
            {merchandise.title !== 'Default Title' && (
              <p className="text-sm text-gray-600">{merchandise.title}</p>
            )}
            <p className="text-sm text-gray-600">Menge: {quantity}</p>
            <p className="font-semibold text-sm">
              {formatPriceSafe(merchandise?.price)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={closeAddToCartOverlay}
            className="flex-1"
          >
            Weiter einkaufen
          </Button>
          <Button
            onClick={openCartFromOverlay}
            className="flex-1 bg-black hover:bg-gray-800 text-white"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Warenkorb
          </Button>
        </div>
      </div>
    </div>
  );
}