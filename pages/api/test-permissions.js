// Test Collections API access
export default async function handler(req, res) {
  const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  console.log('🔍 Testing Collections API access...');
  
  try {
    // Test Collections API
    const collectionsResponse = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2023-10/collections.json?limit=5`, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📂 Collections API Status: ${collectionsResponse.status}`);
    
    if (!collectionsResponse.ok) {
      console.log(`❌ Collections API Error: ${collectionsResponse.status} - ${collectionsResponse.statusText}`);
    } else {
      const collectionsData = await collectionsResponse.json();
      console.log(`✅ Collections API Success: Found ${collectionsData.collections?.length || 0} collections`);
    }

    // Test Pages API
    const pagesResponse = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2023-10/pages.json?limit=5`, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📄 Pages API Status: ${pagesResponse.status}`);
    
    if (!pagesResponse.ok) {
      console.log(`❌ Pages API Error: ${pagesResponse.status} - ${pagesResponse.statusText}`);
    } else {
      const pagesData = await pagesResponse.json();
      console.log(`✅ Pages API Success: Found ${pagesData.pages?.length || 0} pages`);
    }

    // Test Blog Articles API
    const blogsResponse = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2023-10/blogs.json?limit=5`, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📝 Blogs API Status: ${blogsResponse.status}`);
    
    if (!blogsResponse.ok) {
      console.log(`❌ Blogs API Error: ${blogsResponse.status} - ${blogsResponse.statusText}`);
    } else {
      const blogsData = await blogsResponse.json();
      console.log(`✅ Blogs API Success: Found ${blogsData.blogs?.length || 0} blogs`);
    }

    res.json({
      success: true,
      results: {
        collections: {
          status: collectionsResponse.status,
          success: collectionsResponse.ok,
          count: collectionsResponse.ok ? (await collectionsResponse.json()).collections?.length : 0
        },
        pages: {
          status: pagesResponse.status,
          success: pagesResponse.ok,
          count: pagesResponse.ok ? (await pagesResponse.json()).pages?.length : 0
        },
        blogs: {
          status: blogsResponse.status,
          success: blogsResponse.ok,
          count: blogsResponse.ok ? (await blogsResponse.json()).blogs?.length : 0
        }
      }
    });

  } catch (error) {
    console.error('🚨 API Test Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
