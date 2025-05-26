// src/components/Testimonials.tsx
import React from 'react';
import styles from './Testimonials.module.css';
import { useTestimonialContext } from '../../Context/TestimonialContext';

const Testimonials: React.FC = () => {
  const { testimonials } = useTestimonialContext();

  // مرتب‌سازی بر اساس تعداد لایک‌ها و گرفتن سه تای برتر
  const topTestimonials = testimonials
    .sort((a, b) => b.likes - a.likes) // مرتب‌سازی نزولی بر اساس تعداد لایک‌ها
    .slice(0, 3); // گرفتن سه تای اول

  return (
    <section className={styles.testimonials}>
      <h2 className={styles.title}>نظرات پرطرفدار شرکت‌کنندگان</h2>
      <div className={styles.list}>
        {topTestimonials.map((item) => (
          <div key={item.id} className={styles.card}>
            <p className={styles.text}>"{item.text}"</p>
            <h4 className={styles.name}>{item.name}</h4>
            <span className={styles.role}>{item.role}</span>
            <p className={styles.likes}>تعداد لایک‌ها: {item.likes}</p> {/* نمایش تعداد لایک‌ها */}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;