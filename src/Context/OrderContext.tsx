import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { useCourseContext } from './CourseContext';
import { useNotificationContext } from './NotificationContext';

interface OrderItem {
  courseId: number;
  courseTitle: string;
  price: string;
  purchaseDate: string;
  status: 'pending' | 'completed' | 'canceled';
}

interface Order {
  id: number;
  userId: string;
  items: OrderItem[];
  totalAmount: string;
  orderDate: string;
  status: 'pending' | 'completed' | 'canceled';
}

interface OrderContextType {
  orders: Order[];
  createOrder: (items: { courseId: number; courseTitle: string; price: string }[]) => Promise<void>;
  cancelOrder: (orderId: number) => Promise<void>;
  getUserOrders: (userId: string) => Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthContext();
  const { courses } = useCourseContext();
  const { showNotification } = useNotificationContext();
  const [orders, setOrders] = useState<Order[]>([]);

  const createOrder = async (items: { courseId: number; courseTitle: string; price: string }[]) => {
    if (!isAuthenticated || !user) {
      throw new Error('برای ثبت سفارش باید وارد حساب کاربری شوید.');
    }
    if (!items.length) {
      throw new Error('هیچ دوره‌ای برای سفارش انتخاب نشده است.');
    }

    const courseIds = new Set(courses.map((course) => course.id));
    const invalidItems = items.filter((item) => !courseIds.has(item.courseId));
    if (invalidItems.length) {
      throw new Error(`دوره‌های زیر یافت نشدند: ${invalidItems.map((item) => item.courseTitle).join(', ')}`);
    }

    const totalAmount = items
      .reduce((sum, item) => sum + parseFloat(item.price.replace(/[^\d.-]/g, '')), 0)
      .toLocaleString('fa-IR', { style: 'currency', currency: 'IRR' });

    const newOrder: Order = {
      id: Math.max(...orders.map((o) => o.id), 0) + 1,
      userId: user.email,
      items: items.map((item) => ({
        ...item,
        purchaseDate: new Date().toLocaleDateString('fa-IR'),
        status: 'pending' as const,
      })),
      totalAmount,
      orderDate: new Date().toLocaleDateString('fa-IR'),
      status: 'pending',
    };

    try {
      setOrders((prev) => [...prev, newOrder]);
      showNotification('سفارش با موفقیت ثبت شد.', 'success');
    } catch (error: any) {
      showNotification(error.message, 'error');
      throw error;
    }
  };

  const cancelOrder = async (orderId: number) => {
    if (!isAuthenticated || !user) {
      throw new Error('برای لغو سفارش باید وارد حساب کاربری شوید.');
    }
    const order = orders.find((o) => o.id === orderId && o.userId === user.email);
    if (!order) {
      throw new Error('سفارش یافت نشد یا متعلق به شما نیست.');
    }
    if (order.status === 'canceled') {
      throw new Error('سفارش قبلاً لغو شده است.');
    }

    try {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'canceled', items: o.items.map((item) => ({ ...item, status: 'canceled' })) } : o))
      );
      showNotification('سفارش با موفقیت لغو شد.', 'success');
    } catch (error: any) {
      showNotification(error.message, 'error');
      throw error;
    }
  };

  const getUserOrders = (userId: string) => {
    return orders.filter((order) => order.userId === userId);
  };

  return (
    <OrderContext.Provider value={{ orders, createOrder, cancelOrder, getUserOrders, setOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrderContext must be used within an OrderProvider');
  return context;
};