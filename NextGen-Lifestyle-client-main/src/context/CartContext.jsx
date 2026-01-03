// src/context/CartContext.jsx
import { createContext, useContext, useMemo, useState, useEffect } from "react";

const CART_STORAGE_KEY = 'nextgen_cart';
const CartContext = createContext(null);

// Load cart from localStorage
const loadCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage', error);
    return [];
  }
};

// Save cart to localStorage
const saveCart = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart to localStorage', error);
  }
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => loadCart());

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  const addToCart = (product, { size, color, quantity }) => {
    if (!product?._id) return;

    setCartItems((prev) => {
      const key = `${product._id}-${size || ""}-${color || ""}`;
      const existing = prev.find((item) => item.key === key);

      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      const mainImage =
        (Array.isArray(product.images) && product.images[0]) ||
        product.image ||
        product.imageUrl ||
        "https://via.placeholder.com/600x400?text=Product";

      return [
        ...prev,
        {
          key,
          productId: product._id,
          name: product.name,
          price: product.price,
          size: size || null,
          color: color || null,
          quantity,
          image: mainImage,
        },
      ];
    });
  };

  const removeFromCart = (key) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key));
  };

  const updateQuantity = (key, newQty) => {
    if (newQty < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  const value = {
    cartItems,
    cartCount,
    subtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}