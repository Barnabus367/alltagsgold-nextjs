import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Plus } from 'lucide-react';
import { ShopifyProduct } from '@/types/shopify';
import { formatPrice } from '@/lib/shopify';
import { useCart } from '@/hooks/useCart';
import { trackAddToCart } from '@/lib/analytics';
import { PremiumImage } from '@/components/common/PremiumImage';


interface ProductCardProps {
  product: ShopifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItemToCart, isAddingToCart } = useCart();

  const primaryImage = product.images.edges[0]?.node;
  const primaryVariant = product.variants.edges[0]?.node;
  
  const price = primaryVariant ? formatPrice(primaryVariant.price.amount, primaryVariant.price.currencyCode) : 'N/A';

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
      
      // Track AddToCart event
      trackAddToCart({
        content_id: product.id,
        content_name: product.title,
        content_type: 'product',
        value: parseFloat(primaryVariant.price.amount),
        currency: primaryVariant.price.currencyCode || 'CHF',
        contents: [{
          id: primaryVariant.id,
          quantity: 1,
          item_price: parseFloat(primaryVariant.price.amount)
        }]
      });
      
      await addItemToCart(primaryVariant.id, 1, productData);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Link href={`/products/${product.handle}`}>
      <div className="product-card group cursor-pointer bg-white rounded-lg border border-gray-100 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 md:hover:scale-[1.025] hover:border-gray-200">
        {/* Produktbild mit Cloudinary-Optimierung */}
        <div className="relative aspect-square overflow-hidden bg-white mb-4">
          <PremiumImage
            src={primaryImage?.url || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={primaryImage?.altText || product.title}
            className="product-image w-full h-full"
            productTitle={product.title}
          />
          
          {/* Wishlist Button */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 h-auto rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"
            onClick={toggleWishlist}
            aria-label={isWishlisted ? 'Von Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
              }`} 
            />
          </Button>
        </div>
        
        {/* Produktinfos */}
        <div className="space-y-3">
          {/* Produktname - maximal 2 Zeilen */}
          <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
            {product.title}
          </h3>
          
          {/* Preis groß und deutlich */}
          <div className="mb-3">
            <span className="text-xl font-bold text-gray-900">
              {price}
            </span>
          </div>
          
          {/* CTA-Button in Schwarz */}
          <Button
            onClick={handleAddToCart}
            disabled={!primaryVariant?.availableForSale || isAddingToCart}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
            aria-label={`${product.title} in den Warenkorb legen`}
          >
            {isAddingToCart ? 'Wird hinzugefügt...' : 'In den Warenkorb'}
          </Button>
        </div>
      </div>
    </Link>
  );
}