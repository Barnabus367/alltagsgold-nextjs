// Cloudinary-Konfiguration Tester
import { getCloudinaryUrl } from './cloudinary';

export async function testCloudinarySetup() {
  console.log('🧪 Testing Cloudinary Setup...');
  
  // Test verschiedene URL-Typen
  const testUrls = [
    'https://cdn.shopify.com/s/files/1/0123/4567/files/test-product.jpg',
    'https://cdn.shopify.com/s/files/1/0123/4567/products/sample.png',
    'https://example.com/external-image.jpg'
  ];
  
  const results = testUrls.map(url => {
    const cloudinaryUrl = getCloudinaryUrl(url, 'product');
    return {
      original: url,
      cloudinary: cloudinaryUrl,
      isProcessed: cloudinaryUrl.includes('res.cloudinary.com')
    };
  });
  
  console.table(results);
  
  // Test fetch-capability
  const testFetchUrl = getCloudinaryUrl('https://picsum.photos/800/600', 'medium');
  console.log('🔍 Test fetch URL:', testFetchUrl);
  
  try {
    const response = await fetch(testFetchUrl, { method: 'HEAD' });
    console.log('✅ Fetch test result:', response.status, response.statusText);
    
    if (response.status === 200) {
      console.log('🎉 Cloudinary auto-upload is working!');
      return true;
    } else if (response.status === 423) {
      console.log('⚠️ Auto-upload might be disabled. Check Cloudinary settings.');
      return false;
    } else {
      console.log('❌ Unexpected response:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Fetch test failed:', error);
    return false;
  }
}

// Direkte Browser-Test Funktion
export function testCloudinaryInBrowser() {
  if (typeof window === 'undefined') return;
  
  const testImg = new Image();
  const testUrl = getCloudinaryUrl('https://picsum.photos/400/300', 'thumbnail');
  
  testImg.onload = () => {
    console.log('✅ Browser image test successful:', testUrl);
  };
  
  testImg.onerror = (error) => {
    console.log('❌ Browser image test failed:', testUrl, error);
  };
  
  testImg.src = testUrl;
}
