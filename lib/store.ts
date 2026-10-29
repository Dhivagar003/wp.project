"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Finish } from "./types";

export type CartItem = { key: string; productId: string; slug: string; name: string; finish: Finish; size?: string; qty: number; unitPrice: number };

type Shop = {
  cart: CartItem[];
  wishlist: string[];
  cartOpen: boolean;
  add: (i: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  toggleWish: (slug: string) => void;
  setCartOpen: (o: boolean) => void;
};

// Guest cart lives in localStorage; prices here are display-only, the server recomputes at checkout.
export const useShop = create<Shop>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      cartOpen: false,
      add: (i, qty = 1) =>
        set((s) => {
          const key = `${i.productId}:${i.finish}:${i.size ?? ""}`;
          const hit = s.cart.find((c) => c.key === key);
          return {
            cartOpen: true,
            cart: hit ? s.cart.map((c) => (c.key === key ? { ...c, qty: c.qty + qty } : c)) : [...s.cart, { ...i, key, qty }],
          };
        }),
      setQty: (key, qty) => set((s) => ({ cart: s.cart.map((c) => (c.key === key ? { ...c, qty: Math.max(1, Math.min(10, qty)) } : c)) })),
      remove: (key) => set((s) => ({ cart: s.cart.filter((c) => c.key !== key) })),
      clear: () => set({ cart: [] }),
      toggleWish: (slug) => set((s) => ({ wishlist: s.wishlist.includes(slug) ? s.wishlist.filter((w) => w !== slug) : [...s.wishlist, slug] })),
      setCartOpen: (cartOpen) => set({ cartOpen }),
    }),
    { name: "wp-shop", partialize: (s) => ({ cart: s.cart, wishlist: s.wishlist }) },
  ),
);
