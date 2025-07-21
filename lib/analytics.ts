/**
 * Analytics Integration
 * Supports Meta Pixel and Vercel Analytics
 */

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  META_PIXEL_ID: '1408203506889853'
};

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

// Global Analytics Functions werden in types/global.d.ts definiert

/**
 * Initialize Meta Pixel
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
  }, 1000);
}

/**
 * Track Page View with Meta Pixel
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
  
  if (process.env.NODE_ENV === 'development') {
    console.log('PageView tracked:', { url, title });
  }
}

/**
 * Track Product View with Meta Pixel
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
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 ViewContent tracked:', productData);
  }
}

/**
 * Track Add to Cart with Meta Pixel
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
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 AddToCart tracked:', productData);
  }
}

/**
 * Track View Cart with Meta Pixel
 */
export function trackViewCart(cartData: ProductData) {
  if (typeof window === 'undefined') return;
  
  // Meta Pixel (no direct ViewCart, use custom event)
  if (window.fbq) {
    window.fbq('trackCustom', 'ViewCart', {
      value: cartData.value,
      currency: cartData.currency || 'CHF',
      contents: cartData.contents
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 ViewCart tracked:', cartData);
  }
}

/**
 * Track Initiate Checkout with Meta Pixel
 */
export function trackInitiateCheckout(checkoutData: ProductData) {
  if (typeof window === 'undefined') return;
  
  // Meta Pixel InitiateCheckout
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: checkoutData.value,
      currency: checkoutData.currency || 'CHF',
      contents: checkoutData.contents,
      num_items: checkoutData.contents?.length || 1
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 InitiateCheckout tracked:', checkoutData);
  }
}

/**
 * Track Purchase with Meta Pixel
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
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Purchase tracked:', purchaseData);
  }
}

/**
 * Track Search with Meta Pixel
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
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Search tracked:', searchData);
  }
}

/**
 * Track Contact Form Submission with Meta Pixel
 */
export function trackContact(formData: { form_name: string; method?: string }) {
  if (typeof window === 'undefined') return;
  
  // Meta Pixel Contact
  if (window.fbq) {
    window.fbq('track', 'Contact');
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Contact tracked:', formData);
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