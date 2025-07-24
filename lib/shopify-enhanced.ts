/**
 * Enhanced Shopify Functions mit Error Handling
 * Wrapper um bestehende shopify.ts Funktionen - SAFE und BACKWARD COMPATIBLE
 */

import { wrapShopifyFunction, safeShopifyOperation } from './shopify-error-handler';

// Import original functions (diese würden normalerweise aus der originalen shopify.ts kommen)
// Für diese Demo definieren wir die Typen
type ShopifyProduct = any;
type ShopifyCollection = any;
type ShopifyCart = any;

// Enhanced Shopify Fetch mit Error Handling
export async function enhancedShopifyFetch(
  query: string, 
  variables: Record<string, any> = {}
): Promise<any> {
  // Diese Funktion würde die originale shopifyFetch wrappen
  return safeShopifyOperation(
    async () => {
      // Original shopifyFetch würde hier aufgerufen
      const response = await fetch('/api/shopify-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables })
      });
      
      if (!response.ok) {
        throw new Error(`Shopify API Error: ${response.status}`);
      }
      
      return response.json();
    },
    { operation: 'shopify_fetch', query, variables }
  );
}

// Enhanced Product Functions
export const enhancedProductService = {
  /**
   * Get products with enhanced error handling
   */
  async getProducts(first: number = 250, after?: string): Promise<{
    products: ShopifyProduct[];
    hasNextPage: boolean;
    endCursor?: string;
    error?: string;
  }> {
    const result = await safeShopifyOperation(
      async () => {
        // Original getProducts logic würde hier stehen
        const query = `
          query getProducts($first: Int!, $after: String) {
            products(first: $first, after: $after) {
              pageInfo { hasNextPage endCursor }
              edges { node { id title handle } }
            }
          }
        `;
        
        const data = await enhancedShopifyFetch(query, { first, after });
        return {
          products: data.products.edges.map((edge: any) => edge.node),
          hasNextPage: data.products.pageInfo.hasNextPage,
          endCursor: data.products.pageInfo.endCursor
        };
      },
      { operation: 'get_products', variables: { first, after } },
      { products: [], hasNextPage: false, endCursor: undefined } // Fallback value
    );

    return {
      ...result.data!,
      error: result.error
    };
  },

  /**
   * Get product by handle with enhanced error handling
   */
  async getProductByHandle(handle: string): Promise<{
    product: ShopifyProduct | null;
    error?: string;
    fromCache?: boolean;
  }> {
    const result = await safeShopifyOperation(
      async () => {
        const query = `
          query getProductByHandle($handle: String!) {
            productByHandle(handle: $handle) {
              id title description handle
              images(first: 5) {
                edges { node { url altText } }
              }
            }
          }
        `;
        
        const data = await enhancedShopifyFetch(query, { handle });
        return data.productByHandle;
      },
      { operation: 'get_product_by_handle', variables: { handle } }
    );

    if (!result.success && result.error) {
      // Try fallback to cached data
      const cachedProduct = await this.getCachedProduct(handle);
      if (cachedProduct) {
        return {
          product: cachedProduct,
          error: result.error,
          fromCache: true
        };
      }
    }

    return {
      product: result.data || null,
      error: result.error
    };
  },

  async getCachedProduct(handle: string): Promise<ShopifyProduct | null> {
    try {
      // Simplified cache lookup
      const cached = localStorage.getItem(`product_${handle}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }
};

// Enhanced Cart Functions
export const enhancedCartService = {
  /**
   * Add item to cart with enhanced error handling
   */
  async addToCart(variantId: string, quantity: number = 1): Promise<{
    success: boolean;
    cart?: ShopifyCart;
    error?: string;
    action?: 'retry' | 'fallback' | 'show_message';
  }> {
    const result = await safeShopifyOperation(
      async () => {
        const mutation = `
          mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
              cart { id lines(first: 100) { edges { node { id quantity } } } }
              userErrors { field message }
            }
          }
        `;
        
        // Get or create cart ID
        const cartId = this.getCartId();
        const data = await enhancedShopifyFetch(mutation, {
          cartId,
          lines: [{ merchandiseId: variantId, quantity }]
        });
        
        if (data.cartLinesAdd.userErrors?.length > 0) {
          throw new Error(data.cartLinesAdd.userErrors[0].message);
        }
        
        return data.cartLinesAdd.cart;
      },
      { 
        operation: 'add_to_cart', 
        variables: { variantId, quantity } 
      }
    );

    if (!result.success) {
      // Determine recovery action based on error
      const action = this.determineCartRecoveryAction(result.error || '');
      
      return {
        success: false,
        error: result.error,
        action
      };
    }

    return {
      success: true,
      cart: result.data
    };
  },

  getCartId(): string {
    // Simplified cart ID management
    return localStorage.getItem('shopify_cart_id') || 'new';
  },

  determineCartRecoveryAction(error: string): 'retry' | 'fallback' | 'show_message' {
    const message = error.toLowerCase();
    
    if (message.includes('inventory') || message.includes('stock')) {
      return 'show_message';
    }
    
    if (message.includes('network') || message.includes('timeout')) {
      return 'retry';
    }
    
    return 'fallback';
  }
};

// Enhanced Checkout Functions
export const enhancedCheckoutService = {
  /**
   * Process checkout with enhanced error handling
   */
  async processCheckout(cartId: string): Promise<{
    success: boolean;
    checkoutUrl?: string;
    error?: string;
    action?: 'retry' | 'manual' | 'redirect';
  }> {
    const result = await safeShopifyOperation(
      async () => {
        const query = `
          query getCart($id: ID!) {
            cart(id: $id) {
              checkoutUrl
              lines(first: 100) {
                edges { node { id quantity } }
              }
            }
          }
        `;
        
        const data = await enhancedShopifyFetch(query, { id: cartId });
        
        if (!data.cart?.checkoutUrl) {
          throw new Error('Checkout URL nicht verfügbar');
        }
        
        return data.cart.checkoutUrl;
      },
      { operation: 'process_checkout', variables: { cartId } }
    );

    if (!result.success) {
      const action = this.determineCheckoutRecoveryAction(result.error || '');
      
      return {
        success: false,
        error: result.error,
        action
      };
    }

    return {
      success: true,
      checkoutUrl: result.data
    };
  },

  determineCheckoutRecoveryAction(error: string): 'retry' | 'manual' | 'redirect' {
    const message = error.toLowerCase();
    
    if (message.includes('expired') || message.includes('invalid')) {
      return 'redirect';
    }
    
    if (message.includes('network') || message.includes('temporary')) {
      return 'retry';
    }
    
    return 'manual';
  }
};

// Utility function to gradually migrate existing code
export function createEnhancedShopifyWrapper<T extends (...args: any[]) => Promise<any>>(
  originalFunction: T,
  operationName: string,
  fallbackValue?: any
): T {
  return wrapShopifyFunction(originalFunction, operationName);
}

// Export enhanced services
export {
  enhancedProductService as productService,
  enhancedCartService as cartService,
  enhancedCheckoutService as checkoutService
};
