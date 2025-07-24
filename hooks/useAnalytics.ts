/**
 * ANALYTICS HOOKS
 * React Hooks für einfaches Analytics Tracking
 */

import { useEffect, useRef, useState } from 'react';
import { 
  trackUserEngagement, 
  trackCollectionBrowse, 
  trackExitIntent,
  trackFilterUsage,
  trackZeroResultsSearch
} from '../lib/analytics';

/**
 * Hook für automatisches User Engagement Tracking
 */
export function useEngagementTracking(pageType: 'product' | 'collection' | 'home' | 'other') {
  const startTime = useRef(Date.now());
  const maxScroll = useRef(0);
  const interactions = useRef(0);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercentage > maxScroll.current) {
        maxScroll.current = scrollPercentage;
      }

      // Debounce scroll tracking
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        interactions.current++;
      }, 150);
    };

    const handleClick = () => {
      interactions.current++;
    };

    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTime.current;
      
      trackUserEngagement({
        scroll_depth: maxScroll.current,
        time_on_page: Math.round(timeSpent / 1000),
        interactions_count: interactions.current,
        page_type: pageType
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleClick);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(scrollTimeout);
    };
  }, [pageType]);

  return {
    getCurrentEngagement: () => ({
      timeSpent: Math.round((Date.now() - startTime.current) / 1000),
      scrollDepth: maxScroll.current,
      interactions: interactions.current
    })
  };
}

/**
 * Hook für Collection Browse Tracking
 */
export function useCollectionTracking(collectionName: string) {
  const startTime = useRef(Date.now());
  const productsViewed = useRef(new Set<string>());
  const filtersUsed = useRef<string[]>([]);
  const maxScroll = useRef(0);

  const trackProductView = (productId: string) => {
    productsViewed.current.add(productId);
  };

  const trackFilterApplied = (filterType: string, filterValue: string, resultsCount: number) => {
    const filterString = `${filterType}:${filterValue}`;
    if (!filtersUsed.current.includes(filterString)) {
      filtersUsed.current.push(filterString);
    }

    trackFilterUsage({
      filter_type: filterType,
      filter_value: filterValue,
      products_shown: resultsCount,
      category: collectionName
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercentage > maxScroll.current) {
        maxScroll.current = scrollPercentage;
      }
    };

    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTime.current;
      
      trackCollectionBrowse({
        collection_name: collectionName,
        products_viewed: productsViewed.current.size,
        time_spent: Math.round(timeSpent / 1000),
        scroll_depth: maxScroll.current,
        filters_used: filtersUsed.current
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [collectionName]);

  return {
    trackProductView,
    trackFilterApplied,
    getStats: () => ({
      productsViewed: productsViewed.current.size,
      timeSpent: Math.round((Date.now() - startTime.current) / 1000),
      filtersUsed: filtersUsed.current.length,
      scrollDepth: maxScroll.current
    })
  };
}

/**
 * Hook für Search Tracking mit Zero Results Detection
 */
export function useSearchTracking() {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const trackSearch = (query: string, resultsCount: number, category?: string) => {
    setSearchHistory(prev => [...prev.slice(-9), query]); // Keep last 10 searches

    if (resultsCount === 0) {
      trackZeroResultsSearch({
        query,
        category,
        suggested_alternatives: getSuggestions(query)
      });
    }
  };

  const getSuggestions = (query: string): string[] => {
    // Simple suggestion logic - in real implementation würde man ein Suggestion API verwenden
    const commonProducts = ['led lichterkette', 'küchenhelfer', 'haushaltsware', 'mini eierkocher'];
    return commonProducts.filter(product => 
      product.toLowerCase().includes(query.toLowerCase().substring(0, 3))
    );
  };

  return {
    trackSearch,
    searchHistory,
    clearHistory: () => setSearchHistory([])
  };
}

/**
 * Hook für Exit Intent Detection
 */
export function useExitIntentTracking(pageType: string) {
  const startTime = useRef(Date.now());
  const maxScroll = useRef(0);
  const [cartItems, setCartItems] = useState(0);

  useEffect(() => {
    let exitIntentTriggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger nur wenn Maus den oberen Bereich verlässt (Intent to close tab)
      if (e.clientY <= 0 && !exitIntentTriggered) {
        exitIntentTriggered = true;
        
        trackExitIntent({
          page_type: pageType,
          time_spent: Math.round((Date.now() - startTime.current) / 1000),
          scroll_depth: maxScroll.current,
          cart_items: cartItems
        });
      }
    };

    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercentage > maxScroll.current) {
        maxScroll.current = scrollPercentage;
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pageType, cartItems]);

  return {
    updateCartItems: setCartItems,
    getExitData: () => ({
      timeSpent: Math.round((Date.now() - startTime.current) / 1000),
      scrollDepth: maxScroll.current,
      cartItems
    })
  };
}

/**
 * Hook für Performance Impact Tracking
 */
export function usePerformanceTracking() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const trackPerformanceMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;

      // Track if user waited for slow loading
      const userWaited = loadTime > 3000;
      const speedBounce = loadTime > 5000 && window.location.pathname === '/';

      if (loadTime > 1000) { // Only track if load time is significant
        import('../lib/analytics').then(({ trackPerformanceImpact }) => {
          trackPerformanceImpact({
            page_load_time: loadTime,
            user_waited: userWaited,
            bounced_due_to_speed: speedBounce
          });
        });
      }
    };

    // Track after page is fully loaded
    if (document.readyState === 'complete') {
      setTimeout(trackPerformanceMetrics, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(trackPerformanceMetrics, 1000);
      });
    }
  }, []);
}
