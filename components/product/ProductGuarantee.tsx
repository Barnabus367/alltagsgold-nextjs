import React from 'react';
import { Shield, RefreshCw, Phone, Truck } from '@/lib/icons';

export function ProductGuarantee() {
  const guarantees = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: '2 Jahre Garantie',
      description: 'Auf alle Produkte gewähren wir eine 2-jährige Garantie ab Kaufdatum.',
      highlight: '2',
      unit: 'Jahre'
    },
    {
      icon: <RefreshCw className="w-12 h-12" />,
      title: '30 Tage Rückgaberecht',
      description: 'Nicht zufrieden? Kein Problem! 30 Tage kostenlose Rücksendung.',
      highlight: '30',
      unit: 'Tage'
    }
  ];

  const supportFeatures = [
    {
      icon: <Phone className="w-6 h-6" />,
      text: 'Schweizer Kundenservice'
    },
    {
      icon: <Truck className="w-6 h-6" />,
      text: 'Kostenloser Versand ab CHF 60'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      text: 'Sichere SSL-Verschlüsselung'
    }
  ];

  return (
    <section className="my-20">
      {/* Hauptgarantien */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {guarantees.map((guarantee, index) => (
          <div 
            key={index}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 text-center hover:shadow-xl transition-shadow duration-300"
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg mb-6 text-gray-700">
              {guarantee.icon}
            </div>
            
            {/* Große Zahl */}
            <div className="mb-4">
              <span className="text-6xl font-light text-gray-900">{guarantee.highlight}</span>
              <span className="text-2xl font-light text-gray-600 ml-2">{guarantee.unit}</span>
            </div>
            
            {/* Titel */}
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              {guarantee.title}
            </h3>
            
            {/* Beschreibung */}
            <p className="text-gray-600 max-w-xs mx-auto">
              {guarantee.description}
            </p>
          </div>
        ))}
      </div>
      
      {/* Support Features */}
      <div className="bg-gray-900 text-white rounded-3xl p-8 lg:p-12">
        <h3 className="text-2xl font-light text-center mb-8">
          Unser Versprechen an Sie
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-4 justify-center">
              <div className="text-gray-400">
                {feature.icon}
              </div>
              <span className="text-lg">{feature.text}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 max-w-2xl mx-auto">
            Bei AlltagsGold steht Ihre Zufriedenheit an erster Stelle. 
            Wir sind stolz darauf, Ihnen nicht nur hochwertige Produkte, 
            sondern auch erstklassigen Service zu bieten.
          </p>
        </div>
      </div>
    </section>
  );
}