import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { initializeAnalytics, trackPageView } from '@/lib/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const router = useRouter();
  const isInitialized = useRef(false);
  const lastTrackedPath = useRef<string>('');

  // Initialize analytics after scripts load - only on client
  useEffect(() => {
    if (typeof window === 'undefined' || isInitialized.current) return;
    
    const timer = setTimeout(() => {
      initializeAnalytics();
      isInitialized.current = true;
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Track page views on route change - only on client and prevent duplicates
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized.current) return;
    if (lastTrackedPath.current === router.asPath) return;
    
    const trackingTimer = setTimeout(() => {
      trackPageView(router.asPath);
      lastTrackedPath.current = router.asPath;
    }, 100); // Small delay to prevent rapid firing
    
    return () => clearTimeout(trackingTimer);
  }, [router.asPath]);

  return <>{children}</>;
}