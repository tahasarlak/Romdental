import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthContext } from './AuthContext';
import { useNotificationContext } from './NotificationContext';
import { CartItem, User } from '../types/types';

interface CartItemExtended extends CartItem {
  status?: 'pending' | 'approved' | 'rejected'; // Add status to track payment state
}

interface CartContextType {
  cartItems: CartItemExtended[];
  addToCart: (courseId: number, quantity?: number) => Promise<void>;  
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearApprovedItems: () => Promise<void>; // New function to clear approved items
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, setUser } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const [cartItems, setCartItems] = useState<CartItemExtended[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart) as CartItemExtended[];
        setCartItems(parsedCart || []);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        setCartItems([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const storedCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItemExtended[];
      const userCart = Array.isArray(user.cart) ? user.cart : [];
      const mergedCart = [
        ...userCart,
        ...storedCart.filter((item) => !userCart.some((cartItem) => cartItem.id === item.id)),
      ];

      if (JSON.stringify(mergedCart) !== JSON.stringify(cartItems)) {
        setCartItems(mergedCart);
        if (JSON.stringify(userCart) !== JSON.stringify(mergedCart)) {
          setUser({ ...user, cart: mergedCart });
        }
      }
    } else {
      const storedCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItemExtended[];
      if (JSON.stringify(storedCart) !== JSON.stringify(cartItems)) {
        setCartItems(storedCart);
      }
    }
  }, [isAuthenticated, user, setUser, cartItems]);

  const addToCart = async (courseId: number, quantity: number = 1) => {
    try {
      const newCartItem: CartItemExtended = { id: uuidv4(), courseId, quantity, status: 'pending' };
      const newCart = [...cartItems, newCartItem];
      setCartItems(newCart);
      if (isAuthenticated && user) {
        const updatedUser: User = { ...user, cart: newCart };
        await setUser(updatedUser);
      }
      showNotification('دوره به سبد خرید اضافه شد.', 'success');
    } catch (error: any) {
      showNotification('خطایی در افزودن به سبد خرید رخ داد.', 'error');
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const item = cartItems.find((item) => item.id === itemId);
      if (item?.status === 'pending') {
        showNotification('نمی‌توانید آیتم‌های در انتظار پرداخت را حذف کنید.', 'warning');
        return;
      }
      const newCart = cartItems.filter((item) => item.id !== itemId);
      setCartItems(newCart);
      if (isAuthenticated && user) {
        const updatedUser: User = { ...user, cart: newCart };
        await setUser(updatedUser);
      }
      showNotification('دوره از سبد خرید حذف شد.', 'success');
    } catch (error: any) {
      showNotification('خطایی در حذف از سبد خرید رخ داد.', 'error');
      throw error;
    }
  };

  const updateCartItemQuantity = async (itemId: string, quantity: number) => {
    try {
      const item = cartItems.find((item) => item.id === itemId);
      if (item?.status === 'pending') {
        showNotification('نمی‌توانید آیتم‌های در انتظار پرداخت را ویرایش کنید.', 'warning');
        return;
      }
      if (quantity < 1) {
        await removeFromCart(itemId);
        return;
      }
      const newCart = cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      setCartItems(newCart);
      if (isAuthenticated && user) {
        const updatedUser: User = { ...user, cart: newCart };
        await setUser(updatedUser);
      }
      showNotification('تعداد دوره به‌روزرسانی شد.', 'success');
    } catch (error: any) {
      showNotification('خطایی در به‌روزرسانی سبد خرید رخ داد.', 'error');
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const pendingItemsExist = cartItems.some((item) => item.status === 'pending');
      if (pendingItemsExist) {
        showNotification('نمی‌توانید سبد خرید را با آیتم‌های در انتظار پرداخت خالی کنید.', 'warning');
        return;
      }
      setCartItems([]);
      if (isAuthenticated && user) {
        const updatedUser: User = { ...user, cart: [] };
        await setUser(updatedUser);
      }
      localStorage.removeItem('cart');
      showNotification('سبد خرید خالی شد.', 'success');
    } catch (error: any) {
      showNotification('خطایی در خالی کردن سبد خرید رخ داد.', 'error');
      throw error;
    }
  };

  const clearApprovedItems = async () => {
    try {
      const newCart = cartItems.filter((item) => item.status === 'pending');
      setCartItems(newCart);
      if (isAuthenticated && user) {
        const updatedUser: User = { ...user, cart: newCart };
        await setUser(updatedUser);
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      showNotification('آیتم‌های تأییدشده از سبد خرید حذف شدند.', 'success');
    } catch (error: any) {
      showNotification('خطایی در حذف آیتم‌های تأییدشده رخ داد.', 'error');
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateCartItemQuantity, clearCart, clearApprovedItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};