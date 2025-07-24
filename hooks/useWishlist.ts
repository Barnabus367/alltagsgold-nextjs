import { useState, useEffect, useCallback } from 'react';
import { ShopifyProduct } from '@/types/shopify';

interface WishlistItem {
  id: string;
  product: ShopifyProduct;
  addedAt: string;
}

interface UseWishlistReturn {
  wishlistItems: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: ShopifyProduct) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: ShopifyProduct) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WISHLIST_STORAGE_KEY = 'alltagsgold_wishlist';

export function useWishlist(): UseWishlistReturn {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load wishlist from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsedItems = JSON.parse(stored);
        setWishlistItems(parsedItems);
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage whenever wishlist changes (nur nach Hydration)
  useEffect(() => {
    if (!isHydrated) return;
    
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  }, [wishlistItems, isHydrated]);

  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlistItems.some(item => item.product.id === productId);
  }, [wishlistItems]);

  const addToWishlist = useCallback((product: ShopifyProduct) => {
    if (isInWishlist(product.id)) return;

    const newItem: WishlistItem = {
      id: `wishlist_${Date.now()}_${Math.random()}`,
      product,
      addedAt: new Date().toISOString(),
    };

    setWishlistItems(prev => [...prev, newItem]);
  }, [isInWishlist]);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const toggleWishlist = useCallback((product: ShopifyProduct): boolean => {
    const isCurrentlyInWishlist = isInWishlist(product.id);
    
    if (isCurrentlyInWishlist) {
      removeFromWishlist(product.id);
      return false;
    } else {
      addToWishlist(product);
      return true;
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);

  return {
    wishlistItems,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    wishlistCount: wishlistItems.length,
  };
}
