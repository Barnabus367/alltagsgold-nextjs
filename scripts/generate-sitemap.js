#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'https://www.alltagsgold.ch';
const PUBLIC_DIR = path.join(__dirname, '../public');
const CURRENT_DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

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
 * Generate XML header for sitemap
 */
function generateXmlHeader(includeImages = false) {
  const imageNamespace = includeImages ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNamespace}>`;
}

/**
 * Generate XML header for sitemap index
 */
function generateIndexHeader() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
}

/**
 * Get static pages from app directory structure
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
          const handle = url.replace('/products/', '');
          
          // Extract images for products with basic image URL pattern
          const images = [{
            url: `https://res.cloudinary.com/ddshn3a6o/image/upload/f_auto,q_auto,w_800/alltagsgold/${handle}`,
            title: handle.replace(/-/g, ' ')
          }];
          
          productUrls.push(createUrlEntry(`${SITE_URL}${url}`, CURRENT_DATE, 'weekly', '0.9', images));
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
                const images = product.image ? [{
                  url: product.image.url || product.image,
                  title: product.title || product.handle
                }] : [];
                products.push(createUrlEntry(`${SITE_URL}/products/${product.handle}`, CURRENT_DATE, 'weekly', '0.9', images));
              }
            });
          } else if (data.handle) {
            const images = data.image ? [{
              url: data.image.url || data.image,
              title: data.title || data.handle
            }] : [];
            products.push(createUrlEntry(`${SITE_URL}/products/${data.handle}`, CURRENT_DATE, 'weekly', '0.9', images));
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
 * Generate all sitemaps (split by content type)
 */
function generateSitemaps() {
  console.log('🗺️  Generating multi-part sitemap...');
  
  // Ensure public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  
  const staticPages = getStaticPages();
  const blogPages = getBlogPages();
  const products = getProducts();
  const collections = getCollections();
  
  // Generate individual sitemaps
  const pageCount = writeSitemap(SITEMAP_PAGES, staticPages);
  const blogCount = writeSitemap(SITEMAP_BLOG, blogPages);
  const collectionCount = writeSitemap(SITEMAP_COLLECTIONS, collections);
  const productCount = writeSitemap(SITEMAP_PRODUCTS, products, true); // Include images for products
  
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
  
  fs.writeFileSync(SITEMAP_INDEX, indexXml, 'utf8');
  
  const totalUrls = pageCount + blogCount + collectionCount + productCount;
  
  console.log(`✅ Multi-part sitemap generated successfully!`);
  console.log(`📊 URLs included: ${totalUrls} total`);
  console.log(`   - Static pages: ${pageCount} (sitemap-pages.xml)`);
  console.log(`   - Blog pages: ${blogCount} (sitemap-blog.xml)`);
  console.log(`   - Collections: ${collectionCount} (sitemap-collections.xml)`);
  console.log(`   - Products: ${productCount} (sitemap-products.xml) with images`);
  console.log(`📄 Main sitemap: ${SITEMAP_INDEX}`);
  
  return totalUrls;
}

/**
 * Update robots.txt to include sitemap reference and validate
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
  
  // Validate robots.txt content
  const lines = robotsContent.split('\n');
  const hasSitemap = lines.some(line => line.trim().startsWith('Sitemap:'));
  const hasUserAgent = lines.some(line => line.trim().startsWith('User-agent:'));
  
  console.log(`🤖 Updated robots.txt with sitemap reference`);
  console.log(`   ✅ User-agent directive: ${hasUserAgent ? 'Present' : 'Missing'}`);
  console.log(`   ✅ Sitemap directive: ${hasSitemap ? 'Present' : 'Missing'}`);
  console.log(`   📄 Sitemap URL: ${sitemapUrl}`);
  
  if (!hasSitemap || !hasUserAgent) {
    console.warn(`⚠️  robots.txt validation failed - please check manually`);
  }
}

// Main execution
if (require.main === module) {
  try {
    const urlCount = generateSitemaps();
    updateRobotsTxt();
    
    console.log(`\n🚀 Multi-part sitemap generation complete!`);
    console.log(`   Generated ${urlCount} URLs across 4 sitemaps for ${SITE_URL}`);
    console.log(`   🖼️  Product images included for enhanced SEO`);
    console.log(`   🎯 Optimized for Google crawling efficiency`);
    console.log(`   📋 Main index: sitemap.xml`);
    console.log(`   Ready for search engine indexing`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  }
}

module.exports = { generateSitemaps, updateRobotsTxt };
