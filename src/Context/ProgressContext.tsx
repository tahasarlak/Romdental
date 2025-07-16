import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { useCourseContext } from './CourseContext';
import { useEnrollmentContext } from './EnrollmentContext';
import { useQuizContext } from './QuizContext';
import { useNotificationContext } from './NotificationContext';
import { v4 as uuidv4 } from 'uuid';

interface Progress {
  id: string;
  courseId: number;
  studentId: number;
  completedItems: string[]; // IDs سرفصل‌ها، ویدیوها یا تکالیف تکمیل‌شده
  progressPercentage: number; // درصد پیشرفت
  lastUpdated: string;
}

interface ProgressContextType {
  progresses: Progress[];
  updateProgress: (courseId: number, itemId: string) => Promise<void>;
  getStudentProgress: (studentId: number, courseId?: number) => Progress[];
  calculateProgress: (courseId: number, studentId: number) => number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthContext();
  const { courses } = useCourseContext();
  const { enrollments } = useEnrollmentContext();
  const { submissions, getQuizScore } = useQuizContext();
  const { showNotification } = useNotificationContext();
  const [progresses, setProgresses] = useState<Progress[]>([]);

  // Load progresses from localStorage on mount
  useEffect(() => {
    const storedProgresses = localStorage.getItem('progresses');
    if (storedProgresses) {
      try {
        setProgresses(JSON.parse(storedProgresses));
      } catch (error) {
        console.error('Error parsing progresses from localStorage:', error);
      }
    }
  }, []);

  // Save progresses to localStorage on change
  useEffect(() => {
    localStorage.setItem('progresses', JSON.stringify(progresses));
  }, [progresses]);

  // Update progress for a student in a course
  const updateProgress = async (courseId: number, itemId: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('برای به‌روزرسانی پیشرفت باید وارد حساب کاربری شوید.');
    }
    const enrollment = enrollments.find((e) => e.courseId === courseId && e.studentId === user.id);
    if (!enrollment) {
      throw new Error('شما در این دوره ثبت‌نام نکرده‌اید.');
    }
    const course = courses.find((c) => c.id === courseId);
    if (!course) {
      throw new Error('دوره یافت نشد.');
    }

    try {
      let progress = progresses.find((p) => p.courseId === courseId && p.studentId === user.id);
      if (!progress) {
        progress = {
          id: uuidv4(),
          courseId,
          studentId: user.id,
          completedItems: [],
          progressPercentage: 0,
          lastUpdated: new Date().toLocaleString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      }

      if (!progress.completedItems.includes(itemId)) {
        progress.completedItems.push(itemId);
        // Calculate progress percentage (simplified: based on completed items and quizzes)
        const totalItems = 10; // Example: Assume 10 items per course (syllabus + quizzes)
        const quizSubmissions = submissions.filter((s) => s.quizId.includes(courseId.toString()) && s.studentId === user.id);
        const quizScore = quizSubmissions.reduce((sum, s) => sum + getQuizScore(s.id), 0) / (quizSubmissions.length || 1);
        const itemProgress = (progress.completedItems.length / totalItems) * 70; // 70% weight for items
        const quizProgress = (quizSubmissions.length > 0 ? quizScore : 0) * 0.3; // 30% weight for quizzes
        progress.progressPercentage = Math.min(100, Math.round(itemProgress + quizProgress));
        progress.lastUpdated = new Date().toLocaleString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        setProgresses((prev) => [
          ...prev.filter((p) => p.id !== progress!.id),
          progress!,
        ]);
        showNotification(`پیشرفت شما در دوره ${course.title} به‌روزرسانی شد: ${progress.progressPercentage}%`, 'success');
      }
    } catch (error: any) {
      showNotification(error.message || 'خطا در به‌روزرسانی پیشرفت.', 'error');
      throw error;
    }
  };

  const getStudentProgress = (studentId: number, courseId?: number): Progress[] => {
    return progresses.filter((p) => p.studentId === studentId && (!courseId || p.courseId === courseId));
  };

  const calculateProgress = (courseId: number, studentId: number): number => {
    const progress = progresses.find((p) => p.courseId === courseId && p.studentId === studentId);
    return progress ? progress.progressPercentage : 0;
  };

  return (
    <ProgressContext.Provider
      value={{
        progresses,
        updateProgress,
        getStudentProgress,
        calculateProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgressContext = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgressContext must be used within a ProgressProvider');
  }
  return context;
};