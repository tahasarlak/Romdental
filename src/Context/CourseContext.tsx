import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useInstructorContext } from './InstructorContext';

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

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

interface Course {
  slug: string;
  id: number;
  title: string;
  instructor: string;
  description: string;
  duration: string;
  courseNumber: string;
  category: 'آناتومی' | 'پروتز' | 'ترمیمی' | 'عمومی';
  image: string;
  price: string;
  discountPrice?: string;
  discountPercentage?: number;
  startDate: string;
  isOpen: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  syllabus: SyllabusItem[];
  faqs: FaqItem[];
  tags?: string[];
  prerequisites?: string[];
  courseType: 'Online' | 'Offline' | 'In-Person' | 'Hybrid';
  university: string;
}

interface CourseContextType {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const { instructors } = useInstructorContext();
  const instructorNames = new Set(instructors.map((instructor) => instructor.name));

  const validatedCourses = [
    {
      id: 1,
      title: 'دوره جامع آناتومی دندان',
      instructor: 'احمد رضایی',
      description: 'آموزش کامل آناتومی دندان با تمرکز بر تکنیک‌های عملی و تئوری پیشرفته برای درس آناتومی دانشگاه سماشکو.',
      duration: '8 هفته',
      courseNumber: 'Course 1',
      category: 'آناتومی' as const,
      image: '/assets/courses/restorative.jpg',
      price: '۴,۵۰۰,۰۰۰ تومان',
      discountPrice: '۳,۸۰۰,۰۰۰ تومان',
      discountPercentage: 15,
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
          contentType: 'video' as const,
          isNew: true,
        },
        {
          id: 2,
          title: 'آناتومی عملی دندان',
          isLocked: false,
          previewContent: 'کار عملی با مدل‌های دندانی.',
          completed: false,
          duration: '45 دقیقه',
          contentType: 'text' as const,
        },
        {
          id: 3,
          title: 'تکنیک‌های پیشرفته تصویربرداری',
          isLocked: true,
          duration: '40 دقیقه',
          contentType: 'video' as const,
        },
        {
          id: 4,
          title: 'آزمون آناتومی',
          isLocked: true,
          duration: '20 دقیقه',
          contentType: 'quiz' as const,
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
      tags: ['آناتومی', 'دندانپزشکی', 'عملی'],
      prerequisites: ['آشنایی اولیه با دندانپزشکی'],
      courseType: 'Online' as const,
      university: 'Smashko',
    },
    {
      id: 2,
      title: 'پروتزهای دندانی پیشرفته',
      instructor: 'مریم حسینی',
      description: 'طراحی و ساخت پروتزهای دندانی با استفاده از تکنولوژی‌های روز دنیا برای درس پروتز دانشگاه پیراگوا.',
      duration: '10 هفته',
      courseNumber: 'Course 2',
      category: 'پروتز' as const,
      image: '/assets/courses/restorative.jpg',
      price: '۶,۰۰۰,۰۰۰ تومان',
      discountPrice: '۵,۱۰۰,۰۰۰ تومان',
      discountPercentage: 15,
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
          contentType: 'video' as const,
          isNew: true,
        },
        {
          id: 2,
          title: 'طراحی پروتز با نرم‌افزار',
          isLocked: true,
          duration: '50 دقیقه',
          contentType: 'text' as const,
        },
        {
          id: 3,
          title: 'ساخت پروتزهای پیشرفته',
          isLocked: true,
          duration: '60 دقیقه',
          contentType: 'video' as const,
        },
        {
          id: 4,
          title: 'آزمون طراحی پروتز',
          isLocked: true,
          duration: '15 دقیقه',
          contentType: 'quiz' as const,
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
      tags: ['پروتز', 'تکنولوژی', 'پیشرفته'],
      prerequisites: ['دوره آناتومی دندان', 'آشنایی با CAD/CAM'],
      courseType: 'Hybrid' as const,
      university: 'Piragova',
    },
    {
      id: 3,
      title: 'دوره عملی ترمیمی',
      instructor: 'علی محمدی',
      description: 'تمرین عملی ترمیم دندان با متریال‌های مدرن و شبیه‌سازی کلینیکی برای درس ترمیمی دانشگاه رودن.',
      duration: '6 هفته',
      courseNumber: 'Course 1',
      category: 'ترمیمی' as const,
      image: '/assets/courses/restorative.jpg',
      price: '۳,۸۰۰,۰۰۰ تومان',
      discountPrice: '۳,۴۲۰,۰۰۰ تومان',
      discountPercentage: 10,
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
          contentType: 'video' as const,
        },
        {
          id: 2,
          title: 'تکنیک‌های ترمیم عملی',
          isLocked: false,
          previewContent: 'آموزش تکنیک‌های ترمیم.',
          completed: false,
          duration: '35 دقیقه',
          contentType: 'text' as const,
        },
        {
          id: 3,
          title: 'شبیه‌سازی کلینیکی',
          isLocked: true,
          duration: '45 دقیقه',
          contentType: 'video' as const,
          isNew: true,
        },
        {
          id: 4,
          title: 'آزمون ترمیمی',
          isLocked: true,
          duration: '10 دقیقه',
          contentType: 'quiz' as const,
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
      tags: ['ترمیمی', 'عملی', 'مبتدی'],
      prerequisites: [],
      courseType: 'In-Person' as const,
      university: 'RUDN',
    },
    {
      id: 4,
      title: 'دوره مقدماتی دندانپزشکی عمومی',
      instructor: 'سارا احمدی',
      description: 'آشنایی با مفاهیم پایه دندانپزشکی و تکنیک‌های اولیه برای درس عمومی دانشگاه سچینوا.',
      duration: '5 هفته',
      courseNumber: 'Course 1',
      category: 'عمومی' as const,
      image: '/assets/courses/restorative.jpg',
      price: '۲,۵۰۰,۰۰۰ تومان',
      startDate: 'تیر ۱۴۰۴',
      isOpen: true,
      isFeatured: false,
      enrollmentCount: 200,
      syllabus: [
        {
          id: 1,
          title: 'مفاهیم پایه دندانپزشکی',
          isLocked: false,
          previewContent: 'آشنایی با ابزارها و اصول اولیه.',
          videoUrl: 'https://example.com/videos/general-intro.mp4',
          completed: false,
          duration: '25 دقیقه',
          contentType: 'video' as const,
        },
        {
          id: 2,
          title: 'معاینه بیمار',
          isLocked: false,
          previewContent: 'روش‌های معاینه بیمار در کلینیک.',
          completed: false,
          duration: '30 دقیقه',
          contentType: 'text' as const,
        },
        {
          id: 3,
          title: 'تکنیک‌های اولیه درمان',
          isLocked: true,
          duration: '35 دقیقه',
          contentType: 'video' as const,
        },
        {
          id: 4,
          title: 'آزمون مقدماتی',
          isLocked: true,
          duration: '15 دقیقه',
          contentType: 'quiz' as const,
          isNew: true,
        },
      ],
      faqs: [
        {
          id: 1,
          question: 'آیا این دوره برای دانشجویان مناسب است؟',
          answer: 'بله، این دوره برای دانشجویان و مبتدیان ایده‌آل است.',
        },
        {
          id: 2,
          question: 'آیا نیاز به تجربه قبلی دارد؟',
          answer: 'خیر، این دوره هیچ پیش‌نیازی ندارد.',
        },
      ],
      tags: ['دندانپزشکی', 'مبتدی', 'عمومی'],
      prerequisites: [],
      courseType: 'Online' as const,
      university: 'Sechenov',
    },
    {
      id: 5,
      title: 'دوره پیشرفته ایمپلنت دندانی',
      instructor: 'رضا کاظمی',
      description: 'آموزش تکنیک‌های پیشرفته ایمپلنتولوژی با تمرکز بر روش‌های جراحی برای درس ایمپلنت دانشگاه سماشکو.',
      duration: '12 هفته',
      courseNumber: 'Course 3',
      category: 'پروتز' as const,
      image: '/assets/courses/restorative.jpg',
      price: '۷,۵۰۰,۰۰۰ تومان',
      discountPrice: '۶,۳۷۵,۰۰۰ تومان',
      discountPercentage: 15,
      startDate: 'مرداد ۱۴۰۴',
      isOpen: true,
      isFeatured: true,
      enrollmentCount: 60,
      syllabus: [
        {
          id: 1,
          title: 'آشنایی با ایمپلنت‌های دندانی',
          isLocked: false,
          previewContent: 'بررسی انواع ایمپلنت‌ها و کاربردها.',
          videoUrl: 'https://example.com/videos/implant-intro.mp4',
          completed: false,
          duration: '30 دقیقه',
          contentType: 'video' as const,
          isNew: true,
        },
        {
          id: 2,
          title: 'جراحی ایمپلنت',
          isLocked: true,
          duration: '50 دقیقه',
          contentType: 'video' as const,
        },
        {
          id: 3,
          title: 'مدیریت عوارض',
          isLocked: true,
          duration: '40 دقیقه',
          contentType: 'text' as const,
        },
        {
          id: 4,
          title: 'آزمون ایمپلنت',
          isLocked: true,
          duration: '20 دقیقه',
          contentType: 'quiz' as const,
        },
      ],
      faqs: [
        {
          id: 1,
          question: 'آیا این دوره شامل تمرین عملی است؟',
          answer: 'بله، شامل جلسات عملی در کلینیک است.',
        },
        {
          id: 2,
          question: 'پیش‌نیازهای این دوره چیست؟',
          answer: 'تجربه در دندانپزشکی عمومی و آشنایی با جراحی.',
        },
      ],
      tags: ['ایمپلنت', 'جراحی', 'پیشرفته'],
      prerequisites: ['دوره دندانپزشکی عمومی', 'آشنایی با جراحی'],
      courseType: 'In-Person' as const,
      university: 'Smashko',
    },
    {
      id: 6,
      title: 'دوره ترمیمی پیشرفته',
      instructor: 'نازنین موسوی',
      description: 'آموزش تکنیک‌های پیشرفته ترمیمی با متریال‌های نوین برای درس ترمیمی دانشگاه پیراگوا.',
      duration: '8 هفته',
      courseNumber: 'Course 2',
      category: 'ترمیمی' as const,
      image: '/assets/courses/restorative.jpg',
      price: '۴,۸۰۰,۰۰۰ تومان',
      discountPrice: '۴,۳۲۰,۰۰۰ تومان',
      discountPercentage: 10,
      startDate: 'خرداد ۱۴۰۴',
      isOpen: true,
      isFeatured: false,
      enrollmentCount: 90,
      syllabus: [
        {
          id: 1,
          title: 'متریال‌های نوین ترمیمی',
          isLocked: false,
          previewContent: 'آشنایی با مواد پیشرفته ترمیمی.',
          videoUrl: 'https://example.com/videos/restorative-advanced.mp4',
          completed: false,
          duration: '25 دقیقه',
          contentType: 'video' as const,
        },
        {
          id: 2,
          title: 'تکنیک‌های ترمیم پیشرفته',
          isLocked: false,
          previewContent: 'آموزش تکنیک‌های نوین.',
          completed: false,
          duration: '40 دقیقه',
          contentType: 'text' as const,
        },
        {
          id: 3,
          title: 'کار عملی ترمیمی',
          isLocked: true,
          duration: '50 دقیقه',
          contentType: 'video' as const,
          isNew: true,
        },
        {
          id: 4,
          title: 'آزمون ترمیمی پیشرفته',
          isLocked: true,
          duration: '15 دقیقه',
          contentType: 'quiz' as const,
        },
      ],
      faqs: [
        {
          id: 1,
          question: 'آیا این دوره برای دندانپزشکان عمومی مناسب است؟',
          answer: 'بله، با دانش پایه ترمیمی مناسب است.',
        },
        {
          id: 2,
          question: 'آیا گواهینامه ارائه می‌شود؟',
          answer: 'بله، گواهینامه معتبر ارائه می‌شود.',
        },
      ],
      tags: ['ترمیمی', 'پیشرفته', 'عملی'],
      prerequisites: ['دوره عملی ترمیمی'],
      courseType: 'Hybrid' as const,
      university: 'Piragova',
    },
    {
      id: 7,
      title: 'دوره مدیریت کلینیک دندانپزشکی',
      instructor: 'مهدی شریفی',
      description: 'آموزش مدیریت کلینیک‌های دندانپزشکی و بهینه‌سازی فرآیندها برای درس مدیریت دانشگاه سچینوا.',
      duration: '6 هفته',
      courseNumber: 'Course 3',
      category: 'عمومی' as const,
      image: '/assets/courses/restorative.jpg',
      price: '۳,۲۰۰,۰۰۰ تومان',
      startDate: 'مرداد ۱۴۰۴',
      isOpen: true,
      isFeatured: false,
      enrollmentCount: 110,
      syllabus: [
        {
          id: 1,
          title: 'مدیریت منابع کلینیک',
          isLocked: false,
          previewContent: 'آشنایی با مدیریت منابع و تجهیزات.',
          videoUrl: 'https://example.com/videos/clinic-management.mp4',
          duration: '30 دقیقه',
          contentType: 'video' as const,
        },
        {
          id: 2,
          title: 'مدیریت بیماران',
          isLocked: false,
          previewContent: 'روش‌های مدیریت بیماران.',
          completed: false,
          duration: '35 دقیقه',
          contentType: 'text' as const,
        },
        {
          id: 3,
          title: 'استراتژی‌های مالی',
          isLocked: true,
          duration: '40 دقیقه',
          contentType: 'video' as const,
        },
        {
          id: 4,
          title: 'آزمون مدیریت',
          isLocked: true,
          duration: '15 دقیقه',
          contentType: 'quiz' as const,
        },
      ],
      faqs: [
        {
          id: 1,
          question: 'آیا این دوره برای مدیران کلینیک مناسب است؟',
          answer: 'بله، برای مدیران و دندانپزشکان مناسب است.',
        },
        {
          id: 2,
          question: 'آیا این دوره عملی است؟',
          answer: 'بله، شامل تمرین‌های عملی مدیریت است.',
        },
      ],
      tags: ['مدیریت', 'کلینیک', 'عمومی'],
      prerequisites: ['آشنایی با دندانپزشکی عمومی'],
      courseType: 'Online' as const,
      university: 'Sechenov',
    },
    {
      id: 8,
      title: 'دوره ارتودنسی مقدماتی',
      instructor: 'حسین کاظمی',
      description: 'آشنایی با مفاهیم پایه ارتودنسی و تکنیک‌های اولیه برای درس ارتودنسی دانشگاه رودن.',
      duration: '7 هفته',
      courseNumber: 'Course 1',
      category: 'عمومی' as const,
      image: '/assets/courses/restorative.jpg',
      price: '۴,۰۰۰,۰۰۰ تومان',
      discountPrice: '۳,۶۰۰,۰۰۰ تومان',
      discountPercentage: 10,
      startDate: 'اردیبهشت ۱۴۰۴',
      isOpen: true,
      isFeatured: true,
      enrollmentCount: 130,
      syllabus: [
        {
          id: 1,
          title: 'مفاهیم پایه ارتودنسی',
          isLocked: false,
          previewContent: 'آشنایی با اصول ارتودنسی.',
          videoUrl: 'https://example.com/videos/orthodontics-intro.mp4',
          completed: false,
          duration: '25 دقیقه',
          contentType: 'video' as const,
        },
        {
          id: 2,
          title: 'تشخیص مشکلات ارتودنسی',
          isLocked: false,
          previewContent: 'روش‌های تشخیص اولیه.',
          completed: false,
          duration: '30 دقیقه',
          contentType: 'text' as const,
        },
        {
          id: 3,
          title: 'کار عملی ارتودنسی',
          isLocked: true,
          duration: '40 دقیقه',
          contentType: 'video' as const,
          isNew: true,
        },
        {
          id: 4,
          title: 'آزمون ارتودنسی',
          isLocked: true,
          duration: '15 دقیقه',
          contentType: 'quiz' as const,
        },
      ],
      faqs: [
        {
          id: 1,
          question: 'آیا این دوره برای مبتدیان مناسب است؟',
          answer: 'بله، برای افراد بدون تجربه قبلی مناسب است.',
        },
        {
          id: 2,
          question: 'آیا گواهینامه ارائه می‌شود؟',
          answer: 'بله، گواهینامه معتبر ارائه می‌شود.',
        },
      ],
      tags: ['ارتودنسی', 'مبتدی', 'عملی'],
      prerequisites: [],
      courseType: 'In-Person' as const,
      university: 'RUDN',
    },
    {
      id: 9,
      title: 'دوره جراحی دهان و دندان',
      instructor: 'بهرام رحیمی',
      description: 'آموزش تکنیک‌های جراحی دهان و دندان با تمرکز بر روش‌های پیشرفته برای درس جراحی دانشگاه سماشکو.',
      duration: '10 هفته',
      courseNumber: 'Course 4',
      category: 'عمومی' as const,
      image: '/assets/courses/restorative.jpg',
      price: '۶,۵۰۰,۰۰۰ تومان',
      startDate: 'تیر ۱۴۰۴',
      isOpen: false,
      isFeatured: false,
      enrollmentCount: 70,
      syllabus: [
        {
          id: 1,
          title: 'آشنایی با جراحی دهان',
          isLocked: false,
          previewContent: 'بررسی تکنیک‌های جراحی پایه.',
          videoUrl: 'https://example.com/videos/oral-surgery-intro.mp4',
          completed: false,
          duration: '30 دقیقه',
          contentType: 'video' as const,
          isNew: true,
        },
        {
          id: 2,
          title: 'جراحی پیشرفته',
          isLocked: true,
          duration: '50 دقیقه',
          contentType: 'video' as const,
        },
        {
          id: 3,
          title: 'مدیریت عوارض جراحی',
          isLocked: true,
          duration: '40 دقیقه',
          contentType: 'text' as const,
        },
        {
          id: 4,
          title: 'آزمون جراحی',
          isLocked: true,
          duration: '20 دقیقه',
          contentType: 'quiz' as const,
        },
      ],
      faqs: [
        {
          id: 1,
          question: 'آیا این دوره عملی است؟',
          answer: 'بله، شامل جلسات عملی جراحی است.',
        },
        {
          id: 2,
          question: 'پیش‌نیازهای این دوره چیست؟',
          answer: 'تجربه در دندانپزشکی عمومی و آشنایی با جراحی پایه.',
        },
      ],
      tags: ['جراحی', 'دهان', 'پیشرفته'],
      prerequisites: ['دوره دندانپزشکی عمومی'],
      courseType: 'Hybrid' as const,
      university: 'Smashko',
    },
    {
      id: 10,
      title: 'دوره تکنیک‌های لیزر در دندانپزشکی',
      instructor: 'فاطمه رحیمی',
      description: 'آموزش استفاده از لیزر در درمان‌های دندانپزشکی برای درس لیزر دانشگاه سچینوا.',
      duration: '6 هفته',
      courseNumber: 'Course 2',
      category: 'عمومی' as const,
      image: '/assets/courses/restorative.jpg',
      price: '۴,۲۰۰,۰۰۰ تومان',
      discountPrice: '۳,۷۸۰,۰۰۰ تومان',
      discountPercentage: 10,
      startDate: 'خرداد ۱۴۰۴',
      isOpen: true,
      isFeatured: true,
      enrollmentCount: 100,
      syllabus: [
        {
          id: 1,
          title: 'آشنایی با لیزر در دندانپزشکی',
          isLocked: false,
          previewContent: 'معرفی کاربردهای لیزر.',
          videoUrl: 'https://example.com/videos/laser-intro.mp4',
          completed: false,
          duration: '25 دقیقه',
          contentType: 'video' as const,
        },
        {
          id: 2,
          title: 'تکنیک‌های لیزر درمانی',
          isLocked: false,
          previewContent: 'آموزش تکنیک‌های لیزر.',
          completed: false,
          duration: '30 دقیقه',
          contentType: 'text' as const,
        },
        {
          id: 3,
          title: 'کار عملی با لیزر',
          isLocked: true,
          duration: '40 دقیقه',
          contentType: 'video' as const,
          isNew: true,
        },
        {
          id: 4,
          title: 'آزمون لیزر',
          isLocked: true,
          duration: '15 دقیقه',
          contentType: 'quiz' as const,
        },
      ],
      faqs: [
        {
          id: 1,
          question: 'آیا این دوره برای دندانپزشکان عمومی مناسب است؟',
          answer: 'بله، با دانش پایه دندانپزشکی مناسب است.',
        },
        {
          id: 2,
          question: 'آیا گواهینامه ارائه می‌شود؟',
          answer: 'بله، گواهینامه معتبر ارائه می‌شود.',
        },
      ],
      tags: ['لیزر', 'دندانپزشکی', 'متوسط'],
      prerequisites: ['آشنایی با دندانپزشکی عمومی'],
      courseType: 'Offline' as const,
      university: 'Sechenov',
    },
  ].filter((course) => {
    const isValid = instructorNames.has(course.instructor);
    if (!isValid) {
      console.warn(`استاد ${course.instructor} برای دوره ${course.title} در لیست اساتید یافت نشد.`);
    }
    return isValid;
  }) as Course[];

  const [courses, setCourses] = useState<Course[]>(validatedCourses);

  const validateAndSetCourses = (newCourses: Course[] | ((prev: Course[]) => Course[])) => {
    setCourses((prev) => {
      const updatedCourses = typeof newCourses === 'function' ? newCourses(prev) : newCourses;
      const validCourses = updatedCourses.filter((course) => {
        const isValid = instructorNames.has(course.instructor) &&
          ['آناتومی', 'پروتز', 'ترمیمی', 'عمومی'].includes(course.category) &&
          ['Online', 'Offline', 'In-Person', 'Hybrid'].includes(course.courseType) &&
          ['Course 1', 'Course 2', 'Course 3', 'Course 4', 'Course 5'].includes(course.courseNumber) &&
          ['Smashko', 'Piragova', 'RUDN', 'Sechenov'].includes(course.university);
        if (!isValid) {
          console.warn(`دوره ${course.title} به دلیل استاد، دسته‌بندی، نوع دوره، کورس یا دانشگاه نامعتبر حذف شد.`);
        }
        return isValid;
      });
      return validCourses;
    });
  };

  return (
    <CourseContext.Provider value={{ courses, setCourses: validateAndSetCourses }}>
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