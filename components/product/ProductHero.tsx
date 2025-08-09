import React from 'react';
import { Button } from '@/components/ui/button';
import { PremiumImage } from '@/components/common/PremiumImage';
import { CompactVariantSelector } from './CompactVariantSelector';
import { ShopifyProduct, ShopifyVariant } from '@/types/shopify';
import { formatPriceSafe } from '@/lib/type-guards';
import { ShoppingCart, Truck, Shield, Clock } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface ProductHeroProps {
  product: ShopifyProduct;
  selectedVariant: ShopifyVariant | null;
  variants: ShopifyVariant[];
  onAddToCart: () => void;
  onVariantChange: (variant: ShopifyVariant) => void;
  isAddingToCart: boolean;
}

export function ProductHero({ 
  product, 
  selectedVariant,
  variants,
  onAddToCart,
  onVariantChange,
  isAddingToCart 
}: ProductHeroProps) {
  const price = selectedVariant ? formatPriceSafe(selectedVariant.price) : 'CHF --';
  
  // Dynamisches Bild basierend auf Variante
  const currentImage = selectedVariant?.image || product.images.edges[0]?.node;
  
  // URL-Parameter setzen wenn Variante gewählt wird (nur bei User-Interaktion, nicht Initial)
  const handleVariantChange = (variant: any) => {
    onVariantChange(variant);
    
    // Update URL nur bei expliziter Varianten-Auswahl durch User
    if (variant?.id) {
      // Extrahiere numerische ID aus GraphQL ID (gid://shopify/ProductVariant/123456)
      const numericId = variant.id.split('/').pop() || variant.id;
      const url = new URL(window.location.href);
      url.searchParams.set('variant', numericId);
      // Nutze replaceState statt push um History nicht zu überladen
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  };
  
  // Button-Text basierend auf Zustand
  const getButtonText = () => {
    if (!selectedVariant) return 'Bitte Variante wählen';
    if (isAddingToCart) return 'Wird hinzugefügt...';
    return 'In den Warenkorb';
  };
  
  const isButtonDisabled = !selectedVariant || isAddingToCart;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
      {/* Bild Links - 60% */}
      <div className="lg:col-span-3">
        <div className="bg-gray-50 rounded-2xl p-8 lg:p-12 aspect-square flex items-center justify-center">
          <PremiumImage
            src={currentImage?.url || ''}
            alt={currentImage?.altText || product.title}
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
        
        {/* Kompakte Varianten-Auswahl - NEU HIER */}
        {variants.length > 1 && (
          <div className="pb-4 mb-4 border-b border-gray-200">
            <CompactVariantSelector
              variants={variants}
              selectedVariant={selectedVariant}
              onVariantChange={handleVariantChange}
            />
          </div>
        )}
        
        {/* CTA Button mit dynamischem Text */}
        <Button
          onClick={onAddToCart}
          disabled={isButtonDisabled}
          size="lg"
          className={cn(
            "w-full h-14 text-lg font-medium rounded-xl shadow-lg transition-all duration-300",
            !selectedVariant 
              ? "bg-gray-400 hover:bg-gray-500" 
              : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-xl"
          )}
        >
          {isAddingToCart ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Wird hinzugefügt...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>{getButtonText()}</span>
            </div>
          )}
        </Button>
        
        {/* Verfügbarkeit & Lieferzeit */}
        {selectedVariant && (
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span className="font-medium">Auf Lager - Versand innerhalb 24h</span>
          </div>
        )}
        
        {/* Kurze Produkt-Highlights statt Beschreibung */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 mt-0.5">✓</span>
            <span className="text-gray-700">Premium Qualität aus sorgfältiger Auswahl</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 mt-0.5">✓</span>
            <span className="text-gray-700">Getestet für den Schweizer Alltag</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 mt-0.5">✓</span>
            <span className="text-gray-700">Hervorragendes Preis-Leistungs-Verhältnis</span>
          </div>
        </div>
        
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