// Vereinfachtes Shopify-Cloudinary Sync System basierend auf shopify-product.ts
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

// Cloudinary-Konfiguration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'do7yh4dll',
  api_key: process.env.CLOUDINARY_API_KEY || '594974357421936',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'HzFguz2h0acwmXf8-YNnbXA-3hI'
});

// Shopify Admin API Setup
const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'yxwc4d-2f.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || '';

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  images: Array<{
    id: number;
    src: string;
    alt: string | null;
    position: number;
  }>;
  created_at: string;
  updated_at: string;
}

/**
 * Check if image already exists in Cloudinary
 */
async function checkImageExists(productId: string, imageIndex: number): Promise<boolean> {
  try {
    const publicId = `alltagsgold/products/shopify-products/product_${productId}_image_${imageIndex}`;
    await cloudinary.api.resource(publicId);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Upload image to Cloudinary using Direct Upload API
 */
async function uploadToCloudinary(
  imageUrl: string, 
  productId: string, 
  imageIndex: number,
  productTitle: string,
  imageAlt?: string
): Promise<any> {
  try {
    const publicId = `shopify-products/product_${productId}_image_${imageIndex}`;
    
    // Check if image already exists
    const exists = await checkImageExists(productId, imageIndex);
    if (exists) {
      console.log(`⏭️  Skipping existing image: ${publicId}`);
      return { secure_url: `https://res.cloudinary.com/do7yh4dll/image/upload/alltagsgold/products/${publicId}`, skipped: true };
    }
    
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      folder: 'alltagsgold/products',
      tags: ['shopify', 'product', 'auto-upload'],
      transformation: [
        { width: 1200, height: 1200, crop: 'pad', background: 'white' },
        { quality: 'auto', format: 'webp' }
      ],
      overwrite: false, // Changed to false to avoid overwriting existing images
      context: `alt=${encodeURIComponent(imageAlt || productTitle)}|product=${encodeURIComponent(productTitle)}`
    });
    
    return result;
  } catch (error) {
    console.error(`❌ Upload failed for ${imageUrl}:`, error);
    throw error;
  }
}

/**
 * Get all Shopify products with pagination
 */
async function getAllShopifyProducts(): Promise<ShopifyProduct[]> {
  let allProducts: ShopifyProduct[] = [];
  let hasNextPage = true;
  let pageInfo = '';
  
  while (hasNextPage) {
    const url = pageInfo 
      ? `https://${SHOPIFY_DOMAIN}/admin/api/2023-10/products.json?limit=50&page_info=${pageInfo}`
      : `https://${SHOPIFY_DOMAIN}/admin/api/2023-10/products.json?limit=50`;
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }
    
    const data = await response.json();
    allProducts = allProducts.concat(data.products);
    
    // Check for more pages via Link Header
    const linkHeader = response.headers.get('link');
    if (linkHeader && linkHeader.includes('rel="next"')) {
      const nextMatch = linkHeader.match(/<[^>]*[?&]page_info=([^&>]+)[^>]*>;\s*rel="next"/);
      if (nextMatch) {
        pageInfo = nextMatch[1];
        console.log(`📄 Loading next page... (${allProducts.length} products so far)`);
        // Rate limiting between API calls
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        hasNextPage = false;
      }
    } else {
      hasNextPage = false;
    }
  }
  
  console.log(`📦 Total products found: ${allProducts.length}`);
  return allProducts;
}

/**
 * Process product images and upload to Cloudinary
 */
async function processProductImages(
  product: ShopifyProduct,
  logCallback?: (message: string) => void
): Promise<{ uploaded: number; skipped: number; failed: number; results: any[] }> {
  const log = (message: string) => {
    console.log(message);
    if (logCallback) logCallback(message);
  };

  const results: any[] = [];
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  log(`🔄 Processing ${product.images.length} images for: ${product.title}`);

  // Filter and sort images by position
  const sortedImages = product.images
    .filter(img => img.src.includes('cdn.shopify.com'))
    .sort((a, b) => a.position - b.position);

  for (let i = 0; i < sortedImages.length; i++) {
    const image = sortedImages[i];
    
    try {
      log(`🔍 Checking image ${i + 1}/${sortedImages.length}: ${image.src}`);
      
      const uploadResult = await uploadToCloudinary(
        image.src, 
        product.id.toString(),
        i,
        product.title,
        image.alt || undefined
      );
      
      if (uploadResult.skipped) {
        results.push({
          original: image.src,
          cloudinary: uploadResult.secure_url,
          success: true,
          skipped: true
        });
        skipped++;
        log(`⏭️  Skipped existing image: ${uploadResult.secure_url}`);
      } else {
        results.push({
          original: image.src,
          cloudinary: uploadResult.secure_url,
          success: true,
          skipped: false
        });
        uploaded++;
        log(`✅ Uploaded new image: ${uploadResult.secure_url}`);
      }
      
      // Rate limiting to avoid hitting Cloudinary limits
      await new Promise(resolve => setTimeout(resolve, 200)); // Reduced delay for skipped images
      
    } catch (error) {
      log(`❌ Failed to process ${image.src}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      results.push({
        original: image.src,
        cloudinary: '',
        success: false,
        skipped: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      failed++;
    }
  }

  return { uploaded, skipped, failed, results };
}

/**
 * Main sync function
 */
export async function syncShopifyProductsToCloudinary(logCallback?: (message: string) => void) {
  const log = (message: string) => {
    console.log(message);
    if (logCallback) logCallback(message);
  };

  try {
    log('🚀 Starting Shopify Products → Cloudinary sync...');
    
    // Get all products
    const products = await getAllShopifyProducts();
    log(`📦 Found ${products.length} products to process`);
    
    let totalUploaded = 0;
    let totalSkipped = 0;
    let totalFailed = 0;
    let processedProducts = 0;
    
    for (const product of products) {
      processedProducts++;
      log(`\n🔄 Processing product ${processedProducts}/${products.length}: ${product.title}`);
      
      if (product.images && product.images.length > 0) {
        const results = await processProductImages(product, logCallback);
        totalUploaded += results.uploaded;
        totalSkipped += results.skipped;
        totalFailed += results.failed;
        
        log(`✅ Product completed: ${results.uploaded} uploaded, ${results.skipped} skipped, ${results.failed} failed`);
      } else {
        log(`⚠️  No images found for product: ${product.title}`);
      }
      
      // Progress update every 10 products
      if (processedProducts % 10 === 0) {
        log(`📊 Progress: ${processedProducts}/${products.length} products, ${totalUploaded} new images uploaded, ${totalSkipped} skipped`);
      }
    }
    
    const summary = {
      totalProducts: products.length,
      processedProducts,
      totalUploaded,
      totalSkipped,
      totalFailed,
      success: true
    };
    
    log(`\n🎉 Sync completed! ${totalUploaded} new images uploaded, ${totalSkipped} existing images skipped, ${totalFailed} failed`);
    return summary;
    
  } catch (error) {
    const errorMsg = `❌ Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    log(errorMsg);
    throw error;
  }
}

// Legacy function for backward compatibility
export async function syncShopifyToCloudinary(logCallback?: (message: string) => void) {
  return await syncShopifyProductsToCloudinary(logCallback);
}
