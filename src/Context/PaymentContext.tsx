import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './Auth/UserAuthContext';
import { useOrderContext } from './OrderContext';
import { useNotificationContext } from './NotificationContext';
import DOMPurify from 'dompurify';

interface Payment {
  id: number;
  orderId: number;
  userId: string;
  amount: string;
  receiptImage: string;
  instructorId: number;
  status: 'pending' | 'verified' | 'rejected' | 'refunded';
  submissionDate: string;
  verificationDate?: string;
  rejectionReason?: string;
  refundReason?: string;
}

interface Invoice {
  id: number;
  orderId: number;
  userId: string;
  amount: string;
  issueDate: string;
  items: { courseId: number; courseTitle: string; price: string; instructorId: number; purchaseDate: string; status: 'pending' | 'completed' | 'canceled'; receiptImageUrl?: string }[];
}

interface FinancialReport {
  totalRevenue: string;
  totalPending: string;
  totalVerified: string;
  totalRefunded: string;
  paymentCount: number;
}

interface PaymentContextType {
  payments: Payment[];
  invoices: Invoice[];
  submitPayment: (orderId: number, receiptImage: string, instructorId: number) => Promise<void>;
  verifyPayment: (paymentId: number) => Promise<void>;
  rejectPayment: (paymentId: number, reason: string) => Promise<void>;
  refundPayment: (paymentId: number, reason: string) => Promise<void>;
  generateInvoice: (orderId: number) => Promise<Invoice>;
  getFinancialReport: () => FinancialReport;
  getUserPayments: (userId: string) => Payment[];
  getUserInvoices: (userId: string) => Invoice[];
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthContext();
  const { orders } = useOrderContext();
  const { showNotification } = useNotificationContext();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const storedPayments = localStorage.getItem('payments');
    const storedInvoices = localStorage.getItem('invoices');
    if (storedPayments) {
      try {
        setPayments(JSON.parse(storedPayments));
      } catch (error) {
        console.error('Error parsing payments from localStorage:', error);
      }
    }
    if (storedInvoices) {
      try {
        setInvoices(JSON.parse(storedInvoices));
      } catch (error) {
        console.error('Error parsing invoices from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [payments, invoices]);

  const submitPayment = async (orderId: number, receiptImage: string, instructorId: number) => {
    if (!isAuthenticated || !user) {
      throw new Error('برای ثبت پرداخت باید وارد حساب کاربری شوید.');
    }
    const order = orders.find((o) => o.id === orderId && o.userId === user.email);
    if (!order) {
      throw new Error('سفارش یافت نشد یا متعلق به شما نیست.');
    }
    if (order.status !== 'pending') {
      throw new Error('سفارش در وضعیت قابل پرداخت نیست.');
    }
    if (!receiptImage) {
      throw new Error('تصویر فیش معتبر نیست.');
    }

    try {
      const newPayment: Payment = {
        id: Math.max(...payments.map((p) => p.id), 0) + 1,
        orderId,
        userId: user.email,
        amount: order.totalAmount,
        receiptImage,
        instructorId,
        status: 'pending',
        submissionDate: new Date().toLocaleDateString('fa-IR'),
      };
      setPayments((prev) => [...prev, newPayment]);
      showNotification('فیش پرداخت با موفقیت ارسال شد و در انتظار تأیید است.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در ارسال فیش پرداخت.', 'error');
      throw error;
    }
  };

  const verifyPayment = async (paymentId: number) => {
    if (!user || !['SuperAdmin', 'Admin'].includes(user.role)) {
      throw new Error('فقط ادمین‌ها می‌توانند پرداخت را تأیید کنند.');
    }
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) {
      throw new Error('پرداخت یافت نشد.');
    }
    if (payment.status !== 'pending') {
      throw new Error('پرداخت در وضعیت قابل تأیید نیست.');
    }

    try {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? { ...p, status: 'verified', verificationDate: new Date().toLocaleDateString('fa-IR') }
            : p
        )
      );
      const order = orders.find((o) => o.id === payment.orderId);
      if (order) {
        setInvoices((prev) => [
          ...prev,
          {
            id: Math.max(...prev.map((i) => i.id), 0) + 1,
            orderId: payment.orderId,
            userId: payment.userId,
            amount: payment.amount,
            issueDate: new Date().toLocaleDateString('fa-IR'),
            items: order.items,
          },
        ]);
      }
      showNotification('پرداخت با موفقیت تأیید شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در تأیید پرداخت.', 'error');
      throw error;
    }
  };

  const rejectPayment = async (paymentId: number, reason: string) => {
    if (!user || !['SuperAdmin', 'Admin'].includes(user.role)) {
      throw new Error('فقط ادمین‌ها می‌توانند پرداخت را رد کنند.');
    }
    if (!reason.trim()) {
      throw new Error('لطفاً دلیل رد پرداخت را وارد کنید.');
    }
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) {
      throw new Error('پرداخت یافت نشد.');
    }
    if (payment.status !== 'pending') {
      throw new Error('پرداخت در وضعیت قابل رد نیست.');
    }

    try {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? { ...p, status: 'rejected', rejectionReason: DOMPurify.sanitize(reason) }
            : p
        )
      );
      showNotification('پرداخت با موفقیت رد شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در رد پرداخت.', 'error');
      throw error;
    }
  };

  const refundPayment = async (paymentId: number, reason: string) => {
    if (!user || !['SuperAdmin', 'Admin'].includes(user.role)) {
      throw new Error('فقط ادمین‌ها می‌توانند بازپرداخت انجام دهند.');
    }
    if (!reason.trim()) {
      throw new Error('لطفاً دلیل بازپرداخت را وارد کنید.');
    }
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) {
      throw new Error('پرداخت یافت نشد.');
    }
    if (payment.status !== 'verified') {
      throw new Error('فقط پرداخت‌های تأییدشده قابل بازپرداخت هستند.');
    }

    try {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? { ...p, status: 'refunded', refundReason: DOMPurify.sanitize(reason) }
            : p
        )
      );
      showNotification('بازپرداخت با موفقیت انجام شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در انجام بازپرداخت.', 'error');
      throw error;
    }
  };

  const generateInvoice = async (orderId: number): Promise<Invoice> => {
    if (!user) {
      throw new Error('برای تولید فاکتور باید وارد حساب کاربری شوید.');
    }
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error('سفارش یافت نشد.');
    }
    const payment = payments.find((p) => p.orderId === orderId && p.status === 'verified');
    if (!payment) {
      throw new Error('پرداخت تأییدشده برای این سفارش یافت نشد.');
    }

    try {
      const newInvoice: Invoice = {
        id: Math.max(...invoices.map((i) => i.id), 0) + 1,
        orderId,
        userId: order.userId,
        amount: order.totalAmount,
        issueDate: new Date().toLocaleDateString('fa-IR'),
        items: order.items,
      };
      setInvoices((prev) => [...prev, newInvoice]);
      showNotification('فاکتور با موفقیت تولید شد.', 'success');
      return newInvoice;
    } catch (error: any) {
      showNotification(error.message || 'خطا در تولید فاکتور.', 'error');
      throw error;
    }
  };

  const getFinancialReport = (): FinancialReport => {
    const totalRevenue = payments
      .filter((p: Payment) => p.status === 'verified')
      .reduce((sum: number, p: Payment) => sum + parseFloat(p.amount.replace(/[^\d.-]/g, '')), 0)
      .toLocaleString('fa-IR', { style: 'currency', currency: 'IRR' });

    const totalPending = payments
      .filter((p: Payment) => p.status === 'pending')
      .reduce((sum: number, p: Payment) => sum + parseFloat(p.amount.replace(/[^\d.-]/g, '')), 0)
      .toLocaleString('fa-IR', { style: 'currency', currency: 'IRR' });

    const totalRefunded = payments
      .filter((p: Payment) => p.status === 'refunded')
      .reduce((sum: number, p: Payment) => sum + parseFloat(p.amount.replace(/[^\d.-]/g, '')), 0)
      .toLocaleString('fa-IR', { style: 'currency', currency: 'IRR' });

    return {
      totalRevenue,
      totalPending,
      totalVerified: totalRevenue,
      totalRefunded,
      paymentCount: payments.length,
    };
  };

  const getUserPayments = (userId: string): Payment[] => {
    return payments.filter((p: Payment) => p.userId === userId);
  };

  const getUserInvoices = (userId: string): Invoice[] => {
    return invoices.filter((i: Invoice) => i.userId === userId);
  };

  return (
    <PaymentContext.Provider
      value={{
        payments,
        invoices,
        submitPayment,
        verifyPayment,
        rejectPayment,
        refundPayment,
        generateInvoice,
        getFinancialReport,
        getUserPayments,
        getUserInvoices,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePaymentContext must be used within a PaymentProvider');
  }
  return context;
};