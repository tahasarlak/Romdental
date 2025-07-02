import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './FeaturedCourses.module.css';
import { useCourseContext } from '../../Context/CourseContext';
import { useInstructorContext } from '../../Context/InstructorContext';
import CourseCard from '../CourseCard/CourseCard'; 

interface Course {
  id: number;
  title: string;
  instructor: string;
  description: string;
  duration: string;
  courseNumber: string;
  category: string;
  image: string;
  price: string;
  discountPrice?: string;
  discountPercentage?: number;
  startDate: string;
  isOpen: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  syllabus: { completed?: boolean }[];
  tags?: string[];
  prerequisites?: string[];
  courseType: 'Online' | 'Offline' | 'In-Person' | 'Hybrid';
  university: string;
}

const getRandomCourses = (courses: Course[], count: number): Course[] => {
  const featuredCourses = courses.filter((course) => course.isFeatured && course.isOpen);
  const otherCourses = courses.filter((course) => !course.isFeatured && course.isOpen);

  const shuffledFeatured = [...featuredCourses].sort(() => Math.random() - 0.5);
  const shuffledOthers = [...otherCourses].sort(() => Math.random() - 0.5);

  const selectedCourses = [
    ...shuffledFeatured.slice(0, Math.min(count, featuredCourses.length)),
    ...shuffledOthers.slice(0, count - Math.min(count, featuredCourses.length)),
  ].slice(0, count);

  return selectedCourses;
};

const FeaturedCourses: React.FC = () => {
  const { courses } = useCourseContext();
  const { instructors } = useInstructorContext();
  const [isVisible, setIsVisible] = useState(false);
  const [cartItems, setCartItems] = useState<number[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector(`.${styles.featured}`);
      if (section) {
        const { top } = section.getBoundingClientRect();
        if (top < window.innerHeight - 100) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const instructorNames = useMemo(() => {
    return new Set(instructors.map((instructor) => instructor.name));
  }, [instructors]);

  const featuredCourses = useMemo(() => {
    return getRandomCourses(courses, 3);
  }, [courses]);

  const handleAddToCart = (course: Course) => {
    setCartItems((prev) =>
      prev.includes(course.id)
        ? prev.filter((id) => id !== course.id)
        : [...prev, course.id]
    );
  };

  const handleWishlistToggle = (courseId: number) => {
    setWishlist((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const isCartItem = (courseId: number) => cartItems.includes(courseId);

  const isInWishlist = (id: number, type: 'course' | 'instructor') => {
    if (type === 'course') {
      return wishlist.includes(id);
    }
    return false;
  };

  return (
    <section className={`${styles.featured} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.container}>
        <h2 className={`${styles.title} ${isVisible ? styles.titleVisible : ''}`}>
          دوره‌های برجسته روم دنتال
        </h2>
        <div className={styles.courses}>
          {featuredCourses.length > 0 ? (
            featuredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={false} // فرض می‌کنیم کاربر در این دوره‌ها ثبت‌نام نکرده است
                isCartItem={isCartItem}
                handleAddToCart={handleAddToCart}
                handleWishlistToggle={handleWishlistToggle}
                isInWishlist={isInWishlist}
                instructorNames={instructorNames}
                averageRating="4.5" // مقدار پیش‌فرض برای نمونه
                courseReviewsLength={10} // مقدار پیش‌فرض برای نمونه
              />
            ))
          ) : (
            <p className={styles.noCourses}>دوره‌ای برای نمایش وجود ندارد.</p>
          )}
        </div>
        <div className={styles.viewAllContainer}>
          <Link to="/courses" className={styles.viewAllButton}>
            مشاهده همه دوره‌ها
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;