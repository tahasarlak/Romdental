import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Enrollment, User } from '../types/types';
import { useAuthContext } from './AuthContext';

interface EnrollmentContextType {
  enrollments: Enrollment[];
  enrollStudent: (studentId: number, courseId: number, group?: string) => Promise<void>;
  getEnrollmentsByStudent: (studentId: number) => Enrollment[];
  isCourseActiveForUser: (studentId: number, courseId: number) => boolean;
  updateEnrollmentStatus: (enrollmentId: number, status: 'active' | 'inactive') => Promise<void>;
  updateEnrollmentGroup: (enrollmentId: number, group: string) => Promise<void>;
  getEnrollmentCount: () => number; // تابع جدید برای گرفتن تعداد ثبت‌نام‌ها
}

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

export const EnrollmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, users, setUsers, setUser } = useAuthContext();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([
    {
      id: 1,
      studentId: 3, // نیما رحیمی (Student)
      courseId: 3,
      instructorId: 3,
      status: 'active',
      group: 'Group A',
      enrollmentDate: '2025-07-01',
    },
    // برای تست، می‌توانید ثبت‌نام‌های بیشتری اضافه کنید
  ]);

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
      const newEnrollment: Enrollment = {
        id: Math.max(...enrollments.map((e) => e.id), 0) + 1,
        studentId,
        courseId,
        instructorId: 2, // Assuming a default instructor for simplicity
        status: 'active',
        group,
        enrollmentDate: new Date().toISOString().split('T')[0],
      };
      setEnrollments((prev) => [...prev, newEnrollment]);
      // Update user's enrolledCourses in the users array
      const updatedUser = { ...targetUser, enrolledCourses: [...targetUser.enrolledCourses, courseId] };
      setUsers((prev) =>
        prev.map((u) => (u.id === studentId ? updatedUser : u))
      );
      // Update authenticated user if applicable
      if (user && user.id === studentId) {
        await setUser(updatedUser);
      }
    } catch (error: any) {
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
    } catch (error: any) {
      throw new Error(`خطا در به‌روزرسانی وضعیت ثبت‌نام: ${error.message}`);
    }
  };

  const updateEnrollmentGroup = async (enrollmentId: number, group: string) => {
    try {
      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollmentId ? { ...e, group } : e))
      );
    } catch (error: any) {
      throw new Error(`خطا در به‌روزرسانی گروه ثبت‌نام: ${error.message}`);
    }
  };

  const getEnrollmentCount = (): number => {
    return enrollments.length; // تعداد کل ثبت‌نام‌ها
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
        getEnrollmentCount, // اضافه کردن تابع به context
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

export default EnrollmentProvider;