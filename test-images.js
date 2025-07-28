// SOFORTIGER IMAGE TEST
const testUrls = [
  // Originale Shopify URLs
  'https://cdn.shopify.com/s/files/1/0918/4575/5223/files/913340162679.jpg?v=1750055469',
  
  // Cloudinary fetch URLs
  'https://res.cloudinary.com/do7yh4dll/image/fetch/w_800,h_600,c_fill,q_auto,f_webp/https://cdn.shopify.com/s/files/1/0918/4575/5223/files/913340162679.jpg?v=1750055469',
  
  // Current fallback
  'https://res.cloudinary.com/do7yh4dll/image/fetch/c_pad,w_800,h_800,b_auto/https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'
];

console.log('Testing image URLs:');
testUrls.forEach((url, i) => {
  console.log(`${i + 1}. ${url}`);
});

// Test mit fetch
async function testImages() {
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`✅ URL ${i + 1}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`❌ URL ${i + 1}: Error - ${error.message}`);
    }
  }
}

testImages();
