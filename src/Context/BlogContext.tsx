import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuthContext,  } from './AuthContext';
import { User } from '../types/types'; // Updated import

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  slug?: string;
  image?: string;
  author?: string;
  date?: string;
  tags?: string[];
  category?: string;
  excerpt?: string;
  images?: string[];
  videos?: string[];
}

interface BlogContextType {
  blogPosts: BlogPost[];
  addBlogPost: (post: Omit<BlogPost, 'id' | 'date' | 'author'>) => void;
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
}

export const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    {
      id: 1,
      title: 'نکات مهم در مراقبت از دندان‌ها',
      author: 'دکتر احمد رضایی',
      category: 'بهداشت دهان',
      excerpt: 'روش‌های ساده و مؤثر برای حفظ سلامت دندان‌ها.',
      content: '<p>آموزش روش‌های روزمره برای سلامت دندان‌ها...</p>',
      images: ['/assets/blog/dental-care.jpg'],
      videos: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
      date: '2025-05-01',
      tags: ['دندانپزشکی', 'بهداشت'],
    },
  ]);

  const addBlogPost = (post: Omit<BlogPost, 'id' | 'date' | 'author'>) => {
    if (!user || user.role !== 'Blogger') {
      throw new Error('فقط وبلاگ‌نویس‌ها می‌تونن پست بذارن.');
    }
    setBlogPosts((prev) => [
      ...prev,
      {
        ...post,
        id: prev.length + 1,
        date: new Date().toISOString().split('T')[0],
        author: user.name,
      },
    ]);
  };

  const restrictedSetBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>> = (action) => {
    if (!user || user.role !== 'Blogger') {
      throw new Error('فقط وبلاگ‌نویس‌ها می‌تونن پست‌ها رو تغییر بدن.');
    }
    setBlogPosts(action);
  };

  return (
    <BlogContext.Provider value={{ blogPosts, addBlogPost, setBlogPosts: restrictedSetBlogPosts }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlogContext = () => {
  const context = useContext(BlogContext);
  if (!context) throw new Error('useBlogContext باید توی BlogProvider استفاده بشه');
  return context;
};