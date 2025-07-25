import '../styles/globals.css'
import { AnalyticsProvider } from '../components/AnalyticsProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { TooltipProvider } from '../components/ui/tooltip';
import { ToastProvider } from '../components/ui/toast-system';
import { useEffect, useRef } from 'react';
import { forceCloudinaryOptimization } from '../lib/cloudinary';
import { reportWebVitals } from '../lib/web-vitals';
import { inter, optimizeFontLoading } from '../lib/fonts-optimized';
import { initializeWebVitalsMonitoring } from '../lib/web-vitals-monitor';
import { useTouchOptimization, useMobilePerformanceMonitor } from '../lib/mobile-optimization';
import { PWAProvider } from '../components/PWAProvider';
import { loadCriticalCSS } from '../lib/critical-css';
import { Analytics } from '@vercel/analytics/react';
import { VercelAnalytics } from '../components/VercelAnalytics';
import { initializeAnalytics } from '../lib/analytics';
import { ClickAnalyticsDashboard } from '../components/ClickAnalyticsDashboard';
import { AnalyticsTestDashboard } from '../components/dev/AnalyticsTestDashboard';

export default function App({ Component, pageProps }) {
  // Performance Optimizations Hook
  useTouchOptimization();
  useMobilePerformanceMonitor();
  
  // Track initialization to prevent repeated calls
  const isInitialized = useRef(false);

  // Aktiviere globale Optimierungen nur einmal
  useEffect(() => {
    if (isInitialized.current) return;
    
    forceCloudinaryOptimization();
    optimizeFontLoading();
    initializeWebVitalsMonitoring();
    
    // Initialize All Analytics (Meta Pixel + Vercel + Global Click Tracker)
    initializeAnalytics();
    
    // Initialize Navigation Diagnostics für SSG/ISR Hydration-Analyse
    if (typeof window !== 'undefined') {
      import('../lib/navigation-diagnostics').then(({ initializeNavigationDiagnostics }) => {
        initializeNavigationDiagnostics();
        console.log('🔧 Navigation Diagnostics aktiviert für Hydration-Analyse');
      }).catch(console.error);
    }
    
    // Load Critical CSS based on initial route only - safe browser check
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/products/')) {
        loadCriticalCSS('product');
      } else if (currentPath.includes('/collections') || currentPath.includes('/products')) {
        loadCriticalCSS('products');
      } else {
        loadCriticalCSS('home');
      }
    }
    
    isInitialized.current = true;
  }, []);

  return (
    <div className={inter.variable}>
      <PWAProvider>
        <AnalyticsProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <ToastProvider>
                <Component {...pageProps} />
                <Analytics />
                <VercelAnalytics />
                <ClickAnalyticsDashboard />
                <AnalyticsTestDashboard />
              </ToastProvider>
            </TooltipProvider>
          </QueryClientProvider>
        </AnalyticsProvider>
      </PWAProvider>
    </div>
  );
}

// Web Vitals Reporting for Performance Monitoring
export { reportWebVitals };
