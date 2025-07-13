import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import DOMPurify from 'dompurify';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import styles from './Contact.module.css';
import { useContactContext } from '../../Context/ContactContext';
import { useNotificationContext } from '../../Context/NotificationContext';

/**
 * Contact Component
 * Displays a contact form and contact information with social media links.
 * Supports form validation, SEO, and sanitized input handling.
 */
const Contact: React.FC = React.memo(() => {
  const { addMessage, contactInfo } = useContactContext();
  const { showNotification } = useNotificationContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  /**
   * Handle form input changes
   * @param e - Change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  /**
   * Validate form inputs
   * @returns {boolean} - True if form is valid
   */
  const validateForm = () => {
    const newErrors = { name: '', email: '', subject: '', message: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'نام الزامی است.';
      isValid = false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'ایمیل معتبر وارد کنید.';
      isValid = false;
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'موضوع الزامی است.';
      isValid = false;
    }
    if (!formData.message.trim() || formData.message.length > 500) {
      newErrors.message = 'پیام باید بین ۱ تا ۵۰۰ کاراکتر باشد.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Handle form submission
   * @param e - Form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showNotification('لطفاً خطاهای فرم را برطرف کنید.', 'error');
      return;
    }

    const success = addMessage({
      name: DOMPurify.sanitize(formData.name),
      email: DOMPurify.sanitize(formData.email),
      subject: DOMPurify.sanitize(formData.subject),
      message: DOMPurify.sanitize(formData.message),
    });

    if (success) {
      setFormData({ name: '', email: '', subject: '', message: '' });
      showNotification('پیام شما با موفقیت ارسال شد!', 'success');
    } else {
      showNotification('خطا در ارسال پیام. لطفاً ورودی‌ها را بررسی کنید.', 'error');
    }
  };

  return (
    <section className={styles.contactSection}>
      <Helmet>
        <title>تماس با ما | روم دنتال</title>
        <meta
          name="description"
          content="با روم دنتال از طریق فرم تماس، تلفن، ایمیل یا شبکه‌های اجتماعی در ارتباط باشید."
        />
        <meta name="keywords" content="تماس, روم دنتال, دندانپزشکی, پشتیبانی" />
      </Helmet>
      <div className={styles.container}>
        <h1 className={styles.title}>تماس با ما</h1>
        <p className={styles.subtitle}>
          با ما در ارتباط باشید، از طریق فرم، تماس مستقیم یا شبکه‌های اجتماعی
        </p>

        <div className={styles.contactWrapper}>
          <div className={styles.formContainer}>
            <h2 className={styles.sectionTitle}>ارسال پیام</h2>
            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  <PersonIcon /> نام
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="نام خود را وارد کنید"
                  className={styles.input}
                  required
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name && <span className={styles.error}>{errors.name}</span>}
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
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && <span className={styles.error}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject" className={styles.label}>
                  <CommentIcon /> موضوع
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="موضوع پیام"
                  className={styles.input}
                  required
                  aria-invalid={errors.subject ? 'true' : 'false'}
                />
                {errors.subject && <span className={styles.error}>{errors.subject}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>
                  <CommentIcon /> پیام
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="پیام خود را بنویسید"
                  className={styles.textarea}
                  rows={5}
                  required
                  aria-invalid={errors.message ? 'true' : 'false'}
                />
                {errors.message && <span className={styles.error}>{errors.message}</span>}
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                aria-label="ارسال پیام تماس"
              >
                <SendIcon /> ارسال پیام
              </button>
            </form>
          </div>

          <div className={styles.infoContainer}>
            <h2 className={styles.sectionTitle}>اطلاعات تماس</h2>
            <div className={styles.contactInfo}>
              <p className={styles.infoItem}>
                <PhoneIcon /> <span>تلفن: {contactInfo.phone}</span>
              </p>
              <p className={styles.infoItem}>
                <EmailIcon /> <span>ایمیل: {contactInfo.email}</span>
              </p>
              <p className={styles.infoItem}>
                <LocationOnIcon /> <span>آدرس: {contactInfo.address}</span>
              </p>
            </div>

            <h2 className={styles.sectionTitle}>ما را دنبال کنید</h2>
            <div className={styles.socialLinks}>
              <a
                href={contactInfo.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="صفحه اینستاگرام روم دنتال"
              >
                <InstagramIcon /> اینستاگرام
              </a>
              <a
                href={contactInfo.socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="کانال تلگرام روم دنتال"
              >
                <TelegramIcon /> تلگرام
              </a>
              <a
                href={contactInfo.socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="واتساپ روم دنتال"
              >
                <WhatsAppIcon /> واتساپ
              </a>
              <a
                href={contactInfo.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="صفحه لینکدین روم دنتال"
              >
                <LinkedInIcon /> لینکدین
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default Contact;