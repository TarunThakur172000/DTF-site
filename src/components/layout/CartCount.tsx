"use client";

import { useEffect, useState, useCallback } from "react";

export function CartCount() {
  const [count, setCount] = useState(0);

  const loadCartCount = useCallback(async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const cart = await response.json();

      if (cart.success && Array.isArray(cart.items)) {
        const totalItems = cart.items.reduce(
          (
            total: number,
            item: { quantity?: number }
          ) => total + (item.quantity || 0),
          0
        );

        setCount(totalItems);
      } else {
        setCount(0);
      }
    } catch (error) {
      console.error("Failed to load cart count:", error);
      setCount(0);
    }
  }, []);

  useEffect(() => {
    loadCartCount();

    window.addEventListener(
      "cart-updated",
      loadCartCount
    );

    return () => {
      window.removeEventListener(
        "cart-updated",
        loadCartCount
      );
    };
  }, [loadCartCount]);

  if (count === 0) {
    return null;
  }

  return (
    <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-accent-600 text-[10px] font-bold text-white shadow-sm">
      {count > 99 ? "99+" : count}
    </span>
  );
}