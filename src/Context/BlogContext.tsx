import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import { User, BlogPost } from '../types/types';

interface BlogContextType {
  blogPosts: BlogPost[];
  addBlogPost: (post: Omit<BlogPost, 'id' | 'date' | 'author'>) => void;
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  deleteBlogPost: (id: number) => Promise<void>;
  loading: boolean;
}

export const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    {
      id: 1,
      title: 'مقدمه‌ای بر آناتومی دندان',
      content: 'این پست به بررسی اصول اولیه آناتومی دندان می‌پردازد.',
      excerpt: 'آشنایی با ساختار دندان و کاربردهای آن در دندانپزشکی.',
      author: 'سی',
      date: '1404-02-15',
      category: 'آموزش',
      tags: ['آناتومی', 'دندانپزشکی'],
      images: ['/assets/images/anatomy-post.jpg'],
      videos: [],
    },
  ]);
  const [loading, setLoading] = useState(false);

  const addBlogPost = (post: Omit<BlogPost, 'id' | 'date' | 'author'>) => {
    if (!user || !['Blogger', 'SuperAdmin', 'Instructor'].includes(user.role)) {
      throw new Error('فقط وبلاگ‌نویس‌ها، مدیران کل یا مربیان می‌تونن پست بذارن.');
    }
    setBlogPosts((prev) => [
      ...prev,
      {
        ...post,
        id: Math.max(...prev.map((p) => p.id || 0), 0) + 1,
        date: new Date().toISOString().split('T')[0],
        author: user.name,
      },
    ]);
  };

  const deleteBlogPost = async (id: number) => {
    if (!user || !['Blogger', 'SuperAdmin', 'Instructor'].includes(user.role)) {
      throw new Error('فقط وبلاگ‌نویس‌ها، مدیران کل یا مربیان می‌تونن پست حذف کنن.');
    }
    setBlogPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const restrictedSetBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>> = (action) => {
    if (!user || !['Blogger', 'SuperAdmin', 'Instructor'].includes(user.role)) {
      throw new Error('فقط وبلاگ‌نویس‌ها، مدیران کل یا مربیان می‌تونن پست‌ها رو تغییر بدن.');
    }
    setBlogPosts(action);
  };

  return (
    <BlogContext.Provider
      value={{ blogPosts, addBlogPost, setBlogPosts: restrictedSetBlogPosts, deleteBlogPost, loading }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlogContext = () => {
  const context = useContext(BlogContext);
  if (!context) throw new Error('useBlogContext باید توی BlogProvider استفاده بشه');
  return context;
};

export type { BlogPost };