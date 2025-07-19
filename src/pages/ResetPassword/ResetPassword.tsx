import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import EmailIcon from '@mui/icons-material/Email';
import { useNotificationContext } from '../../Context/NotificationContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useForm, Controller, FieldValues } from 'react-hook-form';
import styles from './ResetPassword.module.css';
import { useAuthContext } from '../../Context/Auth/UserAuthContext';

interface FormData {
  identifier: string;
}

interface Errors {
  identifier?: string;
  root?: string;
}

interface FormFieldProps {
  label: string;
  name: keyof FormData;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  Icon?: React.ElementType;
  children?: React.ReactNode;
  ariaDescribedBy?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const FormField: React.FC<FormFieldProps> = React.memo(
  ({
    label,
    name,
    error,
    type = 'text',
    placeholder,
    required = false,
    Icon,
    children,
    ariaDescribedBy,
    inputRef,
  }) => (
    <div className={styles.formGroup}>
      <label htmlFor={name} className={styles.label}>
        {Icon && <Icon aria-hidden="true" />} {label} {required && <span aria-hidden="true">*</span>}
      </label>
      <div className={styles.inputContainer}>
        {children || (
          <input
            type={type}
            id={name}
            name={name}
            placeholder={placeholder}
            className={styles.input}
            required={required}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy || (error ? `${name}-error` : undefined)}
            ref={inputRef}
            maxLength={100}
          />
        )}
      </div>
      {error && (
        <p id={`${name}-error`} className={styles.error} role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  )
);

const ResetPassword: React.FC = () => {
  const { forgotPassword } = useAuthContext(); // Changed from resetPassword to forgotPassword
  const { showNotification } = useNotificationContext();
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors }, reset, setError } = useForm<FormData>({
    defaultValues: {
      identifier: '',
    },
    mode: 'onChange',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const identifierRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    identifierRef.current?.focus();
  }, []);

  useEffect(() => {
    if (retryAfter) {
      const timer = setTimeout(() => {
        setRetryAfter((prev) => (prev && prev > 0 ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [retryAfter]);

  useEffect(() => {
    if (errors.root || errors.identifier) {
      errorRef.current?.focus();
    }
  }, [errors]);

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (retryAfter) {
        showNotification(`لطفاً ${retryAfter} ثانیه دیگر تلاش کنید.`, 'error');
        errorRef.current?.focus();
        return;
      }

      setIsLoading(true);
      try {
        const sanitizedIdentifier = DOMPurify.sanitize(data.identifier.trim());

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedIdentifier);
        const isPhone = /^\+?\d{10,15}$/.test(sanitizedIdentifier);
        if (!isEmail && !isPhone) {
          setError('identifier', { message: 'ایمیل یا شماره تلفن نامعتبر است' });
          showNotification('ایمیل یا شماره تلفن نامعتبر است', 'error');
          identifierRef.current?.focus();
          return;
        }

        await forgotPassword(sanitizedIdentifier); // Changed from resetPassword to forgotPassword
        showNotification('ایمیل بازنشانی رمز عبور با رمز جدید ارسال شد. لطفاً ایمیل خود را بررسی کنید.', 'success');
        reset();
        navigate('/login');
      } catch (error: any) {
        let errorMessage = 'خطایی رخ داد. لطفاً دوباره تلاش کنید.';
        let field: keyof FormData | 'root' = 'root';

        if (error.message?.includes('NetworkError')) {
          errorMessage = 'اتصال به سرور برقرار نشد. لطفاً اینترنت خود را بررسی کنید.';
        } else if (error.message?.includes('ایمیل') || error.message?.includes('شماره تلفن')) {
          errorMessage = 'ایمیل یا شماره تلفن ثبت‌نشده است.';
          field = 'identifier';
        } else if (error.response?.status === 400) {
          errorMessage = 'ایمیل یا شماره تلفن نامعتبر است.';
          field = 'identifier';
        } else if (error.response?.status === 429) {
          const retrySec = parseInt(error.response.headers['retry-after'] || '300', 10);
          setRetryAfter(retrySec);
          errorMessage = `تعداد درخواست‌ها زیاد است. لطفاً ${retrySec} ثانیه دیگر تلاش کنید.`;
        } else if (error.response?.status === 500) {
          errorMessage = 'خطای سرور رخ داد. لطفاً با پشتیبانی تماس بگیرید.';
        } else if (error.message?.includes('CORS')) {
          errorMessage = 'خطای ارتباط با سرور. لطفاً با پشتیبانی تماس بگیرید.';
        } else {
          console.error('Unhandled error:', error);
        }

        setError(field, { message: errorMessage });
        showNotification(errorMessage, 'error');
        errorRef.current?.focus();
      } finally {
        setIsLoading(false);
      }
    },
    [forgotPassword, showNotification, setError, reset, retryAfter, navigate] // Updated dependency
  );

  return (
    <>
      <Helmet>
        <title>بازنشانی رمز عبور | روم دنتال</title>
        <meta name="description" content="برای بازنشانی رمز عبور، ایمیل یا شماره تلفن خود را وارد کنید." />
        <meta name="keywords" content="بازنشانی رمز عبور, آموزش آنلاین, سامانه آموزشی, روم دنتال" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="بازنشانی رمز عبور | روم دنتال" />
        <meta property="og:description" content="برای بازنشانی رمز عبور، ایمیل یا شماره تلفن خود را وارد کنید." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourwebsite.com/reset-password" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="بازنشانی رمز عبور | روم دنتال" />
        <meta name="twitter:description" content="برای بازنشانی رمز عبور، ایمیل یا شماره تلفن خود را وارد کنید." />
      </Helmet>
      <section className={styles.resetPasswordSection} aria-label="فرم بازنشانی رمز عبور">
        <div className={styles.container}>
          <header>
            <h1 className={styles.title}>بازنشانی رمز عبور</h1>
            <p className={styles.subtitle}>ایمیل یا شماره تلفن خود را وارد کنید تا رمز عبور جدید برای شما ارسال شود.</p>
          </header>

          <div ref={errorRef} tabIndex={-1} aria-live="assertive">
            {errors.root && (
              <p className={styles.error} role="alert">
                {errors.root.message}
              </p>
            )}
            {retryAfter && (
              <p className={styles.error} role="alert">
                لطفاً {retryAfter} ثانیه دیگر تلاش کنید.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.resetPasswordForm} role="form" noValidate>
            <Controller
              name="identifier"
              control={control}
              rules={{
                required: 'ایمیل یا شماره تلفن الزامی است',
                validate: (value) => {
                  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                  const isPhone = /^\+?\d{10,15}$/.test(value);
                  return isEmail || isPhone || 'ایمیل یا شماره تلفن نامعتبر است';
                },
              }}
              render={({ field }: { field: FieldValues }) => (
                <FormField
                  label="ایمیل یا شماره تلفن"
                  name="identifier"
                  error={errors.identifier?.message}
                  placeholder="ایمیل یا شماره تلفن خود را وارد کنید"
                  required
                  Icon={EmailIcon}
                  ariaDescribedBy="identifier-desc"
                  inputRef={identifierRef}
                >
                  <input {...field} type="text" className={styles.input} />
                  <span id="identifier-desc" className={styles.hidden}>
                    لطفاً ایمیل یا شماره تلفن خود را وارد کنید (مثال: example@domain.com یا +989123456789)
                  </span>
                </FormField>
              )}
            />
            <p className={styles.captchaNote}>
              توجه: برای جلوگیری از ربات‌ها، لطفاً از سیستم کپچای سرور (مانند reCAPTCHA) استفاده کنید.
            </p>
            <button
              type="submit"
              className={`${styles.submitButton} ${isLoading || retryAfter ? styles.disabled : ''}`}
              disabled={isLoading || !!retryAfter}
              aria-label="ارسال درخواست بازنشانی رمز عبور"
            >
              {isLoading ? (
                <>
                  <span className={styles.loader} aria-hidden="true"></span> در حال ارسال...
                </>
              ) : (
                'ارسال درخواست'
              )}
            </button>
            <p className={styles.subtitle}>
              حساب کاربری ندارید؟{' '}
              <RouterLink to="/signup">
                ثبت‌نام در سامانه آموزشی
              </RouterLink>
            </p>
            <p className={styles.subtitle}>
              <RouterLink to="/login">
                بازگشت به ورود
              </RouterLink>
            </p>
          </form>
        </div>
      </section>
    </>
  );
};

export default ResetPassword;