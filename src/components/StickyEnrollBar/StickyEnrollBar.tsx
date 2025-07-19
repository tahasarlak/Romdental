import React, { useState, memo, useCallback } from 'react';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '@mui/material';
import DOMPurify from 'dompurify';
import styles from './StickyEnrollBar.module.css';
import { useAuthContext } from '../../Context/Auth/UserAuthContext';
import { useCartContext } from '../../Context/CartContext';
import { useNotificationContext } from '../../Context/NotificationContext';
import { Course } from '../../types/types';

interface StickyEnrollBarProps {
  course: Course;
  isEnrolled: boolean;
  handleEnroll: () => void;
  handleJoinClass: () => void;
}

const sanitizeText = (text: string): string => {
  if (text.length > 100) {
    console.warn('Input too long, truncating to 100 characters');
    text = text.slice(0, 100);
  }
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['p', 'strong', 'em'],
    ALLOWED_ATTR: [],
  });
};

const StickyEnrollBar: React.FC<StickyEnrollBarProps> = memo(
  ({ course, isEnrolled, handleEnroll, handleJoinClass }) => {
    const { isAuthenticated } = useAuthContext();
    const { cartItems, addToCart, removeFromCart } = useCartContext();
    const { showNotification } = useNotificationContext();
    const [error, setError] = useState<string | null>(null);

    const isCartItem = cartItems.some((item) => item.courseId === course.id);

    const handleClickWithError = useCallback(
      (handler: () => void) => {
        try {
          handler();
          setError(null);
        } catch (err: any) {
          setError('خطایی رخ داد. لطفاً با پشتیبانی تماس بگیرید.');
          console.warn('StickyEnrollBar Error:', err.message);
          showNotification(err.message || 'خطایی رخ داد.', 'error');
        }
      },
      [showNotification]
    );

    const handleCartAction = useCallback(() => {
      if (isCartItem) {
        const cartItem = cartItems.find((item) => item.courseId === course.id);
        if (!cartItem) return;
        const confirmRemove = window.confirm(
          `آیا مطمئن هستید که می‌خواهید دوره "${sanitizeText(course.title)}" را از سبد خرید حذف کنید؟`
        );
        if (!confirmRemove) return;
        handleClickWithError(() => {
          removeFromCart(cartItem.id);
          showNotification(`دوره "${sanitizeText(course.title)}" از سبد خرید حذف شد.`, 'success');
        });
      } else {
        handleClickWithError(() => {
          handleEnroll();
          addToCart(course.id);
          showNotification(`دوره "${sanitizeText(course.title)}" به سبد خرید اضافه شد.`, 'success');
        });
      }
    }, [
      isCartItem,
      course.id,
      course.title,
      handleEnroll,
      addToCart,
      removeFromCart,
      showNotification,
      handleClickWithError,
      cartItems,
    ]);

    const sanitizedPrice = sanitizeText(course.discountPrice || course.price);
    const sanitizedTitle = sanitizeText(course.title);

    return (
      <footer
        className={styles.stickyEnrollBar}
        role="complementary"
        aria-label="نوار ثبت‌نام دوره"
        aria-describedby="enroll-bar-description"
        dir="rtl"
      >
        <div id="enroll-bar-description" className={styles.hidden}>
          نوار ثبت‌نام برای دوره {sanitizedTitle}
        </div>
        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
            <Button variant="text" href="/support" sx={{ ml: 1 }}>
              تماس با پشتیبانی
            </Button>
          </div>
        )}
        <button
          className={`${styles.enrollButton} ${isCartItem ? styles.addedToCart : ''}`}
          disabled={!course.isOpen || isEnrolled}
          onClick={handleCartAction}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCartAction();
            }
          }}
          aria-label={
            isEnrolled
              ? 'شما در این دوره ثبت‌نام کرده‌اید'
              : isCartItem
              ? `حذف دوره ${sanitizedTitle} از سبد خرید`
              : course.isOpen
              ? `افزودن دوره ${sanitizedTitle} به سبد خرید`
              : 'ثبت‌نام بسته است'
          }
          title={
            isCartItem
              ? 'حذف از سبد خرید'
              : 'برای افزودن به سبد خرید، ورود به حساب کاربری اختیاری است'
          }
          role="button"
        >
          {isEnrolled ? (
            'شما ثبت‌نام کرده‌اید'
          ) : isCartItem ? (
            <>
              <DeleteIcon className={styles.removeIcon} aria-hidden="true" />
              افزوده شده
            </>
          ) : course.isOpen ? (
            `افزودن به سبد خرید (${sanitizedPrice})`
          ) : (
            'ثبت‌نام بسته است'
          )}
        </button>
        {course.courseType === 'Online' && isEnrolled && isAuthenticated && (
          <button
            className={styles.joinClassButton}
            onClick={() => handleClickWithError(handleJoinClass)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClickWithError(handleJoinClass);
              }
            }}
            aria-label="ورود به کلاس آنلاین"
            title="برای ورود به کلاس آنلاین، باید ثبت‌نام کرده و وارد حساب کاربری شده باشید"
            role="button"
          >
            <VideoCallIcon aria-hidden="true" /> ورود به کلاس آنلاین
          </button>
        )}
      </footer>
    );
  }
);

export const getCourseStructuredData = (course: Course) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: sanitizeText(course.title),
  description: sanitizeText(`دوره ${course.courseType} با قیمت ${course.discountPrice || course.price}`),
  inLanguage: 'fa',
  offers: {
    '@type': 'Offer',
    price: sanitizeText(course.discountPrice || course.price),
    priceCurrency: 'IRR',
    availability: course.isOpen ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
  },
  provider: {
    '@type': 'Organization',
    name: 'MyClassWebsite',
  },
});

export default StickyEnrollBar;