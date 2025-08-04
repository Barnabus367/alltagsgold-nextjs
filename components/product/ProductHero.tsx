import React from 'react';
import { Button } from '@/components/ui/button';
import { PremiumImage } from '@/components/common/PremiumImage';
import { ShopifyProduct, ShopifyVariant } from '@/types/shopify';
import { formatPriceSafe } from '@/lib/type-guards';
import { ShoppingCart, Truck, Shield, Clock } from '@/lib/icons';

interface ProductHeroProps {
  product: ShopifyProduct;
  selectedVariant: ShopifyVariant;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

export function ProductHero({ 
  product, 
  selectedVariant, 
  onAddToCart, 
  isAddingToCart 
}: ProductHeroProps) {
  const price = formatPriceSafe(selectedVariant.price);
  const primaryImage = product.images.edges[0]?.node;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
      {/* Bild Links - 60% */}
      <div className="lg:col-span-3">
        <div className="bg-gray-50 rounded-2xl p-8 lg:p-12 aspect-square flex items-center justify-center">
          <PremiumImage
            src={primaryImage?.url || ''}
            alt={primaryImage?.altText || product.title}
            className="w-full h-full object-contain"
            productTitle={product.title}
            context="detail"
          />
        </div>
        
        {/* Trust Badges unter dem Bild */}
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>Schneller Versand</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Sichere Zahlung</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>30 Tage Rückgabe</span>
          </div>
        </div>
      </div>
      
      {/* Info Rechts - 40% */}
      <div className="lg:col-span-2 space-y-6">
        {/* Produkttitel */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-light text-gray-900 mb-2">
            {product.title}
          </h1>
          <p className="text-lg text-gray-600">
            {'Modernes Design trifft Funktionalität'}
          </p>
        </div>
        
        {/* Preis */}
        <div className="text-4xl font-light text-gray-900">
          {price}
        </div>
        
        {/* Kurzbeschreibung */}
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed line-clamp-3">
            {product.description || 
             'Entdecken Sie unser sorgfältig ausgewähltes Produkt, das Qualität und Design vereint. Perfekt für Ihren Alltag.'}
          </p>
        </div>
        
        {/* Verfügbarkeit */}
        <div className="flex items-center gap-2 text-green-600">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
          <span className="font-medium">Auf Lager - Versand innerhalb 24h</span>
        </div>
        
        {/* CTA Button */}
        <Button
          onClick={onAddToCart}
          disabled={!selectedVariant?.availableForSale || isAddingToCart}
          size="lg"
          className="w-full h-14 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isAddingToCart ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Wird hinzugefügt...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>In den Warenkorb</span>
            </div>
          )}
        </Button>
        
        {/* Zusatzinfo */}
        <div className="pt-4 border-t border-gray-200 text-sm text-gray-600 space-y-2">
          <p>✓ Kostenloser Versand ab CHF 60</p>
          <p>✓ Direkt aus unserem Schweizer Lager</p>
          <p>✓ Sichere Bezahlung mit SSL-Verschlüsselung</p>
        </div>
      </div>
    </section>
  );
}