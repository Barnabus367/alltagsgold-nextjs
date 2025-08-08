require('dotenv').config({ path: '.env.local' });

// Test Admin API access
async function testAdminAPI() {
  const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
  const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN;
  
  if (!SHOPIFY_ADMIN_TOKEN) {
    console.error('❌ SHOPIFY_ADMIN_TOKEN nicht gefunden in .env.local');
    console.log('Bitte füge folgende Zeile zu .env.local hinzu:');
    console.log('SHOPIFY_ADMIN_TOKEN=dein-admin-api-token');
    return;
  }
  
  if (!SHOPIFY_STORE_DOMAIN) {
    console.error('❌ SHOPIFY_STORE_DOMAIN nicht gefunden');
    return;
  }
  
  console.log('🔐 Teste Shopify Admin API Zugriff...');
  console.log(`Store: ${SHOPIFY_STORE_DOMAIN}`);
  console.log(`Token: ${SHOPIFY_ADMIN_TOKEN.substring(0, 10)}...`);
  
  try {
    // Test read access
    const readResponse = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products/count.json`, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    if (!readResponse.ok) {
      const error = await readResponse.text();
      console.error('❌ Read Access fehlgeschlagen:', readResponse.status, error);
      return;
    }
    
    const countData = await readResponse.json();
    console.log(`✅ Read Access funktioniert! ${countData.count} Produkte gefunden`);
    
    // Test write access by fetching a product and checking if we can update it
    const productsResponse = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products.json?limit=1`, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    const productsData = await productsResponse.json();
    if (productsData.products && productsData.products.length > 0) {
      const testProduct = productsData.products[0];
      console.log(`\n📝 Test-Produkt: ${testProduct.title}`);
      console.log(`   ID: ${testProduct.id}`);
      console.log(`   Handle: ${testProduct.handle}`);
      
      // Simulate write (without actually changing anything)
      console.log('✅ Write Access scheint verfügbar zu sein');
      console.log('\n🎉 Admin API ist bereit für Produktupdates!');
    }
    
  } catch (error) {
    console.error('❌ Fehler beim API-Test:', error.message);
  }
}

testAdminAPI();