import { NextApiRequest, NextApiResponse } from 'next';

// Rate Limiting: Einfache In-Memory Store (Production: Redis empfohlen)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // Requests pro Minute
const WINDOW_MS = 60 * 1000; // 1 Minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

// Server-side only Shopify API Proxy
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  console.error('⚠️ SHOPIFY_STORE_DOMAIN oder SHOPIFY_STOREFRONT_ACCESS_TOKEN fehlt in Environment Variables');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate Limiting
  const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress || 'unknown';
  const ip = Array.isArray(clientIP) ? clientIP[0] : clientIP;
  
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  const { query, variables } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'GraphQL query required' });
  }

  try {
    const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      console.error(`Shopify API error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ error: 'Shopify API error' });
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return res.status(400).json({ error: 'GraphQL error', details: data.errors });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Shopify proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}