#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local manually (only in local development)
function loadEnvLocal() {
  // Skip in production/CI environments
  if (process.env.CI || process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return;
  }
  
  const envPath = path.join(__dirname, '../.env.local');
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, value] = trimmed.split('=', 2);
        if (key && value) {
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    console.warn('⚠️  Could not load .env.local:', error.message);
  }
}

loadEnvLocal();

// Node.js 18+ fetch polyfill
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Configuration
const SITE_URL = 'https://www.alltagsgold.ch';
const PUBLIC_DIR = path.join(__dirname, '../public');
const CURRENT_DATE = new Date().toISOString().split('T')[0];

// SEO-optimierte Prioritäten und Update-Frequenzen
const SITEMAP_CONFIG = {
  pages: {
    '/': { priority: 1.0, changefreq: 'daily' },
    '/collections': { priority: 0.9, changefreq: 'daily' },
    '/products': { priority: 0.8, changefreq: 'daily' },
    '/ueber-uns': { priority: 0.7, changefreq: 'monthly' },
    '/blog': { priority: 0.7, changefreq: 'weekly' },
    '/contact': { priority: 0.6, changefreq: 'monthly' },
    '/impressum': { priority: 0.3, changefreq: 'yearly' },
    '/datenschutz': { priority: 0.3, changefreq: 'yearly' },
    '/agb': { priority: 0.3, changefreq: 'yearly' }
  },
  products: { priority: 0.8, changefreq: 'weekly' },
  collections: { priority: 0.9, changefreq: 'weekly' },
  blog: { priority: 0.6, changefreq: 'weekly' }
};

// Environment variables (same as Shopify lib)
// Try multiple sources: process.env, .env.local, and hardcoded fallbacks
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 
                             process.env.SHOPIFY_STORE_DOMAIN || 
                             'yxwc4d-2f.myshopify.com';
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || 
                                       process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
                                       '6cee47c83316d9e619313231aedf5861';

// Debug environment variables
console.log('🔍 Environment variables:');
console.log('STORE_DOMAIN:', SHOPIFY_STORE_DOMAIN);
console.log('ACCESS_TOKEN:', SHOPIFY_STOREFRONT_ACCESS_TOKEN ? '***set***' : 'missing');

/**
 * Sleep helper for retry logic
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Shopify API fetch function with retry logic (compatible with lib/shopify.ts)
 */
async function shopifyFetch(query, variables = {}, maxRetries = 3) {
  if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN || !SHOPIFY_STORE_DOMAIN) {
    console.warn('⚠️  Shopify credentials missing - generating sitemap without products/collections');
    return null;
  }

  const STOREFRONT_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(STOREFRONT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }

      const { data, errors } = await response.json();
      
      if (errors) {
        // GraphQL errors sind nicht retry-würdig
        console.warn(`⚠️  Shopify GraphQL error: ${JSON.stringify(errors)}`);
        return null;
      }

      return data;
    } catch (error) {
      lastError = error;
      
      // Bei Netzwerkfehlern retry mit Backoff
      if (attempt < maxRetries - 1) {
        const delay = Math.min(250 * Math.pow(2, attempt), 1000); // 250ms, 500ms, 1000ms
        const jitter = Math.random() * 100; // 0-100ms Jitter
        console.warn(`⚠️  Shopify API Retry ${attempt + 1}/${maxRetries} nach ${delay}ms - ${variables.after ? 'pagination' : 'initial fetch'}`);
        await sleep(delay + jitter);
      }
    }
  }
  
  console.error(`❌ Shopify API nicht erreichbar nach ${maxRetries} Versuchen: ${lastError?.message}`);
  return null;
}

/**
 * Fetch all products from Shopify API
 */
async function fetchShopifyProducts() {
  const query = `
    query getAllProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            handle
            title
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            updatedAt
          }
        }
      }
    }
  `;

  let allProducts = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage && allProducts.length < 250) { // Limit to 250 products
    const data = await shopifyFetch(query, { first: 50, after: cursor });
    
    if (!data) break;
    
    // Filtere nur Produkte mit vollständigen Daten (synchron mit SSG)
    const products = data.products.edges
      .map(edge => edge.node)
      .filter(product => {
        // Validierung identisch mit getStaticPaths
        const hasValidData = product.handle && 
                            product.title && 
                            product.images?.edges?.length > 0;
        
        if (!hasValidData) {
          console.warn(`⚠️  Sitemap: Überspringe Produkt ohne vollständige Daten: ${product.handle || 'unknown'}`);
        }
        
        return hasValidData;
      });
    
    allProducts = allProducts.concat(products);
    
    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  console.log(`✅ Fetched ${allProducts.length} valide Produkte von Shopify`);
  return allProducts;
}

/**
 * Fetch all collections from Shopify API
 */
async function fetchShopifyCollections() {
  const query = `
    query getAllCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            handle
            title
            updatedAt
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { first: 100 });
  
  if (!data) return [];
  
  // Filtere nur Collections mit validen Daten
  const allCollections = data.collections.edges.map(edge => edge.node);
  const validCollections = allCollections.filter(collection => {
    const hasValidData = collection.handle && collection.title;
    
    if (!hasValidData) {
      console.warn(`⚠️  Sitemap: Überspringe Collection ohne Daten: ${collection.handle || 'unknown'}`);
      return false;
    }
    
    return true;
  });
  
  const skippedCount = allCollections.length - validCollections.length;
  console.log(`✅ Fetched ${validCollections.length} Collections von Shopify${skippedCount > 0 ? ` (${skippedCount} übersprungen)` : ''}`);
  return validCollections;
}

// Sitemap file paths
const SITEMAP_INDEX = path.join(PUBLIC_DIR, 'sitemap-index.xml');
const SITEMAP_PAGES = path.join(PUBLIC_DIR, 'sitemap-pages.xml');
const SITEMAP_COLLECTIONS = path.join(PUBLIC_DIR, 'sitemap-collections.xml');
const SITEMAP_PRODUCTS = path.join(PUBLIC_DIR, 'sitemap-products.xml');
const SITEMAP_BLOG = path.join(PUBLIC_DIR, 'sitemap-blog.xml');


/**
 * Generate XML-safe content
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Create URL entry for sitemap
 */
function createUrlEntry(loc, lastmod = CURRENT_DATE, changefreq = 'monthly', priority = '0.5', images = []) {
  let imageXml = '';
  if (images.length > 0) {
    imageXml = images.map(img => `
    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
      ${img.title ? `<image:title>${escapeXml(img.title)}</image:title>` : ''}
    </image:image>`).join('');
  }
  
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${imageXml}
  </url>`;
}

/**
 * Create sitemap index entry
 */
function createSitemapEntry(loc, lastmod = CURRENT_DATE) {
  return `  <sitemap>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
}

/**
 * Generate XML headers
 */
function generateXmlHeader(includeImages = false) {
  const imageNamespace = includeImages ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNamespace}>`;
}

function generateIndexHeader() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
}

/**
 * Get static pages
 */
function getStaticPages() {
  const staticPages = Object.entries(SITEMAP_CONFIG.pages).map(([url, config]) => ({
    url,
    changefreq: config.changefreq,
    priority: config.priority.toString()
  }));

  return staticPages.map(page => 
    createUrlEntry(`${SITE_URL}${page.url}`, CURRENT_DATE, page.changefreq, page.priority)
  );
}

/**
 * Get blog pages including all blog posts
 */
function getBlogPages() {
  // Import blog posts data
  let blogPosts = [];
  try {
    // Import TypeScript blog post data
    const { getAllBlogPosts } = require('../data/blog-posts');
    blogPosts = getAllBlogPosts();
    
    console.log(`✅ Found ${blogPosts.length} blog posts`);
  } catch (error) {
    console.warn('⚠️  Could not load blog posts - trying TypeScript compilation');
    
    // Fallback: Try to compile TypeScript files first
    try {
      const { execSync } = require('child_process');
      execSync('npx tsc data/blog-posts.ts data/blog-posts-phase*.ts --module commonjs --target es2015 --outDir .temp-blog-data', { stdio: 'ignore' });
      
      const { getAllBlogPosts } = require('../.temp-blog-data/blog-posts');
      blogPosts = getAllBlogPosts();
      
      console.log(`✅ Found ${blogPosts.length} blog posts after TypeScript compilation`);
      
      // Clean up temp files
      execSync('rm -rf .temp-blog-data', { stdio: 'ignore' });
    } catch (compileError) {
      console.warn('⚠️  Could not compile TypeScript blog posts:', compileError.message);
    }
  }

  const blogConfig = SITEMAP_CONFIG.blog;
  const blogPages = [
    { url: '/blog', changefreq: blogConfig.changefreq, priority: blogConfig.priority.toString() }
  ];
  
  // Add all blog post URLs
  blogPosts.forEach(post => {
    if (post.slug) {
      blogPages.push({
        url: `/blog/${post.slug}`,
        changefreq: 'monthly',
        priority: '0.7'
      });
    }
  });

  return blogPages.map(page => 
    createUrlEntry(`${SITE_URL}${page.url}`, CURRENT_DATE, page.changefreq, page.priority)
  );
}

/**
 * Convert Shopify products to sitemap entries
 */
function convertProductsToSitemapEntries(products) {
  return products.map(product => {
    const images = [];
    
    if (product.images?.edges?.[0]) {
      images.push({
        url: product.images.edges[0].node.url,
        title: product.images.edges[0].node.altText || product.title
      });
    }
    
    const lastmod = product.updatedAt ? product.updatedAt.split('T')[0] : CURRENT_DATE;
    
    return createUrlEntry(
      `${SITE_URL}/products/${product.handle}`,
      lastmod,
      SITEMAP_CONFIG.products.changefreq,
      SITEMAP_CONFIG.products.priority.toString(),
      images
    );
  });
}

/**
 * Convert Shopify collections to sitemap entries
 */
function convertCollectionsToSitemapEntries(collections) {
  return collections.map(collection => {
    const lastmod = collection.updatedAt ? collection.updatedAt.split('T')[0] : CURRENT_DATE;
    
    return createUrlEntry(
      `${SITE_URL}/collections/${collection.handle}`,
      lastmod,
      SITEMAP_CONFIG.collections.changefreq,
      SITEMAP_CONFIG.collections.priority.toString()
    );
  });
}

/**
 * Write sitemap to file
 */
function writeSitemap(filePath, urls, includeImages = false) {
  const xml = `${generateXmlHeader(includeImages)}
${urls.join('\n')}
</urlset>`;
  
  fs.writeFileSync(filePath, xml, 'utf8');
  return urls.length;
}

/**
 * Main sitemap generation function
 */
async function generateSitemaps() {
  console.log('🗺️  Generating multi-part sitemap with live Shopify data...');
  
  // Ensure public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  
  // Fetch live data from Shopify
  const [products, collections] = await Promise.all([
    fetchShopifyProducts(),
    fetchShopifyCollections()
  ]);
  
  // Generate sitemap entries
  const staticPages = getStaticPages();
  const blogPages = getBlogPages();
  const productEntries = convertProductsToSitemapEntries(products);
  const collectionEntries = convertCollectionsToSitemapEntries(collections);
  
  // Write individual sitemaps
  const pageCount = writeSitemap(path.join(PUBLIC_DIR, 'sitemap-pages.xml'), staticPages);
  const blogCount = writeSitemap(path.join(PUBLIC_DIR, 'sitemap-blog.xml'), blogPages);
  const collectionCount = writeSitemap(path.join(PUBLIC_DIR, 'sitemap-collections.xml'), collectionEntries);
  const productCount = writeSitemap(path.join(PUBLIC_DIR, 'sitemap-products.xml'), productEntries, true);
  
  // Generate sitemap index
  const indexEntries = [
    createSitemapEntry(`${SITE_URL}/sitemap-pages.xml`),
    createSitemapEntry(`${SITE_URL}/sitemap-blog.xml`),
    createSitemapEntry(`${SITE_URL}/sitemap-collections.xml`),
    createSitemapEntry(`${SITE_URL}/sitemap-products.xml`)
  ];
  
  const indexXml = `${generateIndexHeader()}
${indexEntries.join('\n')}
</sitemapindex>`;
  
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), indexXml, 'utf8');
  
  const totalUrls = pageCount + blogCount + collectionCount + productCount;
  
  console.log(`✅ Multi-part sitemap with live Shopify data generated!`);
  console.log(`📊 URLs included: ${totalUrls} total`);
  console.log(`   - Static pages: ${pageCount} (sitemap-pages.xml)`);
  console.log(`   - Blog pages: ${blogCount} (sitemap-blog.xml)`);
  console.log(`   - Collections: ${collectionCount} (sitemap-collections.xml)`);
  console.log(`   - Products: ${productCount} (sitemap-products.xml) with images`);
  
  return totalUrls;
}

/**
 * Update robots.txt to reference sitemap-index.xml (Option 1)
 */
function updateRobotsTxt() {
  const robotsPath = path.join(PUBLIC_DIR, 'robots.txt');
  const sitemapUrl = `${SITE_URL}/sitemap.xml`; // Points to our index
  
  const robotsContent = `User-agent: *
Allow: /
Sitemap: ${sitemapUrl}`;

  fs.writeFileSync(robotsPath, robotsContent, 'utf8');
  
  console.log(`🤖 Updated robots.txt`);
  console.log(`   📄 Sitemap URL: ${sitemapUrl}`);
  console.log(`   ✅ Points to sitemap index (sitemap.xml → sitemapindex)`);
  console.log(`   ✅ Vercel will rename to sitemap-index.xml automatically`);
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      const urlCount = await generateSitemaps();
      updateRobotsTxt();
      
      console.log(`\n🚀 Shopify-powered sitemap generation complete!`);
      console.log(`   Generated ${urlCount} URLs across 4 sitemaps`);
      console.log(`   🛍️  Live products and collections included`);
      console.log(`   🖼️  Product images included for enhanced SEO`);
      console.log(`   📋 Vercel will handle sitemap-index.xml naming`);
      console.log(`   Ready for Google Search Console submission`);
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error generating sitemaps:', error);
      process.exit(1);
    }
  })();
}

module.exports = { generateSitemaps, updateRobotsTxt };
