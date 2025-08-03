import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, X, Filter, SlidersHorizontal, Tag, Palette, Package, Grid, Minus, Plus } from '@/lib/icons';
import { ShopifyProduct } from '../../types/shopify';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';

interface FilterCriteria {
  collections: string[];
  tags: string[];
  priceRange: [number, number];
  colors: string[];
  materials: string[];
}

interface ActiveFilter {
  type: 'collection' | 'tag' | 'price' | 'color' | 'material';
  value: string | number[];
  label: string;
}

interface ImprovedProductFilterBarProps {
  products: ShopifyProduct[];
  onFilteredProducts: (filteredProducts: ShopifyProduct[]) => void;
  className?: string;
  compact?: boolean;
}

export function ImprovedProductFilterBar({ 
  products, 
  onFilteredProducts, 
  className = '',
  compact = false 
}: ImprovedProductFilterBarProps) {
  const [isOpen, setIsOpen] = useState(!compact);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({
    collections: [],
    tags: [],
    priceRange: [0, 1000],
    colors: [],
    materials: []
  });

  // Extrahiere verfügbare Filteroptionen aus den Produkten
  const filterOptions = useMemo(() => {
    const collections = new Set<string>();
    const tags = new Set<string>();
    const colors = new Set<string>();
    const materials = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;

    products.forEach(product => {
      // Kollektionen
      product.collections?.edges?.forEach((edge: any) => {
        collections.add(edge.node.handle);
      });

      // Tags
      product.tags?.forEach(tag => {
        tags.add(tag);
        
        // Farben aus Tags extrahieren
        const colorKeywords = ['rot', 'blau', 'grün', 'gelb', 'schwarz', 'weiß', 'grau', 'red', 'blue', 'green', 'yellow', 'black', 'white', 'gray'];
        if (colorKeywords.some(keyword => tag.toLowerCase().includes(keyword))) {
          colors.add(tag);
        }
        
        // Materialien aus Tags extrahieren
        const materialKeywords = ['baumwolle', 'holz', 'metall', 'kunststoff', 'glas', 'cotton', 'wood', 'metal', 'plastic', 'glass', 'leder', 'leather'];
        if (materialKeywords.some(keyword => tag.toLowerCase().includes(keyword))) {
          materials.add(tag);
        }
      });

      // Preise
      const price = parseFloat(product.variants?.edges?.[0]?.node?.price?.amount || '0');
      if (price > 0) {
        minPrice = Math.min(minPrice, price);
        maxPrice = Math.max(maxPrice, price);
      }

      // Farben und Materialien aus Varianten
      product.variants?.edges?.forEach((variant: any) => {
        variant.node.selectedOptions?.forEach((option: any) => {
          if (option.name.toLowerCase().includes('farbe') || option.name.toLowerCase().includes('color')) {
            colors.add(option.value);
          }
          if (option.name.toLowerCase().includes('material')) {
            materials.add(option.value);
          }
        });
      });
    });

    return {
      collections: Array.from(collections).sort(),
      tags: Array.from(tags).sort(),
      colors: Array.from(colors).sort(),
      materials: Array.from(materials).sort(),
      priceRange: [Math.floor(minPrice === Infinity ? 0 : minPrice), Math.ceil(maxPrice)] as [number, number]
    };
  }, [products]);

  // Setze initiale Preisspanne
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: filterOptions.priceRange
    }));
  }, [filterOptions.priceRange]);

  // Aktive Filter sammeln
  const activeFilters: ActiveFilter[] = useMemo(() => {
    const active: ActiveFilter[] = [];
    
    filters.collections.forEach(collection => {
      active.push({ type: 'collection', value: collection, label: collection });
    });
    
    filters.tags.forEach(tag => {
      active.push({ type: 'tag', value: tag, label: tag });
    });
    
    filters.colors.forEach(color => {
      active.push({ type: 'color', value: color, label: color });
    });
    
    filters.materials.forEach(material => {
      active.push({ type: 'material', value: material, label: material });
    });
    
    if (filters.priceRange[0] !== filterOptions.priceRange[0] || filters.priceRange[1] !== filterOptions.priceRange[1]) {
      active.push({ 
        type: 'price', 
        value: filters.priceRange, 
        label: `${filters.priceRange[0]} CHF - ${filters.priceRange[1]} CHF` 
      });
    }
    
    return active;
  }, [filters, filterOptions.priceRange]);

  // Filtere Produkte
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Kollektions-Filter
      if (filters.collections.length > 0) {
        const productCollections = product.collections?.edges?.map((edge: any) => edge.node.handle) || [];
        if (!filters.collections.some(collection => productCollections.includes(collection))) {
          return false;
        }
      }

      // Tag-Filter
      if (filters.tags.length > 0) {
        const productTags = product.tags || [];
        if (!filters.tags.some(tag => productTags.includes(tag))) {
          return false;
        }
      }

      // Farb-Filter
      if (filters.colors.length > 0) {
        const productTags = product.tags || [];
        const productColors: string[] = [];
        
        productTags.forEach(tag => {
          if (filters.colors.includes(tag)) {
            productColors.push(tag);
          }
        });
        
        product.variants?.edges?.forEach(variant => {
          variant.node.selectedOptions?.forEach(option => {
            if (option.name.toLowerCase().includes('farbe') || option.name.toLowerCase().includes('color')) {
              if (filters.colors.includes(option.value)) {
                productColors.push(option.value);
              }
            }
          });
        });

        if (productColors.length === 0) return false;
      }

      // Material-Filter
      if (filters.materials.length > 0) {
        const productTags = product.tags || [];
        const productMaterials: string[] = [];
        
        productTags.forEach(tag => {
          if (filters.materials.includes(tag)) {
            productMaterials.push(tag);
          }
        });
        
        product.variants?.edges?.forEach(variant => {
          variant.node.selectedOptions?.forEach(option => {
            if (option.name.toLowerCase().includes('material')) {
              if (filters.materials.includes(option.value)) {
                productMaterials.push(option.value);
              }
            }
          });
        });

        if (productMaterials.length === 0) return false;
      }

      // Preis-Filter
      const productPrice = parseFloat(product.variants?.edges?.[0]?.node?.price?.amount || '0');
      if (productPrice < filters.priceRange[0] || productPrice > filters.priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  useEffect(() => {
    onFilteredProducts(filteredProducts);
  }, [filteredProducts, onFilteredProducts]);

  const removeFilter = (filterToRemove: ActiveFilter) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (filterToRemove.type) {
        case 'collection':
          newFilters.collections = newFilters.collections.filter(c => c !== filterToRemove.value);
          break;
        case 'tag':
          newFilters.tags = newFilters.tags.filter(t => t !== filterToRemove.value);
          break;
        case 'color':
          newFilters.colors = newFilters.colors.filter(color => color !== filterToRemove.value);
          break;
        case 'material':
          newFilters.materials = newFilters.materials.filter(m => m !== filterToRemove.value);
          break;
        case 'price':
          newFilters.priceRange = filterOptions.priceRange;
          break;
      }
      
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({
      collections: [],
      tags: [],
      priceRange: filterOptions.priceRange,
      colors: [],
      materials: []
    });
  };

  const toggleFilter = (type: keyof FilterCriteria, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      const currentValues = newFilters[type] as string[];
      
      if (currentValues.includes(value)) {
        (newFilters[type] as string[]) = currentValues.filter(v => v !== value);
      } else {
        (newFilters[type] as string[]) = [...currentValues, value];
      }
      
      return newFilters;
    });
  };

  // URL-Parameter für SEO
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.collections.length > 0) {
      params.set('kategorie', filters.collections.join(','));
    }
    if (filters.tags.length > 0) {
      params.set('tags', filters.tags.join(','));
    }
    if (filters.colors.length > 0) {
      params.set('farbe', filters.colors.join(','));
    }
    if (filters.materials.length > 0) {
      params.set('material', filters.materials.join(','));
    }
    if (filters.priceRange[0] !== filterOptions.priceRange[0] || filters.priceRange[1] !== filterOptions.priceRange[1]) {
      params.set('preis', `${filters.priceRange[0]}-${filters.priceRange[1]}`);
    }

    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    
    // Nur URL updaten wenn bereits initialisiert (verhindert Browser-Back-Bug)
    if (hasInitialized) {
      window.history.replaceState({}, '', newUrl);
    }
    
    // Nach erstem Update als initialisiert markieren
    if (!hasInitialized) {
      setHasInitialized(true);
    }
  }, [filters, filterOptions.priceRange, hasInitialized]);

  return (
    <div className={`bg-white border border-gray-200 shadow-sm rounded-lg ${className}`}>
      {/* Header mit Toggle für kompakte Version */}
      {compact && (
        <div className="p-4 border-b border-gray-100">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full justify-between text-gray-700 hover:text-black hover:bg-gray-50"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter ({activeFilters.length})
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      )}

      {/* Aktive Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Aktive Filter:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-red-600"
            >
              Alle entfernen
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200 hover:bg-blue-200 transition-colors"
              >
                <span>{filter.label}</span>
                <button
                  onClick={() => removeFilter(filter)}
                  className="ml-1 hover:bg-blue-300 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${filter.label} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Content */}
      {isOpen && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Kollektionen Filter */}
            {filterOptions.collections.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Grid className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Kategorien</h3>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filterOptions.collections.map(collection => (
                    <Button
                      key={collection}
                      variant={filters.collections.includes(collection) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter('collections', collection)}
                      className={`w-full justify-start text-left h-auto py-2 px-3 ${
                        filters.collections.includes(collection) 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {collection}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Filter */}
            {filterOptions.tags.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Tags</h3>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filterOptions.tags.slice(0, 8).map(tag => (
                    <Button
                      key={tag}
                      variant={filters.tags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter('tags', tag)}
                      className={`w-full justify-start text-left h-auto py-2 px-3 ${
                        filters.tags.includes(tag) 
                          ? 'bg-green-600 text-white hover:bg-green-700 border-green-600' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Farben Filter */}
            {filterOptions.colors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Farben</h3>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filterOptions.colors.map(color => (
                    <Button
                      key={color}
                      variant={filters.colors.includes(color) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter('colors', color)}
                      className={`w-full justify-start text-left h-auto py-2 px-3 ${
                        filters.colors.includes(color) 
                          ? 'bg-purple-600 text-white hover:bg-purple-700 border-purple-600' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Preis Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Preis</h3>
              </div>
              <div className="space-y-4">
                <div className="px-2">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                    max={filterOptions.priceRange[1]}
                    min={filterOptions.priceRange[0]}
                    step={10}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 px-2">
                  <span>{filters.priceRange[0]} CHF</span>
                  <span className="text-gray-400">bis</span>
                  <span>{filters.priceRange[1]} CHF</span>
                </div>
              </div>
            </div>

          </div>

          {/* Ergebnisse Anzeige */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{filteredProducts.length}</span> 
              {' '}von {products.length} Produkten werden angezeigt
            </p>
          </div>
        </div>
      )}
    </div>
  );
}