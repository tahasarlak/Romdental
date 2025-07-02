import React from 'react';
import styles from './CTA.module.css';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useSubscriptionContext } from '../../Context/SubscriptionContext';

const CTA: React.FC = () => {
  const { email, setEmail, status, message, subscribe } = useSubscriptionContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await subscribe(email);
  };

  return (
    <section className={styles.cta} role="region" aria-labelledby="cta-title">
      <h2 id="cta-title" className={styles.title}>
        به جمع دندانپزشکان حرفه‌ای بپیوندید!
      </h2>
      <Typography variant="body1" className={styles.subtitle}>
        با ثبت‌نام، به جدیدترین نکات و منابع دندانپزشکی دسترسی پیدا کنید
      </Typography>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Box className={styles.inputContainer}>
          <input
            type="email"
            placeholder="ایمیل خود را وارد کنید"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            aria-label="ایمیل برای ثبت‌نام"
            disabled={status === 'loading'}
          />
          {status === 'error' && (
            <Typography variant="caption" className={styles.errorMessage}>
              {message}
            </Typography>
          )}
          {status === 'success' && (
            <Typography variant="caption" className={styles.successMessage}>
              {message}
            </Typography>
          )}
        </Box>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={status === 'loading'}
          aria-label="ثبت‌نام رایگان"
        >
          {status === 'loading' ? (
            <CircularProgress size={24} className={styles.loader} />
          ) : (
            'ثبت‌نام رایگان'
          )}
        </button>
      </form>
    </section>
  );
};

export default CTA;