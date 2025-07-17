import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { initializeAnalytics, trackPageView } from '@/lib/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const router = useRouter();

  // Initialize analytics after scripts load - only on client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const timer = setTimeout(() => {
      initializeAnalytics();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Track page views on route change - only on client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    trackPageView(router.asPath);
  }, [router.asPath]);

  return <>{children}</>;
}