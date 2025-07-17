import React, { useState } from 'react';
import { ProductFilterBar } from './ProductFilterBar';
import { ProductCard } from './ProductCard';
import { ShopifyProduct } from '../../types/shopify';

interface ProductFilterBarExampleProps {
  products: ShopifyProduct[];
}

export function ProductFilterBarExample({ products }: ProductFilterBarExampleProps) {
  const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>(products);

  return (
    <div className="space-y-6">
      {/* Eigenständige ProductFilterBar - kann überall eingebunden werden */}
      <ProductFilterBar 
        products={products}
        onFilteredProducts={setFilteredProducts}
        compact={false}
        className="shadow-sm"
      />
      
      {/* Produktgrid zeigt gefilterte Ergebnisse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Keine Produkte entsprechen den gewählten Filtern.</p>
        </div>
      )}
    </div>
  );
}

// Alternative: Kompakte Version für bestehende Layouts
export function CompactProductFilterBar({ products, onFilteredProducts }: {
  products: ShopifyProduct[];
  onFilteredProducts: (products: ShopifyProduct[]) => void;
}) {
  return (
    <ProductFilterBar 
      products={products}
      onFilteredProducts={onFilteredProducts}
      compact={true}
      className="bg-white border rounded-lg shadow-sm"
    />
  );
}