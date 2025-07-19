import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useCourseContext } from './CourseContext';
import { useAuthContext } from './Auth/UserAuthContext';
import DOMPurify from 'dompurify';
import { ReviewItem, ReplyItem } from '../types/types';

interface ReviewContextType {
  reviews: ReviewItem[];
  addReview: (
    courseId: number,
    rating: number,
    comment: string,
    metadata?: { role: 'admin' | 'instructor' | 'student' | 'owner' | 'user'; userId?: number }
  ) => void;
  addReply: (reviewId: number, comment: string) => void;
  deleteReview: (reviewId: number) => void;
  deleteReply: (reviewId: number, replyId: number) => void; // New function
  setReviews: React.Dispatch<React.SetStateAction<ReviewItem[]>>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { courses } = useCourseContext();
  const { users, user, isAuthenticated } = useAuthContext();
  const courseIds = new Set(courses.map((course) => course.id));
  const userNames = new Set(users.map((u) => u.name));

  const initialReviews: ReviewItem[] = [
    {
      id: 1,
      courseId: 1,
      user: 'سارا احم',
      rating: 5,
      comment: 'دوره بسیار کاربردی و با تدریس عالی بود!',
      date: 'فروردین ۱۴۰۴',
      isEnrolled: true,
      role: 'instructor' as const,
      userId: 2,
      replies: [] as ReplyItem[],
    },
    {
      id: 2,
      courseId: 2,
      user: 'نیما رحیمی',
      rating: 5,
      comment: 'مطالب به‌روز و استاد عالی بود.',
      date: 'خرداد ۱۴۰۴',
      isEnrolled: true,
      role: 'student' as const,
      userId: 3,
      replies: [] as ReplyItem[],
    },
    {
      id: 3,
      courseId: 3,
      user: 'علی محمدی',
      rating: 4.0,
      comment: 'دوره خوبی بود، اما نیاز به جلسات عملی بیشتر دارد.',
      date: 'تیر ۱۴۰۴',
      isEnrolled: false,
      role: 'admin' as const,
      userId: 1,
      replies: [] as ReplyItem[],
    },
  ].filter((review) => courseIds.has(review.courseId) && userNames.has(review.user));

  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);

  // Map user roles to review/reply roles, ensuring compatibility with ReplyItem
  const mapUserRoleToReviewRole = (
    userRole: 'Student' | 'Instructor' | 'Blogger' | 'Admin' | 'SuperAdmin',
    isReply: boolean = false
  ): 'admin' | 'instructor' | 'student' | 'owner' | 'user' => {
    switch (userRole) {
      case 'SuperAdmin':
      case 'Admin':
        return 'admin';
      case 'Instructor':
        return 'instructor';
      case 'Student':
        return 'student';
      case 'Blogger':
        return isReply ? 'student' : 'user';
      default:
        return isReply ? 'student' : 'user';
    }
  };

  const addReview = (
    courseId: number,
    rating: number,
    comment: string,
    metadata?: { role: 'admin' | 'instructor' | 'student' | 'owner' | 'user'; userId?: number }
  ) => {
    if (!isAuthenticated || !user) throw new Error('برای ثبت نظر باید وارد حساب کاربری شوید.');
    if (!courseIds.has(courseId)) throw new Error('دوره موردنظر یافت نشد.');
    if (rating < 1 || rating > 5) throw new Error('امتیاز باید بین ۱ تا ۵ باشد.');
    if (!comment.trim()) throw new Error('لطفاً نظر خود را وارد کنید.');
    if (reviews.some((review) => review.courseId === courseId && review.user === user.name)) {
      throw new Error('شما قبلاً برای این دوره نظر ثبت کرده‌اید.');
    }

    const role = metadata?.role || mapUserRoleToReviewRole(user.role);
    const userId = metadata?.userId || user.id;

    const newReview: ReviewItem = {
      id: Date.now(),
      courseId,
      user: user.name,
      rating,
      comment: DOMPurify.sanitize(comment),
      date: new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' }),
      isEnrolled: user.enrolledCourses.includes(courseId),
      role,
      userId,
      replies: [] as ReplyItem[],
    };

    setReviews((prev) => [...prev, newReview]);
  };

  const addReply = (reviewId: number, comment: string) => {
    if (!isAuthenticated || !user) throw new Error('برای ثبت پاسخ باید وارد حساب کاربری شوید.');
    if (!comment.trim()) throw new Error('لطفاً پاسخ خود را وارد کنید.');
    if (!reviews.some((review) => review.id === reviewId)) throw new Error('نظر موردنظر یافت نشد.');

    const role = mapUserRoleToReviewRole(user.role, true) as 'admin' | 'instructor' | 'student' | 'owner';

    const newReply: ReplyItem = {
      id: Date.now(),
      reviewId,
      user: user.name,
      comment: DOMPurify.sanitize(comment),
      date: new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' }),
      role,
      userId: user.id,
    };

    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId ? { ...review, replies: [...review.replies, newReply] } : review
      )
    );
  };

  const deleteReview = (reviewId: number) => {
    if (!isAuthenticated || !user) throw new Error('برای حذف نظر باید وارد حساب کاربری شوید.');
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) throw new Error('نظر موردنظر یافت نشد.');
    if (user.name !== review.user && !['Admin', 'SuperAdmin'].includes(user.role)) {
      throw new Error('فقط نویسنده نظر یا ادمین می‌تواند نظر را حذف کند.');
    }

    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const deleteReply = (reviewId: number, replyId: number) => {
    if (!isAuthenticated || !user) throw new Error('برای حذف پاسخ باید وارد حساب کاربری شوید.');
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) throw new Error('نظر موردنظر یافت نشد.');
    const reply = review.replies.find((r) => r.id === replyId);
    if (!reply) throw new Error('پاسخ موردنظر یافت نشد.');
    if (user.name !== reply.user && !['Admin', 'SuperAdmin'].includes(user.role)) {
      throw new Error('فقط نویسنده پاسخ یا ادمین می‌تواند پاسخ را حذف کند.');
    }

    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? { ...review, replies: review.replies.filter((r) => r.id !== replyId) }
          : review
      )
    );
  };

  return (
    <ReviewContext.Provider value={{ reviews, addReview, addReply, deleteReview, deleteReply, setReviews }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviewContext = () => {
  const context = useContext(ReviewContext);
  if (!context) throw new Error('useReviewContext must be used within a ReviewProvider');
  return context;
};