import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from './Auth/UserAuthContext';
import { useNotificationContext } from './NotificationContext';
import { useOrderContext } from './OrderContext';
import { useCartContext } from './CartContext';
import { useCourseContext } from './CourseContext';
import { useInstructorContext } from './InstructorContext';
import { Instructor } from '../types/types';

interface OrderItem {
  courseId: number;
  courseTitle: string;
  price: string;
  purchaseDate: string;
  status: 'pending' | 'completed' | 'canceled';
  instructorId: number;
}

interface CheckoutContextType {
  proceedToCheckout: () => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const { createOrder } = useOrderContext();
  const { cartItems } = useCartContext();
  const { courses } = useCourseContext();
  const { instructors } = useInstructorContext();

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
      const orderItems: OrderItem[] = cartItems
        .map((item) => {
          const course = courses.find((c) => c.id === item.courseId);
          if (!course) return null;
          const instructor = instructors.find((i: Instructor) => i.name === course.instructor);
          return {
            courseId: item.courseId,
            courseTitle: course.title,
            price: course.discountPrice || course.price,
            purchaseDate: new Date().toISOString(),
            status: 'pending',
            instructorId: instructor?.id || 0,
          };
        })
        .filter((item): item is OrderItem => item !== null);

      await createOrder(orderItems);
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