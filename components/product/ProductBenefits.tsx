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
  // Parse Benefits aus Shopify Tags
  const parseProductBenefits = (): Benefit[] => {
    if (!product?.tags || product.tags.length === 0) {
      // Fallback wenn keine Tags vorhanden
      return [
        {
          icon: '📦',
          title: 'Produkteigenschaften',
          description: 'Weitere Details finden Sie in der Produktbeschreibung'
        }
      ];
    }
    
    // Benefit-Tags erkennen (z.B. "benefit:Energiesparend", "feature:LED", etc.)
    const benefitTags = product.tags.filter(tag => 
      tag.toLowerCase().includes('benefit:') || 
      tag.toLowerCase().includes('feature:') ||
      tag.toLowerCase().includes('vorteil:')
    );
    
    // Icon-Mapping für häufige Begriffe
    const iconMap: Record<string, string> = {
      'energie': '⚡',
      'led': '💡',
      'usb': '🔌',
      'batterie': '🔋',
      'akku': '🔋',
      'wasserdicht': '💧',
      'outdoor': '🏕️',
      'einstellbar': '🎛️',
      'timer': '⏰',
      'fernbedienung': '📱',
      'smart': '📱',
      'leise': '🔇',
      'kompakt': '📏',
      'faltbar': '📐',
      'robust': '💪',
      'premium': '⭐',
      'garantie': '🛡️',
      'umweltfreundlich': '🌱',
      'recycling': '♻️',
      'sicher': '🔒',
      'kinder': '👶',
      'einfach': '👍'
    };
    
    const getIcon = (text: string): string => {
      const lowerText = text.toLowerCase();
      for (const [key, icon] of Object.entries(iconMap)) {
        if (lowerText.includes(key)) return icon;
      }
      return '✓'; // Standard-Icon
    };
    
    // Wenn spezifische Benefit-Tags vorhanden sind
    if (benefitTags.length > 0) {
      return benefitTags.slice(0, 3).map(tag => {
        const [prefix, ...valueParts] = tag.split(':');
        const value = valueParts.join(':').trim();
        
        return {
          icon: getIcon(value),
          title: value,
          description: '' // Beschreibung könnte aus weiteren Tags kommen
        };
      });
    }
    
    // Alternativ: Alle Tags als Benefits interpretieren (max. 3)
    const relevantTags = product.tags
      .filter(tag => 
        !tag.toLowerCase().includes('hidden') &&
        !tag.toLowerCase().includes('collection') &&
        tag.length > 2
      )
      .slice(0, 3);
    
    if (relevantTags.length === 0) {
      // Absolute Fallback basierend auf Produkttyp
      return [{
        icon: '📦',
        title: product.productType || 'Qualitätsprodukt',
        description: 'Sorgfältig ausgewählt für Ihren Alltag'
      }];
    }
    
    return relevantTags.map(tag => ({
      icon: getIcon(tag),
      title: tag.charAt(0).toUpperCase() + tag.slice(1),
      description: ''
    }));
  };

  const benefits = parseProductBenefits();
  
  // Fülle auf 3 Benefits auf wenn weniger vorhanden
  while (benefits.length < 3) {
    benefits.push({
      icon: '✓',
      title: benefits.length === 1 ? 'Schweizer Qualität' : 'Premium Service',
      description: benefits.length === 1 
        ? 'Direkt aus unserem Lager' 
        : 'Kundenservice auf Deutsch'
    });
  }

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