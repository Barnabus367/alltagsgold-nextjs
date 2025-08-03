import { Package, Star, MapPin, Shield } from '@/lib/icons';

export function USPSection() {
  const usps = [
    {
      icon: MapPin,
      title: 'Schweizer Lager',
      description: 'Alle Produkte direkt ab Lager Schweiz'
    },
    {
      icon: Package,
      title: 'Schneller Versand',
      description: 'Bestellung heute = Versand morgen'
    },
    {
      icon: Star,
      title: 'Premium Qualität',
      description: 'Sorgfältig ausgewählte Produkte'
    },
    {
      icon: Shield,
      title: 'Sicher einkaufen',
      description: '100% SSL-verschlüsselt'
    }
  ];

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {usps.map((usp, index) => (
            <div 
              key={index} 
              className="text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 mb-4 group-hover:shadow-lg transition-shadow">
                <usp.icon className="w-7 h-7 text-amber-700" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{usp.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{usp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}