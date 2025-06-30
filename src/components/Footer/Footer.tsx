import React from 'react';
import InstagramIcon from '@mui/icons-material/Instagram'; // آیکون اینستاگرام
import TelegramIcon from '@mui/icons-material/Telegram'; // آیکون تلگرام
import WhatsAppIcon from '@mui/icons-material/WhatsApp'; // آیکون واتس‌اپ
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.target as any).email.value;
    console.log('اشتراک در خبرنامه با ایمیل:', email);
    // اینجا می‌توانید درخواست به سرور بفرستید
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* بخش لوگو و کپی‌رایت */}
        <div className={styles.section}>
          <h3 className={styles.logo}>روم دنتال - سماشکو</h3>
          <p className={styles.description}>
            موسسه آموزشی پیشرو در زمینه دندانپزشکی با هدف ارتقای مهارت‌های حرفه‌ای
          </p>
          <p className={styles.copyright}>© ۱۴۰۴ - تمامی حقوق محفوظ است</p>
        </div>

        {/* بخش لینک‌ها */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>لینک‌های مفید</h4>
          <ul className={styles.list}>
            <li><a href="#home" className={styles.link}>خانه</a></li>
            <li><a href="#about" className={styles.link}>درباره ما</a></li>
            <li><a href="#courses" className={styles.link}>دوره‌ها</a></li>
            <li><a href="#contact" className={styles.link}>تماس با ما</a></li>
            <li><a href="#blog" className={styles.link}>وبلاگ</a></li>
          </ul>
        </div>

        {/* بخش تماس */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>تماس با ما</h4>
          <p>ایمیل: <a href="mailto:info@roomdental.com" className={styles.link}>info@roomdental.com</a></p>
          <p>تلفن: <a href="tel:+982112345678" className={styles.link}>021-12345678</a></p>
          <p>آدرس: تهران، خیابان ولیعصر، پلاک ۱۲۳</p>
        </div>

        {/* بخش خبرنامه و شبکه‌های اجتماعی */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>اشتراک در خبرنامه</h4>
          <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              name="email"
              placeholder="ایمیل خود را وارد کنید"
              className={styles.newsletterInput}
              required
            />
            <button type="submit" className={styles.newsletterButton}>اشتراک</button>
          </form>
          <div className={styles.socialIcons}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <InstagramIcon />
            </a>
            <a href="https://telegram.me/rom-dental" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <TelegramIcon />
            </a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <WhatsAppIcon />
            </a>
          </div>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <p>طراحی و توسعه توسط 
          <a href="#team" className={styles.link}>تیم روم دنتال</a></p>
      </div>
    </footer>
  );
};

export default Footer;