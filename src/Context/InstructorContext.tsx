// src/context/InstructorContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Instructor {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  experience: string;
  coursesTaught: string[];
}

interface InstructorContextType {
  instructors: Instructor[];
  setInstructors: React.Dispatch<React.SetStateAction<Instructor[]>>;
}

const InstructorContext = createContext<InstructorContextType | undefined>(undefined);

export const InstructorProvider = ({ children }: { children: ReactNode }) => {
  const [instructors, setInstructors] = useState<Instructor[]>([
    {
      id: 1,
      name: 'دکتر احمد رضایی',
      specialty: 'آناتومی دندان',
      bio: 'متخصص آناتومی دندان با بیش از ۱۵ سال تجربه در آموزش و پژوهش.',
      image: '/assets/instructors/ahmad-rezaei.jpg',
      experience: '۱۵ سال',
      coursesTaught: ['دوره جامع آناتومی دندان'],
    },
    {
      id: 2,
      name: 'دکتر مریم حسینی',
      specialty: 'پروتزهای دندانی',
      bio: 'کارشناس پروتزهای دندانی با تمرکز بر تکنولوژی‌های مدرن.',
      image: '/assets/instructors/maryam-hosseini.jpg',
      experience: '۱۲ سال',
      coursesTaught: ['پروتزهای دندانی پیشرفته'],
    },
    {
      id: 3,
      name: 'دکتر علی محمدی',
      specialty: 'ترمیم دندان',
      bio: 'متخصص ترمیم دندان با تجربه گسترده در کلینیک‌های پیشرفته.',
      image: '/assets/instructors/ali-mohammadi.jpg',
      experience: '۱۰ سال',
      coursesTaught: ['دوره عملی ترمیمی'],
    },
  ]);

  return (
    <InstructorContext.Provider value={{ instructors, setInstructors }}>
      {children}
    </InstructorContext.Provider>
  );
};

export const useInstructorContext = () => {
  const context = useContext(InstructorContext);
  if (!context) {
    throw new Error('useInstructorContext must be used within an InstructorProvider');
  }
  return context;
};