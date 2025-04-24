import React, { createContext, useState, useEffect } from 'react';
import Decimal from 'decimal.js';

interface SelectionIds {
    lightVariantId: number;
}

export interface CartItem {
    itemId: string;
    imageUrl: string;
    name: string;
    dimensionStr: string;
    price: Decimal;
    quantity: number;
    selection: SelectionIds
}

export interface Coupon {
    couponCode: string;
    isValid: boolean;
    discountPercentage: number;
}

const DEFAULT_COUPON = null;

interface CartContextProps {
    cart: CartItem[];
    coupon: Coupon | null;
    addItem: (item: CartItem) => void;
    removeItem: (itemId: string) => void;
    clearCart: () => void;
    increaseItemQuantity: (itemId: string) => void;
    decreaseItemQuantity: (itemId: string) => void;
    setCoupon: (coupon: Coupon) => void;
}

export const CartContext = createContext<CartContextProps>({
    cart: [],
    coupon: DEFAULT_COUPON,
    addItem: () => {},
    removeItem: () => {},
    clearCart: () => {},
    increaseItemQuantity: () => {},
    decreaseItemQuantity: () => {},
    setCoupon: () => {},
});

// Custom reviver function to convert strings to Decimal
function reviver(_: string, value: any): any {
    if (typeof value === 'string') {
        const numberValue = Number(value); // Convert to number
        if (!isNaN(numberValue)) {
            return new Decimal(value); // If it's a valid number, return Decimal
        }
    }
    return value; // Return value unchanged if not a string
  }
  

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [coupon, setCoupon] = useState<Coupon | null>(DEFAULT_COUPON);
    const [isLocalStorageLoaded, setIsLocalStorageLoaded] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        const savedCoupon = localStorage.getItem('coupon');
        if (savedCart) {
            setCart(JSON.parse(savedCart, reviver));
        }
        if (savedCoupon) {
            setCoupon(JSON.parse(savedCoupon));
        }
        setIsLocalStorageLoaded(true);
    }, []);

    useEffect(() => {
        if (isLocalStorageLoaded) {
            localStorage.setItem('cart', JSON.stringify(cart));
            localStorage.setItem('coupon', JSON.stringify(coupon));
        }
    }, [cart, coupon]);

    const addItem = (newItem: CartItem) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.itemId === newItem.itemId);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.itemId === newItem.itemId ? { ...item, quantity: item.quantity + newItem.quantity } : item
                );
            }
            return [...prevCart, newItem];
        });
    };

  const removeItem = (itemId: string) => {
      setCart((prevCart) => prevCart.filter((item) => item.itemId !== itemId));
  };

  const clearCart = () => {
      setCart([]);
      setCoupon(DEFAULT_COUPON);
  }

  const increaseItemQuantity = (itemId: string) => {
      setCart((prevCart) => {
          const existingItem = prevCart.find((item) => item.itemId === itemId);
          if (existingItem) {
              return prevCart.map((item) =>
                  (item.itemId === itemId && item.quantity < 10) ? { ...item, quantity: item.quantity + 1 } : item
              );
          }
          return prevCart;
      });
  }

  const decreaseItemQuantity = (itemId: string) => {
      setCart((prevCart) => {
          const existingItem = prevCart.find((item) => item.itemId === itemId);
          if (existingItem) {
              return prevCart.map((item) =>
                  (item.itemId === itemId && item.quantity > 1) ? { ...item, quantity: item.quantity - 1 } : item
              );
          }
          return prevCart;
      });
  }

  return (
      <CartContext.Provider value={
          { cart, coupon, addItem, removeItem, clearCart, increaseItemQuantity, decreaseItemQuantity, setCoupon }
      }>
          {children}
      </CartContext.Provider>
  );
};
