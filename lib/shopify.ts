import { ShopifyProduct, ShopifyCollection, ShopifyCart, CartItem, ShopifyBlogPost, ShopifyBlog } from '@/types/shopify';

// Fix für vertauschte Umgebungsvariablen
const SHOPIFY_STORE_DOMAIN = 'yxwc4d-2f.myshopify.com';
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = '6cee47c83316d9e619313231aedf5861';

const STOREFRONT_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;

async function shopifyFetch(query: string, variables: Record<string, any> = {}) {
  if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error('SHOPIFY_CONFIG_MISSING');
  }

  try {
    const response = await fetch(STOREFRONT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Shopify API error: ${response.status} ${response.statusText}`);
      }
      throw new Error('SHOPIFY_API_ERROR');
    }

    const { data, errors } = await response.json();
    
    if (errors) {
      if (process.env.NODE_ENV === 'development') {
        console.error('GraphQL errors:', errors);
      }
      throw new Error('SHOPIFY_GRAPHQL_ERROR');
    }

    return data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Shopify fetch error:', error);
      console.error('API URL:', STOREFRONT_API_URL);
      console.error('Domain:', SHOPIFY_STORE_DOMAIN);
      console.error('Token length:', SHOPIFY_STOREFRONT_ACCESS_TOKEN?.length || 0);
    }
    throw error;
  }
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
