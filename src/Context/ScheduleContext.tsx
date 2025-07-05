import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useCourseContext } from './CourseContext';

interface ScheduleItem {
  day: string;
  time: string;
  course: string;
  instructor: string;
}

interface ScheduleContextType {
  weeklySchedule: ScheduleItem[];
  setWeeklySchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const { courses } = useCourseContext();

  // Filter online courses and map to schedule items
  const initialSchedule = courses
    .filter((course) => course.courseType === 'Online')
    .map((course) => {
      const days = ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه', 'یکشنبه'];
      const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
      const randomDay = days[Math.floor(Math.random() * days.length)];
      const randomTime = times[Math.floor(Math.random() * times.length)];
      return {
        day: randomDay,
        time: randomTime,
        course: course.title,
        instructor: course.instructor,
      };
    });

  const [weeklySchedule, setWeeklySchedule] = useState<ScheduleItem[]>(initialSchedule);

  return (
    <ScheduleContext.Provider value={{ weeklySchedule, setWeeklySchedule }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useScheduleContext = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useScheduleContext must be used within a ScheduleProvider');
  }
  return context;
};