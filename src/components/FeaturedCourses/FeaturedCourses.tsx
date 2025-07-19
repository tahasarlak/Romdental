import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './FeaturedCourses.module.css';
import { useCourseContext } from '../../Context/CourseContext';
import { useInstructorContext } from '../../Context/InstructorContext';
import { useReviewContext } from '../../Context/ReviewContext';
import { useWishlistContext } from '../../Context/WishlistContext';
import { useCartContext } from '../../Context/CartContext';
import { useAuthContext } from '../../Context/Auth/UserAuthContext';
import { useNotificationContext } from '../../Context/NotificationContext';
import CourseCard from '../CourseCard/CourseCard';
import { Course, ReviewItem } from '../../types/types';
import DOMPurify from 'dompurify';

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getRandomCourses = (courses: Course[], count: number): Course[] => {
  const openCourses = courses.filter((course) => course.isOpen && course.isFeatured);
  if (openCourses.length === 0) return [];
  const shuffled = shuffleArray(openCourses);
  return shuffled.slice(0, Math.min(count, openCourses.length));
};

const FeaturedCourses: React.FC = () => {
  const { courses, loading } = useCourseContext();
  const { instructors } = useInstructorContext();
  const { reviews } = useReviewContext();
  const { isInWishlist, toggleWishlist, isWishlistLoading } = useWishlistContext();
  const { cartItems, addToCart, removeFromCart } = useCartContext();
  const { user, isAuthenticated } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector(`.${styles.featured}`);
      if (section) {
        const { top } = section.getBoundingClientRect();
        setIsVisible(top < window.innerHeight - 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const instructorNames = useMemo(() => new Set(instructors.map((instructor) => instructor.name)), [instructors]);

  const featuredCourses = useMemo(() => {
    if (loading) return [];
    return getRandomCourses(courses, 3);
  }, [courses, loading]);

  const isCartItem = (courseId: number) => cartItems.some((item) => item.courseId === courseId);

  const isEnrolled = (courseId: number) => user?.enrolledCourses?.includes(courseId) || false;

  const getAverageRating = (courseId: number) => {
    const courseReviews = reviews.filter((review: ReviewItem) => review.courseId === courseId);
    return courseReviews.length > 0
      ? (courseReviews.reduce((sum: number, r: ReviewItem) => sum + r.rating, 0) / courseReviews.length).toFixed(1)
      : '0.0';
  };

  const handleAddToCart = async (course: Course) => {
    if (!isAuthenticated) {
      showNotification('برای افزودن به سبد خرید، لطفاً وارد شوید.', 'warning');
      navigate('/login');
      return;
    }
    try {
      if (isCartItem(course.id)) {
        const cartItem = cartItems.find((item) => item.courseId === course.id);
        if (!cartItem) return;
        const confirmRemove = window.confirm(
          `آیا مطمئن هستید که می‌خواهید دوره "${DOMPurify.sanitize(course.title)}" را از سبد خرید حذف کنید؟`
        );
        if (!confirmRemove) return;
        await removeFromCart(cartItem.id);
        showNotification(`دوره "${DOMPurify.sanitize(course.title)}" از سبد خرید حذف شد.`, 'success');
      } else {
        await addToCart(course.id);
        showNotification(`دوره "${DOMPurify.sanitize(course.title)}" به سبد خرید اضافه شد.`, 'success');
      }
    } catch (error) {
      console.error('Error handling cart action:', error);
      showNotification('خطایی در به‌روزرسانی سبد خرید رخ داد.', 'error');
    }
  };

  const handleWishlistToggle = async (courseId: number, title: string) => {
    if (!isAuthenticated) {
      showNotification('برای افزودن به علاقه‌مندی‌ها، لطفاً وارد شوید.', 'warning');
      navigate('/login');
      return;
    }
    try {
      await toggleWishlist(courseId, 'course', DOMPurify.sanitize(title));
    } catch (error: any) {
      showNotification(error.message || 'خطایی در به‌روزرسانی علاقه‌مندی‌ها رخ داد.', 'error');
    }
  };

  return (
    <section className={`${styles.featured} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.container}>
        <h2 className={`${styles.title} ${isVisible ? styles.titleVisible : ''}`}>
          دوره‌های برجسته روم دنتال
        </h2>
        {loading ? (
          <p className={styles.noCourses}>در حال بارگذاری...</p>
        ) : featuredCourses.length > 0 ? (
          <div className={styles.courses}>
            {featuredCourses.map((course) => {
              const courseReviews = reviews.filter((review: ReviewItem) => review.courseId === course.id);
              const averageRating = getAverageRating(course.id);
              const courseReviewsLength = courseReviews.length;

              return (
                <CourseCard
                  key={course.id}
                  course={{ ...course, image: `${course.image}?format=webp` }}
                  isEnrolled={isEnrolled(course.id)}
                  handleWishlistToggle={handleWishlistToggle}
                  isInWishlist={isInWishlist}
                  instructorNames={instructorNames}
                  averageRating={averageRating}
                  courseReviewsLength={courseReviewsLength}
                  handleAddToCart={() => handleAddToCart(course)}
                  isInCart={isCartItem(course.id)}
                  isWishlistLoading={isWishlistLoading}
                />
              );
            })}
          </div>
        ) : (
          <p className={styles.noCourses}>هیچ دوره برجسته‌ای در دسترس نیست.</p>
        )}
        <Link to="/courses" className={styles.viewAllLink} aria-label="مشاهده همه دوره‌ها">
          مشاهده همه دوره‌ها
        </Link>
      </div>
    </section>
  );
};

export default FeaturedCourses;