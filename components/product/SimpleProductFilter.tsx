import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, X, Filter } from '@/lib/icons';
import { ShopifyProduct } from '@/types/shopify';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getPriceAmountSafe } from '@/lib/type-guards';

interface SimpleFilterCriteria {
  collections: string[];
  priceRange: [number, number];
}

interface SimpleProductFilterProps {
  products: ShopifyProduct[];
  onFilteredProducts: (filteredProducts: ShopifyProduct[]) => void;
}

export function SimpleProductFilter({ products, onFilteredProducts }: SimpleProductFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SimpleFilterCriteria>({
    collections: [],
    priceRange: [0, 500]
  });

  // Extract available filter options
  const filterOptions = useMemo(() => {
    const collections = new Map<string, { handle: string; title: string; count: number }>();
    let minPrice = Infinity;
    let maxPrice = 0;

    products.forEach(product => {
      // Collections
      product.collections?.edges?.forEach((edge: any) => {
        const handle = edge.node.handle;
        const title = edge.node.title;
        const existing = collections.get(handle);
        if (existing) {
          existing.count++;
        } else {
          collections.set(handle, { handle, title, count: 1 });
        }
      });

      // Price range
      const price = getPriceAmountSafe(product.priceRange?.minVariantPrice);
      if (price < minPrice) minPrice = price;
      if (price > maxPrice) maxPrice = price;
    });

    return {
      collections: Array.from(collections.values()).sort((a, b) => b.count - a.count),
      priceRange: { min: Math.floor(minPrice), max: Math.ceil(maxPrice) }
    };
  }, [products]);

  // Initialize price range
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: [filterOptions.priceRange.min, filterOptions.priceRange.max]
    }));
  }, [filterOptions.priceRange.min, filterOptions.priceRange.max]);

  // Apply filters
  useEffect(() => {
    const filtered = products.filter(product => {
      // Collection filter
      if (filters.collections.length > 0) {
        const productCollections = product.collections?.edges?.map((e: any) => e.node.handle) || [];
        if (!filters.collections.some(c => productCollections.includes(c))) {
          return false;
        }
      }

      // Price filter
      const price = getPriceAmountSafe(product.priceRange?.minVariantPrice);
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      return true;
    });

    onFilteredProducts(filtered);
  }, [filters, products, onFilteredProducts]);

  const activeFilterCount = filters.collections.length + 
    (filters.priceRange[0] !== filterOptions.priceRange.min || filters.priceRange[1] !== filterOptions.priceRange.max ? 1 : 0);

  const resetFilters = () => {
    setFilters({
      collections: [],
      priceRange: [filterOptions.priceRange.min, filterOptions.priceRange.max]
    });
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        Filter
        {activeFilterCount > 0 && (
          <span className="bg-amber-500 text-white text-xs rounded-full px-2 py-0.5">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-6 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Filter</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preis</h4>
            <div className="px-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                min={filterOptions.priceRange.min}
                max={filterOptions.priceRange.max}
                step={10}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>CHF {filters.priceRange[0]}</span>
                <span>CHF {filters.priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Collections */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Kategorien</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.collections.map(collection => (
                <label key={collection.handle} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.collections.includes(collection.handle)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({ ...prev, collections: [...prev.collections, collection.handle] }));
                      } else {
                        setFilters(prev => ({ ...prev, collections: prev.collections.filter(c => c !== collection.handle) }));
                      }
                    }}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">{collection.title}</span>
                  <span className="text-xs text-gray-500">({collection.count})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="flex-1"
              disabled={activeFilterCount === 0}
            >
              Zurücksetzen
            </Button>
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            >
              Anwenden
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}