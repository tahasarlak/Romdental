// src/components/BackToTop/BackToTop.tsx
import React, { useState, useEffect } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import IconButton from '@mui/material/IconButton';
import styles from './BackToTop.module.css';

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // نمایش دکمه هنگام اسکرول
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // اسکرول به بالای صفحه
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <IconButton
          onClick={scrollToTop}
          className={styles.backToTop}
          aria-label="بازگشت به بالا"
        >
          <ArrowUpwardIcon />
        </IconButton>
      )}
    </>
  );
};

export default BackToTop;