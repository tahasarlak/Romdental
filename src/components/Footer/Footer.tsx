import React from 'react';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.target as any).email.value;
    // اینجا می‌توانید درخواست به سرور بفرستید
    console.log('Newsletter subscription:', email);
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
            <li><a href="/" className={styles.link}>خانه</a></li>
            <li><a href="/about" className={styles.link}>درباره ما</a></li>
            <li><a href="/courses" className={styles.link}>دوره‌ها</a></li>
            <li><a href="/contact" className={styles.link}>تماس با ما</a></li>
            <li><a href="/blog" className={styles.link}>وبلاگ</a></li>
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
            <a href="https://www.instagram.com/roomdental" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <InstagramIcon />
            </a>
            <a href="https://t.me/roomdental" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <TelegramIcon />
            </a>
            <a href="https://wa.me/+989123456789" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <WhatsAppIcon />
            </a>
            <a href="https://www.linkedin.com/company/roomdental" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <LinkedInIcon />
            </a>
          </div>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <p>طراحی و توسعه توسط 
          <a href="/about#team" className={styles.link}>تیم روم دنتال</a></p>
      </div>
    </footer>
  );
};

export default Footer;