/**
 * Overlay Data Structure Builder
 * Extrahiert für bessere Testbarkeit und Wiederverwendung
 */

import { formatPriceSafe, isValidPrice, isValidMerchandise } from './type-guards';

export interface OverlayMerchandise {
  id: string;
  product: {
    title: string;
    featuredImage?: {
      url: string;
      altText?: string;
    };
  };
  price: {
    amount: string;
    currencyCode: string;
  };
  title: string;
}

export interface OverlayItem {
  merchandise: OverlayMerchandise;
  quantity: number;
}

/**
 * Builds overlay item data structure from product data
 * Testable, reusable function for consistent data transformation
 */
export function buildOverlayItem(
  productData: any,
  variantId: string,
  quantity: number
): OverlayItem {
  // Defensive fallbacks for all required fields
  const merchandiseData: OverlayMerchandise = {
    id: variantId || 'unknown-variant',
    product: {
      title: productData?.title || 'Unbekanntes Produkt',
      featuredImage: productData?.featuredImage ? {
        url: productData.featuredImage.url || '',
        altText: productData.featuredImage.altText || productData?.title || 'Produktbild'
      } : undefined
    },
    price: {
      amount: productData?.price?.toString() || '0',
      currencyCode: productData?.currencyCode || 'CHF'
    },
    title: productData?.variant_title || productData?.title || 'Standard'
  };

  return {
    merchandise: merchandiseData,
    quantity: Math.max(1, quantity || 1) // Ensure minimum quantity of 1
  };
}

/**
 * Validates overlay item structure
 * Useful for testing and runtime checks
 */
export function isValidOverlayItem(item: any): item is OverlayItem {
  return (
    item &&
    typeof item === 'object' &&
    item.merchandise &&
    isValidMerchandise(item.merchandise) &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  );
}

/**
 * Creates fallback overlay item for error cases
 */
export function createFallbackOverlayItem(): OverlayItem {
  return {
    merchandise: {
      id: 'fallback-item',
      product: {
        title: 'Produkt'
      },
      price: {
        amount: '0',
        currencyCode: 'CHF'
      },
      title: 'Standard'
    },
    quantity: 1
  };
}
