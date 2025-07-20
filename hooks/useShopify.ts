import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getCollections, getProductByHandle, getCollectionByHandle } from '@/lib/shopify';
import { ShopifyProduct, ShopifyCollection } from '@/types/shopify';

export function useProducts(first: number = 250, options?: { enabled?: boolean; initialData?: any }) {
  return useQuery({
    queryKey: ['products', first],
    queryFn: () => getProducts(first),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
    initialData: options?.initialData,
  });
}

export function useProduct(handle: string, options?: { enabled?: boolean; initialData?: any }) {
  return useQuery({
    queryKey: ['product', handle],
    queryFn: () => getProductByHandle(handle),
    enabled: options?.enabled !== false && !!handle,
    staleTime: 60 * 1000, // Reduced from 5 minutes to 1 minute
    refetchOnMount: true,
    initialData: options?.initialData,
  });
}

export function useCollections(options?: { enabled?: boolean; initialData?: any }) {
  return useQuery({
    queryKey: ['collections'],
    queryFn: () => getCollections(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled !== false,
    initialData: options?.initialData,
  });
}

export function useCollection(handle: string, options?: { enabled?: boolean; initialData?: any }) {
  return useQuery({
    queryKey: ['collection', handle],
    queryFn: () => getCollectionByHandle(handle),
    enabled: options?.enabled !== false && !!handle,
    staleTime: 60 * 1000, // Reduced from 5 minutes to 1 minute
    refetchOnMount: true,
    initialData: options?.initialData,
  });
}

export function useProductSearch(query: string, products: ShopifyProduct[] = []) {
  return useMemo(() => {
    if (!query.trim()) {
      return products;
    }

    return products.filter(product =>
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query, products]);
}

export function useProductFilter(products: ShopifyProduct[] = [], filters: { collection?: string; priceRange?: [number, number]; tags?: string[] } = {}) {
  return useMemo(() => {
    let filtered = [...products];

    // Filter by collection
    if (filters.collection && filters.collection !== 'all') {
      filtered = filtered.filter(product =>
        product.collections?.edges?.some((edge: any) => edge.node.handle === filters.collection)
      );
    }

    // Filter by price range
    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange;
      filtered = filtered.filter(product => {
        const price = parseFloat(product.priceRange.minVariantPrice.amount);
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(product =>
        filters.tags!.some(tag => product.tags.includes(tag))
      );
    }

    return filtered;
  }, [products, filters]);
}
