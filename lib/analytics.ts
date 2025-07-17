/**
 * Multi-Platform Analytics Integration
 * Supports Meta Pixel, TikTok Pixel, and Google Tag Manager
 */

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  META_PIXEL_ID: '1408203506889853',
  TIKTOK_PIXEL_ID: 'D0QIT2BC77U5V5P7175G',
  GTM_CONTAINER_ID: 'GTM-T5C8R8MK',
  LINKEDIN_PARTNER_ID: '6847265'
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

// Global Analytics Functions
declare global {
  interface Window {
    fbq: any;
    ttq: any;
    dataLayer: any[];
    gtag: any;
    lintrk: any;
    _linkedin_data_partner_ids: string[];
  }
}

/**
 * Initialize all analytics platforms
 */
export function initializeAnalytics() {
  if (typeof window === 'undefined') return;
  
  // Initialize dataLayer first
  window.dataLayer = window.dataLayer || [];
  
  // Wait for scripts to load before initializing
  setTimeout(() => {
    // Initialize Meta Pixel if loaded
    if (window.fbq && typeof window.fbq === 'function') {
      if (process.env.NODE_ENV === 'development') {
        console.log('Meta Pixel initialized');
      }
    }
    
    // Initialize TikTok Pixel if loaded  
    if (window.ttq && typeof window.ttq === 'function') {
      if (process.env.NODE_ENV === 'development') {
        console.log('TikTok Pixel initialized');
      }
    }
    
    // Initialize GTM if loaded
    if (window.gtag && typeof window.gtag === 'function') {
      if (process.env.NODE_ENV === 'development') {
        console.log('Google Tag Manager initialized');
      }
    }
    
    // Initialize LinkedIn Insight Tag if loaded
    if (window.lintrk && typeof window.lintrk === 'function') {
      if (process.env.NODE_ENV === 'development') {
        console.log('LinkedIn Insight Tag initialized');
      }
    }
  }, 1000);
}

/**
 * Track Page View on all platforms
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
  
  // TikTok Pixel PageView
  if (window.ttq && window.ttq.track) {
    try {
      window.ttq.track('Browse');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('TikTok Pixel error:', error);
      }
    }
  }
  
  // Google Tag Manager PageView
  if (window.gtag && typeof window.gtag === 'function') {
    try {
      window.gtag('event', 'page_view', {
        page_title: title,
        page_location: window.location.href,
        page_path: url
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('GTM error:', error);
      }
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('PageView tracked:', { url, title });
  }
}

/**
 * Track Product View
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
  
  // TikTok Pixel ViewContent
  if (window.ttq) {
    window.ttq.track('ViewContent', {
      content_type: productData.content_type || 'product',
      content_id: productData.content_id,
      content_name: productData.content_name,
      value: productData.value,
      currency: productData.currency || 'CHF'
    });
  }
  
  // Google Tag Manager ViewContent
  if (window.gtag) {
    window.gtag('event', 'view_item', {
      item_id: productData.content_id,
      item_name: productData.content_name,
      item_category: productData.content_type,
      value: productData.value,
      currency: productData.currency || 'CHF'
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 ViewContent tracked:', productData);
  }
}

/**
 * Track Add to Cart
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
  
  // TikTok Pixel AddToCart
  if (window.ttq) {
    window.ttq.track('AddToCart', {
      content_type: productData.content_type || 'product',
      content_id: productData.content_id,
      content_name: productData.content_name,
      value: productData.value,
      currency: productData.currency || 'CHF',
      contents: productData.contents
    });
  }
  
  // Google Tag Manager AddToCart
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      item_id: productData.content_id,
      item_name: productData.content_name,
      item_category: productData.content_type,
      value: productData.value,
      currency: productData.currency || 'CHF',
      quantity: productData.contents?.[0]?.quantity || 1
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 AddToCart tracked:', productData);
  }
}

/**
 * Track View Cart
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
  
  // TikTok Pixel (no direct ViewCart, use custom event)
  if (window.ttq) {
    window.ttq.track('Browse', {
      content_type: 'cart',
      value: cartData.value,
      currency: cartData.currency || 'CHF'
    });
  }
  
  // Google Tag Manager ViewCart
  if (window.gtag) {
    window.gtag('event', 'view_cart', {
      value: cartData.value,
      currency: cartData.currency || 'CHF',
      items: cartData.contents?.map(item => ({
        item_id: item.id,
        quantity: item.quantity,
        price: item.item_price
      }))
    });
  }
  
  console.log('📊 ViewCart tracked:', cartData);
}

/**
 * Track Initiate Checkout
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
  
  // TikTok Pixel InitiateCheckout
  if (window.ttq) {
    window.ttq.track('InitiateCheckout', {
      value: checkoutData.value,
      currency: checkoutData.currency || 'CHF',
      contents: checkoutData.contents
    });
  }
  
  // Google Tag Manager InitiateCheckout
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      value: checkoutData.value,
      currency: checkoutData.currency || 'CHF',
      items: checkoutData.contents?.map(item => ({
        item_id: item.id,
        quantity: item.quantity,
        price: item.item_price
      }))
    });
  }
  
  console.log('📊 InitiateCheckout tracked:', checkoutData);
}

/**
 * Track Purchase
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
  
  // TikTok Pixel Purchase
  if (window.ttq) {
    window.ttq.track('PlaceAnOrder', {
      value: purchaseData.total_value || purchaseData.value,
      currency: purchaseData.currency || 'CHF',
      contents: purchaseData.contents
    });
  }
  
  // Google Tag Manager Purchase
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: purchaseData.order_id,
      value: purchaseData.total_value || purchaseData.value,
      currency: purchaseData.currency || 'CHF',
      items: purchaseData.contents?.map(item => ({
        item_id: item.id,
        quantity: item.quantity,
        price: item.item_price
      }))
    });
  }
  
  // LinkedIn Insight Tag Purchase
  if (window.lintrk) {
    window.lintrk('track', { conversion_id: 16619601 });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Purchase tracked:', purchaseData);
  }
}

/**
 * Track Search
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
  
  // TikTok Pixel Search
  if (window.ttq) {
    window.ttq.track('Search', {
      search_string: searchData.search_string,
      content_category: searchData.content_category
    });
  }
  
  // Google Tag Manager Search
  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchData.search_string,
      content_category: searchData.content_category
    });
  }
  
  console.log('📊 Search tracked:', searchData);
}

/**
 * Track Contact Form Submission
 */
export function trackContact(formData: { form_name: string; method?: string }) {
  if (typeof window === 'undefined') return;
  
  // Meta Pixel Contact
  if (window.fbq) {
    window.fbq('track', 'Contact');
  }
  
  // TikTok Pixel Contact
  if (window.ttq) {
    window.ttq.track('Contact');
  }
  
  // Google Tag Manager Contact
  if (window.gtag) {
    window.gtag('event', 'contact', {
      form_name: formData.form_name,
      method: formData.method || 'form'
    });
  }
  
  // LinkedIn Insight Tag Contact/Lead
  if (window.lintrk) {
    window.lintrk('track', { conversion_id: 16619609 });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Contact tracked:', formData);
  }
}

/**
 * Track Custom Event
 */
export function trackCustomEvent(eventName: string, eventData: any = {}) {
  if (typeof window === 'undefined') return;
  
  // Meta Pixel Custom Event
  if (window.fbq) {
    window.fbq('trackCustom', eventName, eventData);
  }
  
  // TikTok Pixel Custom Event
  if (window.ttq) {
    window.ttq.track(eventName, eventData);
  }
  
  // Google Tag Manager Custom Event
  if (window.gtag) {
    window.gtag('event', eventName, eventData);
  }
  
  console.log('📊 Custom Event tracked:', { eventName, eventData });
}