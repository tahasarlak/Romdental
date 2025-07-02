// src/context/InstructorContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Interface for defining the structure of an instructor
export interface Instructor {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  experience: string;
  coursesTaught: string[];
  averageRating: string; // Add required property
  totalStudents: number; // Add required property
}

// Interface for defining the context type
interface InstructorContextType {
  instructors: Instructor[];
  setInstructors: React.Dispatch<React.SetStateAction<Instructor[]>>;
}

// Create context
const InstructorContext = createContext<InstructorContextType | undefined>(undefined);

// Context provider for managing the list of instructors
export const InstructorProvider = ({ children }: { children: ReactNode }) => {
  const [instructors, setInstructors] = useState<Instructor[]>([
    {
      id: 1,
      name: 'احمد رضایی',
      specialty: 'آناتومی دندان',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه سماشکو، متخصص آموزش آناتومی دندان',
      image: '/assets/instructors/ahmad-rasteh.jpg',
      experience: '۱۵ سال',
      coursesTaught: ['دوره جامع آناتومی دندان'],
      averageRating: '4.5', // Add required field
      totalStudents: 120, // Add required field
    },
    {
      id: 2,
      name: 'مریم حسینی',
      specialty: 'پروتزهای دندانی',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه پیراگوا، متخصص پروتزهای دندانی',
      image: '/assets/instructors/ahmad-rasteh.jpg',
      experience: '۱۲ سال',
      coursesTaught: ['پروتزهای دندانی پیشرفته'],
      averageRating: '4.7', // Add required field
      totalStudents: 95, // Add required field
    },
    // Update the rest of the instructors similarly...
    {
      id: 3,
      name: 'علی محمدی',
      specialty: 'ترمیم دندان',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه رودن، متخصص ترمیم دندان',
      image: '/assets/instructors/ahmad-rasteh.jpg',
      experience: '۱۰ سال',
      coursesTaught: ['دوره عملی ترمیمی'],
      averageRating: '4.3',
      totalStudents: 80,
    },
    {
      id: 4,
      name: 'سارا احمدی',
      specialty: 'دندانپزشکی عمومی',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه سچینوا، با تمرکز بر آموزش دندانپزشکی پایه',
      image: '/assets/instructors/ahmad-rasteh.jpg',
      experience: '۸ سال',
      coursesTaught: ['دوره مقدماتی دندانپزشکی عمومی'],
      averageRating: '4.6',
      totalStudents: 150,
    },
    {
      id: 5,
      name: 'رضا کاظمی',
      specialty: 'ایمپلنتولوژی',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه سماشکو، متخصص ایمپلنت دندانی',
      image: '/assets/instructors/ahmad-rasteh.jpg',
      experience: '۱۴ سال',
      coursesTaught: ['دوره پیشرفته ایمپلنت دندانی'],
      averageRating: '4.8',
      totalStudents: 110,
    },
    {
      id: 6,
      name: 'نازنین موسوی',
      specialty: 'ترمیم پیشرفته',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه پیراگوا، متخصص مواد نوین ترمیمی',
      image: '/assets/instructors/ahmad-rasteh.jpg',
      experience: '۱۱ سال',
      coursesTaught: ['دوره ترمیمی پیشرفته'],
      averageRating: '4.4',
      totalStudents: 90,
    },
    {
      id: 7,
      name: 'مهدی شریفی',
      specialty: 'مدیریت کلینیک',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه سچینوا، متخصص مدیریت کلینیک‌های دندانپزشکی',
      image: '/assets/instructors/ahmad-rasteh.jpg',
      experience: '۱۳ سال',
      coursesTaught: ['دوره مدیریت کلینیک دندانپزشکی'],
      averageRating: '4.9',
      totalStudents: 70,
    },
    {
      id: 8,
      name: 'حسین کاظمی',
      specialty: 'ارتودنسی',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه رودن، متخصص ارتودنسی مقدماتی',
      image: '/assets/instructors/ahmad-rasteh.jpg',
      experience: '۹ سال',
      coursesTaught: ['دوره ارتودنسی مقدماتی'],
      averageRating: '4.2',
      totalStudents: 100,
    },
    {
      id: 9,
      name: 'بهرام رحیمی',
      specialty: 'جراحی دهان',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه سماشکو، متخصص جراحی دهان و دندان',
      image: '/assets/instructors/ahmad-rasteh.jpg',
      experience: '۱۶ سال',
      coursesTaught: ['دوره جراحی دهان و دندان'],
      averageRating: '4.6',
      totalStudents: 130,
    },
    {
      id: 10,
      name: 'فاطمه رحیمی',
      specialty: 'لیزر در دندانپزشکی',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه سچینوا، متخصص لیزر درمانی در دندانپزشکی',
      image: '/assets/instructors/ahmad-rasteh.jpg',
      experience: '۱۰ سال',
      coursesTaught: ['دوره تکنیک‌های لیزر در دندانپزشکی'],
      averageRating: '4.5',
      totalStudents: 85,
    },
  ]);

  return (
    <InstructorContext.Provider value={{ instructors, setInstructors }}>
      {children}
    </InstructorContext.Provider>
  );
};

// Hook for using the context
export const useInstructorContext = () => {
  const context = useContext(InstructorContext);
  if (!context) {
    throw new Error('useInstructorContext must be used within an InstructorProvider');
  }
  return context;
};