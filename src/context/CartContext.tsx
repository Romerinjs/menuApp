import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem } from '../types/cart';
import { Dish } from '../types/restaurant';

interface CartContextType {
  items: CartItem[];
  itemsCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (dish: Dish, quantity?: number, notes?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  restaurantSlug,
  children
}: {
  restaurantSlug: string;
  children: ReactNode;
}) {
  const storageKey = `menuapp_cart_${restaurantSlug.toLowerCase()}`;
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error cargando carrito:', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sincronizar con LocalStorage cuando cambie el carrito o el slug
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (e) {
      console.error('Error guardando carrito:', e);
    }
  }, [items, storageKey]);

  // Recalcular subtotal exclusivo (los cobros finales se hacen en físico)
  const subtotal = items.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);
  const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (dish: Dish, quantity = 1, notes?: string) => {
    if (!dish.isAvailable) return;

    setItems((prev) => {
      // Si el ítem ya existe con las mismas notas, solo incrementamos cantidad
      const existingIndex = prev.findIndex(
        (i) => i.dish.id === dish.id && (i.notes || '') === (notes || '')
      );

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      }

      const newItem: CartItem = {
        id: `cart-${dish.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        dish,
        quantity,
        notes: notes?.trim() ? notes.trim() : undefined
      };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemsCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
}
