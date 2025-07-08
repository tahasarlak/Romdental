import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useCourseContext } from './CourseContext';
import { useAuthContext } from './AuthContext';

interface ReplyItem {
  id: number;
  reviewId: number;
  user: string;
  comment: string;
  date: string;
  role: 'admin' | 'instructor' | 'student';
}

interface ReviewItem {
  id: number;
  courseId: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
  isEnrolled: boolean;
  replies?: ReplyItem[];
}

interface ReviewContextType {
  reviews: ReviewItem[];
  addReview: (courseId: number, rating: number, comment: string) => void;
  addReply: (reviewId: number, comment: string) => void;
  setReviews: React.Dispatch<React.SetStateAction<ReviewItem[]>>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider = ({ children }: { children: ReactNode }) => {
  const { courses } = useCourseContext();
  const { users, user, isAuthenticated } = useAuthContext();
  const courseIds = new Set(courses.map((course) => course.id));
  const userNames = new Set(users.map((u) => u.name));

  const initialReviews: ReviewItem[] = [
    {
      id: 1,
      courseId: 1,
      user: 'دکتر سارا احمدی',
      rating: 5,
      comment: 'دوره بسیار کاربردی و با تدریس عالی بود!',
      date: 'فروردین ۱۴۰۴',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 2,
      courseId: 1,
      user: 'محمد حسینی',
      rating: 4,
      comment: 'محتوا خوب بود، ولی می‌توانست عملی‌تر باشد.',
      date: 'اسفند ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 3,
      courseId: 1,
      user: 'زهرا کریمی',
      rating: 5,
      comment: 'یکی از بهترین دوره‌هایی که شرکت کردم!',
      date: 'بهمن ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 4,
      courseId: 2,
      user: 'دکتر علی رضوی',
      rating: 4,
      comment: 'دوره خوبی بود، اما انتظار محتوای عملی بیشتری داشتم.',
      date: 'دی ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 5,
      courseId: 2,
      user: 'نازنین موسوی',
      rating: 5,
      comment: 'تدریس بسیار حرفه‌ای و محتوای به‌روز!',
      date: 'آذر ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 6,
      courseId: 3,
      user: 'مهدی شریفی',
      rating: 5,
      comment: 'برای شروع دندانپزشکی عالی بود!',
      date: 'بهمن ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 7,
      courseId: 3,
      user: 'فاطمه رحیمی',
      rating: 4,
      comment: 'دوره خوبی بود، اما نیاز به جلسات عملی بیشتری دارد.',
      date: 'دی ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 8,
      courseId: 3,
      user: 'حسین کاظمی',
      rating: 5,
      comment: 'مدرس بسیار با تجربه و محتوای کاربردی!',
      date: 'آذر ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 9,
      courseId: 4,
      user: 'علی اکبری',
      rating: 5,
      comment: 'دوره عالی برای شروع بود!',
      date: 'مهر ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 10,
      courseId: 4,
      user: 'مریم کاظمی',
      rating: 4,
      comment: 'مطالب ساده و قابل فهم بود.',
      date: 'آبان ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 11,
      courseId: 5,
      user: 'دکتر سعید مرادی',
      rating: 5,
      comment: 'دوره بسیار حرفه‌ای و کاربردی بود!',
      date: 'شهریور ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 12,
      courseId: 6,
      user: 'دکتر شیما رضایی',
      rating: 4,
      comment: 'محتوای خوبی داشت، اما جلسات عملی بیشتری می‌خواست.',
      date: 'آبان ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 13,
    courseId: 6,
      user: 'حسن محمدی',
      rating: 5,
      comment: 'تدریس بسیار باکیفیت بود!',
      date: 'مهر ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 14,
      courseId: 7,
      user: 'دکتر لیلا احمدی',
      rating: 5,
      comment: 'دوره بسیار کاربردی برای مدیریت کلینیک!',
      date: 'دی ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 15,
      courseId: 8,
      user: 'سارا موسوی',
      rating: 5,
      comment: 'دوره بسیار خوبی برای شروع ارتودنسی!',
      date: 'آذر ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 16,
      courseId: 8,
      user: 'امیر حسینی',
      rating: 4,
      comment: 'مطالب خوبی داشت، اما نیاز به تمرین بیشتر.',
      date: 'آبان ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 17,
      courseId: 9,
      user: 'دکتر محمد احمدی',
      rating: 5,
      comment: 'دوره بسیار حرفه‌ای و کامل!',
      date: 'مهر ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 18,
      courseId: 10,
      user: 'دکتر لیلا مرادی',
      rating: 5,
      comment: 'دوره بسیار نوآورانه و کاربردی!',
      date: 'آبان ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
    {
      id: 19,
      courseId: 10,
      user: 'علیرضا حسینی',
      rating: 4,
      comment: 'محتوای خوبی داشت، اما نیاز به تمرین عملی بیشتر.',
      date: 'مهر ۱۴۰۳',
      isEnrolled: true,
      replies: [],
    },
  ].filter((review) => {
    const isValidCourse = courseIds.has(review.courseId);
    const isValidUser = userNames.has(review.user);
    return isValidCourse && isValidUser;
  });

  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);

  const addReview = (courseId: number, rating: number, comment: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('برای ثبت نظر باید ابتدا وارد حساب کاربری خود شوید.');
    }
    if (!courseIds.has(courseId)) {
      throw new Error('دوره موردنظر یافت نشد.');
    }
    if (rating < 1 || rating > 5) {
      throw new Error('امتیاز باید بین ۱ تا ۵ باشد.');
    }
    if (!comment.trim()) {
      throw new Error('لطفا نظر خود را وارد کنید.');
    }
    if (reviews.some((review) => review.courseId === courseId && review.user === user.name)) {
      throw new Error('شما قبلاً برای این دوره نظر ثبت کرده‌اید.');
    }

    const newReview: ReviewItem = {
      id: Date.now(),
      courseId,
      user: user.name,
      rating,
      comment,
      date: new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
      }),
      isEnrolled: user.enrolledCourses.includes(courseId),
      replies: [],
    };

    setReviews((prev) => [...prev, newReview]);
  };

  const addReply = (reviewId: number, comment: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('برای ثبت پاسخ باید ابتدا وارد حساب کاربری خود شوید.');
    }
    if (!comment.trim()) {
      throw new Error('لطفا پاسخ خود را وارد کنید.');
    }
    if (!reviews.some((review) => review.id === reviewId)) {
      throw new Error('نظر موردنظر یافت نشد.');
    }

    const role = user.email === 'superadmin@example.com' ? 'admin' :
                 users.find((u) => u.name === user.name && u.email.includes('dr')) ? 'instructor' : 'student';

    const newReply: ReplyItem = {
      id: Date.now(),
      reviewId,
      user: user.name,
      comment,
      date: new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
      }),
      role,
    };

    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? { ...review, replies: [...(review.replies || []), newReply] }
          : review
      )
    );
  };

  return (
    <ReviewContext.Provider value={{ reviews, addReview, addReply, setReviews }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviewContext = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviewContext must be used within a ReviewProvider');
  }
  return context;
};