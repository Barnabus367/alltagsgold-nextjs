#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'https://www.alltagsgold.ch';
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');
const CURRENT_DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

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
function createUrlEntry(loc, lastmod = CURRENT_DATE, changefreq = 'monthly', priority = '0.5') {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * Get static pages from app directory structure
 */
function getStaticPages() {
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/products', changefreq: 'daily', priority: '0.8' },
    { url: '/collections', changefreq: 'weekly', priority: '0.8' },
    { url: '/blog', changefreq: 'daily', priority: '0.7' },
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
 * Load products from cache or generate from existing sitemap
 */
function getProducts() {
  try {
    // Try to read from existing sitemap to extract products
    const existingSitemapPath = path.join(__dirname, '../public/sitemap.xml');
    if (fs.existsSync(existingSitemapPath)) {
      const existingSitemap = fs.readFileSync(existingSitemapPath, 'utf8');
      const productUrls = [];
      
      // Extract product URLs using regex
      const productMatches = existingSitemap.match(/<loc>https:\/\/www\.alltagsgold\.ch\/products\/[^<]+<\/loc>/g);
      if (productMatches) {
        productMatches.forEach(match => {
          const url = match.replace(/<\/?loc>/g, '').replace('https://www.alltagsgold.ch', '');
          productUrls.push(createUrlEntry(`${SITE_URL}${url}`, CURRENT_DATE, 'weekly', '0.9'));
        });
      }
      
      return productUrls;
    }
    
    // Fallback: Try to read from data directory
    const dataDir = path.join(__dirname, '../data');
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir);
      const productFiles = files.filter(file => file.includes('product') && file.endsWith('.json'));
      
      const products = [];
      productFiles.forEach(file => {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
          if (Array.isArray(data)) {
            data.forEach(product => {
              if (product.handle) {
                products.push(createUrlEntry(`${SITE_URL}/products/${product.handle}`, CURRENT_DATE, 'weekly', '0.9'));
              }
            });
          } else if (data.handle) {
            products.push(createUrlEntry(`${SITE_URL}/products/${data.handle}`, CURRENT_DATE, 'weekly', '0.9'));
          }
        } catch (error) {
          console.warn(`Could not parse product file ${file}:`, error.message);
        }
      });
      
      return products;
    }
    
    return [];
  } catch (error) {
    console.warn('Could not load products:', error.message);
    return [];
  }
}

/**
 * Load collections from cache or generate from existing sitemap
 */
function getCollections() {
  try {
    // Try to read from existing sitemap to extract collections
    const existingSitemapPath = path.join(__dirname, '../public/sitemap.xml');
    if (fs.existsSync(existingSitemapPath)) {
      const existingSitemap = fs.readFileSync(existingSitemapPath, 'utf8');
      const collectionUrls = [];
      
      // Extract collection URLs using regex
      const collectionMatches = existingSitemap.match(/<loc>https:\/\/www\.alltagsgold\.ch\/collections\/[^<]+<\/loc>/g);
      if (collectionMatches) {
        collectionMatches.forEach(match => {
          const url = match.replace(/<\/?loc>/g, '').replace('https://www.alltagsgold.ch', '');
          collectionUrls.push(createUrlEntry(`${SITE_URL}${url}`, CURRENT_DATE, 'weekly', '0.7'));
        });
      }
      
      return collectionUrls;
    }
    
    // Fallback: Try to read from data directory
    const dataDir = path.join(__dirname, '../data');
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir);
      const collectionFiles = files.filter(file => file.includes('collection') && file.endsWith('.json'));
      
      const collections = [];
      collectionFiles.forEach(file => {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
          if (Array.isArray(data)) {
            data.forEach(collection => {
              if (collection.handle) {
                collections.push(createUrlEntry(`${SITE_URL}/collections/${collection.handle}`, CURRENT_DATE, 'weekly', '0.7'));
              }
            });
          } else if (data.handle) {
            collections.push(createUrlEntry(`${SITE_URL}/collections/${data.handle}`, CURRENT_DATE, 'weekly', '0.7'));
          }
        } catch (error) {
          console.warn(`Could not parse collection file ${file}:`, error.message);
        }
      });
      
      return collections;
    }
    
    return [];
  } catch (error) {
    console.warn('Could not load collections:', error.message);
    return [];
  }
}

/**
 * Generate complete sitemap XML
 */
function generateSitemap() {
  console.log('🗺️  Generating sitemap.xml...');
  
  const staticPages = getStaticPages();
  const products = getProducts();
  const collections = getCollections();
  
  const allUrls = [
    ...staticPages,
    ...collections,
    ...products
  ];
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.join('\n')}
</urlset>`;

  // Ensure public directory exists
  const publicDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write sitemap file
  fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');
  
  const urlCount = allUrls.length;
  console.log(`✅ Sitemap generated successfully!`);
  console.log(`📊 URLs included: ${urlCount} total`);
  console.log(`   - Static pages: ${staticPages.length}`);
  console.log(`   - Collections: ${collections.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`📄 Output: ${OUTPUT_FILE}`);
  
  return urlCount;
}

/**
 * Update robots.txt to include sitemap reference
 */
function updateRobotsTxt() {
  const robotsPath = path.join(__dirname, '../public/robots.txt');
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  
  let robotsContent = `User-agent: *
Allow: /
Sitemap: ${sitemapUrl}`;

  // Check if robots.txt exists and already contains sitemap
  if (fs.existsSync(robotsPath)) {
    const existingContent = fs.readFileSync(robotsPath, 'utf8');
    if (existingContent.includes('Sitemap:')) {
      // Update existing sitemap reference
      robotsContent = existingContent.replace(/Sitemap:\s*.*/g, `Sitemap: ${sitemapUrl}`);
    } else {
      // Append sitemap to existing content
      robotsContent = existingContent.trim() + `\nSitemap: ${sitemapUrl}`;
    }
  }
  
  fs.writeFileSync(robotsPath, robotsContent, 'utf8');
  console.log(`🤖 Updated robots.txt with sitemap reference`);
}

// Main execution
if (require.main === module) {
  try {
    const urlCount = generateSitemap();
    updateRobotsTxt();
    
    console.log(`\n🚀 Sitemap generation complete!`);
    console.log(`   Generated ${urlCount} URLs for ${SITE_URL}`);
    console.log(`   Ready for search engine indexing`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

module.exports = { generateSitemap, updateRobotsTxt };