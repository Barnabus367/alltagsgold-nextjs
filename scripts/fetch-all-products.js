const fetch = require('node-fetch');
const fs = require('fs');

async function fetchAllProducts() {
  const shopifyUrl = 'https://yxwc4d-2f.myshopify.com/admin/api/2024-01/products.json';
  const token = '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';
  
  let allProducts = [];
  let hasNextPage = true;
  let pageInfo = null;
  let currentUrl = `${shopifyUrl}?limit=250`;
  
  while (hasNextPage) {
    try {
      const response = await fetch(pageInfo ? `${shopifyUrl}?page_info=${pageInfo}&limit=250` : currentUrl, {
        headers: {
          'X-Shopify-Access-Token': token
        }
      });
      
      const linkHeader = response.headers.get('link');
      const data = await response.json();
      
      if (data.products) {
        allProducts = allProducts.concat(data.products);
        console.log(`Fetched ${allProducts.length} products so far...`);
      }
      
      // Check for next page
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const matches = linkHeader.match(/<[^>]+page_info=([^&>]+)[^>]*>; rel="next"/);
        pageInfo = matches ? matches[1] : null;
        hasNextPage = pageInfo !== null;
      } else {
        hasNextPage = false;
      }
      
    } catch (error) {
      console.error('Error fetching products:', error);
      hasNextPage = false;
    }
  }
  
  // Save to file
  fs.writeFileSync('./data/all-products-raw.json', JSON.stringify(allProducts, null, 2));
  console.log(`✅ Total products fetched: ${allProducts.length}`);
  
  // Create simplified version for SEO generation
  const simplifiedProducts = allProducts.map(p => ({
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.body_html?.replace(/<[^>]*>/g, '').substring(0, 500),
    vendor: p.vendor,
    product_type: p.product_type,
    tags: p.tags,
    price: p.variants?.[0]?.price,
    image: p.images?.[0]?.src
  }));
  
  fs.writeFileSync('./data/products-simplified.json', JSON.stringify(simplifiedProducts, null, 2));
  
  return simplifiedProducts;
}

fetchAllProducts();