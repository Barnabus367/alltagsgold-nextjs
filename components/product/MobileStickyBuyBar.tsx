import React from 'react';
import { Button } from '@/components/ui/button';
import { ShopifyVariant } from '@/types/shopify';
import { formatPriceSafe } from '@/lib/type-guards';
import { ShoppingCart } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface MobileStickyBuyBarProps {
  selectedVariant: ShopifyVariant | null;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

export function MobileStickyBuyBar({
  selectedVariant,
  onAddToCart,
  isAddingToCart
}: MobileStickyBuyBarProps) {
  
  const getButtonText = () => {
    if (!selectedVariant) return 'Variante wählen';
    if (isAddingToCart) return 'Hinzufügen...';
    return 'In den Warenkorb';
  };
  
  const price = selectedVariant ? formatPriceSafe(selectedVariant.price) : 'CHF --';
  const variantTitle = selectedVariant?.title !== 'Default Title' 
    ? selectedVariant?.title 
    : selectedVariant?.selectedOptions?.[0]?.value || 'Wählen';
  
  return (
    <div className="
      fixed bottom-0 left-0 right-0 z-40
      bg-white border-t shadow-lg
      px-4 py-3 lg:hidden
      animate-in slide-in-from-bottom duration-300
    ">
      <div className="flex items-center justify-between gap-3">
        {/* Varianten-Info & Preis */}
        <div className="flex-shrink-0">
          <div className="text-xs text-gray-600 truncate max-w-[120px]">
            {variantTitle}
          </div>
          <div className="font-semibold text-lg">
            {price}
          </div>
        </div>
        
        {/* CTA Button */}
        <Button 
          onClick={onAddToCart}
          disabled={!selectedVariant || isAddingToCart}
          className={cn(
            "flex-1 max-w-[200px] h-12",
            !selectedVariant 
              ? "bg-gray-400 hover:bg-gray-500" 
              : "bg-emerald-600 hover:bg-emerald-700"
          )}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">{getButtonText()}</span>
        </Button>
      </div>
      
      {/* Kostenloser Versand Hinweis */}
      {selectedVariant && (
        <div className="text-xs text-gray-500 text-center mt-2">
          Kostenloser Versand ab CHF 60
        </div>
      )}
    </div>
  );
}