import '../styles/globals.css'
import '../styles/product-detail.css'
import { AnalyticsProvider } from '../components/AnalyticsProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { TooltipProvider } from '../components/ui/tooltip';
import { ToastProvider } from '../components/ui/toast-system';
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
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
import { initializeLazyScripts } from '../lib/lazy-load-scripts';
import { isDebugEnabled, debugLog } from '../lib/debug-config';
import type { AppProps } from 'next/app';

// Lazy load debug components - nur wenn benötigt
const ClickAnalyticsDashboard = dynamic(
  () => import('../components/ClickAnalyticsDashboard').then(mod => mod.ClickAnalyticsDashboard),
  { ssr: false, loading: () => null }
);

const AnalyticsTestDashboard = dynamic(
  () => import('../components/dev/AnalyticsTestDashboard').then(mod => mod.AnalyticsTestDashboard),
  { ssr: false, loading: () => null }
);

export default function App({ Component, pageProps }: AppProps) {
  // Performance Optimizations Hook
  useTouchOptimization();
  
  // Mobile Performance Monitor - Hook wird immer aufgerufen, aber intern bedingt ausgeführt
  const debugEnabled = isDebugEnabled('enablePerformanceMonitoring');
  useMobilePerformanceMonitor(debugEnabled);
  
  // Track initialization to prevent repeated calls
  const isInitialized = useRef(false);

  // Aktiviere globale Optimierungen nur einmal
  useEffect(() => {
    if (isInitialized.current) return;
    
    forceCloudinaryOptimization();
    optimizeFontLoading();
    
    // Web Vitals Monitoring nur wenn Debug aktiviert
    if (isDebugEnabled('enablePerformanceMonitoring')) {
      initializeWebVitalsMonitoring();
      debugLog('Web Vitals Monitoring aktiviert');
    }
    
    // Initialize All Analytics (Meta Pixel + Vercel + Global Click Tracker)
    initializeAnalytics();
    
    // Initialize lazy-loaded third-party scripts
    initializeLazyScripts();
    
    // Navigation Diagnostics nur wenn Debug aktiviert
    if (typeof window !== 'undefined' && isDebugEnabled('enableNavigationDiagnostics')) {
      import('../lib/navigation-diagnostics').then(({ initializeNavigationDiagnostics }) => {
        initializeNavigationDiagnostics();
        debugLog('Navigation Diagnostics aktiviert für Hydration-Analyse');
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
                
                {/* Debug Components - nur wenn explizit aktiviert */}
                {isDebugEnabled('enableClickTracking') && <ClickAnalyticsDashboard />}
                {isDebugEnabled('enableAnalyticsDashboard') && <AnalyticsTestDashboard />}
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