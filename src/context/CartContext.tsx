"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
  id: string;
  title: string;
  image: string;
  variant?: string;
  price: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "ppr_cart_v1";

// Demo seed data so /cart isn't empty on first visit — replace with real
// cart data fetched from your backend once you have one.
const DEFAULT_ITEMS: CartItem[] = [
  {
    id: "dtf-transfers",
    title: "DTF Transfers — Gang Sheet (22in x 24in)",
    image: "/images/products/dtf-300x300.webp",
    variant: "Standard finish",
    price: 24.99,
    quantity: 1,
  },
  {
    id: "business-cards",
    title: "Business Cards — 16pt Matte",
    image: "/images/bussinessCard.webp",
    variant: "500 count",
    price: 39.0,
    quantity: 2,
  },
];

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      setItems(raw ? (JSON.parse(raw) as CartItem[]) : DEFAULT_ITEMS);
    } catch {
      setItems(DEFAULT_ITEMS);
    }
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem: CartContextValue["addItem"] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id: string, quantity: number) =>
    setItems((prev) =>
      quantity <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
