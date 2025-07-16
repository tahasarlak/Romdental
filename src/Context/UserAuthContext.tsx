import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import DOMPurify from 'dompurify';
import { User, CategorizedUsers } from '../types/types';
import { useNotificationContext } from './NotificationContext';
import { useAuthContext } from './AuthContext';

interface UserAuthContextType {
  users: User[];
  categorizedUsers: CategorizedUsers;
  universities: string[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  manageUser: (userId: string, updates: Partial<User>) => Promise<void>;
  addUniversity: (university: string) => void;
  deleteUser: (email: string) => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

const categorizeUsers = (users: User[]): CategorizedUsers => {
  const bloggers: User[] = [];
  const students: User[] = [];

  users.forEach((user) => {
    if (user.role === 'Blogger') bloggers.push(user);
    if (user.role === 'Student') students.push(user);
  });

  return { bloggers, students };
};

export const UserAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const { showNotification } = useNotificationContext();

  const [users, setUsers] = useState<User[]>([]);
  const [universities, setUniversities] = useState<string[]>(['دانشگاه تهران', 'Smashko', 'Sechenov']);
  const categorizedUsers = useMemo(() => categorizeUsers(users), [users]);

  const manageUser = async (userId: string, updates: Partial<User>) => {
    try {
      if (!user || !['SuperAdmin', 'Admin'].includes(user.role)) {
        throw new Error('فقط سوپرادمین و ادمین می‌توانند کاربران را مدیریت کنند');
      }
      const targetUser = users.find((u) => u.email === userId || u.phone === userId);
      if (!targetUser) throw new Error('کاربر یافت نشد');
      if (updates.gender && !['مرد', 'زن'].includes(updates.gender)) {
        throw new Error('جنسیت باید "مرد" یا "زن" باشد.');
      }
      const updatedUser: User = {
        ...targetUser,
        ...updates,
        name: updates.name ? DOMPurify.sanitize(updates.name) : targetUser.name,
        email: updates.email ? DOMPurify.sanitize(updates.email) : targetUser.email,
        phone: updates.phone ? DOMPurify.sanitize(updates.phone) : targetUser.phone,
        university: updates.university ? DOMPurify.sanitize(updates.university) : targetUser.university,
        profilePicture: updates.profilePicture || targetUser.profilePicture,
        gender: updates.gender || targetUser.gender,
        role: updates.role || 'Student',
        wishlist: updates.wishlist || targetUser.wishlist,
        enrolledCourses: updates.enrolledCourses || targetUser.enrolledCourses,
        cart: updates.cart || targetUser.cart,
        password: updates.password || targetUser.password,
        token: targetUser.token,
        id: targetUser.id,
      };
      setUsers((prev) => prev.map((u) => (u.email === userId || u.phone === userId ? updatedUser : u)));
      showNotification('کاربر با موفقیت به‌روزرسانی شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در به‌روزرسانی کاربر', 'error');
      throw error;
    }
  };

  const addUniversity = (university: string) => {
    if (university && !universities.includes(university)) {
      setUniversities((prev) => [...prev, university]);
    }
  };

  const deleteUser = async (email: string) => {
    try {
      if (!user || user.role !== 'SuperAdmin') {
        throw new Error('فقط سوپرادمین می‌تواند کاربران را حذف کند');
      }
      const targetUser = users.find((u) => u.email === email);
      if (!targetUser) throw new Error('کاربر یافت نشد');
      setUsers((prev) => prev.filter((u) => u.email !== email));
      showNotification('کاربر با موفقیت حذف شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در حذف کاربر', 'error');
      throw error;
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        users,
        categorizedUsers,
        universities,
        setUsers,
        manageUser,
        addUniversity,
        deleteUser,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuthContext = () => {
  const context = useContext(UserAuthContext);
  if (!context) throw new Error('useUserAuthContext must be used within a UserAuthProvider');
  return context;
};