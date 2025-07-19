import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { useNotificationContext } from '../../Context/NotificationContext';
import { Helmet } from 'react-helmet-async';
import CourseManagement from '../../components/InstructorDashboard/CourseManagement/CourseManagement';
import ScheduleManagement from '../../components/InstructorDashboard/ScheduleManagement/ScheduleManagement';
import OrderManagement from '../../components/InstructorDashboard/OrderManagement/OrderManagement';
import WishlistManagement from '../../components/InstructorDashboard/WishlistManagement/WishlistManagement';
import StudentGroupManagement from '../../components/InstructorDashboard/StudentGroupManagement/StudentGroupManagement';
import DOMPurify from 'dompurify';
import styles from './InstructorDashboard.module.css';
import { useAuthContext } from '../../Context/Auth/UserAuthContext';

const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i'],
    ALLOWED_ATTR: [],
  });
};

const InstructorDashboard: React.FC = () => {
  const { isAuthenticated, user, setIsAuthenticated } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedUser && storedAuth === 'true') {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === 'SuperAdmin' || parsedUser.role === 'Instructor') {
        setIsAuthenticated(true);
      }
    }
  }, [setIsAuthenticated]);

  if (!isAuthenticated || !user || (user.role !== 'SuperAdmin' && user.role !== 'Instructor')) {
    showNotification('شما به این صفحه دسترسی ندارید!', 'error');
    return <Navigate to="/login" />;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'داشبورد استاد - روم دنتال',
    description: user?.role === 'SuperAdmin'
      ? 'صفحه داشبورد سوپر ادمین برای مدیریت دوره‌ها، برنامه‌ها، سفارش‌ها، علاقه‌مندی‌ها و گروه‌بندی دانشجویان'
      : 'صفحه داشبورد استاد برای مدیریت دوره‌ها، برنامه‌ها، سفارش‌ها، علاقه‌مندی‌ها و گروه‌بندی دانشجویان',
  };

  return (
    <>
      <Helmet>
        <title>داشبورد {user?.role === 'SuperAdmin' ? 'سوپر ادمین' : 'استاد'} - روم دنتال</title>
        <meta
          name="description"
          content={sanitizeText(
            user?.role === 'SuperAdmin'
              ? 'مدیریت دوره‌ها، برنامه‌ها، سفارش‌ها، علاقه‌مندی‌ها و گروه‌بندی دانشجویان توسط سوپر ادمین'
              : 'مدیریت دوره‌ها، برنامه‌ها، سفارش‌ها، علاقه‌مندی‌ها و گروه‌بندی دانشجویان توسط استاد'
          )}
        />
        <meta
          name="keywords"
          content={sanitizeText(
            user?.role === 'SuperAdmin'
              ? 'داشبورد سوپر ادمین, دوره‌های دندانپزشکی, برنامه‌های آموزشی, سفارش‌های آموزشی, علاقه‌مندی‌ها, گروه‌بندی دانشجویان, روم دنتال'
              : 'داشبورد استاد, دوره‌های دندانپزشکی, برنامه‌های آموزشی, سفارش‌های آموزشی, علاقه‌مندی‌ها, گروه‌بندی دانشجویان, روم دنتال'
          )}
        />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <Box className={styles.container}>
        <Typography variant="h4" className={styles.title}>
          داشبورد {user?.role === 'SuperAdmin' ? 'سوپر ادمین' : 'استاد'}: {sanitizeText(user?.name || '')}
        </Typography>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          className={styles.tabs}
          aria-label="مدیریت استاد"
        >
          <Tab label="مدیریت دوره‌ها" className={styles.tab} />
          <Tab label="مدیریت برنامه‌ها" className={styles.tab} />
          <Tab label="مدیریت سفارش‌ها" className={styles.tab} />
          <Tab label="مدیریت علاقه‌مندی‌ها" className={styles.tab} />
          <Tab label="مدیریت گروه‌بندی دانشجویان" className={styles.tab} />
        </Tabs>
        {activeTab === 0 && <CourseManagement />}
        {activeTab === 1 && <ScheduleManagement />}
        {activeTab === 2 && <OrderManagement />}
        {activeTab === 3 && <WishlistManagement />}
        {activeTab === 4 && <StudentGroupManagement />}
      </Box>
    </>
  );
};

export default InstructorDashboard;