import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useCourseContext } from './CourseContext';

interface ScheduleItem {
  id: number;
  day: string;
  time: string;
  course: string;
  instructor: string;
  image: string;
}

interface ScheduleContextType {
  weeklySchedule: ScheduleItem[];
  setWeeklySchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { courses } = useCourseContext();
  const days = ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه', 'یکشنبه'];
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  const initialSchedule = courses
    .filter((course) => course.courseType === 'Online')
    .map((course) => ({
      id: course.id,
      day: days[Math.floor(Math.random() * days.length)],
      time: times[Math.floor(Math.random() * times.length)],
      course: course.title,
      instructor: course.instructor,
      image: course.image,
    }));

  const [weeklySchedule, setWeeklySchedule] = useState<ScheduleItem[]>(initialSchedule);

  return (
    <ScheduleContext.Provider value={{ weeklySchedule, setWeeklySchedule }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useScheduleContext = () => {
  const context = useContext(ScheduleContext);
  if (!context) throw new Error('useScheduleContext must be used within a ScheduleProvider');
  return context;
};