import React, { useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import styles from './Signup.module.css';
import { useAuthContext } from '../../Context/AuthContext';

const Signup: React.FC = () => {
  const { signup } = useAuthContext();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    university: '',
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
      await signup(
        `${formData.firstName} ${formData.lastName}`,
        formData.email,
        formData.password,
        formData.phone,
        formData.university
      );
      setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', university: '' });
      alert('ثبت‌نام با موفقیت انجام شد!');
    } catch (error: any) {
      setError(error.message || 'خطا در ثبت‌نام!');
    }
  };

  return (
    <section className={styles.signupSection}>
      <div className={styles.container}>
        <h1 className={styles.title}>ثبت‌نام</h1>
        <p className={styles.subtitle}>برای شرکت در دوره‌ها ثبت‌نام کنید</p>

        <form onSubmit={handleSubmit} className={styles.signupForm}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>
              <PersonIcon /> نام
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="نام خود را وارد کنید"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.label}>
              <PersonIcon /> نام خانوادگی
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="نام خانوادگی خود را وارد کنید"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              <EmailIcon /> ایمیل
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ایمیل خود را وارد کنید"
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

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              <PhoneIcon /> شماره تماس
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="شماره تماس خود را وارد کنید"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="university" className={styles.label}>
              <SchoolIcon /> دانشگاه
            </label>
            <input
              type="text"
              id="university"
              name="university"
              value={formData.university}
              onChange={handleChange}
              placeholder="دانشگاه خود را وارد کنید"
              className={styles.input}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitButton}>
            ثبت‌نام
          </button>
        </form>
      </div>
    </section>
  );
};

export default Signup;