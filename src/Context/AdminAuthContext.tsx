import React, { createContext, useContext, ReactNode } from 'react';
import DOMPurify from 'dompurify';
import { useAuthContext } from './AuthContext';
import { useNotificationContext } from './NotificationContext';
import { User } from '../types/types';

interface AdminAuthContextType {
  registerAdmin: (
    adminData: Omit<User, 'id' | 'wishlist' | 'enrolledCourses' | 'cart' | 'token' | 'role'>,
    role: 'Admin' | 'SuperAdmin'
  ) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^09[0-9]{9}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const { showNotification } = useNotificationContext();

  const registerAdmin = async (
    adminData: Omit<User, 'id' | 'wishlist' | 'enrolledCourses' | 'cart' | 'token' | 'role'>,
    role: 'Admin' | 'SuperAdmin'
  ) => {
    try {
      if (!user || user.role !== 'SuperAdmin') {
        throw new Error('فقط سوپرادمین می‌تواند ادمین یا سوپرادمین ثبت کند');
      }
      if (!adminData.name.trim()) throw new Error('نام نمی‌تواند خالی باشد.');
      if (!validateEmail(adminData.email)) throw new Error('ایمیل نامعتبر است.');
      if (!validatePhone(adminData.phone)) throw new Error('شماره تلفن باید با فرمت ۰۹xxxxxxxxx باشد.');
      if (!validatePassword(adminData.password)) throw new Error('رمز عبور باید حداقل ۸ کاراکتر باشد.');
      if (!adminData.university.trim()) throw new Error('دانشگاه نمی‌تواند خالی باشد.');
      if (!['مرد', 'زن'].includes(adminData.gender)) throw new Error('جنسیت باید "مرد" یا "زن" باشد.');

      const response = await fetch('/api/admins/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminData.email, phone: adminData.phone }),
      });
      if (response.status === 409) throw new Error('ایمیل یا شماره تلفن قبلاً ثبت شده است');

      const newAdmin: User = {
        id: Math.floor(Math.random() * 10000) + 1,
        name: DOMPurify.sanitize(adminData.name),
        email: DOMPurify.sanitize(adminData.email),
        phone: DOMPurify.sanitize(adminData.phone),
        university: DOMPurify.sanitize(adminData.university),
        gender: adminData.gender,
        profilePicture: adminData.profilePicture || '/assets/Profile/default-admin.jpg',
        wishlist: [],
        enrolledCourses: [],
        cart: [],
        password: `hashed_${adminData.password}`,
        token: `${role.toLowerCase()}-token-${Date.now()}`,
        role: role,
      };

      await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAdmin, role }),
      });

      showNotification(`${role} با موفقیت ثبت شد.`, 'success');
    } catch (error: any) {
      showNotification(error.message || `خطا در ثبت ${role}`, 'error');
      throw error;
    }
  };

  return (
    <AdminAuthContext.Provider value={{ registerAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuthContext = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuthContext must be used within an AdminAuthProvider');
  return context;
};