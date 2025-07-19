import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderContext } from '../../Context/OrderContext';
import { usePaymentContext } from '../../Context/PaymentContext';
import { useNotificationContext } from '../../Context/NotificationContext';
import { useCartContext } from '../../Context/CartContext';
import { useCourseContext } from '../../Context/CourseContext';
import { useInstructorContext } from '../../Context/InstructorContext';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './CheckoutMultiple.module.css';
import { useAuthContext } from '../../Context/Auth/UserAuthContext';

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

const formatPrice = (price: string | number): string => {
  const parsedPrice = typeof price === 'string' ? parsePrice(price) : price;
  return new Intl.NumberFormat('fa-IR', {
    style: 'currency',
    currency: 'IRR',
    minimumFractionDigits: 0,
  })
    .format(parsedPrice)
    .replace('ریال', 'تومان');
};

interface OrderItem {
  courseId: number;
  courseTitle: string;
  price: string;
  purchaseDate: string;
  status: 'pending' | 'completed' | 'canceled';
  instructorId: number;
  receiptImageUrl?: string;
}

interface Order {
  id: number;
  userId: string;
  items: OrderItem[];
  totalAmount: string;
  orderDate: string;
  status: 'pending' | 'completed' | 'canceled';
}

interface InstructorGroup {
  instructorId: number;
  instructorName: string;
  items: { courseId: number; courseTitle: string; price: string; quantity: number; status: string }[];
  total: number;
  receiptImage?: File;
}

const ADMIN_CONTACT = {
  whatsapp: 'https://wa.me/+989123456789',
  telegram: 'https://t.me/admin_username',
};

const CheckoutMultiple: React.FC = () => {
  const { orders, createOrder, setOrders } = useOrderContext();
  const { submitPayment, generateInvoice } = usePaymentContext();
  const { showNotification } = useNotificationContext();
  const { cartItems, clearApprovedItems } = useCartContext();
  const { courses } = useCourseContext();
  const { user } = useAuthContext();
  const { instructors } = useInstructorContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptImages, setReceiptImages] = useState<{ [instructorId: number]: File }>({});

  const instructorGroups = useMemo(() => {
    const groups: InstructorGroup[] = [];
    cartItems.forEach((cartItem) => {
      const course = courses.find((c) => c.id === cartItem.courseId);
      if (!course) return;
      const instructor = instructors.find((inst) => inst.name === course.instructor);
      if (!instructor) return;
      const group = groups.find((g) => g.instructorId === instructor.id);
      const item = {
        courseId: cartItem.courseId,
        courseTitle: course.title,
        price: course.discountPrice || course.price,
        quantity: cartItem.quantity,
        status: cartItem.status || 'pending',
      };
      if (group) {
        group.items.push(item);
        group.total += parsePrice(item.price) * item.quantity;
      } else {
        groups.push({
          instructorId: instructor.id,
          instructorName: instructor.name,
          items: [item],
          total: parsePrice(item.price) * item.quantity,
          receiptImage: receiptImages[instructor.id],
        });
      }
    });
    return groups;
  }, [cartItems, courses, instructors, receiptImages]);

  const totalPrice = useMemo(() => {
    return formatPrice(
      instructorGroups.reduce((sum, group) => sum + group.total, 0)
    );
  }, [instructorGroups]);

  const handleFileChange = useCallback((instructorId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setError('اندازه فایل باید کمتر از ۵ مگابایت باشد.');
        return;
      }
      setReceiptImages((prev) => ({ ...prev, [instructorId]: file }));
      setError(null);
    } else {
      setError('لطفاً یک فایل تصویر معتبر انتخاب کنید.');
    }
  }, []);

  const handleSubmitPayment = useCallback(async () => {
    if (instructorGroups.some((group) => !receiptImages[group.instructorId])) {
      setError('لطفاً برای هر استاد تصویر فیش پرداخت را بارگذاری کنید.');
      return;
    }
    if (instructorGroups.length === 0) {
      setError('سبد خرید خالی است.');
      return;
    }
    setLoading(true);
    try {
      let orderId = orders[orders.length - 1]?.id;
      if (!orderId) {
        const orderItems = instructorGroups.flatMap((group) =>
          group.items.map((item) => ({
            courseId: item.courseId,
            courseTitle: item.courseTitle,
            price: item.price,
            purchaseDate: new Date().toLocaleDateString('fa-IR'),
            status: 'pending' as const,
            instructorId: group.instructorId,
            receiptImageUrl: receiptImages[group.instructorId] ? URL.createObjectURL(receiptImages[group.instructorId]) : undefined,
          }))
        );
        await createOrder(orderItems);
        orderId = orders[orders.length - 1]?.id || Math.max(...orders.map((o) => o.id), 0) + 1;
      }

      const updatedCartItems = cartItems.map((item) => ({
        ...item,
        status: 'pending' as const,
      }));
      localStorage.setItem('cart', JSON.stringify(updatedCartItems));

      for (const group of instructorGroups) {
        const receiptImageUrl = receiptImages[group.instructorId] ? URL.createObjectURL(receiptImages[group.instructorId]) : '';
        await submitPayment(orderId, receiptImageUrl, group.instructorId);
      }

      const isApproved = true;
      if (isApproved) {
        await generateInvoice(orderId);
        await clearApprovedItems();
        setOrders((prev: Order[]) =>
          prev.map((o: Order) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'completed',
                  items: o.items.map((item: OrderItem) => ({ ...item, status: 'completed' })),
                }
              : o
          )
        );
        showNotification('پرداخت تأیید شد و سبد خرید به‌روزرسانی شد.', 'success');
        navigate('/orders');
      } else {
        showNotification('پرداخت در انتظار تأیید ادمین است.', 'info');
        navigate('/cart');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'خطایی در ارسال پرداخت رخ داد.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [instructorGroups, receiptImages, orders, createOrder, setOrders, submitPayment, generateInvoice, showNotification, navigate, cartItems, clearApprovedItems]);

  const handleContinueInApp = useCallback((platform: 'whatsapp' | 'telegram', group: InstructorGroup) => {
    if (!user) {
      showNotification('لطفاً ابتدا وارد شوید.', 'error');
      navigate('/login');
      return;
    }
    const message = encodeURIComponent(
      `درخواست پرداخت\nنام: ${user.name}\nایمیل: ${user.email}\nدوره‌ها: ${group.items.map((item) => item.courseTitle).join(', ')}\nمبلغ: ${formatPrice(group.total)}`
    );
    const url = platform === 'whatsapp' ? `${ADMIN_CONTACT.whatsapp}?text=${message}` : `${ADMIN_CONTACT.telegram}?text=${message}`;
    window.open(url, '_blank');
  }, [user, showNotification, navigate]);

  if (instructorGroups.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <Alert severity="error" className={styles.errorAlert}>
          سبد خرید خالی است یا سفارش یافت نشد.
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.checkoutTitle}>پرداخت سبد خرید</h1>
      <div className={styles.orderDetails}>
        <h2 className={styles.sectionTitle}>جزئیات سفارش</h2>
        {instructorGroups.map((group) => {
          const instructor = instructors.find((inst) => inst.id === group.instructorId);
          return (
            <div key={group.instructorId} className={styles.instructorGroup}>
              <h3 className={styles.instructorTitle}>استاد: {group.instructorName}</h3>
              {instructor?.bankAccounts.map((account, index) => (
                <div key={index} className={styles.bankDetails}>
                  <p><strong>بانک:</strong> {account.bankName}</p>
                  <p><strong>نام صاحب حساب:</strong> {account.accountHolder}</p>
                  <p><strong>شماره حساب:</strong> {account.accountNumber}</p>
                </div>
              ))}
              {group.items.map((item) => (
                <div key={item.courseId} className={styles.orderItem}>
                  <p className={styles.itemTitle}>
                    <strong>دوره:</strong> {item.courseTitle}
                  </p>
                  <p className={styles.itemPrice}>
                    <strong>قیمت:</strong> {formatPrice(item.price)} (تعداد: {item.quantity})
                  </p>
                  <p className={styles.itemStatus}>
                    <strong>وضعیت:</strong>{' '}
                    {item.status === 'pending' ? 'در انتظار پرداخت' : 'در انتظار تأیید'}
                  </p>
                </div>
              ))}
              <p className={styles.groupTotal}>
                <strong>جمع کل برای {group.instructorName}:</strong> {formatPrice(group.total)}
              </p>
              <div className={styles.fileInputContainer}>
                <label htmlFor={`receipt-upload-${group.instructorId}`} className={styles.fileInputLabel}>
                  بارگذاری تصویر فیش پرداخت برای {group.instructorName}
                </label>
                <input
                  id={`receipt-upload-${group.instructorId}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(group.instructorId, e)}
                  className={styles.fileInput}
                />
                {receiptImages[group.instructorId] && (
                  <p className={styles.fileName}>فایل انتخاب‌شده: {receiptImages[group.instructorId].name}</p>
                )}
              </div>
              <div className={styles.continueButtons}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleContinueInApp('whatsapp', group)}
                  className={styles.continueButton}
                >
                  ادامه در واتساپ
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleContinueInApp('telegram', group)}
                  className={styles.continueButton}
                >
                  ادامه در تلگرام
                </Button>
              </div>
            </div>
          );
        })}
        <p className={styles.totalAmount}>
          <strong>مجموع کل:</strong> {totalPrice}
        </p>
        {error && (
          <Alert severity="error" className={styles.errorAlert}>
            {error}
          </Alert>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitPayment}
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? <CircularProgress size={24} /> : 'ارسال پرداخت'}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutMultiple;