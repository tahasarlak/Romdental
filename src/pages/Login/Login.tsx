import React, { useState, useEffect } from 'react';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useAuthContext } from '../../Context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

interface FormData {
  identifier: string;
  password: string;
  captchaAnswer: string;
}

const Login: React.FC = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    identifier: '',
    password: '',
    captchaAnswer: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [captchaNumbers, setCaptchaNumbers] = useState({ num1: 0, num2: 0, sum: 0 });

  // تولید دو عدد تصادفی برای کپچا
  useEffect(() => {
    const num1 = Math.floor(Math.random() * 10) + 1; // عدد تصادفی بین 1 تا 10
    const num2 = Math.floor(Math.random() * 10) + 1; // عدد تصادفی بین 1 تا 10
    setCaptchaNumbers({ num1, num2, sum: num1 + num2 });
  }, []);

  const validate = (): Partial<FormData> => {
    const newErrors: Partial<FormData> = {};
    if (!formData.identifier) newErrors.identifier = 'ایمیل یا شماره تلفن الزامی است';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    if (!formData.captchaAnswer || parseInt(formData.captchaAnswer) !== captchaNumbers.sum) {
      newErrors.captchaAnswer = 'پاسخ جمع اشتباه است';
    }
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    try {
      await login(formData.identifier, formData.password);
      setFormData({ identifier: '', password: '', captchaAnswer: '' });
      // تولید کپچای جدید پس از ورود موفق
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      setCaptchaNumbers({ num1, num2, sum: num1 + num2 });
      navigate('/');
    } catch (error: any) {
      setErrors({ identifier: error.message || 'خطا در ورود!' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.loginSection}>
      <div className={styles.container}>
        <h1 className={styles.title}>ورود به سامانه</h1>
        <p className={styles.subtitle}>برای دسترسی به دوره‌ها وارد شوید</p>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="identifier" className={styles.label}>
              <EmailIcon /> ایمیل یا شماره تلفن
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="ایمیل یا شماره تلفن خود را وارد کنید"
              className={styles.input}
              required
              aria-invalid={!!errors.identifier}
              aria-describedby={errors.identifier ? 'identifier-error' : undefined}
            />
            {errors.identifier && <p id="identifier-error" className={styles.error}>{errors.identifier}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              <LockIcon /> رمز عبور
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="رمز عبور خود را وارد کنید"
              className={styles.input}
              required
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && <p id="password-error" className={styles.error}>{errors.password}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="captchaAnswer" className={styles.label}>
              <CalculateIcon /> تأیید ربات نبودن: {captchaNumbers.num1} + {captchaNumbers.num2} = ?
            </label>
            <input
              type="number"
              id="captchaAnswer"
              name="captchaAnswer"
              value={formData.captchaAnswer}
              onChange={handleChange}
              placeholder="حاصل جمع را وارد کنید"
              className={styles.input}
              required
              aria-invalid={!!errors.captchaAnswer}
              aria-describedby={errors.captchaAnswer ? 'captchaAnswer-error' : undefined}
            />
            {errors.captchaAnswer && <p id="captchaAnswer-error" className={styles.error}>{errors.captchaAnswer}</p>}
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'در حال ورود...' : 'ورود'}
          </button>

          <p className={styles.subtitle}>
            حساب کاربری ندارید؟ <Link to="/signup" className={styles.link}>ثبت‌نام</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;