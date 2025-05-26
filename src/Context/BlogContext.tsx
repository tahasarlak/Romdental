// src/context/BlogContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BlogPost {
  id: number;
  title: string;
  author: string;
  category: string;
  excerpt: string;
  image: string;
  date: string; // فرمت: YYYY-MM-DD
  tags: string[];
}

interface BlogContextType {
  blogPosts: BlogPost[];
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    {
      id: 1,
      title: 'نکات مهم در مراقبت از دندان‌ها',
      author: 'دکتر احمد رضایی',
      category: 'بهداشت دهان',
      excerpt: 'در این مقاله به بررسی روش‌های ساده و مؤثر برای حفظ سلامت دندان‌ها می‌پردازیم.',
      image: '/assets/blog/dental-care.jpg',
      date: '2025-05-01', // اردیبهشت ۱۴۰۴
      tags: ['دندانپزشکی', 'بهداشت'],
    },
    {
      id: 2,
      title: 'آخرین پیشرفت‌ها در پروتزهای دندانی',
      author: 'دکتر مریم حسینی',
      category: 'تکنولوژی دندانپزشکی',
      excerpt: 'نگاهی به تکنولوژی‌های جدید در ساخت پروتزهای دندانی و تأثیر آن‌ها بر بیماران.',
      image: '/assets/blog/prosthesis-tech.jpg',
      date: '2025-06-01', // خرداد ۱۴۰۴
      tags: ['پروتز', 'تکنولوژی'],
    },
    {
      id: 3,
      title: 'ترمیم دندان: تکنیک‌های مدرن',
      author: 'دکتر علی محمدی',
      category: 'ترمیم دندان',
      excerpt: 'بررسی تکنیک‌های پیشرفته در ترمیم دندان و مواد مورد استفاده.',
      image: '/assets/blog/restorative-tech.jpg',
      date: '2025-04-01', // فروردین ۱۴۰۴
      tags: ['ترمیم', 'دندانپزشکی'],
    },
    {
      id: 4,
      title: 'معرفی ابزارهای جدید دندانپزشکی',
      author: 'دکتر سارا احمدی',
      category: 'ابزارها',
      excerpt: 'آشنایی با ابزارهای نوین و کاربرد آن‌ها در کلینیک.',
      image: '/assets/blog/tools.jpg',
      date: '2025-07-01', // تیر ۱۴۰۴
      tags: ['ابزار', 'دندانپزشکی'],
    }, 
  ]);

  return (
    <BlogContext.Provider value={{ blogPosts, setBlogPosts }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlogContext = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlogContext must be used within a BlogProvider');
  }
  return context;
};