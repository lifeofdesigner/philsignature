import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/types/database';

export interface CartItem {
  id: string; // unique identifier (e.g., product_id or product_id-size)
  product: Product;
  quantity: number;
  price: number;
  size?: string;
  variant_id?: string;
}

const CART_STORAGE_KEY = 'philz_shopping_bag';
const CART_CHANGE_EVENT = 'philz_cart_change';

const getStoredCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  } catch {
    // Local storage unavailable
  }
};

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>(getStoredCart);

  useEffect(() => {
    const handleSync = () => {
      setItems(getStoredCart());
    };
    window.addEventListener(CART_CHANGE_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const addItem = useCallback((
    product: Product,
    quantity = 1,
    variant?: { id?: string; name: string; price: number }
  ) => {
    const current = getStoredCart();
    const effectivePrice = variant
      ? variant.price
      : product.sale_price !== null && product.sale_price !== undefined
      ? product.sale_price
      : product.price;

    const cartItemId = variant ? `${product.id}-${variant.name}` : product.id;
    const existingIdx = current.findIndex((item) => item.id === cartItemId);
    let next: CartItem[];

    if (existingIdx > -1) {
      next = [...current];
      next[existingIdx] = {
        ...next[existingIdx],
        quantity: next[existingIdx].quantity + quantity,
      };
    } else {
      next = [
        ...current,
        {
          id: cartItemId,
          product,
          quantity,
          price: effectivePrice,
          size: variant?.name,
          variant_id: variant?.id,
        },
      ];
    }

    saveCart(next);
  }, []);

  const removeItem = useCallback((productId: string) => {
    const current = getStoredCart();
    const next = current.filter((item) => item.id !== productId);
    saveCart(next);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      const current = getStoredCart();
      saveCart(current.filter((item) => item.id !== productId));
      return;
    }
    const current = getStoredCart();
    const next = current.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    saveCart(next);
  }, []);

  const clearCart = useCallback(() => {
    saveCart([]);
  }, []);

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return {
    items,
    totalCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
};

