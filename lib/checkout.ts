import { ShopifyCart } from '@/types/shopify';

export interface CheckoutItem {
  variantId: string;
  quantity: number;
}

/**
 * Generates a Shopify checkout URL with cart items
 * Format: https://checkout.alltagsgold.ch/cart/VARIANTID1:QUANTITY1,VARIANTID2:QUANTITY2
 */
export function generateCheckoutUrl(cart: ShopifyCart | null): string {
  const baseUrl = 'https://checkout.alltagsgold.ch/cart/';
  
  if (!cart || !cart.lines.edges.length) {
    throw new Error('Warenkorb ist leer');
  }

  // Extract variant IDs and quantities from cart
  const cartItems: CheckoutItem[] = cart.lines.edges.map(({ node }) => ({
    variantId: extractVariantId(node.merchandise.id),
    quantity: node.quantity
  }));

  // Remove duplicates and combine quantities if needed
  const consolidatedItems = consolidateCartItems(cartItems);

  // Build checkout URL
  const cartParams = consolidatedItems
    .map(item => `${item.variantId}:${item.quantity}`)
    .join(',');

  return `${baseUrl}${cartParams}`;
}

/**
 * Extracts numeric variant ID from Shopify GraphQL ID
 * Converts "gid://shopify/ProductVariant/12345" to "12345"
 */
function extractVariantId(shopifyId: string): string {
  const match = shopifyId.match(/\/(\d+)$/);
  if (!match) {
    throw new Error(`Invalid Shopify variant ID format: ${shopifyId}`);
  }
  return match[1];
}

/**
 * Consolidates duplicate variant IDs by combining quantities
 */
function consolidateCartItems(items: CheckoutItem[]): CheckoutItem[] {
  const itemMap = new Map<string, number>();
  
  items.forEach(item => {
    const existingQuantity = itemMap.get(item.variantId) || 0;
    itemMap.set(item.variantId, existingQuantity + item.quantity);
  });
  
  return Array.from(itemMap.entries()).map(([variantId, quantity]) => ({
    variantId,
    quantity
  }));
}

/**
 * Validates checkout URL format
 */
export function validateCheckoutUrl(url: string): boolean {
  const pattern = /^https:\/\/checkout\.alltagsgold\.ch\/cart\/(\d+:\d+)(,\d+:\d+)*$/;
  return pattern.test(url);
}

/**
 * Redirects to Shopify checkout with loading state
 */
export function redirectToCheckout(checkoutUrl: string): void {
  // Validate URL before redirect
  if (!validateCheckoutUrl(checkoutUrl)) {
    throw new Error('Ungültige Checkout-URL generiert');
  }
  
  // Open in same window
  window.location.href = checkoutUrl;
}