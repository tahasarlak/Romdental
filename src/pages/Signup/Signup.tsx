  import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
  import { Helmet } from 'react-helmet';
  import PersonIcon from '@mui/icons-material/Person';
  import EmailIcon from '@mui/icons-material/Email';
  import LockIcon from '@mui/icons-material/Lock';
  import VisibilityIcon from '@mui/icons-material/Visibility';
  import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
  import PhoneIcon from '@mui/icons-material/Phone';
  import SchoolIcon from '@mui/icons-material/School';
  import WcIcon from '@mui/icons-material/Wc';
  import { useNotificationContext } from '../../Context/NotificationContext';
  import { useNavigate, Link as RouterLink } from 'react-router-dom';
  import DOMPurify from 'dompurify';
  import { useForm, Controller, FieldValues } from 'react-hook-form';
  import styles from './Signup.module.css';
  import { useAuthContext } from '../../Context/Auth/UserAuthContext';
  import 'react-phone-input-2/lib/style.css';

  const PhoneInput = React.lazy(() => import('react-phone-input-2'));

  interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    university: string;
    gender: 'مرد' | 'زن';
    course: string;
    otherCourse: string;
  }

  interface Errors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phone?: string;
    university?: string;
    gender?: string;
    course?: string;
    otherCourse?: string;
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
          {Icon && <Icon aria-hidden="true" />} {label} {required ? <span aria-hidden="true">*</span> : <span>(اختیاری)</span>}
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
              maxLength={name === 'firstName' || name === 'lastName' || name === 'university' ? 100 : name === 'password' ? 50 : undefined}
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

  const Signup: React.FC = () => {
    const { signup, checkUserExists } = useAuthContext();
    const { showNotification } = useNotificationContext();
    const navigate = useNavigate();
    const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>({
      defaultValues: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        university: '',
        gender: 'مرد',
        course: '',
        otherCourse: '',
      },
      mode: 'onChange',
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [retryAfter, setRetryAfter] = useState<number | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const firstNameRef = useRef<HTMLInputElement>(null);
    const errorRef = useRef<HTMLDivElement>(null);

    const courseValue = watch('course');

    const courses = useMemo<string[]>(() => ['پادفک', 'کورش ۱', 'کورش ۲', 'کورش ۳', 'کورش ۴', 'کورش ۵', 'بقیه موارد'], []);
    const genders = useMemo<string[]>(() => ['مرد', 'زن'], []);

    useEffect(() => {
      firstNameRef.current?.focus();
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
      if (errors.root || errors.firstName || errors.lastName || errors.email || errors.password || errors.phone || errors.university || errors.gender || errors.course || errors.otherCourse) {
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
          const sanitizedData = {
            name: DOMPurify.sanitize(`${data.firstName} ${data.lastName}`.trim()),
            email: DOMPurify.sanitize(data.email.trim()),
            password: DOMPurify.sanitize(data.password),
            phone: DOMPurify.sanitize(data.phone.trim()),
            university: DOMPurify.sanitize(data.university.trim()),
            course: data.course === 'بقیه موارد' ? DOMPurify.sanitize(data.otherCourse.trim()) : DOMPurify.sanitize(data.course),
            gender: data.gender,
          };

          if (sanitizedData.name.length > 200) {
            showNotification('نام و نام خانوادگی نمی‌تواند بیش از ۲۰۰ کاراکتر باشد.', 'error');
            firstNameRef.current?.focus();
            return;
          }
          if (sanitizedData.email.length > 100) {
            showNotification('ایمیل نمی‌تواند بیش از ۱۰۰ کاراکتر باشد.', 'error');
            return;
          }
          if (sanitizedData.password.length > 50) {
            showNotification('رمز عبور نمی‌تواند بیش از ۵۰ کاراکتر باشد.', 'error');
            return;
          }
          if (sanitizedData.university.length > 100) {
            showNotification('نام دانشگاه نمی‌تواند بیش از ۱۰۰ کاراکتر باشد.', 'error');
            return;
          }

          const userExists = await checkUserExists(sanitizedData.email, sanitizedData.phone);
          if (userExists) {
            showNotification('ثبت‌نام ناموفق بود. لطفاً اطلاعات را بررسی کنید.', 'error');
            firstNameRef.current?.focus();
            return;
          }

          await signup(
            sanitizedData.name,
            sanitizedData.email,
            sanitizedData.password,
            sanitizedData.phone,
            sanitizedData.university,
            sanitizedData.gender,
            sanitizedData.course,
            'Student'
          );

          showNotification('ثبت‌نام با موفقیت انجام شد! لطفاً وارد شوید.', 'success');
          reset();
          navigate('/login');
        } catch (error: any) {
          let errorMessage = 'خطایی رخ داد. لطفاً دوباره تلاش کنید.';
          let field: keyof FormData | 'root' = 'root';

          if (error.message?.includes('NetworkError')) {
            errorMessage = 'اتصال به سرور برقرار نشد. لطفاً اینترنت خود را بررسی کنید.';
          } else if (error.message?.includes('ایمیل نامعتبر')) {
            errorMessage = 'ایمیل واردشده معتبر نیست.';
            field = 'email';
          } else if (error.message?.includes('شماره تلفن')) {
            errorMessage = 'شماره تلفن باید با فرمت معتبر باشد (مثال: +989123456789).';
            field = 'phone';
          } else if (error.message?.includes('رمز عبور')) {
            errorMessage = 'رمز عبور باید حداقل ۸ کاراکتر، شامل حرف بزرگ، عدد و کاراکتر خاص باشد.';
            field = 'password';
          } else if (error.response?.status === 400) {
            errorMessage = 'داده‌های ورودی نامعتبر هستند. لطفاً فیلدها را بررسی کنید.';
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

          showNotification(errorMessage, 'error');
          errorRef.current?.focus();
        } finally {
          setIsLoading(false);
        }
      },
      [navigate, signup, checkUserExists, showNotification, retryAfter]
    );

    return (
      <>
        <Helmet>
          <title>ثبت‌نام در دوره‌های آموزشی | روم دنتال</title>
          <meta name="description" content="برای شرکت در دوره‌های آموزشی، فرم ثبت‌نام را پر کنید." />
          <meta name="keywords" content="ثبت‌نام دوره آموزشی, آموزش آنلاین, کورس‌های دانشگاهی, ثبت‌نام سامانه آموزشی" />
          <meta name="robots" content="index, follow" />
          <meta property="og:title" content="ثبت‌نام در دوره‌های آموزشی | روم دنتال" />
          <meta property="og:description" content="برای شرکت در دوره‌های آموزشی، فرم ثبت‌نام را پر کنید." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://yourwebsite.com/signup" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="ثبت‌نام در دوره‌های آموزشی | روم دنتال" />
          <meta name="twitter:description" content="برای شرکت در دوره‌های آموزشی، فرم ثبت‌نام را پر کنید." />
        </Helmet>
        <section className={styles.signupSection} aria-label="فرم ثبت‌نام دوره‌های آموزشی">
          <div className={styles.container}>
            <header>
              <h1 className={styles.title}>ثبت‌نام در دوره‌های آموزشی</h1>
              <p className={styles.subtitle}>برای شرکت در دوره‌های آموزشی، فرم زیر را پر کنید</p>
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

            <form onSubmit={handleSubmit(onSubmit)} className={styles.signupForm} role="form" noValidate>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'نام الزامی است', maxLength: { value: 100, message: 'نام نمی‌تواند بیش از ۱۰۰ کاراکتر باشد' } }}
                render={({ field }: { field: FieldValues }) => (
                  <FormField
                    label="نام"
                    name="firstName"
                    error={errors.firstName?.message}
                    placeholder="نام خود را وارد کنید"
                    required
                    Icon={PersonIcon}
                    ariaDescribedBy="firstName-desc"
                    inputRef={firstNameRef}
                  >
                    <input {...field} type="text" className={styles.input} />
                    <span id="firstName-desc" className={styles.hidden}>
                      لطفاً نام خود را وارد کنید
                    </span>
                  </FormField>
                )}
              />
              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'نام خانوادگی الزامی است', maxLength: { value: 100, message: 'نام خانوادگی نمی‌تواند بیش از ۱۰۰ کاراکتر باشد' } }}
                render={({ field }: { field: FieldValues }) => (
                  <FormField
                    label="نام خانوادگی"
                    name="lastName"
                    error={errors.lastName?.message}
                    placeholder="نام خانوادگی خود را وارد کنید"
                    required
                    Icon={PersonIcon}
                    ariaDescribedBy="lastName-desc"
                  >
                    <input {...field} type="text" className={styles.input} />
                    <span id="lastName-desc" className={styles.hidden}>
                      لطفاً نام خانوادگی خود را وارد کنید
                    </span>
                  </FormField>
                )}
              />
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'ایمیل الزامی است',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'ایمیل معتبر نیست' },
                  maxLength: { value: 100, message: 'ایمیل نمی‌تواند بیش از ۱۰۰ کاراکتر باشد' },
                }}
                render={({ field }: { field: FieldValues }) => (
                  <FormField
                    label="ایمیل"
                    name="email"
                    error={errors.email?.message}
                    type="email"
                    placeholder="ایمیل خود را وارد کنید"
                    required
                    Icon={EmailIcon}
                    ariaDescribedBy="email-desc"
                  >
                    <input {...field} type="email" className={styles.input} />
                    <span id="email-desc" className={styles.hidden}>
                      لطفاً ایمیل معتبر وارد کنید (مثال: example@domain.com)
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
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: 'شماره تلفن الزامی است',
                }}
                render={({ field }: { field: FieldValues }) => (
                  <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.label}>
                      <PhoneIcon aria-hidden="true" /> شماره تماس <span aria-hidden="true">*</span>
                    </label>
                    <Suspense fallback={<div>در حال بارگذاری...</div>}>
                      <PhoneInput
                        country={'ir'}
                        preferredCountries={['ir', 'us', 'gb']}
                        value={field.value}
                        onChange={field.onChange}
                        inputProps={{
                          id: 'phone',
                          name: 'phone',
                          required: true,
                          className: `${styles.input} ${styles.phoneInput}`,
                        }}
                        containerClass={styles.phoneContainer}
                        buttonClass={styles.phoneButton}
                        dropdownClass={styles.phoneDropdown}
                        placeholder="شماره تلفن خود را وارد کنید"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : 'phone-desc'}
                      />
                    </Suspense>
                    <span id="phone-desc" className={styles.hidden}>
                      لطفاً شماره تلفن خود را با کد کشور وارد کنید (مثال: +989123456789)
                    </span>
                    {errors.phone && (
                      <p id="phone-error" className={styles.error} role="alert" aria-live="assertive">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="university"
                control={control}
                rules={{
                  required: 'دانشگاه الزامی است',
                  maxLength: { value: 100, message: 'نام دانشگاه نمی‌تواند بیش از ۱۰۰ کاراکتر باشد' },
                }}
                render={({ field }: { field: FieldValues }) => (
                  <FormField
                    label="دانشگاه"
                    name="university"
                    error={errors.university?.message}
                    placeholder="دانشگاه خود را وارد کنید"
                    required
                    Icon={SchoolIcon}
                    ariaDescribedBy="university-desc"
                  >
                    <input {...field} type="text" className={styles.input} />
                    <span id="university-desc" className={styles.hidden}>
                      لطفاً نام دانشگاه خود را وارد کنید
                    </span>
                  </FormField>
                )}
              />
              <Controller
                name="gender"
                control={control}
                rules={{ required: 'جنسیت الزامی است' }}
                render={({ field }: { field: FieldValues }) => (
                  <FormField
                    label="جنسیت"
                    name="gender"
                    error={errors.gender?.message}
                    required
                    Icon={WcIcon}
                    ariaDescribedBy="gender-desc"
                  >
                    <select {...field} className={styles.input} required aria-invalid={!!errors.gender} aria-describedby="gender-desc">
                      <option value="" disabled>لطفاً جنسیت را انتخاب کنید</option>
                      {genders.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender}
                        </option>
                      ))}
                    </select>
                    <span id="gender-desc" className={styles.hidden}>
                      لطفاً جنسیت خود را انتخاب کنید
                    </span>
                  </FormField>
                )}
              />
              <Controller
                name="course"
                control={control}
                rules={{ required: 'کورس الزامی است' }}
                render={({ field }: { field: FieldValues }) => (
                  <FormField
                    label="کورس"
                    name="course"
                    error={errors.course?.message}
                    Icon={SchoolIcon}
                    ariaDescribedBy="course-desc"
                  >
                    <select {...field} className={styles.input} required aria-describedby="course-desc">
                      <option value="" disabled>لطفاً کورس را انتخاب کنید</option>
                      {courses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                    <span id="course-desc" className={styles.hidden}>
                      لطفاً کورس مورد نظر خود را انتخاب کنید
                    </span>
                  </FormField>
                )}
              />
              {courseValue === 'بقیه موارد' && (
                <Controller
                  name="otherCourse"
                  control={control}
                  rules={{
                    required: 'نام کورس الزامی است',
                    maxLength: { value: 100, message: 'نام کورس نمی‌تواند بیش از ۱۰۰ کاراکتر باشد' },
                  }}
                  render={({ field }: { field: FieldValues }) => (
                    <FormField
                      label="سایر کورس‌ها"
                      name="otherCourse"
                      error={errors.otherCourse?.message}
                      placeholder="نام کورس دیگر را وارد کنید"
                      required
                      Icon={SchoolIcon}
                      ariaDescribedBy="otherCourse-desc"
                    >
                      <input {...field} type="text" className={styles.input} />
                      <span id="otherCourse-desc" className={styles.hidden}>
                        لطفاً نام کورس دیگر را وارد کنید
                      </span>
                    </FormField>
                  )}
                />
              )}
              <p className={styles.captchaNote}>
                توجه: برای جلوگیری از ربات‌ها، لطفاً از سیستم کپچای سرور (مانند reCAPTCHA) استفاده کنید.
              </p>
              <button
                type="submit"
                className={`${styles.submitButton} ${isLoading || retryAfter ? styles.disabled : ''}`}
                disabled={isLoading || !!retryAfter}
                aria-label="ثبت‌نام در سامانه آموزشی"
              >
                {isLoading ? (
                  <>
                    <span className={styles.loader} aria-hidden="true"></span> در حال ثبت‌نام...
                  </>
                ) : (
                  'ثبت‌نام'
                )}
              </button>
              <p className={styles.subtitle}>
                حساب کاربری دارید؟{' '}
                <RouterLink to="/login">
                  ورود به سامانه آموزشی
                </RouterLink>
              </p>
            </form>
          </div>
        </section>
      </>
    );
  };

  export default Signup;