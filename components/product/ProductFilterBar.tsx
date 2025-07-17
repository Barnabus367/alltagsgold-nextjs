import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, X, Filter, SlidersHorizontal, Tag, Palette, Package } from 'lucide-react';
import { ShopifyProduct } from '../../types/shopify';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

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

interface ProductFilterBarProps {
  products: ShopifyProduct[];
  onFilteredProducts: (filteredProducts: ShopifyProduct[]) => void;
  className?: string;
  compact?: boolean;
}

export function ProductFilterBar({ 
  products, 
  onFilteredProducts, 
  className = '',
  compact = false 
}: ProductFilterBarProps) {
  const [isOpen, setIsOpen] = useState(!compact);
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
      if (product.collections?.edges) {
        product.collections.edges.forEach(edge => {
          collections.add(edge.node.title);
        });
      }

      // Tags
      if (product.tags) {
        product.tags.forEach(tag => tags.add(tag));
      }

      // Preise
      if (product.variants?.edges?.[0]?.node?.price?.amount) {
        const price = parseFloat(product.variants.edges[0].node.price.amount);
        minPrice = Math.min(minPrice, price);
        maxPrice = Math.max(maxPrice, price);
      }

      // Farben und Materialien aus Tags extrahieren
      if (product.tags) {
        product.tags.forEach(tag => {
          const lowerTag = tag.toLowerCase();
          if (lowerTag.includes('farbe') || lowerTag.includes('color') || 
              ['rot', 'blau', 'grün', 'gelb', 'schwarz', 'weiß', 'braun', 'grau', 'silber', 'gold'].some(color => lowerTag.includes(color))) {
            colors.add(tag);
          }
          if (lowerTag.includes('material') || lowerTag.includes('stoff') ||
              ['baumwolle', 'seide', 'wolle', 'leder', 'metall', 'holz', 'kunststoff', 'glas'].some(material => lowerTag.includes(material))) {
            materials.add(tag);
          }
        });
      }

      // Farben und Materialien aus Varianten-Optionen
      if (product.variants?.edges) {
        product.variants.edges.forEach(variant => {
          variant.node.selectedOptions?.forEach(option => {
            const optionName = option.name.toLowerCase();
            const optionValue = option.value;
            
            if (optionName.includes('farbe') || optionName.includes('color')) {
              colors.add(optionValue);
            }
            if (optionName.includes('material')) {
              materials.add(optionValue);
            }
          });
        });
      }
    });

    return {
      collections: Array.from(collections).sort(),
      tags: Array.from(tags).filter(tag => 
        !tag.toLowerCase().includes('farbe') && 
        !tag.toLowerCase().includes('material') &&
        !tag.toLowerCase().includes('color')
      ).sort(),
      colors: Array.from(colors).sort(),
      materials: Array.from(materials).sort(),
      priceRange: [Math.floor(minPrice || 0), Math.ceil(maxPrice || 1000)] as [number, number]
    };
  }, [products]);

  // Initialisiere Preis-Range basierend auf verfügbaren Produkten
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: filterOptions.priceRange
    }));
  }, [filterOptions.priceRange]);

  // Filtere Produkte basierend auf aktuellen Kriterien
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Kollektions-Filter
      if (filters.collections.length > 0) {
        const productCollections = product.collections?.edges?.map(edge => edge.node.title) || [];
        if (!filters.collections.some(collection => productCollections.includes(collection))) {
          return false;
        }
      }

      // Tags-Filter
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
        
        // Aus Tags
        productTags.forEach(tag => {
          if (filters.colors.includes(tag)) {
            productColors.push(tag);
          }
        });
        
        // Aus Varianten
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

  // Informiere Parent-Komponente über gefilterte Produkte
  useEffect(() => {
    onFilteredProducts(filteredProducts);
  }, [filteredProducts, onFilteredProducts]);

  // URL-Parameter für SEO/Shareability
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
    window.history.replaceState({}, '', newUrl);
  }, [filters, filterOptions.priceRange]);

  // Lade Filter aus URL beim Initialisieren
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const newFilters = { ...filters };
    
    if (params.get('kategorie')) {
      newFilters.collections = params.get('kategorie')!.split(',');
    }
    if (params.get('tags')) {
      newFilters.tags = params.get('tags')!.split(',');
    }
    if (params.get('farbe')) {
      newFilters.colors = params.get('farbe')!.split(',');
    }
    if (params.get('material')) {
      newFilters.materials = params.get('material')!.split(',');
    }
    if (params.get('preis')) {
      const [min, max] = params.get('preis')!.split('-').map(Number);
      newFilters.priceRange = [min, max];
    }
    
    setFilters(newFilters);
  }, []);

  // Aktive Filter für Chip-Anzeige
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
        label: `CHF ${filters.priceRange[0]} - CHF ${filters.priceRange[1]}` 
      });
    }
    
    return active;
  }, [filters, filterOptions.priceRange]);

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
          newFilters.colors = newFilters.colors.filter(c => c !== filterToRemove.value);
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
      const currentArray = newFilters[type] as string[];
      
      if (currentArray.includes(value)) {
        (newFilters[type] as string[]) = currentArray.filter(item => item !== value);
      } else {
        (newFilters[type] as string[]) = [...currentArray, value];
      }
      
      return newFilters;
    });
  };

  return (
    <div className={`product-filter-bar bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Filter Toggle Button (für Compact-Modus) */}
      {compact && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between p-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter ({filteredProducts.length} Produkte)</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 border-t">
              <FilterContent 
                filterOptions={filterOptions}
                filters={filters}
                setFilters={setFilters}
                toggleFilter={toggleFilter}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Normale Filter-Anzeige */}
      {!compact && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="font-medium">Filter</span>
            <span className="text-sm text-gray-500">({filteredProducts.length} Produkte)</span>
          </div>
          <FilterContent 
            filterOptions={filterOptions}
            filters={filters}
            setFilters={setFilters}
            toggleFilter={toggleFilter}
          />
        </div>
      )}

      {/* Aktive Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="border-t p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Aktive Filter:</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs"
            >
              Alle entfernen
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <div 
                key={`${filter.type}-${index}`}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
              >
                <span>{filter.label}</span>
                <button 
                  onClick={() => removeFilter(filter)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterContent({ 
  filterOptions, 
  filters, 
  setFilters, 
  toggleFilter 
}: {
  filterOptions: any;
  filters: FilterCriteria;
  setFilters: React.Dispatch<React.SetStateAction<FilterCriteria>>;
  toggleFilter: (type: keyof FilterCriteria, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Kollektionen */}
      {filterOptions.collections.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Kategorie</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {filterOptions.collections.map((collection: string) => (
              <div key={collection} className="flex items-center space-x-2">
                <Checkbox 
                  id={`collection-${collection}`}
                  checked={filters.collections.includes(collection)}
                  onCheckedChange={() => toggleFilter('collections', collection)}
                />
                <Label htmlFor={`collection-${collection}`} className="text-sm cursor-pointer">
                  {collection}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {filterOptions.tags.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Tags</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {filterOptions.tags.slice(0, 10).map((tag: string) => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox 
                  id={`tag-${tag}`}
                  checked={filters.tags.includes(tag)}
                  onCheckedChange={() => toggleFilter('tags', tag)}
                />
                <Label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                  {tag}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Farben */}
      {filterOptions.colors.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Farbe</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {filterOptions.colors.map((color: string) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox 
                  id={`color-${color}`}
                  checked={filters.colors.includes(color)}
                  onCheckedChange={() => toggleFilter('colors', color)}
                />
                <Label htmlFor={`color-${color}`} className="text-sm cursor-pointer">
                  {color}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Materialien */}
      {filterOptions.materials.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Material</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {filterOptions.materials.map((material: string) => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox 
                  id={`material-${material}`}
                  checked={filters.materials.includes(material)}
                  onCheckedChange={() => toggleFilter('materials', material)}
                />
                <Label htmlFor={`material-${material}`} className="text-sm cursor-pointer">
                  {material}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preis-Range */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Preis: CHF {filters.priceRange[0]} - CHF {filters.priceRange[1]}
        </Label>
        <Slider
          min={filterOptions.priceRange[0]}
          max={filterOptions.priceRange[1]}
          step={10}
          value={filters.priceRange}
          onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>CHF {filterOptions.priceRange[0]}</span>
          <span>CHF {filterOptions.priceRange[1]}</span>
        </div>
      </div>
    </div>
  );
}