import React from 'react';
import { ShopifyVariant, ShopifyProduct } from '@/types/shopify';
import { formatPriceSafe } from '@/lib/type-guards';
import { cn } from '@/lib/utils';

interface ProductVariantSelectorProps {
  product: ShopifyProduct;
  variants: ShopifyVariant[];
  selectedVariant: ShopifyVariant | null;
  onVariantChange: (variant: ShopifyVariant) => void;
}

export function ProductVariantSelector({
  product,
  variants,
  selectedVariant,
  onVariantChange
}: ProductVariantSelectorProps) {
  // Gruppiere Varianten nach Option-Typ (z.B. Farbe, Größe)
  const groupVariantsByOption = () => {
    const groups: Record<string, { name: string; values: Set<string> }> = {};
    
    variants.forEach(variant => {
      variant.selectedOptions?.forEach(option => {
        if (!groups[option.name]) {
          groups[option.name] = { name: option.name, values: new Set() };
        }
        groups[option.name].values.add(option.value);
      });
    });
    
    return groups;
  };

  const optionGroups = groupVariantsByOption();
  const hasMultipleVariants = variants.length > 1;

  if (!hasMultipleVariants) {
    return null;
  }

  // Finde Variante basierend auf ausgewählten Optionen
  const findVariantByOptions = (selectedOptions: Record<string, string>) => {
    return variants.find(variant => 
      variant.selectedOptions?.every(option => 
        selectedOptions[option.name] === option.value
      )
    );
  };

  // Aktuelle Auswahl
  const currentSelection = selectedVariant?.selectedOptions?.reduce((acc, option) => {
    acc[option.name] = option.value;
    return acc;
  }, {} as Record<string, string>) || {};

  return (
    <section className="my-12">
      <h3 className="text-xl font-medium text-gray-900 mb-6">
        Verfügbare Varianten
      </h3>
      
      {Object.entries(optionGroups).map(([optionName, optionData]) => (
        <div key={optionName} className="mb-8">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {optionName}: <span className="font-normal">{currentSelection[optionName]}</span>
          </h4>
          
          <div className="flex flex-wrap gap-3">
            {Array.from(optionData.values).map(value => {
              const isSelected = currentSelection[optionName] === value;
              const newSelection = { ...currentSelection, [optionName]: value };
              const variant = findVariantByOptions(newSelection);
              const isAvailable = variant?.availableForSale;
              
              return (
                <button
                  key={value}
                  onClick={() => variant && onVariantChange(variant)}
                  disabled={!isAvailable}
                  className={cn(
                    "relative min-w-[100px] px-4 py-3 rounded-xl border-2 transition-all duration-200",
                    "hover:scale-105 hover:shadow-md",
                    isSelected 
                      ? "border-gray-900 bg-gray-900 text-white shadow-lg" 
                      : "border-gray-200 bg-white text-gray-900 hover:border-gray-400",
                    !isAvailable && "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none"
                  )}
                >
                  <span className="font-medium">{value}</span>
                  
                  {/* Preis-Unterschied anzeigen wenn vorhanden */}
                  {variant && variant.price.amount !== selectedVariant?.price.amount && (
                    <span className="block text-xs mt-1 opacity-70">
                      {formatPriceSafe(variant.price)}
                    </span>
                  )}
                  
                  {/* Ausverkauft Badge */}
                  {!isAvailable && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Ausverkauft
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Varianten-Bilder wenn vorhanden */}
      {variants.some(v => v.image) && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Weitere Ansichten
          </h4>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {variants.map((variant, index) => {
              if (!variant.image) return null;
              const isSelected = selectedVariant?.id === variant.id;
              
              return (
                <button
                  key={variant.id}
                  onClick={() => onVariantChange(variant)}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200",
                    "hover:scale-105 hover:shadow-md",
                    isSelected 
                      ? "border-gray-900 shadow-lg" 
                      : "border-gray-200 hover:border-gray-400"
                  )}
                >
                  <img
                    src={variant.image.url}
                    alt={variant.title}
                    className="w-full h-full object-cover"
                  />
                  {!variant.availableForSale && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white text-xs">Ausverkauft</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}