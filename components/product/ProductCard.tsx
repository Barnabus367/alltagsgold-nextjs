import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ShopifyProduct } from '@/types/shopify';
import { formatPrice } from '@/lib/shopify';
import { formatPriceSafe, getPriceAmountSafe } from '@/lib/type-guards';
import { useCart } from '@/hooks/useCart';
import { trackAddToCart } from '@/lib/analytics';
import { PremiumImage } from '@/components/common/PremiumImage';
import { announceToScreenReader } from '@/lib/accessibility';
import { useMobileUX } from '@/hooks/useMobileUX';


interface ProductCardProps {
  product: ShopifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  const { addItemToCart, isAddingToCart } = useCart();
  const { capabilities, getTouchClasses, validateTouchTarget } = useMobileUX();
  const cardRef = useRef<HTMLDivElement>(null);

  const primaryImage = product.images.edges[0]?.node;
  const primaryVariant = product.variants.edges[0]?.node;
  
  const price = primaryVariant ? formatPriceSafe(primaryVariant.price) : '–';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!primaryVariant?.availableForSale) return;
    
    try {
      const productData = {
        title: product.title,
        image: primaryImage?.url,
        price: primaryVariant.price,
        selectedOptions: primaryVariant.selectedOptions,
        handle: product.handle
      };
      
      // Announce to screen readers
      announceToScreenReader(`${product.title} wird zum Warenkorb hinzugefügt`);
      
      // Track AddToCart event
      trackAddToCart({
        content_id: product.id,
        content_name: product.title,
        content_type: 'product',
        value: getPriceAmountSafe(primaryVariant.price),
        currency: primaryVariant.price?.currencyCode || 'CHF',
        contents: [{
          id: primaryVariant.id,
          quantity: 1,
          item_price: getPriceAmountSafe(primaryVariant.price)
        }]
      });
      
      await addItemToCart(primaryVariant.id, 1, productData);
      announceToScreenReader(`${product.title} wurde zum Warenkorb hinzugefügt`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      announceToScreenReader('Fehler beim Hinzufügen zum Warenkorb');
    }
  };

  return (
    <article 
      ref={cardRef}
      className={`product-card group bg-white rounded-lg border border-gray-100 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-200 ${getTouchClasses()}`}
      role="group"
      aria-labelledby={`product-title-${product.id}`}
      aria-describedby={`product-price-${product.id}`}
    >
      <Link 
        href={`/products/${product.handle}`}
        className="block p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
        aria-label={`${product.title} - Produktdetails anzeigen`}
      >
        {/* Produktbild mit Cloudinary-Optimierung */}
        <div className="relative aspect-square overflow-hidden bg-white mb-4 rounded-md">
          <PremiumImage
            src={primaryImage?.url || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={primaryImage?.altText || product.title}
            className="product-image w-full h-full object-cover"
            productTitle={product.title}
            context="card"
            productId={product.id}
            imageIndex={0}
            fallbackSrc="https://via.placeholder.com/400x400?text=Produkt+Bild"
          />
        </div>
        
        {/* Produktinfos */}
        <div className="space-y-3">
          {/* Produktname - maximal 2 Zeilen */}
          <h3 
            id={`product-title-${product.id}`}
            className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 min-h-[2.5rem]"
          >
            {product.title}
          </h3>
          
          {/* Preis groß und deutlich */}
          <div className="mb-3">
            <span 
              id={`product-price-${product.id}`}
              className="text-xl font-bold text-gray-900"
              aria-label={`Preis: ${price}`}
            >
              {price}
            </span>
          </div>
          
          {/* Verfügbarkeitsstatus */}
          {!primaryVariant?.availableForSale && (
            <div className="text-sm text-red-600 font-medium" role="status">
              Nicht verfügbar
            </div>
          )}
        </div>
      </Link>
      
      {/* CTA-Button außerhalb des Links - Mobile-optimiert */}
      <div className="px-4 pb-4">
        <Button
          onClick={handleAddToCart}
          disabled={!primaryVariant?.availableForSale || isAddingToCart}
          className={`w-full bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            capabilities.supportsTouch 
              ? 'py-3 px-4 min-h-[44px] touch-manipulation text-base' 
              : 'py-2 px-3 min-h-[36px] text-sm'
          }`}
          aria-label={`${product.title} in den Warenkorb legen${!primaryVariant?.availableForSale ? ' - nicht verfügbar' : ''}`}
          aria-describedby={`product-title-${product.id} product-price-${product.id}`}
          type="button"
        >
          {isAddingToCart ? (
            <>
              <span className="sr-only">Wird hinzugefügt...</span>
              <div className="flex items-center justify-center">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Wird hinzugefügt...
              </div>
            </>
          ) : (
            'In den Warenkorb'
          )}
        </Button>
      </div>
      
      {/* Status-Region für Screen Reader */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isAddingToCart && `${product.title} wird zum Warenkorb hinzugefügt`}
      </div>
    </article>
  );
}