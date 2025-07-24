#!/usr/bin/env node

/**
 * Production Rich Snippets Monitoring
 * Überprüft live URLs auf Schema.org Markup
 */

const https = require('https');
const fs = require('fs');

const URLS_TO_TEST = [
  'https://www.alltagsgold.ch/',
  'https://www.alltagsgold.ch/products/mini-led-tischlampe',
  'https://www.alltagsgold.ch/products/mini-eierkocher',
  'https://www.alltagsgold.ch/collections/technik-gadgets',
  'https://www.alltagsgold.ch/collections/reinigungsgeraete'
];

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractJsonLd(html) {
  const regex = /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs;
  const matches = [];
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    try {
      matches.push(JSON.parse(match[1]));
    } catch (e) {
      console.warn('Invalid JSON-LD found');
    }
  }
  
  return matches;
}

async function monitorRichSnippets() {
  console.log('🔍 Monitoring Rich Snippets on production...\n');
  
  const results = [];
  
  for (const url of URLS_TO_TEST) {
    try {
      console.log(`Testing: ${url}`);
      const html = await fetchUrl(url);
      const schemas = extractJsonLd(html);
      
      const schemaTypes = schemas.map(s => s['@type']).filter(Boolean);
      
      results.push({
        url,
        success: true,
        schemaCount: schemas.length,
        types: schemaTypes,
        hasProduct: schemaTypes.includes('Product'),
        hasOrganization: schemaTypes.includes('Organization'),
        hasBreadcrumb: schemaTypes.includes('BreadcrumbList')
      });
      
      console.log(`  ✅ Found ${schemas.length} schemas: ${schemaTypes.join(', ')}`);
      
    } catch (error) {
      results.push({
        url,
        success: false,
        error: error.message
      });
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success);
  console.log(`✅ Successful tests: ${successful.length}/${results.length}`);
  
  const totalSchemas = successful.reduce((sum, r) => sum + r.schemaCount, 0);
  console.log(`📄 Total schemas found: ${totalSchemas}`);
  
  const productPages = successful.filter(r => r.hasProduct).length;
  console.log(`🛍️  Product pages with schema: ${productPages}`);
  
  console.log('\n🔗 Next steps:');
  console.log('1. Test URLs in Google Rich Results Test');
  console.log('2. Monitor Google Search Console for Rich Results');
  console.log('3. Check click-through rates in 1-2 weeks');
  
  // Log für Monitoring
  const logEntry = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      successful: successful.length,
      total: results.length,
      totalSchemas,
      productPages
    }
  };
  
  fs.writeFileSync('rich-snippets-monitor.json', JSON.stringify(logEntry, null, 2));
  console.log('\n📝 Results saved to rich-snippets-monitor.json');
}

monitorRichSnippets().catch(console.error);
