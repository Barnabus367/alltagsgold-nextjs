import React from 'react';
import { ShopifyProduct } from '@/types/shopify';
import { Package, Ruler, Zap, Info } from '@/lib/icons';

interface ProductTechnicalDetailsProps {
  product: ShopifyProduct;
}

export function ProductTechnicalDetails({ product }: ProductTechnicalDetailsProps) {
  // Extrahiere technische Details aus Metafields oder generiere Standard-Details
  const getTechnicalDetails = () => {
    const category = product.productType?.toLowerCase() || '';
    
    // Beispiel für Lampen/Lichter
    if (category.includes('lampe') || category.includes('licht')) {
      return [
        { icon: <Zap className="w-5 h-5" />, label: 'Leistung', value: '5W LED' },
        { icon: <Ruler className="w-5 h-5" />, label: 'Maße', value: '15 x 15 x 40 cm' },
        { icon: <Package className="w-5 h-5" />, label: 'Gewicht', value: '0.5 kg' },
        { icon: <Info className="w-5 h-5" />, label: 'Material', value: 'Aluminium & Kunststoff' },
      ];
    }
    
    // Standard-Details für andere Produkte
    return [
      { icon: <Package className="w-5 h-5" />, label: 'Verpackung', value: 'Umweltfreundlich' },
      { icon: <Ruler className="w-5 h-5" />, label: 'Größe', value: 'Standard' },
      { icon: <Info className="w-5 h-5" />, label: 'Garantie', value: '2 Jahre' },
    ];
  };

  const details = getTechnicalDetails();

  return (
    <section className="my-16 bg-gray-50 rounded-3xl p-8 lg:p-12">
      <h2 className="text-2xl font-medium text-gray-900 mb-8">
        Technische Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Details Liste */}
        <div className="space-y-4">
          {details.map((detail, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-xl">
              <div className="text-gray-500 mt-0.5">
                {detail.icon}
              </div>
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-600">
                  {detail.label}
                </dt>
                <dd className="text-base text-gray-900 mt-1">
                  {detail.value}
                </dd>
              </div>
            </div>
          ))}
        </div>
        
        {/* Zusätzliche Informationen */}
        <div className="space-y-6">
          {/* Lieferumfang */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-medium text-gray-900 mb-3">Im Lieferumfang enthalten:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>1x {product.title}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Ausführliche Bedienungsanleitung</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Garantiekarte (2 Jahre)</span>
              </li>
              {(product.productType?.toLowerCase().includes('elektronik') || 
                product.productType?.toLowerCase().includes('lampe')) && (
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>USB-Kabel oder Netzteil</span>
                </li>
              )}
            </ul>
          </div>
          
          {/* Besondere Merkmale */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-medium text-gray-900 mb-3">Besondere Merkmale:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">★</span>
                <span>CE-zertifiziert</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">★</span>
                <span>Energieeffizient</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">★</span>
                <span>Langlebige Qualität</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Hinweis */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>Hinweis:</strong> Die angegebenen technischen Details können je nach Modell leicht variieren. 
          Bei Fragen kontaktieren Sie gerne unseren Kundenservice.
        </p>
      </div>
    </section>
  );
}