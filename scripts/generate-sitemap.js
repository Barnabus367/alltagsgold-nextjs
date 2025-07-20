#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local manually
function loadEnvLocal() {
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

// Environment variables (same as Shopify lib)
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// Debug environment variables
console.log('🔍 Environment variables:');
console.log('STORE_DOMAIN:', SHOPIFY_STORE_DOMAIN);
console.log('ACCESS_TOKEN:', SHOPIFY_STOREFRONT_ACCESS_TOKEN ? '***set***' : 'missing');

/**
 * Shopify API fetch function (compatible with lib/shopify.ts)
 */
async function shopifyFetch(query, variables = {}) {
  if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN || !SHOPIFY_STORE_DOMAIN) {
    console.warn('⚠️  Shopify credentials missing - generating sitemap without products/collections');
    return null;
  }

  const STOREFRONT_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;

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
      throw new Error(`GraphQL errors: ${JSON.stringify(errors)}`);
    }

    return data;
  } catch (error) {
    console.warn(`⚠️  Shopify API error: ${error.message}`);
    return null;
  }
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
    
    const products = data.products.edges.map(edge => edge.node);
    allProducts = allProducts.concat(products);
    
    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  console.log(`✅ Fetched ${allProducts.length} products from Shopify`);
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
  
  const collections = data.collections.edges.map(edge => edge.node);
  console.log(`✅ Fetched ${collections.length} collections from Shopify`);
  return collections;
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
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/products', changefreq: 'daily', priority: '0.8' },
    { url: '/collections', changefreq: 'weekly', priority: '0.8' },
    { url: '/contact', changefreq: 'monthly', priority: '0.6' },
    { url: '/impressum', changefreq: 'yearly', priority: '0.3' },
    { url: '/datenschutz', changefreq: 'yearly', priority: '0.3' },
    { url: '/agb', changefreq: 'yearly', priority: '0.3' }
  ];

  return staticPages.map(page => 
    createUrlEntry(`${SITE_URL}${page.url}`, CURRENT_DATE, page.changefreq, page.priority)
  );
}

/**
 * Get blog pages
 */
function getBlogPages() {
  const blogPages = [
    { url: '/blog', changefreq: 'daily', priority: '0.7' }
  ];

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
      'weekly',
      '0.9',
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
      'weekly',
      '0.7'
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
