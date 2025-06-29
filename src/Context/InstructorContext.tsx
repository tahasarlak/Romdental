// src/context/InstructorContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// رابط برای تعریف ساختار یک استاد
interface Instructor {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  experience: string;
  coursesTaught: string[];
}

// رابط برای تعریف نوع کانتکست
interface InstructorContextType {
  instructors: Instructor[];
  setInstructors: React.Dispatch<React.SetStateAction<Instructor[]>>;
}

// ایجاد کانتکست
const InstructorContext = createContext<InstructorContextType | undefined>(undefined);

// ارائه‌دهنده کانتکست برای مدیریت لیست اساتید
export const InstructorProvider = ({ children }: { children: ReactNode }) => {
  const [instructors, setInstructors] = useState<Instructor[]>([
    {
      id: 1,
      name: 'دکتر احمد رضایی',
      specialty: 'آناتومی دندان',
      bio: 'کارشناس برجسته در حوزه مشاوره و آموزش حرفه‌ای با تمرکز بر توسعه مهارت‌های فردی و تیمی.',
      image: '/assets/instructors/ahmad-rezaei.jpg',
      experience: '۱۵ سال',
      coursesTaught: ['دوره جامع آناتومی دندان', 'کارگاه توسعه فردی', 'سمینار مدیریت تیم'],
    },
    {
      id: 2,
      name: 'دکتر مریم حسینی',
      specialty: 'پروتزهای دندانی',
      bio: 'متخصص آموزش‌های خلاقانه با رویکرد نوآورانه در حل مسائل و بهبود عملکرد سازمانی.',
      image: '/assets/instructors/maryam-hosseini.jpg',
      experience: '۱۲ سال',
      coursesTaught: ['پروتزهای دندانی پیشرفته', 'کارگاه حل مسئله', 'سمینار تفکر خلاق'],
    },
    {
      id: 3,
      name: 'دکتر علی محمدی',
      specialty: 'ترمیم دندان',
      bio: 'مشاور و مربی با تجربه در توانمندسازی افراد و توسعه استراتژی‌های موفقیت‌آمیز.',
      image: '/assets/instructors/ali-mohammadi.jpg',
      experience: '۱۰ سال',
      coursesTaught: ['دوره عملی ترمیمی', 'کارگاه استراتژی موفقیت', 'سمینار هدف‌گذاری'],
    },
    {
      id: 4,
      name: 'دکتر سارا احمدی',
      specialty: 'دندانپزشکی عمومی',
      bio: 'متخصص آموزش مفاهیم پایه دندانپزشکی با تمرکز بر تکنیک‌های اولیه.',
      image: '/assets/instructors/sara-ahmadi.jpg',
      experience: '۸ سال',
      coursesTaught: ['دوره مقدماتی دندانپزشکی عمومی'],
    },
    {
      id: 5,
      name: 'دکتر رضا کاظمی',
      specialty: 'ایمپلنتولوژی',
      bio: 'متخصص تکنیک‌های پیشرفته ایمپلنتولوژی و جراحی دندانی.',
      image: '/assets/instructors/reza-kazemi.jpg',
      experience: '۱۴ سال',
      coursesTaught: ['دوره پیشرفته ایمپلنت دندانی'],
    },
    {
      id: 6,
      name: 'دکتر نازنین موسوی',
      specialty: 'ترمیم پیشرفته',
      bio: 'کارشناس تکنیک‌های پیشرفته ترمیمی با متریال‌های نوین.',
      image: '/assets/instructors/nazanin-mousavi.jpg',
      experience: '۱۱ سال',
      coursesTaught: ['دوره ترمیمی پیشرفته'],
    },
    {
      id: 7,
      name: 'دکتر مهدی شریفی',
      specialty: 'مدیریت کلینیک',
      bio: 'متخصص مدیریت کلینیک‌های دندانپزشکی و بهینه‌سازی فرآیندها.',
      image: '/assets/instructors/mehdi-sharifi.jpg',
      experience: '۱۳ سال',
      coursesTaught: ['دوره مدیریت کلینیک دندانپزشکی'],
    },
    {
      id: 8,
      name: 'دکتر حسین کاظمی',
      specialty: 'ارتودنسی',
      bio: 'متخصص آموزش مفاهیم پایه ارتودنسی و تکنیک‌های اولیه.',
      image: '/assets/instructors/hossein-kazemi.jpg',
      experience: '۹ سال',
      coursesTaught: ['دوره ارتودنسی مقدماتی'],
    },
    {
      id: 9,
      name: 'دکتر بهرام رحیمی',
      specialty: 'جراحی دهان',
      bio: 'متخصص جراحی دهان و دندان با تمرکز بر روش‌های پیشرفته.',
      image: '/assets/instructors/bahram-rahimi.jpg',
      experience: '۱۶ سال',
      coursesTaught: ['دوره جراحی دهان و دندان'],
    },
    {
      id: 10,
      name: 'دکتر فاطمه رحیمی',
      specialty: 'لیزر در دندانپزشکی',
      bio: 'متخصص استفاده از لیزر در درمان‌های دندانپزشکی.',
      image: '/assets/instructors/fatemeh-rahimi.jpg',
      experience: '۱۰ سال',
      coursesTaught: ['دوره تکنیک‌های لیزر در دندانپزشکی'],
    },
  ]);

  return (
    <InstructorContext.Provider value={{ instructors, setInstructors }}>
      {children}
    </InstructorContext.Provider>
  );
};

// هوک برای استفاده از کانتکست
export const useInstructorContext = () => {
  const context = useContext(InstructorContext);
  if (!context) {
    throw new Error('useInstructorContext must be used within an InstructorProvider');
  }
  return context;
};