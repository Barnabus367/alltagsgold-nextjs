// SOFORTIGER FIX: Direkte Cloudinary Upload URLs für bekannte Produkte
export function getProductCloudinaryUrl(productId: string, imageIndex: number = 0, preset: string = 'product'): string {
  const transform = preset === 'product' ? 'c_pad,w_400,h_400,ar_1:1,b_white,q_90,f_webp' : 
                   preset === 'thumbnail' ? 'c_pad,w_150,h_150,ar_1:1,b_white,q_85,f_webp' :
                   preset === 'productZoom' ? 'c_pad,w_800,h_800,ar_1:1,b_white,q_95,f_webp' : 
                   'c_pad,w_400,h_400,ar_1:1,b_white,q_90,f_webp';

  // Generiere Cloudinary Upload URL für hochgeladene Produkte
  const publicId = `shopify-products/product_${productId}_image_${imageIndex}`;
  
  return `https://res.cloudinary.com/do7yh4dll/image/upload/${transform}/alltagsgold/products/${publicId}.jpg`;
}

// Test für bekanntes Produkt
const testProductId = '10107584119127';
console.log('Expected URL:', getProductCloudinaryUrl(testProductId, 0, 'product'));
// Sollte generieren: https://res.cloudinary.com/do7yh4dll/image/upload/c_pad,w_400,h_400,ar_1:1,b_white,q_90,f_webp/alltagsgold/products/shopify-products/product_10107584119127_image_0.jpg
