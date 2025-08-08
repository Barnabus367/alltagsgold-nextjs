import '../styles/globals.css'
import '../styles/product-detail.css'
import { AnalyticsProvider } from '../components/AnalyticsProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { TooltipProvider } from '../components/ui/tooltip';
import { ToastProvider } from '../components/ui/toast-system';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
// dynamic import nicht mehr benötigt nach Cleanup
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
// Dev-Components wurden entfernt für Production

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Performance Optimizations - Hooks müssen immer aufgerufen werden
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Hook wird immer aufgerufen, aber intern wird auf Production geprüft
  useTouchOptimization();
  
  // Mobile Performance Monitor - Hook wird immer aufgerufen
  const debugEnabled = isProduction && isDebugEnabled('enablePerformanceMonitoring');
  useMobilePerformanceMonitor(debugEnabled);
  
  // Track initialization to prevent repeated calls
  const isInitialized = useRef(false);
  
  // Zentraler Router Event Handler (einziger Ort für Router-Events)
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      // Optional: Progress indicator starten
      // NProgress.start();
    };
    
    const handleRouteChangeDone = () => {
      // Optional: Progress indicator stoppen
      // NProgress.done();
      // Scroll to top nach Navigation (nur bei neuer Seite)
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
    };
    
    const handleRouteChangeError = (err: any, url: string) => {
      // Ignoriere Abbruch-Fehler
      if (err?.cancelled || err?.message?.includes('Abort fetching component')) {
        // Silently ignore - das ist normal bei schneller Navigation
        return;
      }
      // Log nur echte Fehler in Dev
      if (process.env.NODE_ENV !== 'production') {
        console.error('Navigation error:', err, url);
      }
      handleRouteChangeDone();
    };
    
    // Registriere Events
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeDone);
    router.events.on('routeChangeError', handleRouteChangeError);
    
    // Cleanup
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeDone);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router.events]);

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
    
    // Development-only diagnostics (synchron geladen für Stabilität)
    if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
      // Nur in Dev-Umgebung laden, synchron für Race-Condition-Vermeidung
      if (isDebugEnabled('enableNavigationDiagnostics')) {
        const { initializeNavigationDiagnostics } = require('../lib/navigation-diagnostics');
        initializeNavigationDiagnostics();
        debugLog('Navigation Diagnostics aktiviert für Hydration-Analyse');
      }
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
                
                {/* Debug Components wurden für Production entfernt */}
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