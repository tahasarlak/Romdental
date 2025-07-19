import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useAuthContext } from './Auth/UserAuthContext';
import { useNotificationContext } from './NotificationContext';
import { useReviewContext } from './ReviewContext';
import { useCourseContext } from './CourseContext';
import { Instructor, ReviewItem } from '../types/types';

interface InstructorContextType {
  instructors: Instructor[];
  loading: boolean;
  setInstructors: React.Dispatch<React.SetStateAction<Instructor[]>>;
  fetchInstructors: () => Promise<void>;
  addInstructor: (instructor: Omit<Instructor, 'id'>) => Promise<void>;
  updateInstructor: (instructorId: number, instructor: Omit<Instructor, 'id'>) => Promise<void>;
  deleteInstructor: (instructorId: number) => Promise<void>;
}

const InstructorContext = createContext<InstructorContextType | undefined>(undefined);

const initialInstructors: Instructor[] = [
  {
    id: 3,
    name: DOMPurify.sanitize('مریم حسینی'),
    specialty: DOMPurify.sanitize('ترمیمی'),
    bio: DOMPurify.sanitize('استاد ترمیمی دندانپزشکی با تمرکز بر روش‌های مدرن ترمیمی.'),
    image: '/assets/instructors/maryam-hosseini.jpg',
    experience: DOMPurify.sanitize('8 سال'),
    coursesTaught: ['دوره ترمیمی دندانپزشکی'],
    averageRating: '4.2',
    totalStudents: 0,
    reviewCount: 20,
    whatsappLink: 'https://wa.me/+989123456788',
    instagramLink: 'https://instagram.com/maryam_hosseini_dentist',
    bankAccounts: [
      {
        bankName: DOMPurify.sanitize('بانک ملت'),
        accountHolder: DOMPurify.sanitize('مریم حسینی'),
        accountNumber: DOMPurify.sanitize('1234-5678-9012-3456'),
      },
    ],
    email: DOMPurify.sanitize('maryam.hosseini@example.com'),
    phone: DOMPurify.sanitize('09123456788'),
    university: DOMPurify.sanitize('دانشگاه تهران'),
    gender: 'زن',
    password: DOMPurify.sanitize('hashedPassword123'),
  },
];

export const InstructorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const [instructors, setInstructors] = useState<Instructor[]>(() => {
    const savedInstructors = localStorage.getItem('instructors');
    return savedInstructors ? JSON.parse(savedInstructors) : initialInstructors;
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('instructors', JSON.stringify(instructors));
    } catch (error) {
      showNotification('خطا در ذخیره‌سازی اساتید!', 'error');
    }
  }, [instructors, showNotification]);

  const fetchInstructors = useCallback(async () => {
    try {
      setLoading(true);
      if (!instructors.length) {
        showNotification('هیچ استادی یافت نشد.', 'info');
      } else {
        showNotification('اساتید با موفقیت بارگذاری شدند.', 'success');
      }
    } catch (error: any) {
      showNotification(error.message || 'خطا در بارگذاری اساتید', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const addInstructor = useCallback(
    async (instructor: Omit<Instructor, 'id'>) => {
      try {
        if (!user || !['SuperAdmin', 'Admin'].includes(user.role)) {
          throw new Error('فقط سوپرادمین و ادمین می‌توانند استاد اضافه کنند');
        }
        const sanitizedInstructor: Omit<Instructor, 'id'> = {
          ...instructor,
          name: DOMPurify.sanitize(instructor.name),
          specialty: DOMPurify.sanitize(instructor.specialty),
          bio: DOMPurify.sanitize(instructor.bio),
          experience: DOMPurify.sanitize(instructor.experience),
          coursesTaught: instructor.coursesTaught.map((course) => DOMPurify.sanitize(course)),
          averageRating: DOMPurify.sanitize(instructor.averageRating || '0.0'),
          reviewCount: instructor.reviewCount ?? 0,
          totalStudents: instructor.totalStudents ?? 0,
          whatsappLink: instructor.whatsappLink ? DOMPurify.sanitize(instructor.whatsappLink) : undefined,
          telegramLink: instructor.telegramLink ? DOMPurify.sanitize(instructor.telegramLink) : undefined,
          instagramLink: instructor.instagramLink ? DOMPurify.sanitize(instructor.instagramLink) : undefined,
          bankAccounts: instructor.bankAccounts.map((account) => ({
            bankName: DOMPurify.sanitize(account.bankName),
            accountHolder: DOMPurify.sanitize(account.accountHolder),
            accountNumber: DOMPurify.sanitize(account.accountNumber),
          })),
          email: DOMPurify.sanitize(instructor.email),
          phone: DOMPurify.sanitize(instructor.phone),
          university: DOMPurify.sanitize(instructor.university),
          gender: instructor.gender,
          password: DOMPurify.sanitize(instructor.password),
        };
        if (instructors.some((inst) => inst.email === sanitizedInstructor.email)) {
          throw new Error(`استاد با ایمیل ${sanitizedInstructor.email} قبلاً وجود دارد`);
        }
        const newInstructor: Instructor = {
          ...sanitizedInstructor,
          id: Math.max(...instructors.map((inst) => inst.id), 0) + 1,
        };
        setInstructors((prev) => [...prev, newInstructor]);
        showNotification(`استاد "${newInstructor.name}" با موفقیت اضافه شد`, 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در افزودن استاد', 'error');
        throw error;
      }
    },
    [user, instructors, showNotification]
  );

  const updateInstructor = useCallback(
    async (instructorId: number, instructor: Omit<Instructor, 'id'>) => {
      try {
        if (!user || !['SuperAdmin', 'Admin'].includes(user.role)) {
          throw new Error('فقط سوپرادمین و ادمین می‌توانند استاد را ویرایش کنند');
        }
        const sanitizedInstructor: Omit<Instructor, 'id'> = {
          ...instructor,
          name: DOMPurify.sanitize(instructor.name),
          specialty: DOMPurify.sanitize(instructor.specialty),
          bio: DOMPurify.sanitize(instructor.bio),
          experience: DOMPurify.sanitize(instructor.experience),
          coursesTaught: instructor.coursesTaught.map((course) => DOMPurify.sanitize(course)),
          averageRating: DOMPurify.sanitize(instructor.averageRating || '0.0'),
          reviewCount: instructor.reviewCount ?? 0,
          totalStudents: instructor.totalStudents ?? 0,
          whatsappLink: instructor.whatsappLink ? DOMPurify.sanitize(instructor.whatsappLink) : undefined,
          telegramLink: instructor.telegramLink ? DOMPurify.sanitize(instructor.telegramLink) : undefined,
          instagramLink: instructor.instagramLink ? DOMPurify.sanitize(instructor.instagramLink) : undefined,
          bankAccounts: instructor.bankAccounts.map((account) => ({
            bankName: DOMPurify.sanitize(account.bankName),
            accountHolder: DOMPurify.sanitize(account.accountHolder),
            accountNumber: DOMPurify.sanitize(account.accountNumber),
          })),
          email: DOMPurify.sanitize(instructor.email),
          phone: DOMPurify.sanitize(instructor.phone),
          university: DOMPurify.sanitize(instructor.university),
          gender: instructor.gender,
          password: DOMPurify.sanitize(instructor.password),
        };
        const existingInstructor = instructors.find((inst) => inst.id === instructorId);
        if (!existingInstructor) {
          throw new Error('استاد مورد نظر یافت نشد');
        }
        setInstructors((prev) =>
          prev.map((inst) =>
            inst.id === instructorId ? { ...sanitizedInstructor, id: instructorId } : inst
          )
        );
        showNotification(`استاد "${sanitizedInstructor.name}" با موفقیت به‌روزرسانی شد`, 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در به‌روزرسانی استاد', 'error');
        throw error;
      }
    },
    [user, instructors, showNotification]
  );

  const deleteInstructor = useCallback(
    async (instructorId: number) => {
      try {
        if (!user || !['SuperAdmin', 'Admin'].includes(user.role)) {
          throw new Error('فقط سوپرادمین و ادمین می‌توانند استاد را حذف کنند');
        }
        const instructor = instructors.find((inst) => inst.id === instructorId);
        if (!instructor) {
          throw new Error('استاد مورد نظر یافت نشد');
        }
        const confirmDelete = window.confirm(
          `آیا مطمئن هستید که می‌خواهید استاد "${DOMPurify.sanitize(instructor.name)}" را حذف کنید؟`
        );
        if (!confirmDelete) return;
        setInstructors((prev) => prev.filter((inst) => inst.id !== instructorId));
        showNotification(`استاد "${DOMPurify.sanitize(instructor.name)}" با موفقیت حذف شد`, 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در حذف استاد', 'error');
        throw error;
      }
    },
    [user, instructors, showNotification]
  );

  const contextValue = useMemo(
    () => ({
      instructors,
      loading,
      setInstructors,
      fetchInstructors,
      addInstructor,
      updateInstructor,
      deleteInstructor,
    }),
    [instructors, loading, fetchInstructors, addInstructor, updateInstructor, deleteInstructor]
  );

  return <InstructorContext.Provider value={contextValue}>{children}</InstructorContext.Provider>;
};

export const useInstructorContext = () => {
  const context = useContext(InstructorContext);
  if (!context) throw new Error('useInstructorContext must be used within an InstructorProvider');
  return context;
};

export const useInstructorMetrics = (instructor: Instructor | null): Instructor => {
  const { reviews } = useReviewContext();
  const { courses } = useCourseContext();

  if (!instructor) {
    return {
      id: 0,
      name: '',
      specialty: '',
      bio: '',
      image: '',
      experience: '',
      coursesTaught: [],
      averageRating: '0.0',
      totalStudents: 0,
      reviewCount: 0,
      whatsappLink: undefined,
      telegramLink: undefined,
      instagramLink: undefined,
      bankAccounts: [],
      email: '',
      phone: '',
      university: '',
      gender: 'مرد',
      password: '',
    };
  }

  const instructorCourses = courses.filter((course) => course.instructor === instructor.name);
  const courseIds = instructorCourses.map((course) => course.id);
  const courseReviews = reviews.filter((review: ReviewItem) => courseIds.includes(review.courseId));
  const reviewCount = courseReviews.length;
  const averageRating =
    reviewCount > 0
      ? (courseReviews.reduce((sum: number, review: ReviewItem) => sum + review.rating, 0) / reviewCount).toFixed(1)
      : '0.0';
  const totalStudents = instructorCourses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);
  const coursesTaught: string[] = instructorCourses.map((course) => course.title);

  return {
    ...instructor,
    reviewCount,
    averageRating,
    totalStudents,
    coursesTaught,
  };
};