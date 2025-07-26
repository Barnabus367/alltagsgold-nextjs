import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, ShoppingBag } from 'lucide-react';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { Layout } from '@/components/layout/Layout';

// Dynamischer Import für Cart-Inhalt (client-side only)
const CartContent = dynamic(() => import('../components/cart/CartContent'), {
  ssr: false,
  loading: () => <CartSkeleton />
});

// Loading Skeleton für bessere UX
function CartSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-6 border rounded-lg">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hydration-sichere Error Boundary
function CartErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Warenkorb konnte nicht geladen werden
      </h2>
      <p className="text-gray-600 mb-4">
        Es gab ein Problem beim Laden Ihres Warenkorbs.
      </p>
      <button 
        onClick={retry}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Erneut versuchen
      </button>
    </div>
  );
}

function Cart() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Generate SEO metadata
  const seoData = {
    title: 'Warenkorb | AlltagsGold',
    description: 'Ihr Warenkorb bei alltagsgold. Überprüfen Sie Ihre Artikel und schließen Sie Ihre Bestellung sicher ab.',
    keywords: 'Warenkorb, Einkauf, AlltagsGold'
  };

  // Sichere Hydration
  useEffect(() => {
    try {
      setMounted(true);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const handleRetry = () => {
    setError(null);
    setMounted(false);
    setTimeout(() => setMounted(true), 100);
  };

  return (
    <Layout>
      <NextSEOHead 
        seo={seoData}
        canonicalUrl="cart" 
      />
      
      {error ? (
        <CartErrorFallback error={error} retry={handleRetry} />
      ) : mounted ? (
        <Suspense fallback={<CartSkeleton />}>
          <CartContent />
        </Suspense>
      ) : (
        <CartSkeleton />
      )}
    </Layout>
  );
}

export default Cart;
