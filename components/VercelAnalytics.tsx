/**
 * VERCEL ANALYTICS COMPONENT
 * Simplified implementation using official @vercel/analytics
 */

import { Analytics } from '@vercel/analytics/react';
import { track } from '@vercel/analytics';

export function VercelAnalytics() {
  return <Analytics />;
}

// Export tracking functions for custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Track in both development and production for debugging
  track(eventName, properties);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Dev Mode: Vercel Event tracked -', eventName, properties);
  } else {
    console.log('📊 Vercel Analytics: Event tracked -', eventName, properties);
  }
};

export const trackPurchase = (purchaseData: {
  value: number;
  currency: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) => {
  trackEvent('Purchase', {
    value: purchaseData.value,
    currency: purchaseData.currency,
    items_count: purchaseData.items.length,
    item_ids: purchaseData.items.map(item => item.id)
  });
};

export const trackAddToCart = (productData: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) => {
  trackEvent('Add_To_Cart', {
    product_id: productData.id,
    product_name: productData.name,
    price: productData.price,
    category: productData.category || 'product'
  });
};

export default VercelAnalytics;
