import React, { useEffect, useState } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { ShopifyProduct } from '@/types/shopify';
import { getProductRecommendations, getCollectionProducts } from '@/lib/shopify';
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
        // Versuche zuerst Shopify Recommendations
        let products: ShopifyProduct[] = [];
        
        // Wenn das Produkt einer Collection angehört, hole Produkte aus derselben Collection
        if (currentProduct.collections?.edges && currentProduct.collections.edges.length > 0) {
          const collectionHandle = currentProduct.collections.edges[0].node.handle;
          const collectionProducts = await getCollectionProducts(collectionHandle, 8);
          
          // Filtere das aktuelle Produkt aus
          products = collectionProducts.filter(p => p.id !== currentProduct.id);
        }
        
        // Fallback: Hole zufällige Produkte
        if (products.length === 0) {
          // Hier könntest du eine getAllProducts Funktion implementieren
          products = [];
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
        <a 
          href="/products" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          Alle Produkte entdecken
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}