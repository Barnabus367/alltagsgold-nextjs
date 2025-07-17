import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCart, addToCart, updateCartLines, removeFromCart, getCart } from '@/lib/shopify';
import { ShopifyCart, CartItem } from '@/types/shopify';

const CART_ID_KEY = 'shopify_cart_id';

export function useCart() {
  const [cartId, setCartId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CART_ID_KEY);
    }
    return null;
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddToCartOverlayOpen, setIsAddToCartOverlayOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<any>(null);
  const queryClient = useQueryClient();

  // Get cart data
  const { data: cart, isLoading: isCartLoading, error: cartError } = useQuery({
    queryKey: ['cart', cartId],
    queryFn: () => cartId ? getCart(cartId) : null,
    enabled: !!cartId,
    staleTime: 1000, // 1 second
  });

  // Create cart mutation
  const createCartMutation = useMutation({
    mutationFn: createCart,
    onSuccess: (newCart) => {
      setCartId(newCart.id);
      localStorage.setItem(CART_ID_KEY, newCart.id);
      queryClient.setQueryData(['cart', newCart.id], newCart);
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: ({ cartId, items }: { cartId: string; items: CartItem[] }) =>
      addToCart(cartId, items),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', cartId], updatedCart);
    },
  });

  // Update cart lines mutation
  const updateCartMutation = useMutation({
    mutationFn: ({ cartId, lines }: { cartId: string; lines: Array<{ id: string; quantity: number }> }) =>
      updateCartLines(cartId, lines),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', cartId], updatedCart);
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: ({ cartId, lineIds }: { cartId: string; lineIds: string[] }) =>
      removeFromCart(cartId, lineIds),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', cartId], updatedCart);
    },
  });

  // Initialize cart if it doesn't exist
  useEffect(() => {
    if (!cartId && !createCartMutation.isPending) {
      createCartMutation.mutate();
    }
  }, [cartId, createCartMutation]);

  // Cart actions
  const addItemToCart = useCallback(async (variantId: string, quantity: number = 1, productData?: any) => {
    try {
      // Check if item already exists in cart
      const existingItem = cart?.lines.edges.find(edge => 
        edge.node.merchandise.id === variantId
      );

      if (existingItem) {
        // Update existing item quantity
        await updateCartMutation.mutateAsync({
          cartId: cartId!,
          lines: [{ id: existingItem.node.id, quantity: existingItem.node.quantity + quantity }],
        });
      } else {
        // Add new item
        if (!cartId) {
          // Create cart first
          const newCart = await createCartMutation.mutateAsync();
          await addToCartMutation.mutateAsync({
            cartId: newCart.id,
            items: [{ id: variantId, merchandiseId: variantId, variantId, quantity }],
          });
        } else {
          await addToCartMutation.mutateAsync({
            cartId,
            items: [{ id: variantId, merchandiseId: variantId, variantId, quantity }],
          });
        }
      }

      // Set last added item for overlay
      if (productData) {
        setLastAddedItem({ ...productData, variantId, quantity });
        setIsAddToCartOverlayOpen(true);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }, [cartId, cart, addToCartMutation, createCartMutation, updateCartMutation]);

  const updateItemQuantity = useCallback((lineId: string, quantity: number) => {
    if (!cartId) return;
    updateCartMutation.mutate({
      cartId,
      lines: [{ id: lineId, quantity }],
    });
  }, [cartId, updateCartMutation]);

  const removeItem = useCallback((lineId: string) => {
    if (!cartId) return;
    removeFromCartMutation.mutate({
      cartId,
      lineIds: [lineId],
    });
  }, [cartId, removeFromCartMutation]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);
  
  const openAddToCartOverlay = useCallback(() => setIsAddToCartOverlayOpen(true), []);
  const closeAddToCartOverlay = useCallback(() => setIsAddToCartOverlayOpen(false), []);
  const openCartFromOverlay = useCallback(() => {
    setIsAddToCartOverlayOpen(false);
    setIsCartOpen(true);
  }, []);

  // Calculate cart totals
  const cartItemCount = cart?.lines.edges.reduce((total, edge) => total + edge.node.quantity, 0) || 0;
  const cartTotal = cart?.estimatedCost.totalAmount.amount || '0';
  const cartSubtotal = cart?.estimatedCost.subtotalAmount.amount || '0';

  return {
    cart,
    cartId,
    isCartLoading,
    cartError,
    isCartOpen,
    isAddToCartOverlayOpen,
    lastAddedItem,
    cartItemCount,
    cartTotal,
    cartSubtotal,
    addItemToCart,
    updateItemQuantity,
    removeItem,
    openCart,
    closeCart,
    toggleCart,
    openAddToCartOverlay,
    closeAddToCartOverlay,
    openCartFromOverlay,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
  };
}
