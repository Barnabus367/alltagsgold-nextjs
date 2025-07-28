// API Endpoint für KOMPLETTE Shopify → Cloudinary Sync (Collections, Pages, etc.)
import { NextApiRequest, NextApiResponse } from 'next';
import { syncShopifyToCloudinary } from '../../lib/shopify-cloudinary-sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Security check - nur in Development oder mit API Key
  const apiKey = req.headers['x-api-key'];
  if (process.env.NODE_ENV === 'production' && apiKey !== process.env.SYNC_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    console.log('🚀 Starting COMPLETE Shopify → Cloudinary sync via API...');
    
    const result = await syncShopifyToCloudinary();
    
    return res.status(200).json({
      success: true,
      message: 'Complete sync finished successfully',
      processed: result.processed,
      totalImages: result.uploadedCount,
      errors: result.errors,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Complete sync API error:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
