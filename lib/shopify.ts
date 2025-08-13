import { ShopifyProduct, ShopifyCollection, ShopifyCart, CartItem, ShopifyBlogPost, ShopifyBlog } from '@/types/shopify';

// Fix für vertauschte Umgebungsvariablen
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'yxwc4d-2f.myshopify.com';
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '6cee47c83316d9e619313231aedf5861';

const STOREFRONT_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;

// Hilfsfunktion für Retry mit Exponential Backoff
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// Kleine, interne In-Memory-Response-Cache (stale-while-revalidate)
type CacheEntry = { ts: number; data: any };
const RESPONSE_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = parseInt(process.env.SHOPIFY_CACHE_TTL_MS || '120000', 10); // 2min

function getOperationName(query: string): string {
  const m = query.match(/\b(query|mutation)\s+([A-Za-z0-9_]+)/);
  return m?.[2] || 'anonymous';
}

function getCacheKey(query: string, variables: Record<string, any>): string {
  const op = getOperationName(query);
  // Nur stabile Variablen ins Key aufnehmen
  const vars = JSON.stringify(variables ?? {});
  return `${op}:${vars}`;
}

function getCachedData(query: string, variables: Record<string, any>): any | undefined {
  const key = getCacheKey(query, variables);
  const hit = RESPONSE_CACHE.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.ts <= CACHE_TTL_MS) return hit.data; // frisch
  return hit.data; // stale okay (SWr)
}

function setCachedData(query: string, variables: Record<string, any>, data: any) {
  const key = getCacheKey(query, variables);
  RESPONSE_CACHE.set(key, { ts: Date.now(), data });
}

async function shopifyFetch(query: string, variables: Record<string, any> = {}, maxRetries: number = 3) {
  if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error('SHOPIFY_CONFIG_MISSING');
  }

  let lastError: Error | null = null;
  const opName = getOperationName(query);
  const baseTimeout = parseInt(process.env.SHOPIFY_TIMEOUT_MS || '3500', 10); // Basis-Timeout pro Versuch
  
  // Retry-Logik mit Exponential Backoff
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Per-Versuch Timeout anpassen (z. B. 3.5s, 5s, 7s)
      const timeoutMs = Math.min(baseTimeout * (1 + attempt * 0.5), 8000);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(STOREFRONT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const status = response.status;
        // 429/5xx als retry-würdig behandeln
        const err = new Error(`SHOPIFY_API_ERROR_${status}`);
        // Bei 4xx (außer 429) direkt abbrechen
        if (status >= 400 && status < 500 && status !== 429) {
          throw err;
        }
        // Sonst in den catch-Block -> Retry
        throw err;
      }

      const { data, errors } = await response.json();
      
      if (errors) {
        // GraphQL errors sind nicht retry-würdig
        throw new Error('SHOPIFY_GRAPHQL_ERROR');
      }

      // Erfolg: im Cache ablegen
      try { setCachedData(query, variables, data); } catch {}
      return data;
    } catch (error) {
      lastError = error as Error;
      const isAbort = (lastError as any)?.name === 'AbortError';
      
      // Keine Retries für GraphQL-Fehler oder Config-Fehler
      if (lastError.message === 'SHOPIFY_GRAPHQL_ERROR' || 
          lastError.message === 'SHOPIFY_CONFIG_MISSING') {
        throw lastError;
      }
      
      // Wenn noch Versuche übrig sind
      if (attempt < maxRetries - 1) {
        // Leicht längeres Backoff, Timeout-Fehler bevorzugt schnell retryen
        const delay = isAbort ? 200 : Math.min(300 * Math.pow(2, attempt), 1200); // 300ms, 600ms, 1200ms
        const jitter = Math.random() * 100; // 0-100ms Jitter
        
        // Nur während Build loggen
        if (process.env.NODE_ENV !== 'production' || process.env.CI) {
          console.warn(`⚠️ Shopify API Retry ${attempt + 1}/${maxRetries} in ${delay}ms [${opName}]`);
        }
        
        await sleep(delay + jitter);
        continue;
      }
    }
  }
  
  // Nach allen Versuchen fehlgeschlagen
  throw new Error(`Shopify API nicht erreichbar nach ${maxRetries} Versuchen: ${lastError?.message}`);
}

export async function getProducts(first: number = 250, after?: string): Promise<{ products: ShopifyProduct[]; hasNextPage: boolean; endCursor?: string }> {
  const query = `
    query getProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            description
            descriptionHtml
            handle
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            tags
            collections(first: 5) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { first, after });
  
  return {
    products: data.products.edges.map((edge: any) => edge.node),
    hasNextPage: data.products.pageInfo.hasNextPage,
    endCursor: data.products.pageInfo.endCursor,
  };
}

// SSG-compatible function to get all product handles for getStaticPaths
export async function getAllProductHandles(): Promise<string[]> {
  const query = `
    query getAllProductHandles {
      products(first: 250) {
        edges {
          node {
            handle
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch(query);
    return data.products.edges.map((edge: any) => edge.node.handle);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching product handles:', error);
    }
    return [];
  }
}

export async function getProductsOptimized(first: number = 250): Promise<{ products: ShopifyProduct[] }> {
  const query = `
    query getProductsOptimized($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
            collections(first: 5) {
              edges {
                node {
                  handle
                  title
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch(query, { first });
    const products = data.products.edges.map((edge: any) => edge.node);
    return { products };
  } catch (error) {
    // Netzwerk-/Timeout-Fehler: auf zuletzt bekannte (stale) Daten zurückfallen, wenn vorhanden
    const cached = getCachedData(query, { first });
    if (cached?.products?.edges?.length) {
      if (process.env.NODE_ENV !== 'production' || process.env.CI) {
        console.warn(`↩️ Verwende stale Cache für getProductsOptimized(first=${first})`);
      }
      try {
        const products = cached.products.edges.map((edge: any) => edge.node);
        return { products };
      } catch {}
    }
    console.error('Error fetching optimized products:', error);
    return { products: [] };
  }
}

// SSG-compatible function to get all collection handles for getStaticPaths
export async function getAllCollectionHandles(): Promise<string[]> {
  const query = `
    query getAllCollectionHandles {
      collections(first: 100) {
        edges {
          node {
            handle
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch(query);
    return data.collections.edges.map((edge: any) => edge.node.handle);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching collection handles:', error);
    }
    return [];
  }
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const query = `
    query getProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        description
        descriptionHtml
        handle
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              image {
                url
                altText
              }
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        tags
        collections(first: 5) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { handle });
  return data.productByHandle;
}

export async function getCollections(first: number = 20): Promise<ShopifyCollection[]> {
  const query = `
    query getCollections($first: Int!) {
      collections(first: $first, sortKey: TITLE) {
        edges {
          node {
            id
            title
            description
            handle
            image {
              url
              altText
            }
            products(first: 20) {
              edges {
                node {
                  id
                  title
                  handle
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { first });
  return data.collections.edges.map((edge: any) => edge.node);
}

export async function getCollectionByHandle(handle: string): Promise<ShopifyCollection | null> {
  const query = `
    query getCollectionByHandle($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        title
        description
        handle
        image {
          url
          altText
        }
        products(first: 50) {
          edges {
            node {
              id
              title
              description
              descriptionHtml
              handle
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              compareAtPriceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              tags
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { handle });
  return data.collectionByHandle;
}

export async function createCart(): Promise<ShopifyCart> {
  const query = `
    mutation cartCreate {
      cartCreate {
        cart {
          id
          lines(first: 10) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      title
                      handle
                      featuredImage {
                        url
                        altText
                      }
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
                estimatedCost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
          estimatedCost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query);
  return data.cartCreate.cart;
}

export async function addToCart(cartId: string, items: CartItem[]): Promise<ShopifyCart> {
  const query = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      title
                      handle
                      featuredImage {
                        url
                        altText
                      }
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
                estimatedCost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
          estimatedCost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `;

  const lines = items.map(item => ({
    merchandiseId: item.variantId,
    quantity: item.quantity,
  }));

  const data = await shopifyFetch(query, { cartId, lines });
  return data.cartLinesAdd.cart;
}

export async function updateCartLines(cartId: string, lines: Array<{ id: string; quantity: number }>): Promise<ShopifyCart> {
  const query = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      title
                      handle
                      featuredImage {
                        url
                        altText
                      }
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
                estimatedCost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
          estimatedCost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { cartId, lines });
  return data.cartLinesUpdate.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<ShopifyCart> {
  const query = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      title
                      handle
                      featuredImage {
                        url
                        altText
                      }
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
                estimatedCost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
          estimatedCost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { cartId, lineIds });
  return data.cartLinesRemove.cart;
}

export async function getCart(cartId: string): Promise<ShopifyCart> {
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                  price {
                    amount
                    currencyCode
                  }
                }
              }
              estimatedCost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
        estimatedCost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { cartId });
  return data.cart;
}

export function formatPrice(amount: string, currencyCode: string = 'CHF'): string {
  const price = parseFloat(amount);
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: currencyCode,
  }).format(price);
}

// Schweizer 5-Rappen-Rundung für Gesamtsummen
export function roundToSwissFrancs(amount: number): number {
  // Auf nächste 5 Rappen runden (0.05 CHF)
  return Math.round(amount * 20) / 20;
}

// Formatierung mit Schweizer Rundung
export function formatSwissPrice(amount: number, currencyCode: string = 'CHF'): string {
  const roundedAmount = roundToSwissFrancs(amount);
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: currencyCode,
  }).format(roundedAmount);
}

// Blog API Functions
export async function getBlogPosts(first: number = 50): Promise<ShopifyBlogPost[]> {
  const query = `
    query getBlogPosts($first: Int!) {
      blogs(first: 10) {
        edges {
          node {
            id
            handle
            title
            articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
              edges {
                node {
                  id
                  title
                  handle
                  content
                  contentHtml
                  excerpt
                  publishedAt
                  createdAt
                  updatedAt
                  tags
                  image {
                    url
                    altText
                    width
                    height
                  }
                  seo {
                    title
                    description
                  }
                  blog {
                    id
                    handle
                    title
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { first });
  
  // Flatten articles from all blogs
  const allPosts: ShopifyBlogPost[] = [];
  data.blogs.edges.forEach((blogEdge: any) => {
    blogEdge.node.articles.edges.forEach((articleEdge: any) => {
      allPosts.push(articleEdge.node);
    });
  });

  return allPosts;
}

export async function getBlogPostByHandle(handle: string): Promise<ShopifyBlogPost | null> {
  const query = `
    query getBlogPostByHandle($handle: String!) {
      blogs(first: 10) {
        edges {
          node {
            articles(first: 250) {
              edges {
                node {
                  id
                  title
                  handle
                  content
                  contentHtml
                  excerpt
                  publishedAt
                  createdAt
                  updatedAt
                  tags
                  image {
                    url
                    altText
                    width
                    height
                  }
                  seo {
                    title
                    description
                  }
                  blog {
                    id
                    handle
                    title
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { handle });
  
  // Find the article with matching handle across all blogs
  for (const blogEdge of data.blogs.edges) {
    for (const articleEdge of blogEdge.node.articles.edges) {
      if (articleEdge.node.handle === handle) {
        return articleEdge.node;
      }
    }
  }

  return null;
}

export async function getBlogs(): Promise<ShopifyBlog[]> {
  const query = `
    query getBlogs {
      blogs(first: 10) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query);
  return data.blogs.edges.map((edge: any) => edge.node);
}
