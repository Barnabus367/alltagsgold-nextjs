#!/usr/bin/env node

/**
 * Script to update collections data from Shopify API
 * This will fetch the latest collection data including images
 */

const fs = require('fs');
const path = require('path');

// Shopify configuration
const SHOPIFY_STORE_DOMAIN = 'yxwc4d-2f.myshopify.com';
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = '6cee47c83316d9e619313231aedf5861';
const STOREFRONT_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;

async function shopifyFetch(query, variables = {}) {
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
      console.error('GraphQL errors:', errors);
      throw new Error('SHOPIFY_GRAPHQL_ERROR');
    }

    return data;
  } catch (error) {
    console.error('Shopify fetch error:', error);
    throw error;
  }
}

async function updateCollections() {
  console.log('🔄 Fetching collections from Shopify...');

  const query = `
    query getCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            description
            descriptionHtml
            handle
            image {
              src: url
              altText
              width
              height
            }
            seo {
              title
              description
            }
            updatedAt
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch(query, { first: 250 });
    const collections = data.collections.edges.map(edge => edge.node);

    console.log(`✅ Fetched ${collections.length} collections`);

    // Check how many have images
    const collectionsWithImages = collections.filter(c => c.image);
    const collectionsWithoutImages = collections.filter(c => !c.image);

    console.log(`📸 Collections with images: ${collectionsWithImages.length}`);
    console.log(`❌ Collections without images: ${collectionsWithoutImages.length}`);

    if (collectionsWithoutImages.length > 0) {
      console.log('\nCollections without images:');
      collectionsWithoutImages.forEach(c => {
        console.log(`  - ${c.title} (${c.handle})`);
      });
    }

    if (collectionsWithImages.length > 0) {
      console.log('\nCollections with images:');
      collectionsWithImages.forEach(c => {
        console.log(`  - ${c.title} (${c.handle}) -> ${c.image.src}`);
      });
    }

    // Write to file
    const dataPath = path.join(__dirname, '..', 'data', 'collections.json');
    fs.writeFileSync(dataPath, JSON.stringify(collections, null, 2));

    console.log(`\n💾 Updated collections data saved to: ${dataPath}`);
    console.log(`🎉 Collections update completed successfully!`);

    // Update timestamp
    const updateLogPath = path.join(__dirname, '..', 'data', 'update-log.json');
    const updateLog = {
      collections: {
        lastUpdated: new Date().toISOString(),
        totalCollections: collections.length,
        collectionsWithImages: collectionsWithImages.length,
        collectionsWithoutImages: collectionsWithoutImages.length
      }
    };
    fs.writeFileSync(updateLogPath, JSON.stringify(updateLog, null, 2));

  } catch (error) {
    console.error('❌ Error updating collections:', error);
    process.exit(1);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  // For older Node.js versions, you might need to install node-fetch
  console.error('❌ fetch is not available. Please use Node.js 18+ or install node-fetch');
  process.exit(1);
}

updateCollections();
