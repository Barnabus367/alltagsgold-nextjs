/**
 * Analytics Events Test Script
 * Tests all implemented custom events
 */

import React, { useEffect, useState } from 'react';
import { 
  trackViewContent,
  trackAddToCart, 
  trackViewCart,
  trackInitiateCheckout,
  trackPurchase,
  trackSearch,
  trackContact,
  trackCollectionBrowse,
  trackFilterUsage,
  trackUserEngagement,
  trackNewsletterSignup,
  trackWishlistAction
} from '../../lib/analytics';
import { getAnalyticsDebugInfo, clearAnalyticsDebug } from '../../lib/analytics-validator';

export function AnalyticsTestDashboard() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  const runTestEvent = (eventType: string) => {
    const testData = {
      product: {
        content_id: 'test-product-123',
        content_name: 'Test Analytics Product',
        content_type: 'product', 
        value: 49.90,
        currency: 'CHF',
        contents: [{ id: 'test-product-123', quantity: 1, item_price: 49.90 }]
      },
      cart: {
        value: 99.80,
        currency: 'CHF',
        contents: [
          { id: 'test-product-123', quantity: 2, item_price: 49.90 }
        ]
      },
      purchase: {
        total_value: 149.70,
        currency: 'CHF',
        order_id: 'test-order-' + Date.now(),
        num_items: 3,
        contents: [
          { id: 'test-product-123', quantity: 3, item_price: 49.90 }
        ]
      },
      search: {
        search_string: 'test analytics search',
        content_category: 'jewelry'
      },
      contact: {
        form_name: 'test_analytics_form',
        method: 'test_method'
      }
    };

    switch(eventType) {
      case 'Product_View':
        trackViewContent(testData.product);
        break;
      case 'Add_To_Cart':
        trackAddToCart(testData.product);
        break;
      case 'Cart_View':
        trackViewCart(testData.cart);
        break;
      case 'Checkout_Start':
        trackInitiateCheckout(testData.cart);
        break;
      case 'Purchase':
        trackPurchase(testData.purchase);
        break;
      case 'Search':
        trackSearch(testData.search);
        break;
      case 'Contact':
        trackContact(testData.contact);
        break;
      case 'Collection_Browse':
        trackCollectionBrowse({
          collection_name: 'Test Collection',
          products_viewed: 12,
          time_spent: 45,
          scroll_depth: 85,
          filters_used: ['price', 'category']
        });
        break;
      case 'Filter_Applied':
        trackFilterUsage({
          filter_type: 'price',
          filter_value: '50-100',
          products_shown: 8,
          category: 'rings'
        });
        break;
      case 'User_Engagement':
        trackUserEngagement({
          scroll_depth: 75,
          time_on_page: 120,
          interactions_count: 5,
          page_type: 'product'
        });
        break;
      case 'Newsletter_Signup':
        trackNewsletterSignup({
          source: 'popup',
          incentive: '10% discount',
          user_type: 'new'
        });
        break;
      case 'Wishlist_Action':
        trackWishlistAction({
          product_id: 'test-product-123',
          product_name: 'Test Product',
          action: 'add',
          total_wishlist_items: 3
        });
        break;
      default:
        console.log('Unknown event type:', eventType);
    }

    // Update debug info after event
    setTimeout(() => {
      setDebugInfo(getAnalyticsDebugInfo());
    }, 500);
  };

  const refreshDebugInfo = () => {
    setDebugInfo(getAnalyticsDebugInfo());
  };

  const clearDebugData = () => {
    clearAnalyticsDebug();
    setDebugInfo(null);
  };

  if (!isVisible) return null;

  const allEvents = [
    'Product_View',
    'Add_To_Cart', 
    'Cart_View',
    'Checkout_Start',
    'Purchase',
    'Search',
    'Contact',
    'Collection_Browse',
    'Filter_Applied',
    'User_Engagement',
    'Newsletter_Signup',
    'Wishlist_Action'
  ];

  return (
    <div className="fixed bottom-4 right-4 bg-white border shadow-lg rounded-lg p-4 max-w-md z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-sm">Analytics Test Dashboard</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        {allEvents.map(eventType => (
          <button
            key={eventType}
            onClick={() => runTestEvent(eventType)}
            className="w-full text-left px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 rounded border"
          >
            Test {eventType}
          </button>
        ))}
      </div>

      <div className="border-t pt-2 space-y-2">
        <button
          onClick={refreshDebugInfo}
          className="w-full px-2 py-1 text-xs bg-green-50 hover:bg-green-100 rounded border"
        >
          Refresh Debug Info
        </button>
        <button
          onClick={clearDebugData}
          className="w-full px-2 py-1 text-xs bg-red-50 hover:bg-red-100 rounded border"
        >
          Clear Debug Data
        </button>
      </div>

      {debugInfo && (
        <div className="mt-4 p-2 bg-gray-50 rounded text-xs">
          <div><strong>Total Events:</strong> {debugInfo.total_tracked}</div>
          <div><strong>Session Events:</strong> {debugInfo.current_session?.length || 0}</div>
          <div><strong>Event Types:</strong> {debugInfo.unique_events?.length || 0}</div>
          {debugInfo.unique_events && (
            <div className="mt-1">
              <strong>Types:</strong> {debugInfo.unique_events.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Global access for console testing
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).testAnalytics = {
    viewProduct: () => trackViewContent({
      content_id: 'console-test-product',
      content_name: 'Console Test Product',
      content_type: 'product',
      value: 29.90,
      currency: 'CHF'
    }),
    addToCart: () => trackAddToCart({
      content_id: 'console-test-product',
      content_name: 'Console Test Product', 
      content_type: 'product',
      value: 29.90,
      currency: 'CHF',
      contents: [{ id: 'console-test-product', quantity: 1, item_price: 29.90 }]
    }),
    search: () => trackSearch({
      search_string: 'console test search',
      content_category: 'all'
    }),
    contact: () => trackContact({
      form_name: 'console_test',
      method: 'console'
    })
  };
}
