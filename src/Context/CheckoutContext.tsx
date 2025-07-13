import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from './AuthContext';
import { useNotificationContext } from './NotificationContext';
import { useOrderContext } from './OrderContext';
import { useCartContext } from './CartContext';
import { useCourseContext } from './CourseContext';

interface CheckoutContextType {
  proceedToCheckout: () => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const { createOrder } = useOrderContext();
  const { cartItems, clearCart } = useCartContext();
  const { courses } = useCourseContext();

  const proceedToCheckout = async () => {
    if (!isAuthenticated || !user) {
      showNotification('برای ادامه به پرداخت، لطفاً وارد شوید.', 'error');
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      showNotification('سبد خرید خالی است.', 'error');
      return;
    }

    try {
      const orderItems = cartItems
        .map((item) => {
          const course = courses.find((c) => c.id === item.courseId);
          if (!course) return null;
          return {
            courseId: item.courseId,
            courseTitle: course.title,
            price: course.discountPrice || course.price,
          };
        })
        .filter((item): item is { courseId: number; courseTitle: string; price: string } => item !== null);

      await createOrder(orderItems);
      await clearCart();
      showNotification('سفارش با موفقیت ثبت شد و به درگاه پرداخت هدایت می‌شوید.', 'success');
      navigate('/checkout/multiple');
    } catch (error: any) {
      showNotification(error.message || 'خطایی در فرآیند پرداخت رخ داد.', 'error');
    }
  };

  return (
    <CheckoutContext.Provider value={{ proceedToCheckout }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckoutContext = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckoutContext must be used within a CheckoutProvider');
  }
  return context;
};