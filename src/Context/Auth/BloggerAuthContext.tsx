import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import DOMPurify from 'dompurify';
import { useNotificationContext } from '../NotificationContext';
import { useBlogContext } from '../BlogContext';
import { useAuthContext } from './UserAuthContext';
import { BlogPost } from '../../types/types';

interface Blogger {
  id: number;
  userId: number;
  name: string;
  bio: string;
  image: string;
  postCount: number;
  email: string;
}

interface BloggerAuthContextType {
  bloggers: Blogger[];
  loading: boolean;
  setBloggers: React.Dispatch<React.SetStateAction<Blogger[]>>;
  addBlogger: (userId: number, name: string, bio: string, email: string, phone: string, university: string, gender: 'مرد' | 'زن', password: string, image?: string) => Promise<void>;
  updateBlogger: (bloggerId: number, updates: Partial<Blogger>) => Promise<void>;
  deleteBlogger: (bloggerId: number) => Promise<void>;
}

const BloggerAuthContext = createContext<BloggerAuthContextType | undefined>(undefined);

export const BloggerAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showNotification } = useNotificationContext();
  const { blogPosts } = useBlogContext();
  const { signup } = useAuthContext();
  const [bloggers, setBloggers] = useState<Blogger[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const addBlogger = useCallback(
    async (userId: number, name: string, bio: string, email: string, phone: string, university: string, gender: 'مرد' | 'زن', password: string, image?: string) => {
      try {
        setLoading(true);
        await signup(name, email, password, phone, university, gender, '', 'Blogger');

        const sanitizedBio = DOMPurify.sanitize(bio);
        const newBlogger: Blogger = {
          id: Math.max(...bloggers.map((b) => b.id), 0) + 1,
          userId,
          name: DOMPurify.sanitize(name),
          bio: sanitizedBio,
          image: image || '/assets/Profile/default-blogger.jpg',
          postCount: blogPosts.filter((post: BlogPost) => post.author === name).length,
          email: DOMPurify.sanitize(email),
        };

        setBloggers((prev) => [...prev, newBlogger]);
        showNotification(`وبلاگ‌نویس "${newBlogger.name}" با موفقیت اضافه شد`, 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در افزودن وبلاگ‌نویس', 'error');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [bloggers, blogPosts, signup, showNotification]
  );

  const updateBlogger = useCallback(
    async (bloggerId: number, updates: Partial<Blogger>) => {
      try {
        setLoading(true);
        const blogger = bloggers.find((b) => b.id === bloggerId);
        if (!blogger) throw new Error('وبلاگ‌نویس یافت نشد');

        const updatedBlogger: Blogger = {
          ...blogger,
          ...updates,
          name: updates.name ? DOMPurify.sanitize(updates.name) : blogger.name,
          bio: updates.bio ? DOMPurify.sanitize(updates.bio) : blogger.bio,
          image: updates.image || blogger.image,
          email: updates.email ? DOMPurify.sanitize(updates.email) : blogger.email,
          postCount: blogPosts.filter((post: BlogPost) => post.author === (updates.name || blogger.name)).length,
        };

        setBloggers((prev) => prev.map((b) => (b.id === bloggerId ? updatedBlogger : b)));
        showNotification(`وبلاگ‌نویس "${updatedBlogger.name}" با موفقیت به‌روزرسانی شد`, 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در به‌روزرسانی وبلاگ‌نویس', 'error');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [bloggers, blogPosts, showNotification]
  );

  const deleteBlogger = useCallback(
    async (bloggerId: number) => {
      try {
        setLoading(true);
        const blogger = bloggers.find((b) => b.id === bloggerId);
        if (!blogger) throw new Error('وبلاگ‌نویس یافت نشد');

        const confirmDelete = window.confirm(
          `آیا مطمئن هستید که می‌خواهید وبلاگ‌نویس "${DOMPurify.sanitize(blogger.name)}" را حذف کنید؟`
        );
        if (!confirmDelete) return;

        setBloggers((prev) => prev.filter((b) => b.id !== bloggerId));
        showNotification(`وبلاگ‌نویس "${DOMPurify.sanitize(blogger.name)}" با موفقیت حذف شد`, 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در حذف وبلاگ‌نویس', 'error');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [bloggers, showNotification]
  );

  const contextValue = useMemo(
    () => ({
      bloggers,
      loading,
      setBloggers,
      addBlogger,
      updateBlogger,
      deleteBlogger,
    }),
    [bloggers, loading, addBlogger, updateBlogger, deleteBlogger]
  );

  return <BloggerAuthContext.Provider value={contextValue}>{children}</BloggerAuthContext.Provider>;
};

export const useBloggerAuthContext = () => {
  const context = useContext(BloggerAuthContext);
  if (!context) throw new Error('useBloggerAuthContext must be used within a BloggerAuthProvider');
  return context;
};