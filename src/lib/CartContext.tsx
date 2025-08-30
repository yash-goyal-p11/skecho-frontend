import { createContext, useContext, useEffect, useState } from 'react';
import { fetchCart, addToCart, updateCartItem, removeCartItem } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cart, CartItem } from '@/lib/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { getAuth } from 'firebase/auth';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    quantity: number;
    seller: {
      user: {
        name: string;
      }
    }
  }
}

interface Cart {
  id: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: Error | null;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const auth = getAuth();

  const getAuthHeaders = async () => {
    const token = await auth.currentUser?.getIdToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const queryClient = useQueryClient();
  const tokenPromise = async () => await auth.currentUser?.getIdToken();

  const { data: cart, isLoading, error } = useQuery<Cart | null>({
    queryKey: ['cart', user?.uid],
    queryFn: async () => {
      if (!user) return null;
      const token = await tokenPromise();
      return fetchCart(token);
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string, quantity?: number }) => {
      const token = await tokenPromise();
      return addToCart(token, productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.uid] });
      toast.success('Added to cart');
    },
    onError: (err: any) => {
      toast.error('Failed to add to cart');
      // setError(err as Error); // This line was removed as per the edit hint
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string, quantity: number }) => {
      const token = await tokenPromise();
      return updateCartItem(token, itemId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.uid] });
    },
    onError: (err: any) => {
      // setError(err as Error); // This line was removed as per the edit hint
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const token = await tokenPromise();
      return removeCartItem(token, itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.uid] });
    },
    onError: (err: any) => {
      // setError(err as Error); // This line was removed as per the edit hint
    },
  });

  const addToCartHandler = (productId: string, quantity: number = 1) => addToCartMutation.mutate({ productId, quantity });
  const updateQuantityHandler = (itemId: string, quantity: number) => updateQuantityMutation.mutate({ itemId, quantity });
  const removeFromCartHandler = (itemId: string) => removeFromCartMutation.mutate(itemId);

  const clearCart = async () => {
    try {
      // setIsLoading(true); // This line was removed as per the edit hint
      const config = await getAuthHeaders();
      // await axios.delete('http://40.81.226.49/api/cart', config); // This line was removed as per the edit hint
      // await fetchCart(); // Refresh cart data // This line was removed as per the edit hint
      toast.success('Cart cleared');
    } catch (err) {
      console.error('Error clearing cart:', err);
      toast.error('Failed to clear cart');
      // setError(err as Error); // This line was removed as per the edit hint
    } finally {
      // setIsLoading(false); // This line was removed as per the edit hint
    }
  };

  const isInCart = (productId: string) => {
    return cart?.items.some(item => item.product.id === productId) ?? false;
  };

  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addToCart: addToCartHandler,
        removeFromCart: removeFromCartHandler,
        updateQuantity: updateQuantityHandler,
        clearCart,
        isInCart,
        totalItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 