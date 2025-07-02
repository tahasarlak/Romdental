import React, { useState, useEffect } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import WcIcon from '@mui/icons-material/Wc';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useAuthContext } from '../../Context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Signup.module.css';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  university: string;
  gender: 'مرد' | 'زن' | '';
  course: string;
  otherCourse: string;
  captchaAnswer: string;
}

const courses = ['پادفکت', 'کورس ۱', 'کورس ۲', 'کورس ۳', 'کورس ۴', 'کورس ۵', 'بقیه موارد'];
const genders = ['مرد', 'زن'];

const Signup: React.FC = () => {
  const { signup } = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    university: '',
    gender: '',
    course: '',
    otherCourse: '',
    captchaAnswer: '',
  });
  const [errors, setErrors] = useState<Partial<FormData> & { genderError?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [captchaNumbers, setCaptchaNumbers] = useState({ num1: 0, num2: 0, sum: 0 });

  // تولید دو عدد تصادفی برای کپچا
  useEffect(() => {
    const num1 = Math.floor(Math.random() * 10) + 1; // عدد تصادفی بین 1 تا 10
    const num2 = Math.floor(Math.random() * 10) + 1; // عدد تصادفی بین 1 تا 10
    setCaptchaNumbers({ num1, num2, sum: num1 + num2 });
  }, []);

  const validate = (): Partial<FormData> & { genderError?: string } => {
    const newErrors: Partial<FormData> & { genderError?: string } = {};
    if (!formData.firstName) newErrors.firstName = 'نام الزامی است';
    if (!formData.lastName) newErrors.lastName = 'نام خانوادگی الزامی است';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'ایمیل معتبر نیست';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    if (!formData.phone || !/^09[0-9]{9}$/.test(formData.phone)) newErrors.phone = 'شماره تلفن معتبر نیست';
    if (!formData.university) newErrors.university = 'دانشگاه الزامی است';
    if (!formData.gender) newErrors.genderError = 'جنسیت الزامی است';
    if (formData.course === 'بقیه موارد' && !formData.otherCourse) newErrors.otherCourse = 'لطفاً نام کورس را وارد کنید';
    if (!formData.captchaAnswer || parseInt(formData.captchaAnswer) !== captchaNumbers.sum) {
      newErrors.captchaAnswer = 'پاسخ جمع اشتباه است';
    }
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '', genderError: '' }));
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
      await signup(
        `${formData.firstName} ${formData.lastName}`,
        formData.email,
        formData.password,
        formData.phone,
        formData.university,
        formData.gender as 'مرد' | 'زن',
        formData.course === 'بقیه موارد' ? formData.otherCourse : formData.course
      );
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        university: '',
        gender: '',
        course: '',
        otherCourse: '',
        captchaAnswer: '',
      });
      // تولید کپچای جدید پس از ثبت‌نام موفق
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      setCaptchaNumbers({ num1, num2, sum: num1 + num2 });
      navigate('/login');
    } catch (error: any) {
      setErrors({ email: error.message || 'خطا در ثبت‌نام!' });
    } finally {
      setIsLoading(false);
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
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            {errors.firstName && <p id="firstName-error" className={styles.error}>{errors.firstName}</p>}
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
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            />
            {errors.lastName && <p id="lastName-error" className={styles.error}>{errors.lastName}</p>}
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
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && <p id="email-error" className={styles.error}>{errors.email}</p>}
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
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && <p id="phone-error" className={styles.error}>{errors.phone}</p>}
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
              aria-invalid={!!errors.university}
              aria-describedby={errors.university ? 'university-error' : undefined}
            />
            {errors.university && <p id="university-error" className={styles.error}>{errors.university}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="gender" className={styles.label}>
              <WcIcon /> جنسیت
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={styles.input}
              required
              aria-invalid={!!errors.genderError}
              aria-describedby={errors.genderError ? 'gender-error' : undefined}
            >
              <option value="">انتخاب کنید</option>
              {genders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
            {errors.genderError && <p id="gender-error" className={styles.error}>{errors.genderError}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="course" className={styles.label}>
              <SchoolIcon /> کورس (اختیاری)
            </label>
            <select
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="">انتخاب کنید</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          {formData.course === 'بقیه موارد' && (
            <div className={styles.formGroup}>
              <label htmlFor="otherCourse" className={styles.label}>
                <SchoolIcon /> نام کورس دیگر
              </label>
              <input
                type="text"
                id="otherCourse"
                name="otherCourse"
                value={formData.otherCourse}
                onChange={handleChange}
                placeholder="نام کورس را وارد کنید"
                className={styles.input}
                required
                aria-invalid={!!errors.otherCourse}
                aria-describedby={errors.otherCourse ? 'otherCourse-error' : undefined}
              />
              {errors.otherCourse && <p id="otherCourse-error" className={styles.error}>{errors.otherCourse}</p>}
            </div>
          )}

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
            {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </button>

          <p className={styles.subtitle}>
            حساب کاربری دارید؟ <Link to="/login" className={styles.link}>ورود</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Signup;