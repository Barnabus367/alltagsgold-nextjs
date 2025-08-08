import React from 'react';
import { ShopifyProduct } from '@/types/shopify';

interface ProductDescriptionProps {
  product: ShopifyProduct;
}

export function ProductDescription({ product }: ProductDescriptionProps) {
  if (!product.description || product.description.trim() === '') {
    return null;
  }

  // Parse HTML description safely
  const createMarkup = () => {
    return { __html: product.description };
  };

  return (
    <section className="my-12">
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <h2 className="text-2xl font-bold mb-6">Produktbeschreibung</h2>
        
        {/* Shopify description with proper formatting */}
        <div 
          className="prose prose-gray max-w-none
                     prose-headings:font-semibold prose-headings:text-gray-900
                     prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                     prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4
                     prose-ul:my-4 prose-ul:space-y-2
                     prose-li:text-gray-600 prose-li:ml-4
                     prose-strong:text-gray-900 prose-strong:font-semibold"
          dangerouslySetInnerHTML={createMarkup()}
        />
      </div>
    </section>
  );
}