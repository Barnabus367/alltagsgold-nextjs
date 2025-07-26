import { ShopifyMoney, ShopifyProductVariant } from '@/types/shopify';

/**
 * Runtime Type Guards für sichere Shopify-Datenverarbeitung
 */

export function isValidPrice(price: any): price is { amount: number; currencyCode: string } {
  if (!price || typeof price !== 'object') return false;
  return typeof price.amount === 'number' && 
         price.amount >= 0 && 
         typeof price.currencyCode === 'string' && 
         price.currencyCode.length > 0;
}

export const isValidVariant = (variant: any): variant is ShopifyProductVariant => {
  return (
    variant &&
    typeof variant === 'object' &&
    typeof variant.id === 'string' &&
    isValidPrice(variant.price) &&
    typeof variant.availableForSale === 'boolean'
  );
};

export const isValidMerchandise = (merchandise: any): boolean => {
  return (
    merchandise &&
    typeof merchandise === 'object' &&
    isValidPrice(merchandise.price) &&
    merchandise.product &&
    typeof merchandise.product.title === 'string'
  );
};

/**
 * Sichere Price Formatter mit Fallbacks
 */
export function formatPriceSafe(price: any, options?: { 
  locale?: string; 
  fallback?: string 
}): string {
  try {
    if (!isValidPrice(price)) {
      console.warn('Invalid price data:', price);
      return options?.fallback || '–';
    }
    
    // Since isValidPrice confirms amount is a number, use it directly
    const amount = price.amount;
    const currency = price.currencyCode;
    const locale = options?.locale || 'de-CH';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting price:', error);
    return options?.fallback || '–';
  }
}

/**
 * Sichere Numeric Price Extraktion
 */
export const getPriceAmountSafe = (price: unknown, fallback: number = 0): number => {
  if (!isValidPrice(price)) {
    return fallback;
  }
  
  // Since isValidPrice confirms amount is a number, use it directly
  const amount = price.amount;
  return isNaN(amount) ? fallback : amount;
};

/**
 * Product Validation für Components
 */
export const hasValidPrimaryVariant = (product: any): boolean => {
  if (!product || typeof product !== 'object') return false;
  return (
    product &&
    product.variants &&
    product.variants.edges &&
    product.variants.edges.length > 0 &&
    isValidVariant(product.variants.edges[0]?.node)
  );
};
