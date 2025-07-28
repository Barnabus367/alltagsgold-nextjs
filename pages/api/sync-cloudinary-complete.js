import { syncShopifyProductsToCloudinary } from '../../lib/shopify-cloudinary-sync-simple';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set headers for streaming response
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  try {
    console.log('🚀 Starting Shopify Products → Cloudinary Sync...');
    res.write('🚀 Starting Shopify Products → Cloudinary Sync...\n');

    // Products Sync (simplified for now)
    const productResult = await syncShopifyProductsToCloudinary((message) => {
      console.log(message);
      res.write(message + '\n');
    });
    
    res.write(`✅ Products completed: ${productResult.totalUploaded} new images uploaded, ${productResult.totalSkipped} existing skipped\n`);

    // Summary
    const summary = `
🎉 Sync Completed!
📊 Summary:
  - Products processed: ${productResult.totalProducts}
  - New images uploaded: ${productResult.totalUploaded}
  - Existing images skipped: ${productResult.totalSkipped}
  - Failed uploads: ${productResult.totalFailed}
  - Total time saved by skipping: ~${(productResult.totalSkipped * 2).toFixed(1)} seconds
`;

    console.log(summary);
    res.write(summary);
    res.end();

  } catch (error) {
    const errorMsg = `❌ Complete sync failed: ${error.message}`;
    console.error(errorMsg);
    res.write(errorMsg + '\n');
    res.end();
  }
}
