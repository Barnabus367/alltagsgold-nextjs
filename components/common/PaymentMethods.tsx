import { CreditCard } from '@/lib/icons';

export function PaymentMethods() {
  // Verwende Text statt Bilder für ein saubereres Design
  const methods = ['Visa', 'Mastercard', 'PayPal', 'Twint', 'PostFinance', 'Klarna'];

  return (
    <div className="flex flex-col items-center space-y-3 py-6 border-t border-gray-100">
      <div className="flex items-center space-x-2 text-gray-400">
        <CreditCard className="w-4 h-4" strokeWidth={1.5} />
        <span className="text-xs font-light tracking-wide">Sichere Zahlungsmethoden</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
        {methods.map((method, index) => (
          <span key={method} className="flex items-center">
            {method}
            {index < methods.length - 1 && <span className="ml-4 text-gray-300">·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}