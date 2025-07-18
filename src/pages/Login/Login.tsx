import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNotificationContext } from '../../Context/NotificationContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useForm, Controller, FieldValues } from 'react-hook-form';
import styles from './Login.module.css';
import { useAuthContext } from '../../Context/Auth/UserAuthContext';

interface FormData {
  identifier: string;
  password: string;
}

interface Errors {
  identifier?: string;
  password?: string;
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
  showPassword?: boolean;
  toggleShowPassword?: () => void;
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
    showPassword,
    toggleShowPassword,
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
            maxLength={name === 'identifier' ? 100 : name === 'password' ? 50 : undefined}
          />
        )}
        {name === 'password' && (
          <button
            type="button"
            onClick={toggleShowPassword}
            className={styles.togglePassword}
            aria-label={showPassword ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
          >
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </button>
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

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors }, reset, setError } = useForm<FormData>({
    defaultValues: {
      identifier: '',
      password: '',
    },
    mode: 'onChange',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const identifierRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const redirectRoutes = useMemo(
    () => ({
      SuperAdmin: '/admin',
      Admin: '/admin',
      Instructor: '/instructor',
      Blogger: '/blogger',
      default: '/',
    }),
    []
  );

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
    if (!isAuthenticated) return;
    const route = redirectRoutes.default;
    navigate(route, { replace: true });
  }, [isAuthenticated, navigate, redirectRoutes]);

  useEffect(() => {
    if (errors.root || errors.identifier || errors.password) {
      errorRef.current?.focus();
    }
  }, [errors]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

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
        const sanitizedPassword = DOMPurify.sanitize(data.password);

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedIdentifier);
        const isPhone = /^\+?\d{10,15}$/.test(sanitizedIdentifier);
        if (!isEmail && !isPhone) {
          setError('identifier', { message: 'ایمیل یا شماره تلفن نامعتبر است' });
          showNotification('ایمیل یا شماره تلفن نامعتبر است', 'error');
          identifierRef.current?.focus();
          return;
        }

        if (sanitizedPassword.length < 8 || sanitizedPassword.length > 50) {
          setError('password', { message: 'رمز عبور باید بین ۸ تا ۵۰ کاراکتر باشد' });
          showNotification('رمز عبور باید بین ۸ تا ۵۰ کاراکتر باشد', 'error');
          return;
        }

        await login(sanitizedIdentifier, sanitizedPassword);
        reset();
        showNotification('ورود با موفقیت انجام شد!', 'success');
      } catch (error: any) {
        let errorMessage = 'خطایی رخ داد. لطفاً دوباره تلاش کنید.';
        let field: keyof FormData | 'root' = 'root';

        if (error.message?.includes('NetworkError')) {
          errorMessage = 'اتصال به سرور برقرار نشد. لطفاً اینترنت خود را بررسی کنید.';
        } else if (error.message?.includes('ایمیل') || error.message?.includes('شماره تلفن')) {
          errorMessage = 'ایمیل یا شماره تلفن نامعتبر است.';
          field = 'identifier';
        } else if (error.message?.includes('رمز عبور')) {
          errorMessage = 'رمز عبور اشتباه است.';
          field = 'password';
        } else if (error.response?.status === 400) {
          errorMessage = 'داده‌های ورودی نامعتبر هستند. لطفاً اطلاعات را بررسی کنید.';
          field = 'identifier';
        } else if (error.response?.status === 401) {
          errorMessage = 'ایمیل، شماره تلفن یا رمز عبور اشتباه است.';
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
    [login, showNotification, setError, reset, retryAfter]
  );

  const handleForgotPassword = useCallback(() => {
    navigate('/reset-password');
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>ورود به سامانه آموزشی | روم دنتال</title>
        <meta name="description" content="برای دسترسی به دوره‌های آموزشی، وارد حساب کاربری خود شوید." />
        <meta name="keywords" content="ورود به سامانه, آموزش آنلاین, دوره‌های آموزشی, سامانه آموزشی" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="ورود به سامانه آموزشی | روم دنتال" />
        <meta property="og:description" content="برای دسترسی به دوره‌های آموزشی، وارد حساب کاربری خود شوید." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourwebsite.com/login" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ورود به سامانه آموزشی | روم دنتال" />
        <meta name="twitter:description" content="برای دسترسی به دوره‌های آموزشی، وارد حساب کاربری خود شوید." />
      </Helmet>
      <section className={styles.loginSection} aria-label="فرم ورود به سامانه آموزشی">
        <div className={styles.container}>
          <header>
            <h1 className={styles.title}>ورود به سامانه آموزشی</h1>
            <p className={styles.subtitle}>برای دسترسی به دوره‌های آموزشی وارد حساب کاربری خود شوید</p>
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

          <form onSubmit={handleSubmit(onSubmit)} className={styles.loginForm} role="form" noValidate>
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
            <Controller
              name="password"
              control={control}
              rules={{
                required: 'رمز عبور الزامی است',
                minLength: { value: 8, message: 'رمز عبور باید حداقل ۸ کاراکتر باشد' },
                maxLength: { value: 50, message: 'رمز عبور نمی‌تواند بیش از ۵۰ کاراکتر باشد' },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,50}$/,
                  message: 'رمز عبور باید شامل حرف بزرگ، عدد و کاراکتر خاص باشد',
                },
              }}
              render={({ field }: { field: FieldValues }) => (
                <FormField
                  label="رمز عبور"
                  name="password"
                  error={errors.password?.message}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="رمز عبور خود را وارد کنید"
                  required
                  Icon={LockIcon}
                  ariaDescribedBy="password-desc"
                  showPassword={showPassword}
                  toggleShowPassword={toggleShowPassword}
                >
                  <input {...field} type={showPassword ? 'text' : 'password'} className={styles.input} />
                  <span id="password-desc" className={styles.hidden}>
                    رمز عبور باید بین ۸ تا ۵۰ کاراکتر، شامل حرف بزرگ، عدد و کاراکتر خاص باشد
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
              aria-label="ورود به سامانه آموزشی"
            >
              {isLoading ? (
                <>
                  <span className={styles.loader} aria-hidden="true"></span> در حال ورود...
                </>
              ) : (
                'ورود'
              )}
            </button>
            <p className={styles.subtitle}>
              <button
                type="button"
                onClick={handleForgotPassword}
                className={styles.link}
                aria-label="فراموشی رمز عبور"
              >
                رمز عبور خود را فراموش کرده‌اید؟
              </button>
            </p>
            <p className={styles.subtitle}>
              حساب کاربری ندارید؟{' '}
              <RouterLink to="/signup">
                ثبت‌نام در سامانه آموزشی
              </RouterLink>
            </p>
          </form>
        </div>
      </section>
    </>
  );
};

export default Login;