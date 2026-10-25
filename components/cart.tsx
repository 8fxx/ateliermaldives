"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Name/price/palette are display snapshots; the server re-prices every order from the database.
export type CartItem = {
  variantId: number;
  slug: string;
  name: string;
  size: string;
  price: number;
  paletteBg: string;
  paletteFg: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">) => void;
  setQuantity: (variantId: number, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "equatra.cart.v2";

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

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + i.price * i.quantity, 0),
      add: (item) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.variantId === item.variantId);
          if (existing) return prev.map((i) => (i === existing ? { ...i, quantity: Math.min(i.quantity + 1, 10) } : i));
          return [...prev, { ...item, quantity: 1 }];
        }),
      setQuantity: (variantId, quantity) =>
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => i.variantId !== variantId)
            : prev.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(quantity, 10) } : i)),
        ),
      clear: () => setItems([]),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
