/**
 * Shopify Performance Optimierungen
 * Erweiterte Caching und Prefetching Strategien
 */

import { ShopifyProduct, ShopifyCollection } from '../types/shopify';

// Advanced Product Cache mit LRU-ähnlichem Verhalten
class ProductCache {
  private cache = new Map<string, { data: ShopifyProduct; timestamp: number; accessCount: number }>();
  private maxSize = 100; // Max Produkte im Cache
  private ttl = 10 * 60 * 1000; // 10 Minuten TTL

  get(handle: string): ShopifyProduct | null {
    const entry = this.cache.get(handle);
    if (!entry) return null;

    // TTL Check
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(handle);
      return null;
    }

    // LRU: Access Count erhöhen
    entry.accessCount++;
    entry.timestamp = Date.now();
    return entry.data;
  }

  set(handle: string, product: ShopifyProduct): void {
    // Cache Size Management
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(handle, {
      data: product,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  private evictLeastUsed(): void {
    let leastUsed: string | null = null;
    let minAccessCount = Infinity;

    // TypeScript-kompatible Iteration
    const entries = Array.from(this.cache.entries());
    for (const [handle, entry] of entries) {
      if (entry.accessCount < minAccessCount) {
        minAccessCount = entry.accessCount;
        leastUsed = handle;
      }
    }

    if (leastUsed) {
      this.cache.delete(leastUsed);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; hitRate: number } {
    const values = Array.from(this.cache.values());
    const totalAccess = values.reduce((sum, entry) => sum + entry.accessCount, 0);
    return {
      size: this.cache.size,
      hitRate: totalAccess > 0 ? this.cache.size / totalAccess : 0,
    };
  }
}

// Collection Preload Strategy
class CollectionPreloader {
  private preloadedCollections = new Set<string>();
  
  async preloadPopularCollections(): Promise<void> {
    const popularCollections = [
      'beleuchtung',
      'kueche-haushalt', 
      'outdoor-camping',
      'technologie'
    ];

    for (const handle of popularCollections) {
      if (!this.preloadedCollections.has(handle)) {
        try {
          // Lazy import um circular dependencies zu vermeiden
          const { getCollectionByHandle } = await import('./shopify');
          await getCollectionByHandle(handle);
          this.preloadedCollections.add(handle);
        } catch (error) {
          console.warn(`Failed to preload collection: ${handle}`, error);
        }
      }
    }
  }
}

// Performance Monitoring
class ShopifyPerformanceMonitor {
  private apiCallTimes: number[] = [];
  private cacheHits = 0;
  private cacheMisses = 0;

  recordAPICall(duration: number): void {
    this.apiCallTimes.push(duration);
    // Keep nur die letzten 100 Calls
    if (this.apiCallTimes.length > 100) {
      this.apiCallTimes.shift();
    }
  }

  recordCacheHit(): void {
    this.cacheHits++;
  }

  recordCacheMiss(): void {
    this.cacheMisses++;
  }

  getPerformanceStats(): {
    avgApiTime: number;
    cacheHitRate: number;
    totalApiCalls: number;
  } {
    const avgApiTime = this.apiCallTimes.length > 0 
      ? this.apiCallTimes.reduce((a, b) => a + b, 0) / this.apiCallTimes.length 
      : 0;

    const totalCacheOperations = this.cacheHits + this.cacheMisses;
    const cacheHitRate = totalCacheOperations > 0 
      ? this.cacheHits / totalCacheOperations 
      : 0;

    return {
      avgApiTime,
      cacheHitRate,
      totalApiCalls: this.apiCallTimes.length,
    };
  }
}

// Global Instances
export const productCache = new ProductCache();
export const collectionPreloader = new CollectionPreloader();
export const performanceMonitor = new ShopifyPerformanceMonitor();

// Utility Functions
export function warmupShopifyCache(): void {
  if (typeof window === 'undefined') {
    // Server-side: Preload popular collections
    collectionPreloader.preloadPopularCollections().catch(console.error);
  }
}

export function logPerformanceStats(): void {
  if (process.env.NODE_ENV === 'development') {
    const stats = performanceMonitor.getPerformanceStats();
    const cacheStats = productCache.getStats();
    
    console.log('🚀 Shopify Performance Stats:', {
      ...stats,
      productCacheSize: cacheStats.size,
      productCacheHitRate: cacheStats.hitRate,
    });
  }
}