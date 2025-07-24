/**
 * Test Analytics Events
 * Run this script to test all analytics events manually
 */

// Import analytics functions
const {
  trackSearch,
  trackAddToCart,
  trackViewCart,
  trackInitiateCheckout,
  trackContact,
  trackViewContent
} = require('../lib/analytics');

console.log('🧪 Testing Analytics Events...\n');

// Test 1: Search Event
console.log('1. Testing Search Event...');
trackSearch({
  search_string: 'test search',
  content_category: 'jewelry'
});

// Test 2: Add to Cart Event  
console.log('2. Testing Add to Cart Event...');
trackAddToCart({
  content_id: 'test-product-123',
  content_name: 'Test Product',
  content_type: 'product',
  value: 49.90,
  currency: 'CHF',
  contents: [{ id: 'test-product-123', quantity: 1, item_price: 49.90 }]
});

// Test 3: View Cart Event
console.log('3. Testing View Cart Event...');
trackViewCart({
  value: 99.80,
  currency: 'CHF',
  contents: [
    { id: 'test-product-123', quantity: 2, item_price: 49.90 }
  ]
});

// Test 4: Contact Event
console.log('4. Testing Contact Event...');
trackContact({
  form_name: 'test_contact_form',
  method: 'test_submission'
});

// Test 5: Checkout Event
console.log('5. Testing Checkout Event...');
trackInitiateCheckout({
  value: 99.80,
  currency: 'CHF',
  contents: [
    { id: 'test-product-123', quantity: 2, item_price: 49.90 }
  ]
});

// Test 6: Product View Event
console.log('6. Testing Product View Event...');
trackViewContent({
  content_id: 'test-product-123',
  content_name: 'Test Product',
  content_type: 'product',
  value: 49.90,
  currency: 'CHF'
});

console.log('\n✅ All analytics events triggered!');
console.log('📊 Check Vercel Analytics dashboard in 5-10 minutes for results.');
