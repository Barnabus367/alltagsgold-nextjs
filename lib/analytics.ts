/**
 * Analytics Integration
 * Supports Meta Pixel, Vercel Analytics, and Global Click Tracking
 */

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  META_PIXEL_ID: '1408203506889853'
};

// Vercel Analytics Integration
import { track } from '@vercel/analytics';
import { enhancedTrack } from './analytics-validator';

// Force analytics to work in all environments
const shouldTrack = true; // Always track, regardless of environment

// Enhanced tracking function with retry mechanism
const trackWithRetry = (eventName: string, properties: any, retries = 3) => {
  if (!shouldTrack) return;
  
  try {
    // Use enhanced tracking with validation
    enhancedTrack(eventName, properties);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Vercel Analytics (Dev):', eventName, properties);
    }
  } catch (error) {
    console.error('❌ Vercel Analytics Error:', error);
    
    // Retry mechanism
    if (retries > 0) {
      setTimeout(() => {
        trackWithRetry(eventName, properties, retries - 1);
      }, 1000);
    }
  }
};

// Global Click Tracker Integration
import { initializeGlobalClickTracker, getGlobalClickTracker } from './global-click-tracker';

// Event Types
export interface ProductData {
  content_id?: string;
  content_name?: string;
  content_type?: string;
  value?: number;
  currency?: string;
  contents?: Array<{
    id: string;
    quantity: number;
    item_price?: number;
  }>;
}

export interface PurchaseData extends ProductData {
  order_id?: string;
  total_value?: number;
  num_items?: number;
}

export interface SearchData {
  search_string: string;
  content_category?: string;
}

// Vercel Analytics Event Types
export interface VercelProductEvent {
  product_id: string;
  product_name: string;
  category: string;
  price: number;
  currency: string;
}

export interface VercelCartEvent {
  cart_value: number;
  item_count: number;
  currency: string;
  products: string[];
}

export interface VercelSearchEvent {
  query: string;
  results_count: number;
  category?: string;
}

// Additional High-Value Event Types
export interface SessionEvent {
  session_duration: number;
  pages_viewed: number;
  bounce_rate_risk: 'low' | 'medium' | 'high';
}

export interface UserEngagementEvent {
  scroll_depth: number;
  time_on_page: number;
  interactions_count: number;
  page_type: 'product' | 'collection' | 'home' | 'other';
}

export interface FilterUsageEvent {
  filter_type: string;
  filter_value: string;
  products_shown: number;
  category: string;
}

export interface WishlistEvent {
  product_id: string;
  product_name: string;
  action: 'add' | 'remove' | 'view';
  total_wishlist_items: number;
}

// Global Analytics Functions werden in types/global.d.ts definiert

/**
 * Initialize Meta Pixel, Vercel Analytics, and Global Click Tracking
 */
export function initializeAnalytics() {
  if (typeof window === 'undefined') return;
  
  // Wait for scripts to load before initializing
  setTimeout(() => {
    // Initialize Meta Pixel if loaded
    if (window.fbq && typeof window.fbq === 'function') {
      if (process.env.NODE_ENV === 'development') {
        console.log('Meta Pixel initialized');
      }
    }

    // Initialize Vercel Analytics if loaded
    if (window.va && typeof window.va === 'function') {
      if (process.env.NODE_ENV === 'development') {
        console.log('Vercel Analytics initialized');
      }
    }

    // Initialize Global Click Tracker
    const clickTracker = initializeGlobalClickTracker();
    if (process.env.NODE_ENV === 'development') {
      console.log('Global Click Tracker initialized:', clickTracker.getSessionMetrics());
    }
  }, 1000);
}

/**
 * Track Page View with Meta Pixel and Vercel Analytics
 */
export function trackPageView(pageUrl?: string, pageTitle?: string) {
  if (typeof window === 'undefined') return;
  
  const url = pageUrl || window.location.pathname;
  const title = pageTitle || document.title;
  
  // Meta Pixel PageView
  if (window.fbq && typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'PageView');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Meta Pixel error:', error);
      }
    }
  }

  // Vercel Analytics PageView
  if (window.va && typeof window.va === 'function') {
    try {
      window.va('pageview', {
        path: url,
        title: title,
        referrer: document.referrer || undefined
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Vercel Analytics error:', error);
      }
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('PageView tracked:', { url, title });
  }
}

/**
 * Track Product View with Meta Pixel + Vercel Analytics
 */
export function trackViewContent(productData: ProductData) {
  if (typeof window === 'undefined') return;
  
  // Meta Pixel ViewContent
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_type: productData.content_type || 'product',
      content_ids: [productData.content_id],
      content_name: productData.content_name,
      value: productData.value,
      currency: productData.currency || 'CHF'
    });
  }
  
  // Vercel Analytics - Product View
  trackWithRetry('Product_View', {
    product_id: productData.content_id || 'unknown',
    product_name: productData.content_name || 'Unknown Product',
    category: productData.content_type || 'product',
    price: productData.value || 0,
    currency: productData.currency || 'CHF'
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 ViewContent tracked (Meta + Vercel):', productData);
  }
}

/**
 * Track Add to Cart with Meta Pixel + Vercel Analytics
 */
export function trackAddToCart(productData: ProductData) {
  if (typeof window === 'undefined') return;
  
  // Meta Pixel AddToCart
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_type: productData.content_type || 'product',
      content_ids: [productData.content_id],
      content_name: productData.content_name,
      value: productData.value,
      currency: productData.currency || 'CHF',
      contents: productData.contents
    });
  }
  
  // Vercel Analytics - Add to Cart
  trackWithRetry('Add_To_Cart', {
    product_id: productData.content_id || 'unknown',
    product_name: productData.content_name || 'Unknown Product',
    category: productData.content_type || 'product',
    price: productData.value || 0,
    currency: productData.currency || 'CHF',
    quantity: productData.contents?.[0]?.quantity || 1
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 AddToCart tracked (Meta + Vercel):', productData);
  }
}

/**
 * Track View Cart with Meta Pixel + Vercel Analytics
 */
export function trackViewCart(cartData: ProductData) {
  if (typeof window === 'undefined') return;
  
  // Meta Pixel ViewCart
  if (window.fbq) {
    window.fbq('track', 'ViewCart', {
      content_type: cartData.content_type || 'product',
      value: cartData.value,
      currency: cartData.currency || 'CHF',
      contents: cartData.contents
    });
  }
  
  // Vercel Analytics - Cart View
  trackWithRetry('Cart_View', {
    cart_value: cartData.value || 0,
    item_count: cartData.contents?.length || 0,
    currency: cartData.currency || 'CHF'
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 ViewCart tracked (Meta + Vercel):', cartData);
  }
}

/**
 * Track Initiate Checkout with Meta Pixel + Vercel Analytics
 */
export function trackInitiateCheckout(cartData: ProductData) {
  if (typeof window === 'undefined') return;
  
  // Meta Pixel InitiateCheckout
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_type: cartData.content_type || 'product',
      value: cartData.value,
      currency: cartData.currency || 'CHF',
      contents: cartData.contents
    });
  }
  
  // Vercel Analytics - Checkout Started
  trackWithRetry('Checkout_Start', {
    cart_value: cartData.value || 0,
    item_count: cartData.contents?.length || 0,
    currency: cartData.currency || 'CHF'
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 InitiateCheckout tracked (Meta + Vercel):', cartData);
  }
}



/**
 * Track Purchase with Meta Pixel + Vercel Analytics
 */
export function trackPurchase(purchaseData: PurchaseData) {
  if (typeof window === 'undefined') return;
  
  // Meta Pixel Purchase
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: purchaseData.total_value || purchaseData.value,
      currency: purchaseData.currency || 'CHF',
      contents: purchaseData.contents,
      content_type: 'product'
    });
  }

  // Vercel Analytics - Purchase Completed
  trackWithRetry('Purchase', {
    order_value: purchaseData.total_value || purchaseData.value || 0,
    item_count: purchaseData.num_items || purchaseData.contents?.length || 1,
    currency: purchaseData.currency || 'CHF',
    order_id: purchaseData.order_id || 'unknown'
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Purchase tracked (Meta + Vercel):', purchaseData);
  }
}

/**
 * Track Search with Meta Pixel + Vercel Analytics
 */
export function trackSearch(searchData: SearchData) {
  if (typeof window === 'undefined') return;
  
  // Meta Pixel Search
  if (window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchData.search_string,
      content_category: searchData.content_category
    });
  }

  // Vercel Analytics - Search Performed
  trackWithRetry('Search', {
    query: searchData.search_string,
    category: searchData.content_category || 'all',
    timestamp: Date.now()
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Search tracked (Meta + Vercel):', searchData);
  }
}

/**
 * Track Contact Form Submission with Meta Pixel + Vercel Analytics
 */
export function trackContact(formData: { form_name: string; method?: string }) {
  if (typeof window === 'undefined') return;
  
  // Meta Pixel Contact
  if (window.fbq) {
    window.fbq('track', 'Contact');
  }

  // Vercel Analytics - Contact Form
  trackWithRetry('Contact', {
    form_name: formData.form_name,
    method: formData.method || 'form',
    timestamp: Date.now()
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Contact tracked (Meta + Vercel):', formData);
  }
}

/**
 * Track Custom Event with Meta Pixel
 */
export function trackCustomEvent(eventName: string, eventData: any = {}) {
  if (typeof window === 'undefined') return;
  
  // Meta Pixel Custom Event
  if (window.fbq) {
    window.fbq('trackCustom', eventName, eventData);
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Custom Event tracked:', { eventName, eventData });
  }
}

/**
 * Track High-Value Click Events (zusätzlich zum Global Tracker)
 */
export function trackSpecialClick(elementSelector: string, eventName: string, properties?: Record<string, any>) {
  const tracker = getGlobalClickTracker();
  if (tracker) {
    tracker.trackSpecialClick(elementSelector, eventName, properties);
  }
}

/**
 * Get Current Session Click Analytics
 */
export function getClickSessionMetrics() {
  const tracker = getGlobalClickTracker();
  return tracker ? tracker.getSessionMetrics() : null;
}

// ==========================================
// HIGH-VALUE VERCEL ANALYTICS EVENTS
// ==========================================

/**
 * Track Collection Browse Behavior
 */
export function trackCollectionBrowse(collectionData: {
  collection_name: string;
  products_viewed: number;
  time_spent: number;
  scroll_depth: number;
  filters_used?: string[];
}) {
  if (typeof window === 'undefined') return;

  trackWithRetry('Collection_Browse', {
    collection: collectionData.collection_name,
    products_count: collectionData.products_viewed,
    engagement_time: collectionData.time_spent,
    scroll_percentage: collectionData.scroll_depth,
    filters_applied: collectionData.filters_used?.join(',') || 'none'
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Collection Browse tracked:', collectionData);
  }
}

/**
 * Track Filter Usage (Super wertvoll für Product Discovery)
 */
export function trackFilterUsage(filterData: FilterUsageEvent) {
  if (typeof window === 'undefined') return;

  trackWithRetry('Filter_Applied', {
    filter_type: filterData.filter_type,
    filter_value: filterData.filter_value,
    results_count: filterData.products_shown,
    category: filterData.category
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Filter Usage tracked:', filterData);
  }
}

/**
 * Track User Engagement Metrics (Page Quality)
 */
export function trackUserEngagement(engagementData: UserEngagementEvent) {
  if (typeof window === 'undefined') return;

  trackWithRetry('User_Engagement', {
    scroll_depth: engagementData.scroll_depth,
    time_on_page: engagementData.time_on_page,
    interaction_count: engagementData.interactions_count,
    page_type: engagementData.page_type,
    engagement_quality: engagementData.scroll_depth > 75 && engagementData.time_on_page > 30 ? 'high' : 'low'
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 User Engagement tracked:', engagementData);
  }
}

/**
 * Track Newsletter Signup (Lead Generation)
 */
export function trackNewsletterSignup(signupData: {
  source: 'popup' | 'footer' | 'checkout' | 'product_page';
  incentive?: string;
  user_type: 'new' | 'returning';
}) {
  if (typeof window === 'undefined') return;

  // Meta Pixel Lead
  if (window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: 'Newsletter Signup',
      content_category: signupData.source
    });
  }

  // Vercel Analytics Newsletter Event
  trackWithRetry('Newsletter_Signup', {
    source: signupData.source,
    incentive: signupData.incentive || 'none',
    user_type: signupData.user_type
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Newsletter Signup tracked:', signupData);
  }
}

/**
 * Track Wishlist Actions (Purchase Intent)
 */
export function trackWishlistAction(wishlistData: WishlistEvent) {
  if (typeof window === 'undefined') return;

  trackWithRetry('Wishlist_Action', {
    action: wishlistData.action,
    product_id: wishlistData.product_id,
    product_name: wishlistData.product_name,
    total_items: wishlistData.total_wishlist_items
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Wishlist Action tracked:', wishlistData);
  }
}

/**
 * Track Zero Results Search (UX Problem)
 */
export function trackZeroResultsSearch(searchData: {
  query: string;
  suggested_alternatives?: string[];
  category?: string;
}) {
  if (typeof window === 'undefined') return;

  track('Search_No_Results', {
    query: searchData.query,
    category: searchData.category || 'all',
    suggestions_shown: searchData.suggested_alternatives?.length || 0
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Zero Results Search tracked:', searchData);
  }
}

/**
 * Track Exit Intent (Bounce Prevention)
 */
export function trackExitIntent(exitData: {
  page_type: string;
  time_spent: number;
  scroll_depth: number;
  cart_items?: number;
}) {
  if (typeof window === 'undefined') return;

  track('Exit_Intent', {
    page_type: exitData.page_type,
    session_time: exitData.time_spent,
    scroll_percentage: exitData.scroll_depth,
    cart_value: exitData.cart_items || 0,
    risk_level: exitData.time_spent < 10 ? 'high' : 'low'
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Exit Intent tracked:', exitData);
  }
}

/**
 * Track Mobile Gestures (Mobile UX)
 */
export function trackMobileGesture(gestureData: {
  gesture_type: 'swipe' | 'pinch' | 'long_press' | 'double_tap';
  element_type: string;
  success: boolean;
}) {
  if (typeof window === 'undefined') return;

  track('Mobile_Gesture', {
    gesture: gestureData.gesture_type,
    element: gestureData.element_type,
    success: gestureData.success
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Mobile Gesture tracked:', gestureData);
  }
}

/**
 * Track Performance Impact on User Behavior
 */
export function trackPerformanceImpact(performanceData: {
  page_load_time: number;
  user_waited: boolean;
  bounced_due_to_speed: boolean;
}) {
  if (typeof window === 'undefined') return;

  track('Performance_Impact', {
    load_time: performanceData.page_load_time,
    user_patience: performanceData.user_waited,
    speed_bounce: performanceData.bounced_due_to_speed,
    performance_score: performanceData.page_load_time < 2000 ? 'good' : 'poor'
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Performance Impact tracked:', performanceData);
  }
}