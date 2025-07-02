import React from 'react';
import { Link } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import styles from '../../pages/Courses/Courses.module.css';

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

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  isCartItem: (courseId: number) => boolean;
  handleAddToCart: (course: Course) => void;
  handleWishlistToggle: (courseId: number) => void;
  isInWishlist: (id: number, type: 'course' | 'instructor') => boolean;
  instructorNames: Set<string>;
  averageRating: string;
  courseReviewsLength: number;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isEnrolled,
  isCartItem,
  handleAddToCart,
  handleWishlistToggle,
  isInWishlist,
  instructorNames,
  averageRating,
  courseReviewsLength,
}) => {
  const completedItems = (course.syllabus || []).filter((item) => item.completed).length;
  const totalItems = (course.syllabus || []).length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div
      className={styles.courseCard}
      role="article"
      aria-labelledby={`course-title-${course.id}`}
    >
      <div className={styles.imageWrapper}>
        <div className={styles.imageContainer}>
          <img
            src={course.image}
            alt={course.title}
            className={styles.courseImage}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = '/assets/fallback.jpg'; }}
          />
          <div className={styles.imageSkeleton} />
        </div>
        {course.isFeatured && (
          <span className={styles.featuredBadge}>ویژه</span>
        )}
      </div>
      <div className={styles.courseContent}>
        <h2 id={`course-title-${course.id}`} className={styles.courseTitle}>
          {course.title}
        </h2>
        <p className={styles.instructor}>
          استاد:{' '}
          {instructorNames.has(course.instructor) ? (
            <Link
              to={`/instructors/${course.instructor.replace(' ', '-')}`}
              className={styles.instructorLink}
              aria-label={`مشاهده پروفایل ${course.instructor}`}
            >
              {course.instructor}
            </Link>
          ) : (
            <span>{course.instructor} (اطلاعات استاد در دسترس نیست)</span>
          )}
        </p>
        <div className={styles.rating}>
          <StarIcon className={styles.starIcon} />
          <span>{averageRating} ({courseReviewsLength} نظر)</span>
        </div>
        <p className={styles.description}>{course.description}</p>
        <div className={styles.details}>
          <Tooltip title="کورس">
            <span><TrendingUpIcon /> {course.courseNumber}</span>
          </Tooltip>
          <Tooltip title="قیمت دوره">
            <div className={styles.priceContainer}>
              <span className={course.discountPrice ? styles.originalPrice : ''}>
                <AttachMoneyIcon /> {course.price}
              </span>
              {course.discountPrice && (
                <>
                  <span className={styles.discountPrice}>
                    <AttachMoneyIcon /> {course.discountPrice}
                  </span>
                  {course.discountPercentage && (
                    <span className={styles.discountPercentage}>
                      ({course.discountPercentage}% تخفیف)
                    </span>
                  )}
                </>
              )}
            </div>
          </Tooltip>
          <Tooltip title="نوع دوره">
            <span>
              {course.courseType === 'Online' ? 'آنلاین' : 
               course.courseType === 'Offline' ? 'آفلاین' : 
               course.courseType === 'In-Person' ? 'حضوری' : 'ترکیبی'}
            </span>
          </Tooltip>
          <Tooltip title="دانشگاه">
            <span>{course.university}</span>
          </Tooltip>
        </div>
        {course.tags && course.tags.length > 0 && (
          <div className={styles.tagsContainer}>
            {course.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
        {isEnrolled && totalItems > 0 && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progressPercentage}%` }} />
            </div>
            <span className={styles.progressText}>
              {Math.round(progressPercentage)}% کامل شده
            </span>
          </div>
        )}
        <div className={styles.actions}>
          <button
            className={`${styles.enrollButton} ${isCartItem(course.id) ? styles.addedToCart : ''}`}
            disabled={!course.isOpen}
            onClick={() => handleAddToCart(course)}
            aria-label={isCartItem(course.id) ? 'حذف از سبد خرید' : course.isOpen ? 'افزودن به سبد خرید' : 'ثبت‌نام بسته است'}
          >
            {isCartItem(course.id) ? (
              <>
                <DeleteIcon className={styles.removeIcon} />
                افزوده شده
              </>
            ) : course.isOpen ? (
              'افزودن به سبد خرید'
            ) : (
              'ثبت‌نام بسته است'
            )}
          </button>
          <Link
            to={`/courses/${course.id}`}
            className={styles.detailsLink}
            aria-label={`جزئیات بیشتر درباره ${course.title}`}
          >
            جزئیات بیشتر
          </Link>
          <button
            className={`${styles.wishlistButton} ${isInWishlist(course.id, 'course') ? styles.wishlistActive : ''}`}
            onClick={() => handleWishlistToggle(course.id)}
            aria-label={isInWishlist(course.id, 'course') ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          >
            {isInWishlist(course.id, 'course') ? (
              <FavoriteIcon className={styles.wishlistIconActive} />
            ) : (
              <FavoriteBorderIcon className={styles.wishlistIcon} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;