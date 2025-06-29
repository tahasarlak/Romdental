import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useCourseContext } from './CourseContext';

interface ReviewItem {
  id: number;
  courseId: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewContextType {
  reviews: ReviewItem[];
  setReviews: React.Dispatch<React.SetStateAction<ReviewItem[]>>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider = ({ children }: { children: ReactNode }) => {
  const { courses } = useCourseContext();
  const courseIds = new Set(courses.map((course) => course.id));

  const initialReviews: ReviewItem[] = [
    {
      id: 1,
      courseId: 1,
      user: 'دکتر سارا احمدی',
      rating: 5,
      comment: 'دوره بسیار کاربردی و با تدریس عالی بود!',
      date: 'فروردین ۱۴۰۴',
    },
    {
      id: 2,
      courseId: 1,
      user: 'محمد حسینی',
      rating: 4,
      comment: 'محتوا خوب بود، ولی می‌توانست عملی‌تر باشد.',
      date: 'اسفند ۱۴۰۳',
    },
    {
      id: 3,
      courseId: 1,
      user: 'زهرا کریمی',
      rating: 5,
      comment: 'یکی از بهترین دوره‌هایی که شرکت کردم!',
      date: 'بهمن ۱۴۰۳',
    },
    {
      id: 4,
      courseId: 2,
      user: 'دکتر علی رضوی',
      rating: 4,
      comment: 'دوره خوبی بود، اما انتظار محتوای عملی بیشتری داشتم.',
      date: 'دی ۱۴۰۳',
    },
    {
      id: 5,
      courseId: 2,
      user: 'نازنین موسوی',
      rating: 5,
      comment: 'تدریس بسیار حرفه‌ای و محتوای به‌روز!',
      date: 'آذر ۱۴۰۳',
    },
    {
      id: 6,
      courseId: 3,
      user: 'مهدی شریفی',
      rating: 5,
      comment: 'برای شروع دندانپزشکی عالی بود!',
      date: 'بهمن ۱۴۰۳',
    },
    {
      id: 7,
      courseId: 3,
      user: 'فاطمه رحیمی',
      rating: 4,
      comment: 'دوره خوبی بود، اما نیاز به جلسات عملی بیشتری دارد.',
      date: 'دی ۱۴۰۳',
    },
    {
      id: 8,
      courseId: 3,
      user: 'حسین کاظمی',
      rating: 5,
      comment: 'مدرس بسیار با تجربه و محتوای کاربردی!',
      date: 'آذر ۱۴۰۳',
    },
    {
      id: 9,
      courseId: 4,
      user: 'علی اکبری',
      rating: 5,
      comment: 'دوره عالی برای شروع بود!',
      date: 'مهر ۱۴۰۳',
    },
    {
      id: 10,
      courseId: 4,
      user: 'مریم کاظمی',
      rating: 4,
      comment: 'مطالب ساده و قابل فهم بود.',
      date: 'آبان ۱۴۰۳',
    },
    {
      id: 11,
      courseId: 5,
      user: 'دکتر سعید مرادی',
      rating: 5,
      comment: 'دوره بسیار حرفه‌ای و کاربردی بود!',
      date: 'شهریور ۱۴۰۳',
    },
    {
      id: 12,
      courseId: 6,
      user: 'دکتر شیما رضایی',
      rating: 4,
      comment: 'محتوای خوبی داشت، اما جلسات عملی بیشتر می‌خواست.',
      date: 'آبان ۱۴۰۳',
    },
    {
      id: 13,
      courseId: 6,
      user: 'حسن محمدی',
      rating: 5,
      comment: 'تدریس بسیار باکیفیت بود!',
      date: 'مهر ۱۴۰۳',
    },
    {
      id: 14,
      courseId: 7,
      user: 'دکتر لیلا احمدی',
      rating: 5,
      comment: 'دوره بسیار کاربردی برای مدیریت کلینیک!',
      date: 'دی ۱۴۰۳',
    },
    {
      id: 15,
      courseId: 8,
      user: 'سارا موسوی',
      rating: 5,
      comment: 'دوره بسیار خوبی برای شروع ارتودنسی!',
      date: 'آذر ۱۴۰۳',
    },
    {
      id: 16,
      courseId: 8,
      user: 'امیر حسینی',
      rating: 4,
      comment: 'مطالب خوبی داشت، اما نیاز به تمرین بیشتر.',
      date: 'آبان ۱۴۰۳',
    },
    {
      id: 17,
      courseId: 9,
      user: 'دکتر محمد احمدی',
      rating: 5,
      comment: 'دوره بسیار حرفه‌ای و کامل!',
      date: 'مهر ۱۴۰۳',
    },
    {
      id: 18,
      courseId: 10,
      user: 'دکتر لیلا مرادی',
      rating: 5,
      comment: 'دوره بسیار نوآورانه و کاربردی!',
      date: 'آبان ۱۴۰۳',
    },
    {
      id: 19,
      courseId: 10,
      user: 'علیرضا حسینی',
      rating: 4,
      comment: 'محتوای خوبی داشت، اما نیاز به تمرین عملی بیشتر.',
      date: 'مهر ۱۴۰۳',
    },
  ].filter((review) => {
    const isValid = courseIds.has(review.courseId);
    if (!isValid) {
      console.warn(`نقد با شناسه ${review.id} برای دوره با شناسه ${review.courseId} نامعتبر است.`);
    }
    return isValid;
  });

  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);

  const validateAndSetReviews = (newReviews: ReviewItem[] | ((prev: ReviewItem[]) => ReviewItem[])) => {
    setReviews((prev) => {
      const updatedReviews = typeof newReviews === 'function' ? newReviews(prev) : newReviews;
      const validReviews = updatedReviews.filter((review) => {
        const isValid = courseIds.has(review.courseId) && review.rating >= 1 && review.rating <= 5;
        if (!isValid) {
          console.warn(`نقد با شناسه ${review.id} به دلیل دوره نامعتبر یا امتیاز نادرست حذف شد.`);
        }
        return isValid;
      });
      return validReviews;
    });
  };

  return (
    <ReviewContext.Provider value={{ reviews, setReviews: validateAndSetReviews }}>
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