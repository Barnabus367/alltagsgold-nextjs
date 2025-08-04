import React from 'react';
import { ShopifyProduct } from '@/types/shopify';

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

interface ProductBenefitsProps {
  product?: ShopifyProduct;
}

export function ProductBenefits({ product }: ProductBenefitsProps) {
  // Standard-Benefits die für alle Produkte gelten
  const defaultBenefits: Benefit[] = [
    {
      icon: '🚚',
      title: 'Schnelle Lieferung',
      description: 'Versand innerhalb 24h aus unserem Schweizer Lager'
    },
    {
      icon: '✓',
      title: 'Geprüfte Qualität',
      description: 'Sorgfältig ausgewählte Produkte für Ihren Alltag'
    },
    {
      icon: '♻️',
      title: '30 Tage Rückgaberecht',
      description: 'Kostenlose Rücksendung bei Nichtgefallen'
    }
  ];

  // Produktspezifische Benefits (können später aus Produktdaten kommen)
  const getProductSpecificBenefits = (): Benefit[] => {
    if (!product) return defaultBenefits;
    
    // Hier können wir später produktspezifische Benefits basierend auf Tags/Kategorien generieren
    const category = product.productType?.toLowerCase() || '';
    
    if (category.includes('lampe') || category.includes('licht')) {
      return [
        {
          icon: '💡',
          title: 'Energieeffizient',
          description: 'LED-Technologie für niedrigen Stromverbrauch'
        },
        {
          icon: '🎨',
          title: 'Vielseitig einstellbar',
          description: 'Mehrere Helligkeitsstufen und Farbtemperaturen'
        },
        {
          icon: '🏠',
          title: 'Perfekt für jeden Raum',
          description: 'Elegantes Design passt zu jedem Einrichtungsstil'
        }
      ];
    }
    
    return defaultBenefits;
  };

  const benefits = getProductSpecificBenefits();

  return (
    <section className="py-16 border-y border-gray-100">
      <h2 className="text-2xl font-light text-center mb-12 text-gray-900">
        Produktvorteile auf einen Blick
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {benefits.map((benefit, index) => (
          <div 
            key={index} 
            className="text-center space-y-4 group hover:scale-105 transition-transform duration-300"
          >
            {/* Icon Circle */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors duration-300">
              <span className="text-3xl" role="img" aria-label={benefit.title}>
                {benefit.icon}
              </span>
            </div>
            
            {/* Title */}
            <h3 className="font-medium text-lg text-gray-900">
              {benefit.title}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}