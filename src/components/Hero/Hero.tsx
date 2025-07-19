import React, { useEffect, useState } from 'react';
import styles from './Hero.module.css';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../Context/Auth/UserAuthContext';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isAuthenticated, user, users } = useAuthContext();

  // Animation for entrance on page load
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <section className={styles.hero}>
      {/* Background image from public folder */}
      <img
        src="/assets/7c4cbcb384c73a4e7ba384fd9f563819.jpg"
        alt="پس‌زمینه آموزش دندانپزشکی"
        className={`${styles.backgroundImage} ${imageLoaded ? styles.imageLoaded : ''}`}
        onLoad={handleImageLoad}
        loading="lazy"
      />

      <div className={styles.content}>
        <h1 className={`${styles.title} ${isVisible ? styles.titleVisible : ''}`}>
          {isAuthenticated && user ? `خوش آمدید، ${user.name}` : 'آموزش تخصصی دندانپزشکی'}
        </h1>
        <p className={`${styles.subtitle} ${isVisible ? styles.subtitleVisible : ''}`}>
          {isAuthenticated && user?.course
            ? `دوره انتخابی شما: ${user.course}`
            : 'دوره‌های پیشرفته آناتومی، پروپد و پروتز'}
          <br />
          دانشگاه سماشکو و موسسه روم دنتال
        </p>
        <div className={styles.buttons}>
          <Link to={isAuthenticated ? '/dashboard' : '/courses'} className={styles.navLink}>
            <button
              className={styles.primaryButton}
              aria-label={isAuthenticated ? "رفتن به داشبورد" : "شروع یادگیری"}
              onClick={() => window.location.href = isAuthenticated ? '/dashboard' : '/courses'}
            >
              <span>{isAuthenticated ? 'رفتن به داشبورد' : 'شروع یادگیری'}</span>
              <span className={styles.buttonIcon}>→</span>
            </button>
          </Link>
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
          <p>بیش از {users.length} دانشجو | گواهینامه معتبر | پشتیبانی ۲۴/۷</p>
        </div>
      </div>
      <div className={styles.wave}></div>
    </section>
  );
};

export default Hero;