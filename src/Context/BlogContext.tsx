import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BlogPost {
  id: number;
  title: string;
  author: string;
  category: string;
  excerpt: string;
  content: string; // New field for full content
  image: string;
  date: string; // Format: YYYY-MM-DD
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
      content: 'این مقاله به شما آموزش می‌دهد که چگونه با روش‌های ساده و روزمره، سلامت دندان‌های خود را حفظ کنید. از مسواک زدن صحیح گرفته تا استفاده از نخ دندان و رژیم غذایی مناسب، همه این نکات به شما کمک می‌کنند تا لبخندی سالم و زیبا داشته باشید. برای مثال، مسواک زدن حداقل دو بار در روز و استفاده از خمیردندان حاوی فلوراید توصیه می‌شود. همچنین، معاینات منظم دندانپزشکی می‌توانند مشکلات احتمالی را زودتر تشخیص دهند.',
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
      content: 'پروتزهای دندانی در سال‌های اخیر به لطف پیشرفت‌های تکنولوژیکی، بهبود چشمگیری یافته‌اند. استفاده از چاپ سه‌بعدی و مواد بیوسازگار جدید، امکان ساخت پروتزهایی با دقت بالا و راحتی بیشتر برای بیماران را فراهم کرده است. این مقاله به بررسی فناوری‌هایی مانند CAD/CAM و مواد سرامیکی پیشرفته می‌پردازد که چگونه کیفیت زندگی بیماران را بهبود بخشیده‌اند.',
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
      content: 'ترمیم دندان با استفاده از تکنیک‌های مدرن مانند کامپوزیت‌های رزینی و لیزرهای دندانی به سطح جدیدی رسیده است. این مقاله به شما نشان می‌دهد که چگونه مواد جدید و روش‌های غیرتهاجمی می‌توانند دندان‌های آسیب‌دیده را با کمترین درد و زمان بهبودی ترمیم کنند. همچنین، به اهمیت انتخاب مواد مناسب برای ترمیم‌های طولانی‌مدت پرداخته می‌شود.',
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
      content: 'ابزارهای جدید دندانپزشکی، مانند اسکنرهای داخل‌دهانی و دستگاه‌های لیزری، تحول بزرگی در کلینیک‌های دندانپزشکی ایجاد کرده‌اند. این مقاله به معرفی ابزارهای نوین و کاربردهای آن‌ها در تشخیص و درمان مشکلات دندانی می‌پردازد. برای مثال، اسکنرهای سه‌بعدی دقت تشخیص را افزایش داده و زمان درمان را کاهش می‌دهند.',
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