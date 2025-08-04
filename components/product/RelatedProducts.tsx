import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { ShopifyProduct } from '@/types/shopify';
import { getCollectionByHandle, getProducts } from '@/lib/shopify';
import { ChevronLeft, ChevronRight } from '@/lib/icons';

interface RelatedProductsProps {
  currentProduct: ShopifyProduct;
}

export function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        let products: ShopifyProduct[] = [];
        
        // Wenn das Produkt einer Collection angehört, hole die Collection
        if (currentProduct.collections?.edges && currentProduct.collections.edges.length > 0) {
          const collectionHandle = currentProduct.collections.edges[0].node.handle;
          const collection = await getCollectionByHandle(collectionHandle);
          
          if (collection?.products?.edges) {
            // Extrahiere Produkte aus der Collection
            products = collection.products.edges
              .map(edge => edge.node)
              .filter((p: ShopifyProduct) => p.id !== currentProduct.id);
          }
        }
        
        // Fallback: Hole alle Produkte
        if (products.length === 0) {
          const allProductsData = await getProducts(12);
          if (allProductsData?.products) {
            products = allProductsData.products
              .filter((p: ShopifyProduct) => p.id !== currentProduct.id)
              .slice(0, 4);
          }
        }
        
        setRelatedProducts(products.slice(0, 4));
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRelatedProducts();
  }, [currentProduct]);
  
  if (loading) {
    return (
      <section className="my-20">
        <h2 className="text-2xl font-light text-gray-900 mb-8">Ähnliche Produkte</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-96 animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }
  
  if (relatedProducts.length === 0) {
    return null;
  }
  
  return (
    <section className="my-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-light text-gray-900">
          Ähnliche Produkte
        </h2>
        
        {/* Optional: Navigation buttons for carousel */}
        <div className="flex gap-2">
          <button 
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Vorherige Produkte"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Nächste Produkte"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Call to Action */}
      <div className="text-center mt-12">
        <Link 
          href="/products" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          Alle Produkte entdecken
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}