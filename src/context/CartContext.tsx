import React, { createContext, useState, useEffect } from 'react';
import Decimal from 'decimal.js';

interface SelectionIds {
    preselectionId?: number;
}

export interface CartItem {
    itemId: string;
    imageUrl: string;
    name: string;
    price: Decimal;
    quantity: number;
    selection: SelectionIds
}

export interface ShippingMethod {
    id: number;
    name: string;
}

export interface Coupon {
    couponCode: string;
    isValid: boolean;
    discountPercentage: number;
}

const DEFAULT_SHIPPING_METHOD = {id: 1, name: "Standard"};

const DEFAULT_COUPON = null;

interface CartContextProps {
    cart: CartItem[];
    shippingMethod: ShippingMethod;
    coupon: Coupon | null;
    addItem: (item: CartItem) => void;
    removeItem: (itemId: string) => void;
    clearCart: () => void;
    increaseItemQuantity: (itemId: string) => void;
    decreaseItemQuantity: (itemId: string) => void;
    setShippingMethod: (method: ShippingMethod) => void;
    setCoupon: (coupon: Coupon) => void;
}

export const CartContext = createContext<CartContextProps>({
    cart: [],
    shippingMethod: DEFAULT_SHIPPING_METHOD,
    coupon: DEFAULT_COUPON,
    addItem: () => {},
    removeItem: () => {},
    clearCart: () => {},
    increaseItemQuantity: () => {},
    decreaseItemQuantity: () => {},
    setShippingMethod: () => {},
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
    const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(DEFAULT_SHIPPING_METHOD);
    const [coupon, setCoupon] = useState<Coupon | null>(DEFAULT_COUPON);
    const [isLocalStorageLoaded, setIsLocalStorageLoaded] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        const savedShippingMethod = localStorage.getItem('shippingMethod');
        const savedCoupon = localStorage.getItem('coupon');
        if (savedCart) {
            setCart(JSON.parse(savedCart, reviver));
        }
        if (savedShippingMethod) {
            setShippingMethod(JSON.parse(savedShippingMethod));
        }
        if (savedCoupon) {
            setCoupon(JSON.parse(savedCoupon));
        }
        setIsLocalStorageLoaded(true);
    }, []);

    useEffect(() => {
        if (isLocalStorageLoaded) {
            localStorage.setItem('cart', JSON.stringify(cart));
            localStorage.setItem('shippingMethod', JSON.stringify(shippingMethod));
            localStorage.setItem('coupon', JSON.stringify(coupon));
        }
    }, [cart, shippingMethod, coupon]);

    const customSort = (x: CartItem, y: CartItem): number => {
        if ("preselectionId" in x.selection && "preselectionId" in y.selection) return 0;
        if ("preselectionId" in x.selection) return -1;
        return 0;
    };

    const addItem = (newItem: CartItem) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.itemId === newItem.itemId);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.itemId === newItem.itemId ? { ...item, quantity: item.quantity + newItem.quantity } : item
                );
            }
            return [...prevCart, newItem].sort(customSort);
        });
    };

  const removeItem = (itemId: string) => {
      setCart((prevCart) => prevCart.filter((item) => item.itemId !== itemId).sort(customSort));
  };

  const clearCart = () => {
      setCart([]);
      setShippingMethod(DEFAULT_SHIPPING_METHOD);
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
          { cart, shippingMethod, coupon, addItem, removeItem, clearCart, increaseItemQuantity, decreaseItemQuantity, setShippingMethod, setCoupon }
      }>
          {children}
      </CartContext.Provider>
  );
};
