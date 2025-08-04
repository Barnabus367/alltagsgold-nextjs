import React from 'react';
import Link from 'next/link';
import { ShopifyProduct } from '@/types/shopify';
import { ProductCard } from '@/components/product/ProductCard';
import { ArrowRight } from '@/lib/icons';

interface RelatedProductsProps {
  category: string;
  products: ShopifyProduct[];
  maxProducts?: number;
}

export function RelatedProducts({ category, products, maxProducts = 4 }: RelatedProductsProps) {
  // Ensure products is an array
  if (!Array.isArray(products) || products.length === 0) {
    return null;
  }

  // Map blog categories to product collections
  const categoryMapping: Record<string, string[]> = {
    'Küche & Kochen': ['kuchenhelfer-gadgets', 'haushaltsgerate'],
    'Haushalt & Reinigung': ['reinigungsgerate', 'haushaltsgerate'],
    'Beauty & Wellness': ['selfcare-beauty', 'wellness-entspannung'],
    'Technologie & Innovation': ['technik-gadgets', 'led-produkte'],
    'Wohnen & Einrichten': ['dekoration', 'beleuchtung-lampen'],
    'Organisation & Aufbewahrung': ['aufbewahrung-organisation'],
    'Outdoor & Garten': ['bbq-grill'],
  };

  const relevantCollections = categoryMapping[category] || [];
  
  // Filter products by relevant collections
  const relatedProducts = products.filter(product => {
    const productCollections = product.collections?.edges?.map(e => e.node.handle) || [];
    return productCollections.some(handle => relevantCollections.includes(handle));
  }).slice(0, maxProducts);

  if (relatedProducts.length === 0) return null;

  return (
    <section className="my-12 py-8 bg-gray-50 rounded-lg">
      <div className="px-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-medium text-gray-900">
            Passende Produkte zum Thema
          </h3>
          <Link 
            href="/collections"
            className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors"
          >
            Alle Produkte
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relatedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}