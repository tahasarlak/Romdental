import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './Auth/UserAuthContext';
import { useCourseContext } from './CourseContext';
import { useEnrollmentContext } from './EnrollmentContext';
import { usePaymentContext } from './PaymentContext';
import { useNotificationContext } from './NotificationContext';

interface CourseAnalytics {
  courseId: number;
  title: string;
  enrollmentCount: number;
  completionRate: number;
  revenue: number;
  averageRating: number;
}

interface UserAnalytics {
  userId: number;
  name: string;
  role: string;
  enrolledCourses: number;
  completedCourses: number;
  totalSpent: number;
  lastActivity: string;
}

interface PlatformAnalytics {
  totalEnrollments: number;
  totalRevenue: number;
  activeUsers: number;
  courseCompletionRate: number;
  topCourses: CourseAnalytics[];
  topUsers: UserAnalytics[];
}

interface AnalyticsContextType {
  courseAnalytics: CourseAnalytics[];
  userAnalytics: UserAnalytics[];
  platformAnalytics: PlatformAnalytics;
  getCourseReport: (courseId: number) => CourseAnalytics | null;
  getUserReport: (userId: number) => UserAnalytics | null;
  refreshAnalytics: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, users, isAuthenticated } = useAuthContext();
  const { courses } = useCourseContext();
  const { enrollments } = useEnrollmentContext();
  const { payments, getFinancialReport } = usePaymentContext();
  const { showNotification } = useNotificationContext();
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics[]>([]);
  const [platformAnalytics, setPlatformAnalytics] = useState<PlatformAnalytics>({
    totalEnrollments: 0,
    totalRevenue: 0,
    activeUsers: 0,
    courseCompletionRate: 0,
    topCourses: [],
    topUsers: [],
  });

  const calculateCompletionRate = (courseId: number): number => {
    const courseEnrollments = enrollments.filter((e) => e.courseId === courseId);
    if (courseEnrollments.length === 0) return 0;
    const completedEnrollments = courseEnrollments.filter((e) => e.status === 'active').length;
    return (completedEnrollments / courseEnrollments.length) * 100;
  };

  const calculateCourseRevenue = (courseId: number): number => {
    const coursePayments = payments
      .filter((p) => p.status === 'verified' && enrollments.some((e) => e.courseId === courseId && e.studentId === parseInt(p.userId)))
      .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^\d.-]/g, '')), 0);
    return coursePayments;
  };

  const calculateAverageRating = (courseId: number): number => {
    return 4.5;
  };

  const refreshAnalytics = () => {
    if (!isAuthenticated || !user || !['SuperAdmin', 'Admin', 'Instructor'].includes(user.role)) {
      showNotification('فقط ادمین‌ها و اساتید می‌توانند به تحلیل داده‌ها دسترسی داشته باشند.', 'error');
      return;
    }

    try {
      const newCourseAnalytics: CourseAnalytics[] = courses.map((course) => ({
        courseId: course.id,
        title: course.title,
        enrollmentCount: enrollments.filter((e) => e.courseId === course.id).length,
        completionRate: calculateCompletionRate(course.id),
        revenue: calculateCourseRevenue(course.id),
        averageRating: calculateAverageRating(course.id),
      }));

      const newUserAnalytics: UserAnalytics[] = users.map((u) => ({
        userId: u.id,
        name: u.name,
        role: u.role,
        enrolledCourses: u.enrolledCourses.length,
        completedCourses: enrollments.filter((e) => e.studentId === u.id && e.status === 'active').length,
        totalSpent: payments
          .filter((p) => p.userId === u.email && p.status === 'verified')
          .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^\d.-]/g, '')), 0),
        lastActivity: new Date().toLocaleString('fa-IR'),
      }));

      const financialReport = getFinancialReport();
      const totalEnrollments = enrollments.length;
      const totalRevenue = parseFloat(financialReport.totalRevenue.replace(/[^\d.-]/g, ''));
      const activeUsers = users.filter((u) => u.enrolledCourses.length > 0).length;
      const courseCompletionRate =
        courses.length > 0
          ? newCourseAnalytics.reduce((sum, ca) => sum + ca.completionRate, 0) / courses.length
          : 0;
      const topCourses = newCourseAnalytics
        .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
        .slice(0, 5);
      const topUsers = newUserAnalytics
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      setCourseAnalytics(newCourseAnalytics);
      setUserAnalytics(newUserAnalytics);
      setPlatformAnalytics({
        totalEnrollments,
        totalRevenue,
        activeUsers,
        courseCompletionRate,
        topCourses,
        topUsers,
      });

      localStorage.setItem('courseAnalytics', JSON.stringify(newCourseAnalytics));
      localStorage.setItem('userAnalytics', JSON.stringify(newUserAnalytics));
      localStorage.setItem('platformAnalytics', JSON.stringify({
        totalEnrollments,
        totalRevenue,
        activeUsers,
        courseCompletionRate,
        topCourses,
        topUsers,
      }));

      showNotification('داده‌های تحلیلی با موفقیت به‌روزرسانی شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در به‌روزرسانی داده‌های تحلیلی.', 'error');
    }
  };

  useEffect(() => {
    const storedCourseAnalytics = localStorage.getItem('courseAnalytics');
    const storedUserAnalytics = localStorage.getItem('userAnalytics');
    const storedPlatformAnalytics = localStorage.getItem('platformAnalytics');

    if (storedCourseAnalytics) {
      try {
        setCourseAnalytics(JSON.parse(storedCourseAnalytics));
      } catch (error) {
        console.error('Error parsing course analytics from localStorage:', error);
      }
    }
    if (storedUserAnalytics) {
      try {
        setUserAnalytics(JSON.parse(storedUserAnalytics));
      } catch (error) {
        console.error('Error parsing user analytics from localStorage:', error);
      }
    }
    if (storedPlatformAnalytics) {
      try {
        setPlatformAnalytics(JSON.parse(storedPlatformAnalytics));
      } catch (error) {
        console.error('Error parsing platform analytics from localStorage:', error);
      }
    }
  }, []);

  const getCourseReport = (courseId: number): CourseAnalytics | null => {
    return courseAnalytics.find((ca) => ca.courseId === courseId) || null;
  };

  const getUserReport = (userId: number): UserAnalytics | null => {
    return userAnalytics.find((ua) => ua.userId === userId) || null;
  };

  return (
    <AnalyticsContext.Provider
      value={{
        courseAnalytics,
        userAnalytics,
        platformAnalytics,
        getCourseReport,
        getUserReport,
        refreshAnalytics,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};