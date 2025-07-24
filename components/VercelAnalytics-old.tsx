/**
 * VERCEL ANALYTICS COMPONENT
 * Robuste Implementation für Production-Environment
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Analytics Script URL
const VERCEL_ANALYTICS_SCRIPT = 'https://va.vercel-scripts.com/v1/script.js';

export function VercelAnalytics() {
  const router = useRouter();

  useEffect(() => {
    // Nur im Production-Modus laden
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 Vercel Analytics: Development-Modus - Analytics deaktiviert');
      return;
    }

    // Script-Loading Funktion
    const loadAnalyticsScript = () => {
      // Prüfen ob Script bereits geladen
      if (document.querySelector(`script[src="${VERCEL_ANALYTICS_SCRIPT}"]`)) {
        console.log('✅ Vercel Analytics: Script bereits geladen');
        return;
      }

      // Analytics Script erstellen
      const script = document.createElement('script');
      script.src = VERCEL_ANALYTICS_SCRIPT;
      script.async = true;
      script.defer = true;
      
      // Script-Loading Events
      script.onload = () => {
        console.log('✅ Vercel Analytics: Script erfolgreich geladen');
        
        // Analytics-Objekt initialisieren
        if (typeof window !== 'undefined' && (window as any).va) {
          (window as any).va('pageview');
          console.log('📊 Vercel Analytics: Erstes PageView getrackt');
        }
      };
      
      script.onerror = () => {
        console.error('❌ Vercel Analytics: Script-Loading fehlgeschlagen');
      };

      // Script zum Head hinzufügen
      document.head.appendChild(script);
      console.log('🚀 Vercel Analytics: Script wird geladen...');
    };

    // Script laden nach kurzer Verzögerung
    const timer = setTimeout(loadAnalyticsScript, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Page Views tracken bei Route-Änderungen
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    const handleRouteChange = (url: string) => {
      // Vercel Analytics PageView
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('pageview', {
          path: url,
          title: document.title,
          referrer: document.referrer || undefined
        });
        console.log('📊 Vercel Analytics: PageView getrackt -', url);
      }
    };

    // Router Events registrieren
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Kein visuelles Element - nur Script-Loading
  return null;
}

/**
 * MANUAL ANALYTICS FUNCTIONS
 * Für Custom Events und E-Commerce Tracking
 */

declare global {
  interface Window {
    va?: (event: 'beforeSend' | 'event' | 'pageview', properties?: unknown) => void;
  }
}

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Dev Mode: Event würde getrackt werden -', eventName, properties);
    return;
  }

  if (typeof window !== 'undefined' && window.va) {
    window.va('event', { name: eventName, ...properties });
    console.log('📊 Vercel Analytics: Event getrackt -', eventName, properties);
  } else {
    console.warn('⚠️ Vercel Analytics: Script noch nicht geladen');
  }
};

export const trackPurchase = (purchaseData: {
  value: number;
  currency: string;
  items: Array<{
    id: string;
    name: string;
    category?: string;
    quantity: number;
    price: number;
  }>;
}) => {
  trackEvent('purchase', {
    value: purchaseData.value,
    currency: purchaseData.currency,
    items: purchaseData.items
  });
};

export const trackAddToCart = (productData: {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
}) => {
  trackEvent('add_to_cart', productData);
};

export const trackViewProduct = (productData: {
  id: string;
  name: string;
  category?: string;
  price: number;
}) => {
  trackEvent('view_item', productData);
};

export default VercelAnalytics;
