import { Shield, Camera, Package, CheckCircle } from '@/lib/icons';

interface AuthenticityBadgeProps {
  variant?: 'compact' | 'detailed';
  showPhotoBadge?: boolean;
  showStockBadge?: boolean;
}

export function AuthenticityBadge({ 
  variant = 'compact',
  showPhotoBadge = true,
  showStockBadge = true 
}: AuthenticityBadgeProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 text-sm">
        {showPhotoBadge && (
          <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
            <Camera className="w-3.5 h-3.5" />
            <span className="font-medium">Eigene Fotos</span>
          </div>
        )}
        {showStockBadge && (
          <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
            <Package className="w-3.5 h-3.5" />
            <span className="font-medium">Auf Lager</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            AlltagsGold Qualitätsversprechen
            <CheckCircle className="w-4 h-4 text-green-600" />
          </h4>
          <ul className="space-y-1.5 text-sm text-gray-700">
            {showPhotoBadge && (
              <li className="flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-amber-600" />
                <span>Eigene Produktfotos aus unserem Schweizer Lager</span>
              </li>
            )}
            {showStockBadge && (
              <li className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-amber-600" />
                <span>Physisch auf Lager - kein Dropshipping</span>
              </li>
            )}
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Von uns getestet und für gut befunden</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}