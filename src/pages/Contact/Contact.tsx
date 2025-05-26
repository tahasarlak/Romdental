import React, { useState } from 'react';
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

const Contact: React.FC = () => {
  const { addMessage } = useContactContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMessage(formData);
    setFormData({ name: '', email: '', subject: '', message: '' });
    alert('پیام شما با موفقیت ارسال شد!');
  };

  return (
    <section className={styles.contactSection}>
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
                />
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
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                <SendIcon /> ارسال پیام
              </button>
            </form>
          </div>

          <div className={styles.infoContainer}>
            <h2 className={styles.sectionTitle}>اطلاعات تماس</h2>
            <div className={styles.contactInfo}>
              <p className={styles.infoItem}>
                <PhoneIcon /> <span>تلفن: ۰۲۱-۱۲۳۴۵۶۷۸</span>
              </p>
              <p className={styles.infoItem}>
                <EmailIcon /> <span>ایمیل: info@roomdental.com</span>
              </p>
              <p className={styles.infoItem}>
                <LocationOnIcon /> <span>آدرس: تهران، خیابان ولیعصر، پلاک ۱۲۳</span>
              </p>
            </div>

            <h2 className={styles.sectionTitle}>ما را دنبال کنید</h2>
            <div className={styles.socialLinks}>
              <a href="https://instagram.com/roomdental" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <InstagramIcon /> اینستاگرام
              </a>
              <a href="https://t.me/roomdental" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <TelegramIcon /> تلگرام
              </a>
              <a href="https://wa.me/989123456789" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <WhatsAppIcon /> واتساپ
              </a>
              <a href="https://linkedin.com/company/roomdental" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <LinkedInIcon /> لینکدین
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;