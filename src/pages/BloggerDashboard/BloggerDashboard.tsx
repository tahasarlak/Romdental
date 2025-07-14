import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { useAuthContext } from '../../Context/AuthContext';
import { useNotificationContext } from '../../Context/NotificationContext';
import { Helmet } from 'react-helmet-async';
import BlogManagement from '../../components/BloggerDashboard/BlogManagement/BlogManagement';
import DOMPurify from 'dompurify';
import styles from './BloggerDashboard.module.css';

const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i'],
    ALLOWED_ATTR: [],
  });
};

const BloggerDashboard: React.FC = () => {
  const { isAuthenticated, user, setIsAuthenticated } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const [activeTab, setActiveTab] = useState(0);

  // بازیابی وضعیت احراز هویت از localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedUser && storedAuth === 'true') {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === 'SuperAdmin' || parsedUser.role === 'Blogger') {
        setIsAuthenticated(true);
      }
    }
  }, [setIsAuthenticated]);

  // بررسی دسترسی وبلاگ‌نویس یا سوپر ادمین
  if (!isAuthenticated || !user || (user.role !== 'SuperAdmin' && user.role !== 'Blogger')) {
    showNotification('شما به این صفحه دسترسی ندارید!', 'error');
    return <Navigate to="/login" />;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'داشبورد وبلاگ‌نویس - روم دنتال',
    description: user?.role === 'SuperAdmin'
      ? 'صفحه داشبورد سوپر ادمین برای مدیریت همه وبلاگ‌های دندانپزشکی'
      : 'صفحه داشبورد وبلاگ‌نویس برای مدیریت وبلاگ‌های دندانپزشکی',
  };

  return (
    <>
      <Helmet>
        <title>داشبورد {user?.role === 'SuperAdmin' ? 'سوپر ادمین' : 'وبلاگ‌نویس'} - روم دنتال</title>
        <meta
          name="description"
          content={sanitizeText(
            user?.role === 'SuperAdmin'
              ? 'مدیریت همه وبلاگ‌های دندانپزشکی توسط سوپر ادمین'
              : 'مدیریت وبلاگ‌های دندانپزشکی توسط وبلاگ‌نویس'
          )}
        />
        <meta
          name="keywords"
          content={sanitizeText(
            user?.role === 'SuperAdmin'
              ? 'داشبورد سوپر ادمین, وبلاگ‌های دندانپزشکی, روم دنتال'
              : 'داشبورد وبلاگ‌نویس, وبلاگ‌های دندانپزشکی, روم دنتال'
          )}
        />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <Box className={styles.container}>
        <Typography variant="h4" className={styles.title}>
          داشبورد {user?.role === 'SuperAdmin' ? 'سوپر ادمین' : 'وبلاگ‌نویس'}: {sanitizeText(user?.name || '')}
        </Typography>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          className={styles.tabs}
          aria-label="مدیریت وبلاگ‌نویس"
        >
          <Tab label="مدیریت وبلاگ‌ها" className={styles.tab} />
        </Tabs>
        {activeTab === 0 && <BlogManagement />}
      </Box>
    </>
  );
};

export default BloggerDashboard;