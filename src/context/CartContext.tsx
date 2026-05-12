import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartApi } from '../lib/api';
import { toast } from '../lib/toast';

export interface CartItem {
  id: string | number;
  variantId?: string;
  name: string;
  price: string;
  size: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string | number, size: string) => Promise<void>;
  updateQuantity: (id: string | number, size: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
  totalItems: number;
  isGuest: boolean;
  isSyncing: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isGuest, setIsGuest] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cart on mount
  useEffect(() => {
    const initCart = async () => {
      const token = localStorage.getItem('auth_token');

      if (token) {
        // User is authenticated - fetch cart from backend
        setIsGuest(false);
        try {
          setIsSyncing(true);
          const data = await cartApi.sync([]);

          // Transform backend cart to frontend format
          const backendCart: CartItem[] = data.cart.items.map((item: any) => ({
            id: item.product.id,
            variantId: item.variantId,
            name: item.product.name,
            price: `₹${Number(item.variant.price || item.product.basePrice).toLocaleString('en-IN')}`,
            size: item.variant.name,
            image: item.product.images[0]?.url || '',
            quantity: item.quantity,
          }));

          setCart(backendCart);
        } catch (error) {
          console.error('Failed to load cart from backend:', error);
          // Fallback to localStorage
          loadFromLocalStorage();
        } finally {
          setIsSyncing(false);
        }
      } else {
        // Guest user - load from localStorage
        setIsGuest(true);
        loadFromLocalStorage();
      }

      setIsInitialized(true);
    };

    const loadFromLocalStorage = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error('Failed to parse cart from localStorage');
        }
      }
    };

    initCart();
  }, []);

  // Save to localStorage whenever cart changes (only for guests)
  useEffect(() => {
    if (isInitialized && isGuest) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isGuest, isInitialized]);

  // Listen for auth changes (login/logout)
  useEffect(() => {
    const syncCartAfterLogin = async () => {
      if (isGuest) return;

      const localCart = [...cart];
      if (localCart.length === 0) return;

      try {
        setIsSyncing(true);
        const items = localCart.map(item => ({
          variantId: item.variantId || String(item.id),
          quantity: item.quantity,
        }));

        const data = await cartApi.sync(items);

        // Update cart with backend response
        const backendCart: CartItem[] = data.cart.items.map((item: any) => ({
          id: item.product.id,
          variantId: item.variantId,
          name: item.product.name,
          price: `₹${Number(item.variant.price || item.product.basePrice).toLocaleString('en-IN')}`,
          size: item.variant.name,
          image: item.product.images[0]?.url || '',
          quantity: item.quantity,
        }));

        setCart(backendCart);
        localStorage.removeItem('cart'); // Clear localStorage cart
      } catch (error) {
        console.error('Failed to sync cart after login:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    const handleLogin = (e: Event) => {
      setIsGuest(false);
      syncCartAfterLogin();
    };

    const handleLogout = () => {
      setIsGuest(true);
      setCart([]);
    };

    window.addEventListener('auth:login', handleLogin as EventListener);
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:login', handleLogin as EventListener);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [isGuest, cart]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const syncWithBackend = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    setIsSyncing(true);

    try {
      // Transform cart items to API format
      const items = cart.map(item => ({
        variantId: item.variantId || String(item.id),
        quantity: item.quantity,
      }));

      const data = await cartApi.sync(items);

      // Transform backend cart to frontend format
      const backendCart: CartItem[] = data.cart.items.map((item: any) => ({
        id: item.product.id,
        variantId: item.variantId,
        name: item.product.name,
        price: `₹${Number(item.variant.price || item.product.basePrice).toLocaleString('en-IN')}`,
        size: item.variant.name,
        image: item.product.images[0]?.url || '',
        quantity: item.quantity,
      }));

      setCart(backendCart);
      setIsGuest(false);
    } catch (error) {
      console.error('Failed to sync cart:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const addToCart = async (item: CartItem) => {
    const previousCart = [...cart];

    // Optimistically update local state
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (i) => i.id === item.id && i.size === item.size
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += item.quantity;
        return newCart;
      }

      return [...prevCart, item];
    });

    // If authenticated, sync to backend
    if (!isGuest && item.variantId) {
      try {
        await cartApi.addItem(item.variantId, item.quantity);
        toast.success('Added to cart');
      } catch (error: any) {
        // Revert on error
        setCart(previousCart);

        const errorData = error.response?.data?.data;
        const available = errorData?.available;
        const errorMessage = available !== undefined
          ? `Only ${available} item${available !== 1 ? 's' : ''} available in stock`
          : 'Failed to add item to cart';

        toast.error(errorMessage);
        console.error('Failed to add item to backend cart:', error);
      }
    } else {
      toast.success('Added to cart');
    }
  };

  const removeFromCart = async (id: string | number, size: string) => {
    const itemToRemove = cart.find((i) => i.id === id && i.size === size);

    // Update local state
    setCart((prevCart) => prevCart.filter((i) => !(i.id === id && i.size === size)));

    // If authenticated, sync to backend
    if (!isGuest && itemToRemove?.variantId) {
      try {
        await cartApi.removeItem(itemToRemove.variantId);
      } catch (error) {
        console.error('Failed to remove item from backend cart:', error);
      }
    }
  };

  const updateQuantity = async (id: string | number, size: string, quantity: number) => {
    const item = cart.find((i) => i.id === id && i.size === size);
    const previousQuantity = item?.quantity || 1;
    const newQuantity = Math.max(1, quantity);

    // Optimistically update local state
    setCart((prevCart) =>
      prevCart.map((i) =>
        i.id === id && i.size === size ? { ...i, quantity: newQuantity } : i
      )
    );

    // If authenticated, sync to backend
    if (!isGuest && item?.variantId) {
      try {
        await cartApi.updateItem(item.variantId, newQuantity);
      } catch (error: any) {
        // Revert to previous quantity on error
        setCart((prevCart) =>
          prevCart.map((i) =>
            i.id === id && i.size === size ? { ...i, quantity: previousQuantity } : i
          )
        );

        // Extract stock info from error response
        const errorData = error.response?.data?.data;
        const available = errorData?.available;

        // Show user-friendly error message
        const errorMessage = available !== undefined
          ? `Only ${available} item${available !== 1 ? 's' : ''} available in stock`
          : 'Failed to update quantity';

        toast.error(errorMessage);
        console.error('Failed to update quantity:', error);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);

    // If authenticated, clear backend cart
    if (!isGuest) {
      try {
        await cartApi.clear();
      } catch (error) {
        console.error('Failed to clear backend cart:', error);
      }
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncWithBackend,
        totalItems,
        isGuest,
        isSyncing,
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
