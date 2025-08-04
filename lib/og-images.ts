/**
 * Open Graph Image Configuration
 * Optimized for social media sharing
 */

import { SITE_URL } from './canonical';

export interface OGImageConfig {
  title: string;
  description?: string;
  image?: string;
  logo?: string;
}

/**
 * Generate dynamic OG image URL using Vercel OG
 */
export function generateOGImageUrl(config: OGImageConfig): string {
  // For now, return static image until we implement dynamic OG generation
  return config.image || `${SITE_URL}/og-default.jpg`;
}

/**
 * Default OG images for different page types
 */
export const DEFAULT_OG_IMAGES = {
  home: '/og-home.jpg',
  product: '/og-product.jpg',
  collection: '/og-collection.jpg',
  blog: '/og-blog.jpg',
  default: '/og-default.jpg'
};

/**
 * Get appropriate OG image for page type
 */
export function getOGImage(pageType: keyof typeof DEFAULT_OG_IMAGES, customImage?: string): string {
  if (customImage) return customImage;
  
  const image = DEFAULT_OG_IMAGES[pageType] || DEFAULT_OG_IMAGES.default;
  return `${SITE_URL}${image}`;
}