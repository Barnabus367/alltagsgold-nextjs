/**
 * Navigation Handler - beforePopState Implementation
 * Löst das SSG/ISR Browser-History-Problem mit minimaler Intervention
 */

import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

interface NavigationState {
  from: string;
  to: string;
  timestamp: number;
}

export function useNavigationHandler() {
  const router = useRouter();
  const navigationHistory = useRef<NavigationState[]>([]);
  const isHandlingPopState = useRef(false);

  useEffect(() => {
    // Track navigation history for back-button detection
    const handleRouteChangeComplete = (url: string) => {
      if (!isHandlingPopState.current) {
        navigationHistory.current.push({
          from: router.asPath,
          to: url,
          timestamp: Date.now()
        });
        
        // Keep only last 3 navigations to detect patterns
        if (navigationHistory.current.length > 3) {
          navigationHistory.current.shift();
        }
      }
    };

    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    // beforePopState - Der Schlüssel zur Lösung
    router.beforePopState((state) => {
      const currentPath = router.asPath;
      const targetPath = state.url;
      
      console.log('🔙 beforePopState triggered:', {
        currentPath,
        targetPath,
        state
      });

      // Detect problematic Product → Collection back navigation
      const isProductToCollectionBack = 
        currentPath.includes('/products/') && 
        targetPath.includes('/collections/');
        
      if (isProductToCollectionBack) {
        console.log('🚨 Product→Collection Back-Navigation detected - Intercepting');
        
        // Set flag to prevent navigation history tracking
        isHandlingPopState.current = true;
        
        // Force client-side navigation instead of browser history
        router.push(targetPath).then(() => {
          console.log('✅ Forced client-side navigation completed');
          isHandlingPopState.current = false;
        });
        
        // Prevent default browser back behavior
        return false;
      }

      // For other navigations, allow default behavior
      return true;
    });

    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);

  // Utility function to reset component state on problematic navigations
  const resetComponentState = () => {
    // This can be called by components that need state reset
    console.log('🔄 Component state reset triggered');
  };

  return {
    resetComponentState,
    navigationHistory: navigationHistory.current
  };
}

// Hook für Collection-Pages um State zu resetten
export function useCollectionNavigationReset() {
  const router = useRouter();
  
  useEffect(() => {
    const handleRouteChangeStart = () => {
      // Reset scroll position when navigating to collections via back button
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 0);
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router]);
}

// Hook für Product-Pages um sauberen State zu gewährleisten
export function useProductNavigationCleanup() {
  const router = useRouter();
  
  useEffect(() => {
    // Cleanup when leaving product page
    return () => {
      console.log('🧹 Product page cleanup on navigation');
    };
  }, [router.asPath]);
}
