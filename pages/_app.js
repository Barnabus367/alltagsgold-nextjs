import '../styles/globals.css'
import { HelmetProvider } from 'react-helmet-async';
import { AnalyticsProvider } from '../components/AnalyticsProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { TooltipProvider } from '../components/ui/tooltip';
import { useEffect } from 'react';
import { forceCloudinaryOptimization } from '../lib/cloudinary';
import { reportWebVitals } from '../lib/web-vitals';

export default function App({ Component, pageProps }) {
  // Aktiviere globale Cloudinary-Überwachung
  useEffect(() => {
    forceCloudinaryOptimization();
  }, []);

  return (
    <HelmetProvider>
      <AnalyticsProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Component {...pageProps} />
          </TooltipProvider>
        </QueryClientProvider>
      </AnalyticsProvider>
    </HelmetProvider>
  );
}

// Web Vitals Reporting for Performance Monitoring
export { reportWebVitals };
