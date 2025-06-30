import React, { useState } from 'react';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import styles from './Login.module.css';
import { useAuthContext } from '../../Context/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuthContext();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(formData.identifier, formData.password);
      setFormData({ identifier: '', password: '' });
      alert('ورود با موفقیت انجام شد!');
    } catch (error: any) {
      setError(error.message || 'خطا در ورود!');
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
            />
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
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitButton}>
            ورود
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;