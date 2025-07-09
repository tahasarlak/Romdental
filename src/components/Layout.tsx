import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import styles from './Layout.module.css';
import BackToTop from './BackToTop/BackToTop';
import Footer from './Footer/Footer';
import Header from './Header/Header';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  // مسیرهایی که باید نوار ناوبری داشبورد نمایش داده شود
  const dashboardRoutes = ['/profile', '/wishlist', '/purchased-courses'];

  // بررسی اینکه آیا مسیر فعلی جزو مسیرهای داشبورد است
  const showDashboardNav = dashboardRoutes.includes(location.pathname);

  return (
    <div className={styles.layout}>
      <Header />
      {showDashboardNav && (
        <AppBar position="static" className={styles.navBar}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              داشبورد کاربر
            </Typography>
            <Button color="inherit" component={Link} to="/profile">
              پروفایل
            </Button>
            <Button color="inherit" component={Link} to="/wishlist">
              لیست علاقه‌مندی‌ها
            </Button>
            <Button color="inherit" component={Link} to="/purchased-courses">
              دوره‌های خریداری‌شده
            </Button>
          </Toolbar>
        </AppBar>
      )}
      <main className={styles.content}>
        {children}
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Layout;