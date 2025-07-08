import React, { useState, useEffect } from 'react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import styles from './BackToTop.module.css';

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Handle scroll visibility
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className={`${styles.backToTop} ${isVisible ? styles.visible : ''}`}>
      <Tooltip title="بازگشت به بالا" placement="left">
        <IconButton
          onClick={scrollToTop}
          className={styles.button}
          aria-label="بازگشت به بالای صفحه"
          size="large"
        >
          <KeyboardArrowUpIcon fontSize="medium" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default BackToTop;