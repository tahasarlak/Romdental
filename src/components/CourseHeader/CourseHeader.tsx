import React from 'react';
import { Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import styles from './CourseHeader.module.css';
import { ReviewItem } from '../../pages/Courses/[title]/[title]';

interface CourseHeaderProps {
  course: {
    id: number;
    title: string;
    instructor: string;
    description: string;
    duration: string;
    courseNumber: string;
    image: string;
    price: string;
    discountPrice?: string;
    discountPercentage?: number;
    startDate: string;
    university: string;
    tags?: string[];
  };
  courseReviews: ReviewItem[];
  isInWishlist: (id: number, type: 'course' | 'instructor') => boolean;
  toggleShareDropdown: () => void;
  isShareDropdownOpen: boolean;
  shareCourse: (platform: 'native' | 'telegram' | 'whatsapp' | 'copy') => void;
  handleWishlistToggle: () => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({
  course,
  courseReviews,
  isInWishlist,
  toggleShareDropdown,
  isShareDropdownOpen,
  shareCourse,
  handleWishlistToggle,
  dropdownRef,
}) => {
  const totalReviews = courseReviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          courseReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        ).toFixed(1)
      : '0.0';

  return (
    <div className={styles.courseHeader}>
      <img
        src={course.image}
        alt={course.title}
        className={styles.courseImage}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = '/assets/fallback.jpg';
        }}
      />
      <div className={styles.courseInfo}>
        <h1 className={styles.courseTitle}>{course.title}</h1>
        <p className={styles.instructor}>
          استاد:{' '}
          <Link
            to={`/instructors/${course.instructor.replace(' ', '-')}`}
            className={styles.instructorLink}
          >
            {course.instructor}
          </Link>
        </p>
        <div className={styles.rating}>
          <StarIcon className={styles.starIcon} />
          <span>
            {averageRating} ({totalReviews} نظر)
          </span>
        </div>
        <p className={styles.description}>{course.description}</p>
        <div className={styles.details}>
          <span>
            <AccessTimeIcon /> مدت: {course.duration}
          </span>
          <span>
            <TrendingUpIcon /> کورس: {course.courseNumber}
          </span>
          <span className={styles.priceContainer}>
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
          </span>
          <span>
            <CalendarTodayIcon /> شروع: {course.startDate}
          </span>
          <span>دانشگاه: {course.university}</span>
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
        <div className={styles.actionButtons}>
          <div className={styles.shareContainer}>
            <IconButton
              className={styles.shareButton}
              onClick={toggleShareDropdown}
              aria-label="اشتراک‌گذاری دوره"
              aria-expanded={isShareDropdownOpen}
            >
              <ShareIcon />
            </IconButton>
            {isShareDropdownOpen && (
              <div className={styles.shareDropdown} ref={dropdownRef}>
                {navigator.share && (
                  <button
                    className={styles.shareOption}
                    onClick={() => shareCourse('native')}
                  >
                    <ShareIcon /> اشتراک‌گذاری
                  </button>
                )}
                <button
                  className={styles.shareOption}
                  onClick={() => shareCourse('telegram')}
                >
                  <TelegramIcon /> تلگرام
                </button>
                <button
                  className={styles.shareOption}
                  onClick={() => shareCourse('whatsapp')}
                >
                  <WhatsAppIcon /> واتساپ
                </button>
                <button
                  className={styles.shareOption}
                  onClick={() => shareCourse('copy')}
                >
                  <ContentCopyIcon /> کپی لینک
                </button>
              </div>
            )}
          </div>
          <IconButton
            className={styles.likeButton}
            onClick={handleWishlistToggle}
            aria-label={
              isInWishlist(course.id, 'course')
                ? 'حذف از لیست علاقه‌مندی‌ها'
                : 'افزودن به لیست علاقه‌مندی‌ها'
            }
          >
            {isInWishlist(course.id, 'course') ? (
              <FavoriteIcon className={styles.likedIcon} />
            ) : (
              <FavoriteBorderIcon />
            )}
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;