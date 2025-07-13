import React, { useMemo } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
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
        return { ...course, quantity: item.quantity, cartItemId: item.id };
      })
      .filter((course): course is NonNullable<typeof course> => course !== null);
  }, [cartItems, courses]);

  const totalPrice = useMemo(() => {
    return cartCourses.reduce((total, course) => {
      const price = course.discountPrice ? parsePrice(course.discountPrice) : parsePrice(course.price);
      return total + price * course.quantity;
    }, 0);
  }, [cartCourses]);

  const handleRemoveItem = (itemId: string) => {
    if (!isAuthenticated) {
      showNotification('برای حذف از سبد خرید، لطفاً وارد شوید.', 'error');
      navigate('/login');
      return;
    }
    const course = cartCourses.find((c) => c.cartItemId === itemId);
    if (course) {
      const confirmRemove = window.confirm(`آیا مطمئن هستید که می‌خواهید دوره "${course.title}" را از سبد خرید حذف کنید؟`);
      if (confirmRemove) {
        removeFromCart(itemId);
      }
    }
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (!isAuthenticated) {
      showNotification('برای تغییر تعداد، لطفاً وارد شوید.', 'error');
      navigate('/login');
      return;
    }
    if (newQuantity < 1) return;
    updateCartItemQuantity(itemId, newQuantity);
  };

  if (cartCourses.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>سبد خرید خالی است</h2>
        <p>دوره‌ای به سبد خرید اضافه نشده است.</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.cartItems}>
        {cartCourses.map((course) => {
          const cartItem = cartItems.find((item) => item.id === course.cartItemId);
          if (!cartItem) return null;
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
                  قیمت: {course.discountPrice || course.price} (تعداد: {cartItem.quantity})
                </p>
                <div className={styles.quantityControls}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuantityChange(cartItem.id, cartItem.quantity - 1)}
                    aria-label={`کاهش تعداد دوره ${course.title}`}
                  >
                    -
                  </Button>
                  <span className={styles.quantity}>{cartItem.quantity}</span>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuantityChange(cartItem.id, cartItem.quantity + 1)}
                    aria-label={`افزایش تعداد دوره ${course.title}`}
                  >
                    +
                  </Button>
                </div>
              </div>
              <IconButton
                className={styles.removeButton}
                onClick={() => handleRemoveItem(cartItem.id)}
                aria-label={`حذف دوره ${course.title} از سبد خرید`}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          );
        })}
      </div>
      <div className={styles.cartSummary}>
        <h3>جمع کل: {formatPrice(totalPrice)}</h3>
        <Button
          variant="contained"
          color="primary"
          onClick={proceedToCheckout}
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