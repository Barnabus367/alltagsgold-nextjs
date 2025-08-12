import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false, // we need raw body for HMAC verification when coming from Shopify
  },
};

// Set NEXT_REVALIDATE_SECRET in your environment
const secret = process.env.NEXT_REVALIDATE_SECRET;

// simple in-memory dedupe to avoid stampedes
const recent = new Map<string, number>();
const DEDUPE_TTL_MS = 5000;

function isDuplicate(key: string) {
  const now = Date.now();
  const ts = recent.get(key) || 0;
  if (now - ts < DEDUPE_TTL_MS) return true;
  recent.set(key, now);
  return false;
}

function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(typeof c === 'string' ? Buffer.from(c) : c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifyShopifyHmac(rawBody: Buffer, header: string | string[] | undefined, secret: string | undefined) {
  if (!header || !secret) return false;
  const received = Array.isArray(header) ? header[0] : header;
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(digest));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  // Allow either query param secret or Authorization: Bearer <secret>
  const authHeader = req.headers['authorization'];
  const bearer = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;

  if (!secret || (req.query.secret !== secret && bearer !== secret)) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    const rawBody = await getRawBody(req);
    // Parse JSON body safely
    let parsed: any = {};
    try { parsed = JSON.parse(rawBody.toString('utf8') || '{}'); } catch {}

    // Initial values if caller posts minimal body { type, handle }
    let { type, handle } = parsed || {};

    // If missing, infer from native Shopify webhook
    // Topic examples: 'products/create', 'products/update', 'products/delete', 'collections/update', ...
    const shopifyTopic = (req.headers['x-shopify-topic'] as string | undefined) || '';
    const body: any = parsed || {};

    // Optional HMAC verification for Shopify (set SHOPIFY_WEBHOOK_SECRET)
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
    const hmacHeader = req.headers['x-shopify-hmac-sha256'];
    const hmacOk = verifyShopifyHmac(rawBody, hmacHeader, webhookSecret);
    if (shopifyTopic && webhookSecret && !hmacOk) {
      return res.status(401).json({ message: 'Invalid HMAC' });
    }

    // Try common handle locations in Shopify payloads
    const inferredHandle = handle
      || body?.handle
      || body?.product?.handle
      || body?.collection?.handle;

    if (!type) {
      if (shopifyTopic.startsWith('products/')) type = 'product';
      if (shopifyTopic.startsWith('collections/')) type = 'collection';
    }

    if (!handle && inferredHandle) {
      handle = inferredHandle;
    }

  // Always revalidate overview pages
  const paths: string[] = ['/products', '/collections'];

    if (type === 'product' && handle) {
      paths.push(`/products/${handle}`);
    }
    if (type === 'collection' && handle) {
      paths.push(`/collections/${handle}`);
    }

    // De-duplicate
    const unique = Array.from(new Set(paths));

    // Dedupe stampede
    const key = `${type || 'unknown'}:${handle || 'unknown'}:${shopifyTopic}`;
    if (isDuplicate(key)) {
      return res.json({ revalidated: false, duplicate: true, paths: unique });
    }

    // Warm-up GET for create events to generate page before first hit
    const isCreate = shopifyTopic.endsWith('/create');
    const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
    if (isCreate && baseUrl) {
      const warm = type === 'product' && handle ? `${baseUrl}/products/${handle}`
        : type === 'collection' && handle ? `${baseUrl}/collections/${handle}`
        : undefined;
      if (warm) {
        try {
          await fetch(warm, { method: 'GET', headers: { 'user-agent': 'revalidate-warmup' } as any });
        } catch {}
      }
    }

    await Promise.all(unique.map((p) => res.revalidate(p)));
    return res.json({
      revalidated: true,
      topic: shopifyTopic || undefined,
      inferred: { type, handle },
      paths: unique
    });
  } catch (err: any) {
    return res.status(500).json({ message: err?.message || 'Revalidate failed' });
  }
}
