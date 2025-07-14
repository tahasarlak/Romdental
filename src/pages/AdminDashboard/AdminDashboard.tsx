import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, Tab } from '@mui/material';
import { useAuthContext } from '../../Context/AuthContext';
import { useNotificationContext } from '../../Context/NotificationContext';
import BlogManagement from '../../components/AdminDashboard/BlogManagement/BlogManagement';
import CourseManagement from '../../components/AdminDashboard/CourseManagement/CourseManagement';
import UserManagement from '../../components/AdminDashboard/UserManagement/UserManagement';
import InstructorManagement from '../../components/AdminDashboard/InstructorManagement/InstructorManagement';
import ReviewManagement from '../../components/AdminDashboard/ReviewManagement/ReviewManagement';
import SubscriptionManagement from '../../components/AdminDashboard/SubscriptionManagement/SubscriptionManagement';
import WishlistManagement from '../../components/AdminDashboard/WishlistManagement/WishlistManagement';
import ScheduleManagement from '../../components/AdminDashboard/ScheduleManagement.tsx/ScheduleManagement';
import ContactManagement from '../../components/AdminDashboard/ContactManagement/ContactManagement';

const AdminDashboard: React.FC = () => {
  const { isAuthenticated, user, setIsAuthenticated } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const [activeTab, setActiveTab] = useState(0);

  // بازیابی وضعیت احراز هویت از localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedUser && storedAuth === 'true') {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === 'SuperAdmin' || parsedUser.role === 'Admin') {
        setIsAuthenticated(true);
      }
    }
  }, [setIsAuthenticated]);

  // بررسی دسترسی ادمین یا سوپر ادمین
  if (!isAuthenticated || !user || (user.role !== 'SuperAdmin' && user.role !== 'Admin')) {
    showNotification('شما به این صفحه دسترسی ندارید!', 'error');
    return <Navigate to="/login" />;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">داشبورد ادمین</h1>
      <Tabs value={activeTab} onChange={handleTabChange} aria-label="مدیریت ادمین">
        <Tab label="مدیریت دوره‌ها" />
        <Tab label="مدیریت کاربران" />
        <Tab label="مدیریت وبلاگ" />
        <Tab label="مدیریت پیام‌ها" />
        <Tab label="مدیریت اساتید" />
        <Tab label="مدیریت نظرات" />
        <Tab label="مدیریت برنامه‌ها" />
        <Tab label="مدیریت اشتراک‌ها" />
        <Tab label="مدیریت لیست علاقه‌مندی‌ها" />
      </Tabs>
      {activeTab === 0 && <CourseManagement />}
      {activeTab === 1 && <UserManagement />}
      {activeTab === 2 && <BlogManagement />}
      {activeTab === 3 && <ContactManagement />}
      {activeTab === 4 && <InstructorManagement />}
      {activeTab === 5 && <ReviewManagement />}
      {activeTab === 6 && <ScheduleManagement />}
      {activeTab === 7 && <SubscriptionManagement />}
      {activeTab === 8 && <WishlistManagement />}
    </div>
  );
};

export default AdminDashboard;