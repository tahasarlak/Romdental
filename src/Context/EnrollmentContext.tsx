import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import DOMPurify from 'dompurify';
import { Enrollment, User } from '../types/types';
import { useAuthContext } from './Auth/UserAuthContext';
import { useNotificationContext } from './NotificationContext';
import { useCourseContext } from './CourseContext';

interface EnrollmentContextType {
  enrollments: Enrollment[];
  enrollStudent: (studentId: number, courseId: number, group?: string) => Promise<void>;
  getEnrollmentsByStudent: (studentId: number) => Enrollment[];
  isCourseActiveForUser: (studentId: number, courseId: number) => boolean;
  updateEnrollmentStatus: (enrollmentId: number, status: 'active' | 'inactive') => Promise<void>;
  updateEnrollmentGroup: (enrollmentId: number, group: string) => Promise<void>;
  getEnrollmentCount: () => number;
}

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

export const EnrollmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, users, setUsers, setUser } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const { courses } = useCourseContext();
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    const savedEnrollments = localStorage.getItem('enrollments');
    return savedEnrollments
      ? JSON.parse(savedEnrollments)
      : [
          {
            id: 1,
            studentId: 3,
            courseId: 3,
            instructorId: 3,
            status: 'active',
            group: 'Group A',
            enrollmentDate: '2025-07-01',
          },
        ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('enrollments', JSON.stringify(enrollments));
    } catch (error) {
      showNotification('خطا در ذخیره‌سازی ثبت‌نام‌ها!', 'error');
    }
  }, [enrollments, showNotification]);

  const enrollStudent = async (studentId: number, courseId: number, group: string = 'Default') => {
    try {
      const targetUser = users.find((u) => u.id === studentId);
      if (!targetUser) {
        throw new Error('کاربر یافت نشد.');
      }
      if (targetUser.role !== 'Student') {
        throw new Error('فقط دانشجویان می‌توانند در دوره‌ها ثبت‌نام کنند');
      }
      if (enrollments.some((e) => e.studentId === studentId && e.courseId === courseId)) {
        throw new Error('دانشجو قبلاً در این دوره ثبت‌نام کرده است.');
      }
      const course = courses.find((c) => c.id === courseId);
      if (!course) {
        throw new Error('دوره یافت نشد.');
      }
      const instructor = course.instructor;
      const instructorId = users.find((u) => u.name === instructor && u.role === 'Instructor')?.id || 0;

      const newEnrollment: Enrollment = {
        id: Math.max(...enrollments.map((e) => e.id), 0) + 1,
        studentId,
        courseId,
        instructorId,
        status: 'active',
        group: DOMPurify.sanitize(group),
        enrollmentDate: new Date().toISOString().split('T')[0],
      };
      setEnrollments((prev) => [...prev, newEnrollment]);
      const updatedUser = { ...targetUser, enrolledCourses: [...targetUser.enrolledCourses, courseId] };
      setUsers((prev) => prev.map((u) => (u.id === studentId ? updatedUser : u)));
      if (user && user.id === studentId) {
        await setUser(updatedUser);
      }
      showNotification('ثبت‌نام با موفقیت انجام شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در ثبت‌نام!', 'error');
      throw error;
    }
  };

  const getEnrollmentsByStudent = (studentId: number): Enrollment[] => {
    return enrollments.filter((e) => e.studentId === studentId);
  };

  const isCourseActiveForUser = (studentId: number, courseId: number): boolean => {
    const enrollment = enrollments.find((e) => e.studentId === studentId && e.courseId === courseId);
    return enrollment ? enrollment.status === 'active' : false;
  };

  const updateEnrollmentStatus = async (enrollmentId: number, status: 'active' | 'inactive') => {
    try {
      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollmentId ? { ...e, status } : e))
      );
      showNotification('وضعیت ثبت‌نام با موفقیت به‌روزرسانی شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در به‌روزرسانی وضعیت ثبت‌نام!', 'error');
      throw error;
    }
  };

  const updateEnrollmentGroup = async (enrollmentId: number, group: string) => {
    try {
      const sanitizedGroup = DOMPurify.sanitize(group);
      if (!sanitizedGroup.trim()) {
        throw new Error('نام گروه نمی‌تواند خالی باشد.');
      }
      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollmentId ? { ...e, group: sanitizedGroup } : e))
      );
      showNotification('گروه ثبت‌نام با موفقیت به‌روزرسانی شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در به‌روزرسانی گروه ثبت‌نام!', 'error');
      throw error;
    }
  };

  const getEnrollmentCount = (): number => {
    return enrollments.length;
  };

  return (
    <EnrollmentContext.Provider
      value={{
        enrollments,
        enrollStudent,
        getEnrollmentsByStudent,
        isCourseActiveForUser,
        updateEnrollmentStatus,
        updateEnrollmentGroup,
        getEnrollmentCount,
      }}
    >
      {children}
    </EnrollmentContext.Provider>
  );
};

export const useEnrollmentContext = () => {
  const context = useContext(EnrollmentContext);
  if (!context) throw new Error('useEnrollmentContext must be used within an EnrollmentProvider');
  return context;
};