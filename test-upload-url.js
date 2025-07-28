// Test der neuen Cloudinary Upload URL Funktion
import { getCloudinaryUrl } from './lib/cloudinary-optimized.js';

const testUrl = 'https://res.cloudinary.com/do7yh4dll/image/upload/v1753735171/alltagsgold/products/shopify-products/product_10107584119127_image_0.jpg';

console.log('Original URL:', testUrl);
console.log('Transformed URL:', getCloudinaryUrl(testUrl, 'product'));

// Erwartetes Ergebnis:
// https://res.cloudinary.com/do7yh4dll/image/upload/c_pad,w_400,h_400,ar_1:1,b_white,q_90,f_webp/v1753735171/alltagsgold/products/shopify-products/product_10107584119127_image_0.jpg
