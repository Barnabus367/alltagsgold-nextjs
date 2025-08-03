import { useState } from 'react';
import Link from 'next/link';
import { Heart } from '@/lib/icons';
import { ShopifyProduct } from '@/types/shopify';
import { formatPrice } from '@/lib/shopify';
import { useCart } from '@/hooks/useCart';
import { trackAddToCart } from '@/lib/analytics';
import { PremiumImage } from '@/components/common/PremiumImage';
import { hasValidPrimaryVariant, isValidVariant, formatPriceSafe, getPriceAmountSafe } from '@/lib/type-guards';

interface HighlightProductCardProps {
  product: ShopifyProduct;
}

export function HighlightProductCard({ product }: HighlightProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItemToCart, isAddingToCart } = useCart();

  // Early validation - wenn Produkt ungültig ist, zeige Fallback
  if (!hasValidPrimaryVariant(product)) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 opacity-50">
        <div className="h-48 bg-gray-200 rounded-lg mb-4" />
        <div className="text-center text-gray-500">
          Produkt nicht verfügbar
        </div>
      </div>
    );
  }

  const primaryImage = product.images.edges[0]?.node;
  const primaryVariant = product.variants.edges[0]?.node;
  
  // Sichere Price-Formatierung mit Type Guards
  const price = formatPriceSafe(primaryVariant.price);

  // Entfernt - jetzt in OptimizedImage-Komponente

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
      <div 
        className="bg-white rounded-xl p-8 cursor-pointer transition-all duration-300 hover:bg-gray-50 md:hover:scale-[1.02]"
        style={{
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
        }}
      >
        {/* Produktbild größer und mit reduziertem Schatten */}
        <div className="relative aspect-square overflow-hidden bg-white mb-6 rounded-lg">
          {primaryImage?.url ? (
            <PremiumImage
              src={primaryImage.url}
              alt={primaryImage.altText || product.title}
              className="w-full h-full object-cover"
              productTitle={product.title}
              productId={product.id ? product.id.replace('gid://shopify/Product/', '') : undefined}
              imageIndex={0}
              context="card"
            />
          ) : (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Kein Bild</span>
            </div>
          )}
          
          {/* Wishlist Button - dezenter */}
          <button
            onClick={toggleWishlist}
            className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
            style={{ 
              opacity: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            aria-label={isWishlisted ? 'Von Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'
              }`} 
            />
          </button>
        </div>
        
        {/* Produktinfos mit mehr Weißraum */}
        <div className="space-y-4">
          {/* Produktname - moderne Typo */}
          <h3 
            className="font-normal text-gray-800 leading-relaxed"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.8rem',
              fontSize: '0.95rem',
              lineHeight: '1.4'
            }}
          >
            {product.title}
          </h3>
          
          {/* Preis kleiner und weniger fett */}
          <div className="mb-5">
            <span 
              className="font-medium text-gray-700"
              style={{ 
                fontSize: '1.1rem',
                fontWeight: '500'
              }}
            >
              {price}
            </span>
          </div>
          
          {/* CTA-Button in ruhigem Anthrazit */}
          <button
            onClick={handleAddToCart}
            disabled={!primaryVariant?.availableForSale || isAddingToCart}
            className="w-full font-medium py-3 px-5 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: '#23272b',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              fontSize: '0.9rem',
              letterSpacing: '0.025em',
              marginTop: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1d20';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#23272b';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
            aria-label={`${product.title} in den Warenkorb legen`}
          >
            {isAddingToCart ? 'Wird hinzugefügt...' : 'In den Warenkorb'}
          </button>
        </div>
      </div>
    </Link>
  );
}