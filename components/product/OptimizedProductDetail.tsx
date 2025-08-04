import React, { useState, useEffect, useMemo } from 'react';
import { Heart, ShoppingCart, Truck, RotateCcw, Shield, Check } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { PremiumImage } from '@/components/common/PremiumImage';
import { ProductDescription } from '@/components/product/ProductDescription';
import { ShopifyProduct, ShopifyVariant } from '@/types/shopify';
import { formatPriceSafe, getPriceAmountSafe } from '@/lib/type-guards';

interface OptimizedProductDetailProps {
  product: ShopifyProduct;
  optimizedContent: any;
  selectedVariant: ShopifyVariant;
  onAddToCart: () => void;
  onVariantChange: (variantId: string) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

/**
 * Optimierte Produktdetailseite nach neuem Layout:
 * - Großes Produktbild mit Galerie
 * - Name & Preis (optimierte Typografie)
 * - Versand, Rückgabe, Garantie Infos
 * - Produktvorteile (Bullet Points)
 * - Technische Details (Bullet Points)
 * - "In den Warenkorb" Button
 */
export const OptimizedProductDetail: React.FC<OptimizedProductDetailProps> = ({
  product,
  optimizedContent,
  selectedVariant,
  onAddToCart,
  onVariantChange,
  quantity,
  onQuantityChange
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Safe data extraction
  const images = product.images?.edges?.map(edge => edge.node) || [];
  const variants = product.variants?.edges?.map(edge => edge.node) || [];
  const hasMultipleImages = images.length > 1;
  const hasMultipleVariants = variants.length > 1;

  // Pricing
  const price = formatPriceSafe(selectedVariant?.price);
  const compareAtPrice = selectedVariant?.compareAtPrice ? formatPriceSafe(selectedVariant.compareAtPrice) : null;

  // Extract product benefits and technical details from optimized content
  const productBenefits = useMemo(() => {
    if (optimizedContent.type === 'legacy' && optimizedContent.benefits) {
      return optimizedContent.benefits;
    }
    // For native content, we could extract bullet points from HTML here
    return [];
  }, [optimizedContent]);

  const technicalDetails = useMemo(() => {
    if (optimizedContent.type === 'legacy' && optimizedContent.sections?.[0]?.content) {
      return optimizedContent.sections[0].content;
    }
    // For native content, we could extract technical details from HTML here
    return [];
  }, [optimizedContent]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* PRODUKTBILD MIT GALERIE */}
        <div className="space-y-6">
          {/* Hauptbild */}
          <div className="aspect-square overflow-hidden bg-gray-50 rounded-xl">
            <PremiumImage
              src={images[selectedImageIndex]?.url || images[0]?.url || ''}
              alt={images[selectedImageIndex]?.altText || product.title}
              className="w-full h-full object-cover"
              productTitle={product.title}
              context="detail"
              productId={product.id}
              imageIndex={selectedImageIndex}
              fallbackSrc="https://res.cloudinary.com/do7yh4dll/image/fetch/c_pad,w_800,h_800,b_auto/https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
            />
          </div>
          
          {/* Thumbnail Galerie */}
          {hasMultipleImages && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === index 
                      ? 'border-gray-900 ring-2 ring-gray-900 ring-opacity-20' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  aria-label={`Produktbild ${index + 1} von ${images.length} anzeigen`}
                >
                  <PremiumImage
                    src={image.url}
                    alt={image.altText || product.title}
                    className="w-full h-full object-cover"
                    productTitle={product.title}
                    context="thumbnail"
                    productId={product.id}
                    imageIndex={index}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PRODUKTINFORMATIONEN */}
        <div className="space-y-8">
          
          {/* NAME & PREIS - Optimierte Typografie */}
          <div className="space-y-4">
            {/* H1 Produktname - 2.0rem, font-weight: 600, line-height: 1.2 */}
            <h1 className="text-4xl font-semibold text-gray-900 leading-tight tracking-tight">
              {product.title}
            </h1>
            
            {/* Preis - 1.75rem, font-weight: 700, Farbe: #111 */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900 tracking-tight">
                {price}
              </span>
              {compareAtPrice && (
                <span className="text-lg text-gray-500 line-through">
                  {compareAtPrice}
                </span>
              )}
            </div>
          </div>

          {/* VERSAND & SERVICE INFOS */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Versand */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-base">Kostenloser Versand</p>
                  <p className="text-sm text-gray-600">Ab CHF 49.- Bestellwert</p>
                </div>
              </div>
              
              {/* Rückgabe */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-base">30 Tage Rückgaberecht</p>
                  <p className="text-sm text-gray-600">Einfache Rückabwicklung</p>
                </div>
              </div>
              
              {/* Garantie */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-base">24 Monate Garantie</p>
                  <p className="text-sm text-gray-600">Herstellergarantie inklusive</p>
                </div>
              </div>
            </div>
          </div>

          {/* PRODUKTVORTEILE - Bullet Points */}
          {productBenefits.length > 0 && (
            <div className="space-y-4">
              {/* Bullet-Heading - 1.125rem, font-weight: 600, margin-bottom: .25rem */}
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Produktvorteile
              </h3>
              
              {/* Bullet-Text - 1rem, line-height: 1.5, margin-bottom: .5rem */}
              <ul className="space-y-3">
                {productBenefits.map((benefit: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-base leading-relaxed text-gray-700 mb-2">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TECHNISCHE DETAILS - Bullet Points */}
          {technicalDetails.length > 0 && (
            <div className="space-y-4">
              {/* Bullet-Heading - 1.125rem, font-weight: 600, margin-bottom: .25rem */}
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Technische Details
              </h3>
              
              {/* Bullet-Text - 1rem, line-height: 1.5, margin-bottom: .5rem */}
              <ul className="space-y-3">
                {technicalDetails.map((detail: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2.5"></div>
                    <span className="text-base leading-relaxed text-gray-700 mb-2">
                      {detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* VARIANT AUSWAHL */}
          {hasMultipleVariants && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Variante wählen
              </h3>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => onVariantChange(variant.id)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                      selectedVariant.id === variant.id
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {variant.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MENGE & CTA BUTTON */}
          <div className="space-y-6">
            {/* Mengenauswahl */}
            <div className="flex items-center gap-4">
              <label className="text-base font-medium text-gray-900">Menge:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-50 transition-colors"
                  disabled={quantity <= 1}
                >
                  <span className="text-lg font-medium">−</span>
                </button>
                <span className="px-4 py-2 text-base font-medium min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => onQuantityChange(quantity + 1)}
                  className="p-2 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-medium">+</span>
                </button>
              </div>
            </div>

            {/* CTA Button - font-size: 1.125rem, font-weight: 700 */}
            <div className="flex gap-4">
              <Button
                onClick={onAddToCart}
                disabled={!selectedVariant.availableForSale}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-4 text-lg font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {selectedVariant.availableForSale ? 'In den Warenkorb' : 'Nicht verfügbar'}
              </Button>
              
              <Button
                variant="outline"
                className="p-4 border-gray-300 hover:border-gray-400 rounded-xl transition-colors"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* ERWEITERTE BESCHREIBUNG */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <ProductDescription 
              html={optimizedContent.html || optimizedContent.description || product.descriptionHtml}
              loading={optimizedContent.loading}
              isEmpty={optimizedContent.isEmpty}
              collapsible={true}
              truncateLines={4}
              previewLines={2}
              className="bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedProductDetail;
