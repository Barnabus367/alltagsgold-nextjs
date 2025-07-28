// Shopify zu Cloudinary Upload-System (ORIGINAL)
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary-Konfiguration mit NEUEN funktionierenden Credentials
cloudinary.config({
  cloud_name: 'do7yh4dll', // Neuer Account Name 
  api_key: '594974357421936', // NEUE API Key
  api_secret: 'HzFguz2h0acwmXf8-YNnbXA-3hI' // NEUES API Secret
});

// Shopify Admin API Setup
const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'yxwc4d-2f.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || '';

async function getShopifyProducts() {
  let allProducts: any[] = [];
  let hasNextPage = true;
  let pageInfo = '';
  
  while (hasNextPage) {
    const url = pageInfo 
      ? `https://${SHOPIFY_DOMAIN}/admin/api/2023-10/products.json?limit=250&page_info=${pageInfo}`
      : `https://${SHOPIFY_DOMAIN}/admin/api/2023-10/products.json?limit=250`;
    
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
    
    // Check für weitere Seiten via Link Header
    const linkHeader = response.headers.get('link');
    if (linkHeader && linkHeader.includes('rel="next"')) {
      const nextMatch = linkHeader.match(/<[^>]*[?&]page_info=([^&>]+)[^>]*>;\s*rel="next"/);
      if (nextMatch) {
        pageInfo = nextMatch[1];
        console.log(`📄 Loading next page... (${allProducts.length} products so far)`);
        // Rate limiting zwischen API calls
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        hasNextPage = false;
      }
    } else {
      hasNextPage = false;
    }
  }
  
  console.log(`📦 Total products loaded: ${allProducts.length}`);
  return { products: allProducts };
}

// NEU: Hole alle Shopify Collections
async function getShopifyCollections() {
  const response = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2023-10/collections.json?limit=250`, {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Shopify Collections API error: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`📂 Found ${data.collections.length} collections`);
  return data.collections;
}

// NEU: Hole alle Shopify Pages
async function getShopifyPages() {
  const response = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2023-10/pages.json?limit=250`, {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Shopify Pages API error: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`📄 Found ${data.pages.length} pages`);
  return data.pages;
}

// NEU: Hole alle Shopify Blog Articles
async function getShopifyArticles() {
  try {
    const blogsResponse = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2023-10/blogs.json`, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    if (!blogsResponse.ok) {
      console.log('⚠️ No blogs found or access denied');
      return [];
    }
    
    const blogsData = await blogsResponse.json();
    let allArticles: any[] = [];
    
    for (const blog of blogsData.blogs) {
      const articlesResponse = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2023-10/blogs/${blog.id}/articles.json?limit=250`, {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      });
      
      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json();
        allArticles = allArticles.concat(articlesData.articles);
      }
    }
    
    console.log(`📝 Found ${allArticles.length} blog articles`);
    return allArticles;
  } catch (error) {
    console.log('⚠️ Blog articles fetch failed:', error);
    return [];
  }
}

async function uploadImageToCloudinary(imageUrl: string, publicId: string, folder: string = 'shopify-products', context?: string) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      folder: folder,
      transformation: [
        { width: 1200, height: 1200, crop: 'pad', background: 'white' },
        { quality: 'auto', format: 'webp' }
      ],
      overwrite: true
    });
    
    console.log(`✅ Uploaded ${context || 'image'}: ${imageUrl} → ${result.secure_url}`);
    return result;
  } catch (error) {
    console.error(`❌ Upload failed for ${context || 'image'} ${imageUrl}:`, error);
    throw error;
  }
}

// Erweiterte Funktion für Produkt-Uploads
async function uploadProductImage(imageUrl: string, productId: string, imageIndex: number = 0) {
  const publicId = `shopify-products/${productId}_${imageIndex}`;
  return uploadImageToCloudinary(imageUrl, publicId, 'shopify-products', `product ${productId}`);
}

// Neue Funktion für Collection-Uploads
async function uploadCollectionImage(imageUrl: string, collectionId: string) {
  const publicId = `shopify-collections/${collectionId}`;
  return uploadImageToCloudinary(imageUrl, publicId, 'shopify-collections', `collection ${collectionId}`);
}

// Neue Funktion für Page-Content Uploads
async function uploadPageContentImages(pageContent: string, pageId: string) {
  const imageUrls = extractImageUrlsFromContent(pageContent);
  const uploadPromises = imageUrls.map((url, index) => {
    const publicId = `shopify-pages/${pageId}_${index}`;
    return uploadImageToCloudinary(url, publicId, 'shopify-pages', `page ${pageId} image ${index}`);
  });
  
  return Promise.allSettled(uploadPromises);
}

// Neue Funktion für Article-Uploads  
async function uploadArticleImages(article: any) {
  const uploadPromises: Promise<any>[] = [];
  
  // Featured Image
  if (article.image?.src) {
    const publicId = `shopify-articles/${article.id}_featured`;
    uploadPromises.push(
      uploadImageToCloudinary(article.image.src, publicId, 'shopify-articles', `article ${article.id} featured`)
    );
  }
  
  // Content Images
  if (article.content) {
    const imageUrls = extractImageUrlsFromContent(article.content);
    imageUrls.forEach((url, index) => {
      const publicId = `shopify-articles/${article.id}_content_${index}`;
      uploadPromises.push(
        uploadImageToCloudinary(url, publicId, 'shopify-articles', `article ${article.id} content ${index}`)
      );
    });
  }
  
  return Promise.allSettled(uploadPromises);
}

// Hilfsfunktion zum Extrahieren von Bild-URLs aus Content
function extractImageUrlsFromContent(content: string): string[] {
  const imageUrls: string[] = [];
  const imgTagRegex = /<img[^>]+src="([^"]+)"/gi;
  let match;
  
  while ((match = imgTagRegex.exec(content)) !== null) {
    const url = match[1];
    if (url.includes('cdn.shopify.com') || url.includes('shopifycdn.com')) {
      imageUrls.push(url);
    }
  }
  
  return imageUrls;
}

export async function syncShopifyToCloudinary(logCallback?: (message: string) => void, contentType: 'products' | 'collections' | 'pages' | 'articles' = 'products') {
  const log = (message: string) => {
    console.log(message);
    if (logCallback) logCallback(message);
  };
  
  log(`🚀 Starting ${contentType} sync...`);
  
  try {
    let totalProcessed = 0;
    let totalImages = 0;
    let totalErrors = 0;

    if (contentType === 'products') {
      // SCHRITT 1: Produkte
      log('\n📦 Syncing Products...');
      const shopifyData = await getShopifyProducts();
      const products = shopifyData.products;
      
      log(`📦 Found ${products.length} products in Shopify`);
      
      for (const product of products) {
        log(`🔄 Processing product ${totalProcessed + 1}/${products.length}: ${product.title}`);
        
        if (product.images && product.images.length > 0) {
          for (let i = 0; i < product.images.length; i++) {
            const image = product.images[i];
            try {
              await uploadProductImage(image.src, product.id.toString(), i);
              totalImages++;
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
              totalErrors++;
              console.error(`❌ Failed to upload product image:`, error);
            }
          }
        }
        
        totalProcessed++;
        if (totalProcessed % 10 === 0) {
          log(`📊 Progress: ${totalProcessed}/${products.length} products, ${totalImages} images`);
        }
      }
    }

    else if (contentType === 'collections') {
      // SCHRITT 2: Collections
      log('\n📂 Syncing Collections...');
      try {
        const collections = await getShopifyCollections();
        for (const collection of collections) {
          if (collection.image?.src) {
            try {
              await uploadCollectionImage(collection.image.src, collection.id.toString());
              totalImages++;
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
              totalErrors++;
              console.error(`❌ Failed to upload collection image:`, error);
            }
          }
          totalProcessed++;
        }
        log(`✅ Collections sync completed: ${collections.length} processed`);
      } catch (error) {
        console.error('⚠️ Collections sync failed:', error);
      }
    }

    else if (contentType === 'pages') {
      // SCHRITT 3: Pages
      log('\n📄 Syncing Pages...');
      try {
        const pages = await getShopifyPages();
        for (const page of pages) {
          if (page.body_html) {
            try {
              await uploadPageContentImages(page.body_html, page.id.toString());
              await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
              totalErrors++;
              console.error(`❌ Failed to upload page images:`, error);
            }
          }
          totalProcessed++;
        }
        log(`✅ Pages sync completed: ${pages.length} processed`);
      } catch (error) {
        console.error('⚠️ Pages sync failed:', error);
      }
    }

    else if (contentType === 'articles') {
      // SCHRITT 4: Blog Articles
      log('\n📝 Syncing Blog Articles...');
      try {
        const articles = await getShopifyArticles();
        for (const article of articles) {
          try {
            await uploadArticleImages(article);
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (error) {
            totalErrors++;
            console.error(`❌ Failed to upload article images:`, error);
          }
          totalProcessed++;
        }
        log(`✅ Articles sync completed: ${articles.length} processed`);
      } catch (error) {
        console.error('⚠️ Articles sync failed:', error);
      }
    }

    const successMessage = `🎉 ${contentType} sync completed! ${totalImages} images uploaded, ${totalErrors} errors`;
    log(successMessage);
    
    return {
      success: true,
      uploadedCount: totalImages,
      errors: totalErrors,
      processed: totalProcessed
    };

  } catch (error: any) {
    const errorMessage = `❌ ${contentType} sync failed: ${error.message}`;
    log(errorMessage);
    throw error;
  }
}

// URL-Generator für bereits hochgeladene Bilder
export function getCloudinaryProductUrl(productId: string, imageIndex: number = 0, transformation?: string) {
  const publicId = `shopify-products/${productId}_${imageIndex}`;
  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'do7yh4dll'}/image/upload`;
  
  if (transformation) {
    return `${baseUrl}/${transformation}/${publicId}`;
  }
  
  return `${baseUrl}/w_800,h_800,c_pad,b_white,q_auto,f_webp/${publicId}`;
}

// NEU: URL-Generator für Collection-Bilder
export function getCloudinaryCollectionUrl(collectionId: string, transformation?: string) {
  const publicId = `shopify-collections/${collectionId}`;
  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'do7yh4dll'}/image/upload`;
  
  if (transformation) {
    return `${baseUrl}/${transformation}/${publicId}`;
  }
  
  return `${baseUrl}/w_1200,h_600,c_fill,q_auto,f_webp/${publicId}`;
}

// NEU: URL-Generator für Page-Bilder
export function getCloudinaryPageUrl(pageId: string, imageIndex: number = 0, transformation?: string) {
  const publicId = `shopify-pages/${pageId}_${imageIndex}`;
  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'do7yh4dll'}/image/upload`;
  
  if (transformation) {
    return `${baseUrl}/${transformation}/${publicId}`;
  }
  
  return `${baseUrl}/w_800,q_auto,f_webp/${publicId}`;
}

// NEU: URL-Generator für Article-Bilder  
export function getCloudinaryArticleUrl(articleId: string, type: 'featured' | 'content' = 'featured', imageIndex?: number, transformation?: string) {
  const publicId = type === 'featured' 
    ? `shopify-articles/${articleId}_featured`
    : `shopify-articles/${articleId}_content_${imageIndex}`;
    
  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'do7yh4dll'}/image/upload`;
  
  if (transformation) {
    return `${baseUrl}/${transformation}/${publicId}`;
  }
  
  return type === 'featured'
    ? `${baseUrl}/w_1200,h_600,c_fill,q_auto,f_webp/${publicId}`
    : `${baseUrl}/w_800,q_auto,f_webp/${publicId}`;
}

// Prüfe ob Bild bereits in Cloudinary existiert
export async function checkImageExists(productId: string, imageIndex: number = 0) {
  const publicId = `shopify-products/${productId}_${imageIndex}`;
  
  try {
    await cloudinary.api.resource(publicId);
    return true;
  } catch (error) {
    return false;
  }
}
