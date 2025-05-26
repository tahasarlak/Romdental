import React, { useEffect, useState } from 'react';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import VerifiedIcon from '@mui/icons-material/Verified';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import styles from './WhyUs.module.css';

interface Feature {
  title: string;
  desc: string;
  icon: typeof MedicalServicesIcon; // نوع بر اساس یکی از آیکون‌ها
}

const WhyUs: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector(`.${styles.whyUs}`);
      if (section) {
        const { top } = section.getBoundingClientRect();
        if (top < window.innerHeight - 100) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features: Feature[] = [
    {
      title: 'اساتید متخصص',
      desc: 'تدریس توسط دندانپزشکان برجسته دانشگاه سماشکو با بیش از ۲۰ سال تجربه.',
      icon: MedicalServicesIcon,
    },
    {
      title: 'آموزش عملی',
      desc: 'تمرین روی مدل‌های واقعی و شبیه‌سازی کلینیکی پیشرفته.',
      icon: HealthAndSafetyIcon,
    },
    {
      title: 'گواهینامه معتبر',
      desc: 'گواهینامه مورد تأیید موسسه روم دنتال و قابل ارائه در سطح بین‌المللی.',
      icon: VerifiedIcon,
    },
    {
      title: 'پشتیبانی دائمی',
      desc: 'دسترسی ۲۴/۷ به مشاوران و منابع آموزشی پس از دوره.',
      icon: HeadsetMicIcon,
    },
  ];

  return (
    <section className={styles.whyUs}>
      <div className={styles.container}>
        <h2 className={`${styles.title} ${isVisible ? styles.titleVisible : ''}`}>
          چرا روم دنتال؟
        </h2>
        <p className={styles.subtitle}>
          تجربه‌ای بی‌نظیر از آموزش حرفه‌ای و لوکس در دندانپزشکی
        </p>
        <div className={styles.features}>
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className={`${styles.card} ${isVisible ? styles.cardVisible : ''}`}
                style={{ transitionDelay: `${index * 0.2}s` }}
              >
                <IconComponent className={styles.icon} />
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardDesc}>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;