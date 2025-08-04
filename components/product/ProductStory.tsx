import React from 'react';
import { PremiumImage } from '@/components/common/PremiumImage';
import { ShopifyProduct } from '@/types/shopify';

interface ProductStoryProps {
  product: ShopifyProduct;
}

export function ProductStory({ product }: ProductStoryProps) {
  // Story-Content basierend auf Produktkategorie generieren
  const getProductStory = () => {
    const category = product.productType?.toLowerCase() || '';
    
    if (category.includes('lampe') || category.includes('licht')) {
      return {
        title: 'Elegantes Design für jeden Raum',
        content: `Diese sorgfältig ausgewählte Lampe vereint modernes Design mit praktischer Funktionalität. 
                 Mit ihrem zeitlosen Look fügt sie sich harmonisch in jede Einrichtung ein und schafft eine 
                 angenehme Atmosphäre in Ihrem Zuhause. Die hochwertige Verarbeitung garantiert langlebige 
                 Freude an Ihrem neuen Begleiter.`
      };
    }
    
    // Standard-Story für andere Produkte
    return {
      title: 'Durchdacht bis ins Detail',
      content: `Jedes unserer Produkte wird sorgfältig ausgewählt, um Ihren Alltag zu bereichern. 
               Wir achten auf Qualität, Funktionalität und Design - damit Sie lange Freude an Ihrem 
               Einkauf haben. Entdecken Sie, wie dieses Produkt Ihr Leben einfacher und schöner macht.`
    };
  };

  const story = getProductStory();
  const secondaryImage = product.images.edges[1]?.node || product.images.edges[0]?.node;

  return (
    <section className="my-20">
      <div className="bg-[#F5F0E8] rounded-3xl p-8 lg:p-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Links */}
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900">
              {story.title}
            </h2>
            <div className="space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                {story.content}
              </p>
              
              {/* Vollständige Produktbeschreibung wenn vorhanden */}
              {product.description && (
                <div className="prose prose-gray max-w-none pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-2">Produktdetails</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
            
            {/* Feature List */}
            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3">
                <span className="text-[#D4A574] mt-1">✓</span>
                <span className="text-gray-700">Hochwertige Materialien für lange Haltbarkeit</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D4A574] mt-1">✓</span>
                <span className="text-gray-700">Zeitloses Design passt zu jedem Einrichtungsstil</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D4A574] mt-1">✓</span>
                <span className="text-gray-700">Einfache Handhabung im Alltag</span>
              </div>
            </div>
          </div>
          
          {/* Bild Rechts */}
          <div className="relative">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <PremiumImage
                src={secondaryImage?.url || ''}
                alt={`${product.title} - Detailansicht`}
                className="w-full h-full object-contain"
                productTitle={product.title}
                context="detail"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#D4A574] rounded-full opacity-20 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}