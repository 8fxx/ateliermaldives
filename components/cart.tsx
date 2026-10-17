"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProduct } from "@/lib/products";

export type CartItem = { slug: string; size: string; quantity: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">) => void;
  setQuantity: (slug: string, size: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "atelier.cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  const value = useMemo<CartContextValue>(() => {
    const valid = items.filter((i) => getProduct(i.slug));
    return {
      items: valid,
      count: valid.reduce((n, i) => n + i.quantity, 0),
      subtotal: valid.reduce((n, i) => n + getProduct(i.slug)!.price * i.quantity, 0),
      add: ({ slug, size }) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.slug === slug && i.size === size);
          if (existing) return prev.map((i) => (i === existing ? { ...i, quantity: Math.min(i.quantity + 1, 10) } : i));
          return [...prev, { slug, size, quantity: 1 }];
        }),
      setQuantity: (slug, size, quantity) =>
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => !(i.slug === slug && i.size === size))
            : prev.map((i) => (i.slug === slug && i.size === size ? { ...i, quantity: Math.min(quantity, 10) } : i)),
        ),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
