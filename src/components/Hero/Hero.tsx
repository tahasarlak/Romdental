import React, { useEffect, useState } from 'react';
import styles from './Hero.module.css';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false); // وضعیت بارگذاری تصویر

  // انیمیشن ورود موقع لود صفحه
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // مدیریت بارگذاری تصویر
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <section className={styles.hero}>
      {/* تصویر پس‌زمینه از پوشه public */}
      <img
        src="/assets/7c4cbcb384c73a4e7ba384fd9f563819.jpg" // مسیر نسبی از public
        alt="پس‌زمینه آموزش دندانپزشکی"
        className={`${styles.backgroundImage} ${imageLoaded ? styles.imageLoaded : ''}`}
        onLoad={handleImageLoad}
        loading="lazy" // بهینه‌سازی بارگذاری
      />

      <div className={styles.content}>
        <h1 className={`${styles.title} ${isVisible ? styles.titleVisible : ''}`}>
          آموزش تخصصی دندانپزشکی
        </h1>
        <p className={`${styles.subtitle} ${isVisible ? styles.subtitleVisible : ''}`}>
          دوره‌های پیشرفته آناتومی، پروپد و پروتز
          <br />
          دانشگاه سماشکو و موسسه روم دنتال
        </p>
        <div className={styles.buttons}>
         <Link to="/courses" className={styles.navLink}>
             <button
            className={styles.primaryButton}
            aria-label="شروع یادگیری"
            onClick={() => window.location.href = '/courses'}
          >
            <span>  شروع یادگیری</span>
            <span className={styles.buttonIcon}>→</span>
          </button></Link>
          <button
            className={styles.secondaryButton}
            aria-label="تماس با ما"
            onClick={() => window.location.href = '/contact'}
          >
            <span>تماس با ما</span>
            <span className={styles.buttonIcon}>✆</span>
          </button>
        </div>
        <div className={styles.extraInfo}>
          <p>بیش از ۲۰۰۰ دانشجو | گواهینامه معتبر | پشتیبانی ۲۴/۷</p>
        </div>
      </div>
      <div className={styles.wave}></div>
    </section>
  );
};

export default Hero;