import React, { useMemo } from 'react';
import { ShopifyVariant } from '@/types/shopify';
import { cn } from '@/lib/utils';

interface CompactVariantSelectorProps {
  variants: ShopifyVariant[];
  selectedVariant: ShopifyVariant | null;
  onVariantChange: (variant: ShopifyVariant) => void;
}

// Farben-Mapping für visuelle Darstellung
const colorMap: Record<string, string> = {
  'Blau': '#3B82F6',
  'Rosa': '#EC4899',
  'Pink': '#EC4899',
  'Weiß': '#F3F4F6',
  'Weiss': '#F3F4F6',
  'Schwarz': '#111827',
  'Grün': '#10B981',
  'Rot': '#EF4444',
  'Gelb': '#FCD34D',
  'Grau': '#6B7280',
  'Lila': '#9333EA',
  'Orange': '#FB923C',
  'Braun': '#92400E'
};

export function CompactVariantSelector({
  variants,
  selectedVariant,
  onVariantChange
}: CompactVariantSelectorProps) {
  
  // Gruppiere Varianten nach Optionstyp
  const optionGroups = useMemo(() => {
    const groups: Record<string, { 
      name: string; 
      values: Array<{
        value: string;
        variant: ShopifyVariant;
        image?: string;
      }> 
    }> = {};
    
    variants.forEach(variant => {
      variant.selectedOptions?.forEach(option => {
        if (!groups[option.name]) {
          groups[option.name] = { 
            name: option.name, 
            values: [] 
          };
        }
        
        // Prüfe ob dieser Wert schon existiert
        const existingValue = groups[option.name].values.find(
          v => v.value === option.value
        );
        
        if (!existingValue) {
          groups[option.name].values.push({
            value: option.value,
            variant: variant,
            image: variant.image?.url
          });
        }
      });
    });
    
    return groups;
  }, [variants]);

  if (variants.length <= 1) {
    return null;
  }

  const isColorOption = (optionName: string) => {
    return optionName.toLowerCase().includes('farbe') || 
           optionName.toLowerCase().includes('color');
  };

  const isSizeOption = (optionName: string) => {
    return optionName.toLowerCase().includes('größe') || 
           optionName.toLowerCase().includes('grösse') ||
           optionName.toLowerCase().includes('size') ||
           optionName.toLowerCase().includes('packung');
  };

  return (
    <div className="space-y-4">
      {Object.entries(optionGroups).map(([optionName, optionData]) => {
        const currentValue = selectedVariant?.selectedOptions?.find(
          opt => opt.name === optionName
        )?.value;

        // Farb-Swatches
        if (isColorOption(optionName)) {
          return (
            <div key={optionName} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {optionName}: <span className="font-normal text-emerald-600">{currentValue || 'Wählen'}</span>
              </label>
              <div className="flex gap-3">
                {optionData.values.map(({ value, variant, image }) => {
                  const isSelected = currentValue === value;
                  const color = colorMap[value] || '#E5E7EB';
                  const isWhite = value.toLowerCase().includes('weiß') || value.toLowerCase().includes('weiss');
                  
                  return (
                    <button
                      key={value}
                      onClick={() => onVariantChange(variant)}
                      className="relative group"
                      aria-label={`${optionName} ${value} auswählen`}
                    >
                      {/* Visueller Swatch */}
                      <div className={cn(
                        "w-12 h-12 rounded-full overflow-hidden transition-all duration-200",
                        "ring-2 ring-offset-2",
                        isSelected 
                          ? "ring-emerald-500 scale-110" 
                          : "ring-transparent hover:ring-gray-300"
                      )}>
                        {image ? (
                          // Verwende Produktbild wenn vorhanden
                          <img 
                            src={image} 
                            alt={value}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          // Fallback auf Farbe
                          <div 
                            className={cn(
                              "w-full h-full",
                              isWhite && "border border-gray-300"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        )}
                      </div>
                      
                      {/* Label unter dem Swatch */}
                      <div className={cn(
                        "absolute -bottom-5 left-1/2 -translate-x-1/2",
                        "text-xs whitespace-nowrap",
                        isSelected ? "font-medium text-emerald-600" : "text-gray-600"
                      )}>
                        {value}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        // Größen/Packungsgrößen als Chips
        return (
          <div key={optionName} className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {optionName}: <span className="font-normal text-emerald-600">{currentValue || 'Wählen'}</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {optionData.values.map(({ value, variant }) => {
                const isSelected = currentValue === value;
                
                // Preis-Differenz berechnen
                const priceDiff = selectedVariant ? 
                  (parseFloat(variant.price.amount) - parseFloat(selectedVariant.price.amount)) : 0;
                const showPriceDiff = Math.abs(priceDiff) > 0.01;
                
                return (
                  <button
                    key={value}
                    onClick={() => onVariantChange(variant)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-full border-2 transition-all duration-200",
                      isSelected 
                        ? "bg-emerald-100 text-emerald-700 border-emerald-500" 
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                    )}
                  >
                    <span>{value}</span>
                    {showPriceDiff && (
                      <span className="ml-1 text-xs opacity-70">
                        ({priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(0)} CHF)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}