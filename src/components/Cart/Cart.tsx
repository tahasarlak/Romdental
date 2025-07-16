import React, { useMemo, useCallback } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { useCourseContext } from '../../Context/CourseContext';
import { useCartContext } from '../../Context/CartContext';
import { useAuthContext } from '../../Context/AuthContext';
import { useNotificationContext } from '../../Context/NotificationContext';
import { useCheckoutContext } from '../../Context/CheckoutContext';
import { useNavigate } from 'react-router-dom';
import styles from './Cart.module.css';

const persianToEnglishDigits = (str: string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[\u06F0-\u06F9]/g, (match) => {
    return String(persianDigits.indexOf(match));
  });
};

const parsePrice = (priceString: string | undefined): number => {
  if (!priceString) return 0;
  const cleanedPrice = priceString.replace(/[^\d۰-۹]/g, '').trim();
  const englishDigits = persianToEnglishDigits(cleanedPrice);
  const parsed = parseInt(englishDigits, 10);
  return isNaN(parsed) ? 0 : parsed;
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fa-IR', {
    style: 'currency',
    currency: 'IRR',
    minimumFractionDigits: 0,
  })
    .format(price)
    .replace('ریال', 'تومان');
};

const Cart: React.FC = () => {
  const { courses } = useCourseContext();
  const { cartItems, removeFromCart, updateCartItemQuantity } = useCartContext();
  const { isAuthenticated } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const { proceedToCheckout } = useCheckoutContext();
  const navigate = useNavigate();

  const cartCourses = useMemo(() => {
    return cartItems
      .map((item) => {
        const course = courses.find((c) => c.id === item.courseId);
        if (!course) return null;
        return { ...course, quantity: item.quantity, cartItemId: item.id, status: item.status };
      })
      .filter((course): course is NonNullable<typeof course> => course !== null);
  }, [cartItems, courses]);

  const totalPrice = useMemo(() => {
    return cartCourses.reduce((total, course) => {
      const price = course.discountPrice ? parsePrice(course.discountPrice) : parsePrice(course.price);
      return total + price * course.quantity;
    }, 0);
  }, [cartCourses]);

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      if (!isAuthenticated) {
        showNotification('برای حذف از سبد خرید، لطفاً وارد شوید.', 'error');
        navigate('/login');
        return;
      }
      const course = cartCourses.find((c) => c.cartItemId === itemId);
      if (course?.status === 'pending') {
        showNotification('نمی‌توانید آیتم‌های در انتظار پرداخت را حذف کنید.', 'warning');
        return;
      }
      if (course) {
        const confirmRemove = window.confirm(`آیا مطمئن هستید که می‌خواهید دوره "${course.title}" را از سبد خرید حذف کنید؟`);
        if (confirmRemove) {
          removeFromCart(itemId);
          showNotification(`دوره "${course.title}" از سبد خرید حذف شد.`, 'success');
        }
      }
    },
    [cartCourses, isAuthenticated, navigate, removeFromCart, showNotification]
  );

  const handleQuantityChange = useCallback(
    (itemId: string, newQuantity: number) => {
      if (!isAuthenticated) {
        showNotification('برای تغییر تعداد، لطفاً وارد شوید.', 'error');
        navigate('/login');
        return;
      }
      const course = cartCourses.find((c) => c.cartItemId === itemId);
      if (course?.status === 'pending') {
        showNotification('نمی‌توانید آیتم‌های در انتظار پرداخت را ویرایش کنید.', 'warning');
        return;
      }
      if (newQuantity < 1) {
        showNotification('تعداد نمی‌تواند کمتر از ۱ باشد.', 'warning');
        return;
      }
      updateCartItemQuantity(itemId, newQuantity);
      showNotification('تعداد دوره به‌روزرسانی شد.', 'success');
    },
    [isAuthenticated, navigate, updateCartItemQuantity, showNotification, cartCourses]
  );

  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) {
      showNotification('برای ادامه به پرداخت، لطفاً وارد شوید.', 'error');
      navigate('/login');
      return;
    }
    const hasPendingItems = cartCourses.some((course) => course.status === 'pending');
    if (hasPendingItems) {
      showNotification('سبد خرید شامل آیتم‌های در انتظار پرداخت است. لطفاً منتظر تأیید ادمین باشید.', 'warning');
      return;
    }
    proceedToCheckout();
  }, [isAuthenticated, navigate, proceedToCheckout, showNotification, cartCourses]);

  if (cartCourses.length === 0) {
    return (
      <div className={styles.emptyCartContainer}>
        <Alert severity="info" className={styles.emptyCartAlert}>
          سبد خرید خالی است. دوره‌ای به سبد خرید اضافه نشده است.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/courses')}
          className={styles.browseCoursesButton}
        >
          مرور دوره‌ها
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.cartTitle}>سبد خرید</h1>
      <div className={styles.cartItems}>
        {cartCourses.map((course) => {
          const cartItem = cartItems.find((item) => item.id === course.cartItemId);
          if (!cartItem) return null;
          const price = course.discountPrice ? parsePrice(course.discountPrice) : parsePrice(course.price);
          const totalItemPrice = price * cartItem.quantity;
          const isPending = cartItem.status === 'pending';

          return (
            <div key={cartItem.id} className={styles.cartItem}>
              <img
                src={course.image}
                alt={`تصویر دوره ${course.title}`}
                className={styles.courseImage}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/assets/fallback.jpg';
                }}
              />
              <div className={styles.courseDetails}>
                <h3 className={styles.courseTitle}>{course.title}</h3>
                <p className={styles.instructor}>استاد: {course.instructor}</p>
                <p className={styles.price}>
                  قیمت واحد: {formatPrice(price)} | مجموع: {formatPrice(totalItemPrice)}
                </p>
                {isPending && (
                  <p className={styles.itemStatus}>
                    <strong>وضعیت:</strong> در انتظار پرداخت
                  </p>
                )}
                <div className={styles.quantityControls}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuantityChange(cartItem.id, cartItem.quantity - 1)}
                    aria-label={`کاهش تعداد دوره ${course.title}`}
                    disabled={isPending}
                  >
                    -
                  </Button>
                  <span className={styles.quantity}>{cartItem.quantity}</span>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuantityChange(cartItem.id, cartItem.quantity + 1)}
                    aria-label={`افزایش تعداد دوره ${course.title}`}
                    disabled={isPending}
                  >
                    +
                  </Button>
                </div>
              </div>
              <IconButton
                className={styles.removeButton}
                onClick={() => handleRemoveItem(cartItem.id)}
                aria-label={`حذف دوره ${course.title} از سبد خرید`}
                disabled={isPending}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          );
        })}
      </div>
      <div className={styles.cartSummary}>
        <h3 className={styles.totalPrice}>جمع کل: {formatPrice(totalPrice)}</h3>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCheckout}
          className={styles.checkoutButton}
          aria-label="تسویه حساب"
        >
          تسویه حساب
        </Button>
      </div>
    </div>
  );
};

export default Cart;