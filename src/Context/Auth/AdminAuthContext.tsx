import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useAuthContext } from './UserAuthContext';
import { useNotificationContext } from '../NotificationContext';
import { User } from '../../types/types';

interface AdminAuthContextType {
  registerAdmin: (
    adminData: Omit<User, 'id' | 'wishlist' | 'enrolledCourses' | 'cart' | 'token' | 'role'>,
    role: 'Admin' | 'SuperAdmin'
  ) => Promise<void>;
  createDefaultAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, signup, checkUserExists } = useAuthContext();
  const { showNotification } = useNotificationContext();

  const registerAdmin = async (
    adminData: Omit<User, 'id' | 'wishlist' | 'enrolledCourses' | 'cart' | 'token' | 'role'>,
    role: 'Admin' | 'SuperAdmin'
  ) => {
    try {
      const sanitizedData = {
        name: DOMPurify.sanitize(adminData.name),
        email: DOMPurify.sanitize(adminData.email),
        password: DOMPurify.sanitize(adminData.password),
        phone: DOMPurify.sanitize(adminData.phone),
        university: DOMPurify.sanitize(adminData.university),
        gender: DOMPurify.sanitize(adminData.gender) as 'مرد' | 'زن',
        course: DOMPurify.sanitize(adminData.course),
      };

      if (!['مرد', 'زن'].includes(sanitizedData.gender)) {
        throw new Error('جنسیت باید "مرد" یا "زن" باشد.');
      }

      const userExists = await checkUserExists(sanitizedData.email, sanitizedData.phone);
      if (userExists) {
        throw new Error(`${role} با این ایمیل یا شماره تلفن قبلاً ثبت شده است.`);
      }

      await signup(
        sanitizedData.name,
        sanitizedData.email,
        sanitizedData.password,
        sanitizedData.phone,
        sanitizedData.university,
        sanitizedData.gender,
        sanitizedData.course,
        role
      );
      showNotification(`${role} با موفقیت ثبت شد.`, 'success');
    } catch (error: any) {
      showNotification(error.message || `خطا در ثبت ${role}`, 'error');
      throw error;
    }
  };

  const createDefaultAdmin = async () => {
    const defaultAdminData: Omit<User, 'id' | 'wishlist' | 'enrolledCourses' | 'cart' | 'token' | 'role'> = {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: 'Admin@123456',
      phone: '09123456789',
      university: 'Default University',
      gender: 'مرد',
      course: '',
    };

    try {
      const userExists = await checkUserExists(defaultAdminData.email, defaultAdminData.phone);
      if (!userExists) {
        await registerAdmin(defaultAdminData, 'SuperAdmin');
        showNotification('ادمین پیش‌فرض با موفقیت ایجاد شد.', 'success');
      }
    } catch (error: any) {
      showNotification('خطا در ایجاد ادمین پیش‌فرض: ' + error.message, 'error');
    }
  };

  useEffect(() => {
    createDefaultAdmin();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ registerAdmin, createDefaultAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuthContext = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuthContext must be used within an AdminAuthProvider');
  return context;
};