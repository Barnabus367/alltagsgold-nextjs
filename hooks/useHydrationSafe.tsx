/**
 * Hydration Safety Hook
 * Prevents hydration mismatches in SSG/ISR pages
 */

import { useState, useEffect } from 'react';

export function useHydrationSafe() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated on client-side
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * SSR-Safe Component Wrapper
 * Only renders children after hydration is complete
 */
interface SSRSafeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SSRSafe({ children, fallback }: SSRSafeProps) {
  const isHydrated = useHydrationSafe();

  if (!isHydrated) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600 font-light">Wird geladen...</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

/**
 * Client-Only Component
 * Only renders on client-side to prevent hydration issues
 */
interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
