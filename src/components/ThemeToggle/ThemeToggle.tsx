// src/components/ThemeToggle/ThemeToggle.tsx
import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // آیکون دارک مود
import Brightness7Icon from '@mui/icons-material/Brightness7'; // آیکون لایت مود
import styles from './ThemeToggle.module.css';

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // بررسی حالت ذخیره‌شده در localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // تغییر حالت تیره/روشن
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <IconButton
      onClick={toggleTheme}
      className={styles.themeToggle}
      aria-label={isDarkMode ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره'}
    >
      {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

export default ThemeToggle;