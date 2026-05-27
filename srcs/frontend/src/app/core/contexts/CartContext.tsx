/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Listing, CartItem as CartItemType } from "@/app/core/types";
import { useAuth } from "@/app/core/contexts/AuthContext";

interface CartContextType {
  items: CartItemType[];
  addItem: (listing: Listing) => void;
  removeItem: (listingId: string) => void;
  clear: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CART_STORAGE_KEY = "cart_items";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [items, setItems] = useState<CartItemType[]>(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [user]);

  const addItem = useCallback((listing: Listing) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.listing.id === listing.id);
      if (existing) {
        return prev.map((item) =>
          item.listing.id === listing.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { listing, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((listingId: string) => {
    setItems((prev) => prev.filter((item) => item.listing.id !== listingId));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const total = items.reduce((sum, item) => sum + item.listing.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}