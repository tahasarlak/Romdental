import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../Context/Auth/UserAuthContext';
import { useCourseContext } from '../../Context/CourseContext';
import { useReviewContext } from '../../Context/ReviewContext';
import styles from './Stats.module.css';

interface Stat {
  value: number;
  label: string;
  description: string;
  extraInfo?: string;
}

const Stats: React.FC = () => {
  const { users } = useAuthContext();
  const { courses } = useCourseContext();
  const { reviews } = useReviewContext();

 
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<number[]>([0, 0, 0]);

  // Calculate average course satisfaction based on reviews
  const satisfactionPercentage = reviews?.length
    ? Math.round(
        (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length) * 20
      )
    : 0;

  // Stats data
  const stats: Stat[] = [
    {
      value: users?.length || 0,
      label: 'کاربر ثبت‌نام‌شده',
      description: `بیش از ${users?.length || 0} نفر به جمع ما پیوسته‌اند.`,
    },
    {
      value: courses?.length || 0,
      label: 'دوره آموزشی',
      description: `بیش از ${courses?.length || 0} دوره متنوع و پیشرفته.`,
    },
    {
      value: satisfactionPercentage,
      label: 'رضایت از دوره‌ها',
      description: `${reviews?.length || 0} نفر از شرکت‌کنندگان نظر داده‌اند.`,
      extraInfo: `${satisfactionPercentage}%`,
    },
  ];

  // Scroll detection for animation trigger
  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector(`.${styles.stats}`);
      if (section) {
        const { top } = section.getBoundingClientRect();
        if (top < window.innerHeight * 0.8 && !isVisible) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  // Number animation
  useEffect(() => {
    if (isVisible) {
      const timers: NodeJS.Timeout[] = [];
      stats.forEach((stat, index) => {
        const end = stat.value;
        let start = animatedValues[index] || 0;
        const duration = 1000; // کاهش مدت‌زمان به 1 ثانیه
        const minStepTime = 50; // حداقل زمان مرحله (میلی‌ثانیه)
        const steps = Math.max(Math.floor(end / 10), 1); // حداقل یک مرحله
        const stepTime = Math.max(minStepTime, Math.floor(duration / steps));
        const increment = Math.ceil(end / (duration / stepTime));

        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            start = end;
            clearInterval(timer);
          }
          setAnimatedValues((prev) => {
            const newValues = [...prev];
            newValues[index] = start;
            return newValues;
          });
        }, stepTime);
        timers.push(timer);
      });

      return () => timers.forEach((timer) => clearInterval(timer));
    }
  }, [isVisible, stats]);

  return (
    <section className={styles.stats} role="region" aria-labelledby="stats-title">
      <div className={styles.container}>
        <h2
          id="stats-title"
          className={`${styles.title} ${isVisible ? styles.titleVisible : ''}`}
        >
          دستاوردهای ما
        </h2>
        <p className={styles.subtitle}>
          نتایجی که نشان‌دهنده تعهد ما به آموزش باکیفیت است
        </p>
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${styles.item} ${isVisible ? styles.itemVisible : ''}`}
              style={{ transitionDelay: `${index * 0.2}s` }}
              role="article"
              aria-label={`آمار ${stat.label}`}
            >
              <h3 className={styles.value}>
                {stat.extraInfo ? stat.extraInfo : `${animatedValues[index] || 0}${stat.label !== 'رضایت از دوره‌ها' ? '+' : ''}`}
              </h3>
              <p className={styles.label}>{stat.label}</p>
              <p className={styles.description}>{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;