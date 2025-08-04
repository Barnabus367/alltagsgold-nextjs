import { Truck, Shield, RefreshCw, Clock } from '@/lib/icons';

export function TrustBanner() {
  const trustPoints = [
    {
      icon: Truck,
      title: 'Versandkostenfrei',
      subtitle: 'ab CHF 49'
    },
    {
      icon: Clock,
      title: 'Schnelle Lieferung',
      subtitle: '1-3 Werktage'
    },
    {
      icon: RefreshCw,
      title: '30 Tage',
      subtitle: 'Rückgaberecht'
    },
    {
      icon: Shield,
      title: 'Sicher einkaufen',
      subtitle: 'SSL-verschlüsselt'
    }
  ];

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-3">
          {trustPoints.map((point, index) => (
            <div key={index} className="flex items-center justify-center space-x-2 group">
              <div className="p-1.5 rounded-full bg-white shadow-sm group-hover:shadow-md transition-shadow">
                <point.icon className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-gray-900 leading-tight">{point.title}</p>
                <p className="text-xs text-gray-500">{point.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}