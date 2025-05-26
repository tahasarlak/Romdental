import React, { createContext, useContext, useState, ReactNode } from 'react';

// Interface for syllabus items
interface SyllabusItem {
  id: number;
  title: string;
  isLocked: boolean;
  previewContent?: string;
  videoUrl?: string;
  completed?: boolean;
  duration: string;
  contentType: 'video' | 'text' | 'quiz';
  isNew?: boolean;
}

// Interface for FAQ items
interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

// Interface for review items
interface ReviewItem {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

// Interface for course
interface Course {
  id: number;
  title: string;
  instructor: string;
  description: string;
  duration: string;
  level: 'مبتدی' | 'متوسط' | 'پیشرفته';
  category: 'آناتومی' | 'پروتز' | 'ترمیمی' | 'عمومی';
  image: string;
  price: string;
  startDate: string;
  isOpen: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  syllabus: SyllabusItem[];
  faqs: FaqItem[];
  reviews: ReviewItem[];
  tags?: string[]; // Optional for future filtering
  prerequisites?: string[]; // Optional for future use
}

// Interface for context
interface CourseContextType {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: 'دوره جامع آناتومی دندان',
      instructor: 'دکتر احمد رضایی',
      description:
        'آموزش کامل آناتومی دندان با تمرکز بر تکنیک‌های عملی و تئوری پیشرفته.',
      duration: '8 هفته',
      level: 'متوسط',
      category: 'آناتومی',
      image: '/assets/courses/anatomy.jpg',
      price: '۴,۵۰۰,۰۰۰ تومان',
      startDate: 'اردیبهشت ۱۴۰۴',
      isOpen: true,
      isFeatured: true,
      enrollmentCount: 120,
      syllabus: [
        {
          id: 1,
          title: 'مقدمه‌ای بر آناتومی دندان',
          isLocked: false,
          previewContent: 'بررسی ساختار دندان و اجزای آن.',
          videoUrl: 'https://example.com/videos/anatomy-intro.mp4',
          completed: true,
          duration: '30 دقیقه',
          contentType: 'video',
          isNew: true,
        },
        {
          id: 2,
          title: 'آناتومی عملی دندان',
          isLocked: false,
          previewContent: 'کار عملی با مدل‌های دندانی.',
          completed: false,
          duration: '45 دقیقه',
          contentType: 'text',
        },
        {
          id: 3,
          title: 'تکنیک‌های پیشرفته تصویربرداری',
          isLocked: true,
          duration: '40 دقیقه',
          contentType: 'video',
        },
        {
          id: 4,
          title: 'آزمون آناتومی',
          isLocked: true,
          duration: '20 دقیقه',
          contentType: 'quiz',
          isNew: true,
        },
      ],
      faqs: [
        {
          id: 1,
          question: 'آیا این دوره پیش‌نیاز دارد؟',
          answer: 'خیر، این دوره برای سطح متوسط طراحی شده و نیازی به پیش‌نیاز ندارد.',
        },
        {
          id: 2,
          question: 'آیا گواهینامه ارائه می‌شود؟',
          answer: 'بله، پس از اتمام دوره، گواهینامه معتبر اعطا می‌شود.',
        },
      ],
      reviews: [
        {
          id: 1,
          user: 'دکتر سارا احمدی',
          rating: 5,
          comment: 'دوره بسیار کاربردی و با تدریس عالی بود!',
          date: 'فروردین ۱۴۰۴',
        },
        {
          id: 2,
          user: 'محمد حسینی',
          rating: 4,
          comment: 'محتوا خوب بود، ولی می‌توانست عملی‌تر باشد.',
          date: 'اسفند ۱۴۰۳',
        },
        {
          id: 3,
          user: 'زهرا کریمی',
          rating: 5,
          comment: 'یکی از بهترین دوره‌هایی که شرکت کردم!',
          date: 'بهمن ۱۴۰۳',
        },
      ],
      tags: ['آناتومی', 'دندانپزشکی', 'عملی'],
      prerequisites: ['آشنایی اولیه با دندانپزشکی'],
    },
    {
      id: 2,
      title: 'پروتزهای دندانی پیشرفته',
      instructor: 'دکتر مریم حسینی',
      description:
        'طراحی و ساخت پروتزهای دندانی با استفاده از تکنولوژی‌های روز دنیا.',
      duration: '10 هفته',
      level: 'پیشرفته',
      category: 'پروتز',
      image: '/assets/courses/prosthesis.jpg',
      price: '۶,۰۰۰,۰۰۰ تومان',
      startDate: 'خرداد ۱۴۰۴',
      isOpen: false,
      isFeatured: false,
      enrollmentCount: 85,
      syllabus: [
        {
          id: 1,
          title: 'مقدمه‌ای بر پروتزهای دندانی',
          isLocked: false,
          previewContent: 'آشنایی با انواع پروتزهای دندانی.',
          videoUrl: 'https://example.com/videos/prosthesis-intro.mp4',
          completed: false,
          duration: '25 دقیقه',
          contentType: 'video',
          isNew: true,
        },
        {
          id: 2,
          title: 'طراحی پروتز با نرم‌افزار',
          isLocked: true,
          duration: '50 دقیقه',
          contentType: 'text',
        },
        {
          id: 3,
          title: 'ساخت پروتزهای پیشرفته',
          isLocked: true,
          duration: '60 دقیقه',
          contentType: 'video',
        },
        {
          id: 4,
          title: 'آزمون طراحی پروتز',
          isLocked: true,
          duration: '15 دقیقه',
          contentType: 'quiz',
        },
      ],
      faqs: [
        {
          id: 1,
          question: 'چه نرم‌افزارهایی در این دوره آموزش داده می‌شوند؟',
          answer: 'نرم‌افزارهای CAD/CAM و طراحی سه‌بعدی آموزش داده می‌شوند.',
        },
        {
          id: 2,
          question: 'آیا این دوره عملی است؟',
          answer: 'بله، شامل جلسات عملی و شبیه‌سازی است.',
        },
      ],
      reviews: [
        {
          id: 1,
          user: 'دکتر علی رضوی',
          rating: 4,
          comment: 'دوره خوبی بود، اما انتظار محتوای عملی بیشتری داشتم.',
          date: 'دی ۱۴۰۳',
        },
        {
          id: 2,
          user: 'نازنین موسوی',
          rating: 5,
          comment: 'تدریس بسیار حرفه‌ای و محتوای به‌روز!',
          date: 'آذر ۱۴۰۳',
        },
      ],
      tags: ['پروتز', 'تکنولوژی', 'پیشرفته'],
      prerequisites: ['دوره آناتومی دندان', 'آشنایی با CAD/CAM'],
    },
    {
      id: 3,
      title: 'دوره عملی ترمیمی',
      instructor: 'دکتر علی محمدی',
      description:
        'تمرین عملی ترمیم دندان با متریال‌های مدرن و شبیه‌سازی کلینیکی.',
      duration: '6 هفته',
      level: 'مبتدی',
      category: 'ترمیمی',
      image: '/assets/courses/restorative.jpg',
      price: '۳,۸۰۰,۰۰۰ تومان',
      startDate: 'فروردین ۱۴۰۴',
      isOpen: true,
      isFeatured: true,
      enrollmentCount: 150,
      syllabus: [
        {
          id: 1,
          title: 'آشنایی با مواد ترمیمی',
          isLocked: false,
          previewContent: 'معرفی متریال‌های مدرن ترمیمی.',
          videoUrl: 'https://example.com/videos/restorative-intro.mp4',
          completed: true,
          duration: '20 دقیقه',
          contentType: 'video',
        },
        {
          id: 2,
          title: 'تکنیک‌های ترمیم عملی',
          isLocked: false,
          previewContent: 'آموزش تکنیک‌های ترمیم.',
          completed: false,
          duration: '35 دقیقه',
          contentType: 'text',
        },
        {
          id: 3,
          title: 'شبیه‌سازی کلینیکی',
          isLocked: true,
          duration: '45 دقیقه',
          contentType: 'video',
          isNew: true,
        },
        {
          id: 4,
          title: 'آزمون ترمیمی',
          isLocked: true,
          duration: '10 دقیقه',
          contentType: 'quiz',
        },
      ],
      faqs: [
        {
          id: 1,
          question: 'آیا این دوره برای مبتدیان مناسب است؟',
          answer: 'بله، این دوره برای مبتدیان طراحی شده است.',
        },
        {
          id: 2,
          question: 'چه ابزارهایی نیاز است؟',
          answer: 'ابزارهای استاندارد دندانپزشکی که در دوره معرفی می‌شوند.',
        },
      ],
      reviews: [
        {
          id: 1,
          user: 'مهدی شریفی',
          rating: 5,
          comment: 'برای شروع دندانپزشکی عالی بود!',
          date: 'بهمن ۱۴۰۳',
        },
        {
          id: 2,
          user: 'فاطمه رحیمی',
          rating: 4,
          comment: 'دوره خوبی بود، اما نیاز به جلسات عملی بیشتری دارد.',
          date: 'دی ۱۴۰۳',
        },
        {
          id: 3,
          user: 'حسین کاظمی',
          rating: 5,
          comment: 'مدرس بسیار با تجربه و محتوای کاربردی!',
          date: 'آذر ۱۴۰۳',
        },
      ],
      tags: ['ترمیمی', 'عملی', 'مبتدی'],
      prerequisites: [],
    },
  ]);

  return (
    <CourseContext.Provider value={{ courses, setCourses }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourseContext = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourseContext must be used within a CourseProvider');
  }
  return context;
};
