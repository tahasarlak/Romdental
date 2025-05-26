// src/components/CTA.tsx
import React from 'react';
import styles from './CTA.module.css';

const CTA: React.FC = () => {
  return (
    <section className={styles.cta}>
      <h2 className={styles.title}>به جمع دندانپزشکان حرفه‌ای بپیوندید!</h2>
      <form className={styles.form}>
        <input type="email" placeholder="ایمیل خود را وارد کنید" className={styles.input} />
        <button type="submit" className={styles.submitButton}>ثبت‌نام رایگان</button>
      </form>
    </section>
  );
};

export default CTA;