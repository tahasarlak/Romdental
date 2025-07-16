import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import DOMPurify from 'dompurify';
import { useAuthContext } from './AuthContext';
import { useNotificationContext } from './NotificationContext';
import { useBlogContext } from './BlogContext';
import { User, BlogPost } from '../types/types';

interface Blogger {
  id: number;
  userId: number;
  name: string;
  bio: string;
  image: string;
  postCount: number;
}

interface BloggerAuthContextType {
  bloggers: Blogger[];
  loading: boolean;
  setBloggers: React.Dispatch<React.SetStateAction<Blogger[]>>;
  addBlogger: (user: User, bio: string, image?: string) => Promise<void>;
  updateBlogger: (bloggerId: number, updates: Partial<Blogger>) => Promise<void>;
  deleteBlogger: (bloggerId: number) => Promise<void>;
}

const BloggerAuthContext = createContext<BloggerAuthContextType | undefined>(undefined);

export const BloggerAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, setUser } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const { blogPosts } = useBlogContext();
  const [bloggers, setBloggers] = useState<Blogger[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const addBlogger = useCallback(
    async (user: User, bio: string, image?: string) => {
      try {
        if (!user || !['SuperAdmin', 'Admin'].includes(user.role)) {
          throw new Error('فقط سوپرادمین و ادمین می‌توانند وبلاگ‌نویس اضافه کنند');
        }
        const sanitizedBio = DOMPurify.sanitize(bio);
        const newBlogger: Blogger = {
          id: Math.max(...bloggers.map((b) => b.id), 0) + 1,
          userId: user.id,
          name: DOMPurify.sanitize(user.name),
          bio: sanitizedBio,
          image: image || user.profilePicture || '/assets/Profile/default-blogger.jpg',
          postCount: blogPosts.filter((post: BlogPost) => post.author === user.name).length,
        };
        setBloggers((prev) => [...prev, newBlogger]);
        setUser({ ...user, role: 'Blogger' });
        showNotification(`وبلاگ‌نویس "${newBlogger.name}" با موفقیت اضافه شد`, 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در افزودن وبلاگ‌نویس', 'error');
        throw error;
      }
    },
    [user, bloggers, blogPosts, showNotification, setUser]
  );

  const updateBlogger = useCallback(
    async (bloggerId: number, updates: Partial<Blogger>) => {
      try {
        if (!user || !['SuperAdmin', 'Admin'].includes(user.role)) {
          throw new Error('فقط سوپرادمین و ادمین می‌توانند وبلاگ‌نویس را ویرایش کنند');
        }
        const blogger = bloggers.find((b) => b.id === bloggerId);
        if (!blogger) {
          throw new Error('وبلاگ‌نویس یافت نشد');
        }
        const updatedBlogger: Blogger = {
          ...blogger,
          ...updates,
          name: updates.name ? DOMPurify.sanitize(updates.name) : blogger.name,
          bio: updates.bio ? DOMPurify.sanitize(updates.bio) : blogger.bio,
          image: updates.image || blogger.image,
          postCount: blogPosts.filter((post: BlogPost) => post.author === (updates.name || blogger.name)).length,
        };
        setBloggers((prev) => prev.map((b) => (b.id === bloggerId ? updatedBlogger : b)));
        showNotification(`وبلاگ‌نویس "${updatedBlogger.name}" با موفقیت به‌روزرسانی شد`, 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در به‌روزرسانی وبلاگ‌نویس', 'error');
        throw error;
      }
    },
    [user, bloggers, blogPosts, showNotification]
  );

  const deleteBlogger = useCallback(
    async (bloggerId: number) => {
      try {
        if (!user || !['SuperAdmin', 'Admin'].includes(user.role)) {
          throw new Error('فقط سوپرادمین و ادمین می‌توانند وبلاگ‌نویس را حذف کنند');
        }
        const blogger = bloggers.find((b) => b.id === bloggerId);
        if (!blogger) {
          throw new Error('وبلاگ‌نویس یافت نشد');
        }
        const confirmDelete = window.confirm(
          `آیا مطمئن هستید که می‌خواهید وبلاگ‌نویس "${DOMPurify.sanitize(blogger.name)}" را حذف کنید؟`
        );
        if (!confirmDelete) return;
        setBloggers((prev) => prev.filter((b) => b.id !== bloggerId));
        showNotification(`وبلاگ‌نویس "${DOMPurify.sanitize(blogger.name)}" با موفقیت حذف شد`, 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در حذف وبلاگ‌نویس', 'error');
        throw error;
      }
    },
    [user, bloggers, showNotification]
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