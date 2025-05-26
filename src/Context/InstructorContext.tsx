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
    name: 'دکتر احمد راسته',
    specialty: 'کونی حرفه ای',
    bio: 'کارشناس برجسته در حوزه مشاوره و آموزش حرفه‌ای با تمرکز بر توسعه مهارت‌های فردی و تیمی.',
    image: '/assets/instructors/ahmad-rasteh.jpg',
    experience: '۱۵ سال',
    coursesTaught: ['دوره جامع مهارت‌های حرفه‌ای', 'کارگاه توسعه فردی', 'سمینار مدیریت تیم'],
  },
  {
    id: 2,
    name: 'دکتر امیر لک زایی',
    specialty: 'جق بین',
    bio: 'متخصص آموزش‌های خلاقانه با رویکرد نوآورانه در حل مسائل و بهبود عملکرد سازمانی.',
    image: '/assets/instructors/amir-lakzaei.jpg',
    experience: '۱۲ سال',
    coursesTaught: ['دوره نوآوری و خلاقیت', 'کارگاه حل مسئله', 'سمینار تفکر خلاق'],
  },
  {
    id: 3,
    name: 'بهشاد نمیدونم چی',
    specialty: 'هیچ گوهی نیست',
    bio: 'مشاور و مربی با تجربه در توانمندسازی افراد و توسعه استراتژی‌های موفقیت‌آمیز.',
    image: '/assets/instructors/behshad-nemati.jpg',
    experience: '۱۰ سال',
    coursesTaught: ['دوره توانمندسازی شخصی', 'کارگاه استراتژی موفقیت', 'سمینار هدف‌گذاری'],
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