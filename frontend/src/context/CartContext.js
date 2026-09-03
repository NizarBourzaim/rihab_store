"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";

const CartContext = createContext({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQty: () => {},
});

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const isLoaded = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem("cartItems");
    if (stored) {
      setTimeout(() => {
        try {
          const parsed = JSON.parse(stored);
          setCartItems(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error("Failed to parse cartItems from localStorage", e);
          localStorage.removeItem("cartItems");
          setCartItems([]);
        } finally {
          isLoaded.current = true;
        }
      }, 0);
    } else {
      isLoaded.current = true;
    }
  }, []);

  useEffect(() => {
    if (isLoaded.current) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Tracked (non-null) and > 0 means limited stock: cap quantity at what's available.
  // Tracked and <= 0, or untracked (null), both mean no cap — the item is a preorder or unlimited.
  const stockCap = (product) =>
    product.stock !== null && product.stock !== undefined && product.stock > 0
      ? product.stock
      : Infinity;

  const addToCart = (product, size) => {
    const selectedSize = size || product.selectedSize || "";
    const cartItemId = selectedSize ? `${product._id}-${selectedSize}` : product._id;
    const exists = cartItems.find((item) => (item.cartItemId || item._id) === cartItemId);
    const cap = stockCap(product);

    if (exists) {
      setCartItems(
        cartItems.map((item) =>
          (item.cartItemId || item._id) === cartItemId
            ? { ...item, qty: Math.min(item.qty + 1, cap) }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, selectedSize, cartItemId, qty: Math.min(1, cap) }]);
    }
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(cartItems.filter((item) => (item.cartItemId || item._id) !== cartItemId));
  };

  const updateQty = (cartItemId, qty) => {
    setCartItems(
      cartItems.map((item) =>
        (item.cartItemId || item._id) === cartItemId ? { ...item, qty: Math.min(Number(qty), stockCap(item)) } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);