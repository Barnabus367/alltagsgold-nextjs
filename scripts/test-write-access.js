require('dotenv').config({ path: '.env.local' });

const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN;

async function testWriteAccess() {
  console.log('🔐 Teste Write-Access mit aktuellem Token...');
  console.log(`Token: ${SHOPIFY_ADMIN_TOKEN.substring(0, 15)}...`);
  
  try {
    // Hole ein Test-Produkt
    const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products.json?limit=1`, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    const testProduct = data.products[0];
    
    console.log(`\n📝 Test-Produkt: ${testProduct.title}`);
    console.log(`ID: ${testProduct.id}`);
    
    // Versuche minimale Änderung (füge nur ein Leerzeichen hinzu)
    const testUpdate = testProduct.body_html + ' ';
    
    console.log('\n🔄 Versuche minimale Test-Änderung...');
    
    const updateResponse = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products/${testProduct.id}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product: {
          id: testProduct.id,
          body_html: testUpdate
        }
      })
    });
    
    const updateResult = await updateResponse.text();
    
    if (!updateResponse.ok) {
      console.log('❌ Write-Access fehlgeschlagen:');
      console.log(`Status: ${updateResponse.status}`);
      console.log(`Response: ${updateResult}`);
      
      // Parse error details
      try {
        const errorData = JSON.parse(updateResult);
        if (errorData.errors) {
          console.log('\n📋 Fehler-Details:');
          console.log(errorData.errors);
        }
      } catch (e) {
        // Not JSON
      }
    } else {
      console.log('✅ Write-Access funktioniert!');
      
      // Revert change
      await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products/${testProduct.id}.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product: {
            id: testProduct.id,
            body_html: testProduct.body_html
          }
        })
      });
      console.log('✅ Test-Änderung rückgängig gemacht');
    }
    
  } catch (error) {
    console.error('❌ Fehler:', error.message);
  }
}

testWriteAccess();