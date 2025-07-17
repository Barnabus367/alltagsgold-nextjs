import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const SHOPIFY_STORE_DOMAIN = 'yxwc4d-2f.myshopify.com';
  const SHOPIFY_STOREFRONT_ACCESS_TOKEN = '6cee47c83316d9e619313231aedf5861';
  
  console.log('Environment check:');
  console.log('Domain:', SHOPIFY_STORE_DOMAIN);
  console.log('Token length:', SHOPIFY_STOREFRONT_ACCESS_TOKEN?.length || 0);
  
  const apiUrl = `https://${SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: `{
          shop {
            name
          }
          products(first: 3) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
        }`
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    res.status(200).json({
      success: true,
      config: {
        domain: SHOPIFY_STORE_DOMAIN,
        apiUrl: apiUrl,
        tokenPresent: !!SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        tokenLength: SHOPIFY_STOREFRONT_ACCESS_TOKEN?.length || 0
      },
      shopifyResponse: data
    });
  } catch (error) {
    console.error('Shopify test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      config: {
        domain: SHOPIFY_STORE_DOMAIN,
        apiUrl: apiUrl,
        tokenPresent: !!SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        tokenLength: SHOPIFY_STOREFRONT_ACCESS_TOKEN?.length || 0
      }
    });
  }
}