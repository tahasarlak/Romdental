// src/components/Stats.tsx
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../Context/AuthContext';
import { useCourseContext } from '../../Context/CourseContext';
import { useTestimonialContext } from '../../Context/TestimonialContext';
import styles from './Stats.module.css';

interface Stat {
  value: number;
  label: string;
  description: string;
  extraInfo?: string; // برای اطلاعات اضافی مثل تعداد نظرات
}

const Stats: React.FC = () => {
  const { users } = useAuthContext();
  const { testimonials } = useTestimonialContext();
  const { courses } = useCourseContext();

  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<(string | number)[]>([]);

  // محاسبه میانگین درصد رضایت بر اساس rating
  const satisfactionPercentage = testimonials.length
    ? Math.round(
        (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length) * 20
      ) // تبدیل 0-5 به 0-100
    : 0;

  // داده‌های آماری از کانتکست‌ها
  const stats: Stat[] = [
    {
      value: users.length,
      label: 'کاربر ثبت‌نام‌شده',
      description: `بیش از ${users.length} نفر به جمع ما پیوسته‌اند.`,
    },
    {
      value: courses.length,
      label: 'دوره آموزشی',
      description: `بیش از ${courses.length} دوره متنوع و پیشرفته.`,
    },
    {
      value: satisfactionPercentage,
      label: 'رضایت',
      description: `${testimonials.length} نفر از شرکت‌کنندگان نظر داده‌اند.`,
      extraInfo: `${satisfactionPercentage}%`, // درصد رضایت به‌عنوان اطلاعات اصلی
    },
  ];

  // تشخیص ورود به دید کاربر برای شروع انیمیشن
  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector(`.${styles.stats}`);
      if (section) {
        const { top } = section.getBoundingClientRect();
        if (top < window.innerHeight - 100 && !isVisible) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  // انیمیشن شمارش اعداد
  useEffect(() => {
    if (isVisible) {
      stats.forEach((stat, index) => {
        // برای "رضایت" انیمیشن رو روی تعداد نظرات اعمال می‌کنیم نه درصد
        const end = stat.label === 'رضایت' ? testimonials.length : stat.value;
        let start = 0;
        const duration = 2000; // مدت زمان انیمیشن (2 ثانیه)
        const stepTime = Math.abs(Math.floor(duration / end)) || 50; // جلوگیری از تقسیم بر صفر
        let timer = setInterval(() => {
          start += Math.ceil(end / (duration / stepTime));
          if (start >= end) {
            start = end;
            clearInterval(timer);
          }
          setAnimatedValues((prev) => {
            const newValues = [...prev];
            newValues[index] =
              stat.label === 'رضایت' ? start : start + (stat.label === 'رضایت' ? '' : '+');
            return newValues;
          });
        }, stepTime);
      });
    }
  }, [isVisible, stats, testimonials.length]);

  return (
    <section className={styles.stats}>
      <div className={styles.container}>
        <h2 className={`${styles.title} ${isVisible ? styles.titleVisible : ''}`}>
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
            >
              <h3 className={styles.value}>
                {stat.label === 'رضایت'
                  ? stat.extraInfo // درصد رضایت برای "رضایت"
                  : animatedValues[index] || '0'} {/* انیمیشن برای بقیه */}
              </h3>
              <p className={styles.label}>{stat.label}</p>
              {stat.description && <p className={styles.description}>{stat.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;