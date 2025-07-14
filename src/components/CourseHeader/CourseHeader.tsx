import React, { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
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
import Button from '@mui/material/Button';
import styles from './CourseHeader.module.css';
import { useCartContext } from '../../Context/CartContext'; // تغییر به CartContext

interface ReviewItem {
  id: number;
  rating: number;
  comment: string;
  user: string;
  date: string;
}

interface Course {
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
  university?: string;
  tags?: string[];
}

interface CourseHeaderProps {
  course: Course;
  courseReviews: ReviewItem[];
  isInWishlist: (id: number, type: 'course' | 'instructor' | 'blog') => boolean;
  toggleShareDropdown: () => void;
  isShareDropdownOpen: boolean;
  shareCourse: (platform: 'native' | 'telegram' | 'whatsapp' | 'copy') => Promise<void>;
  handleWishlistToggle: () => Promise<void>;
  dropdownRef: React.RefObject<HTMLDivElement>;
  'aria-expanded': boolean;
  isWishlistLoading: boolean;
}

const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'iframe', 'object'],
  }).trim();
};

const validateCourse = (course: Course): { isValid: boolean; data: Course; error?: string } => {
  const defaultCourse: Course = {
    id: 0,
    title: '',
    instructor: '',
    description: '',
    duration: '',
    courseNumber: '',
    image: '',
    price: '',
    startDate: '',
    university: '',
    tags: [],
  };

  if (
    typeof course.id !== 'number' ||
    !course.title?.trim() ||
    !course.instructor?.trim() ||
    !course.description?.trim() ||
    !course.duration?.trim() ||
    !course.courseNumber?.trim() ||
    !course.image?.match(/^https?:\/\/|^\/|^data:image\//) ||
    !course.price?.trim() ||
    !course.startDate?.trim() ||
    !course.university?.trim()
  ) {
    return { isValid: false, data: defaultCourse, error: 'یکی از فیلدهای مورد نیاز دوره نامعتبر یا خالی است.' };
  }

  const tags = Array.isArray(course.tags)
    ? course.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim() !== '')
    : [];

  return {
    isValid: true,
    data: {
      ...course,
      tags,
      discountPrice: course.discountPrice?.trim() || undefined,
      discountPercentage: typeof course.discountPercentage === 'number' ? course.discountPercentage : undefined,
    },
  };
};

const validateReviews = (reviews: ReviewItem[]): ReviewItem[] => {
  return Array.isArray(reviews)
    ? reviews.filter(
        (review): review is ReviewItem =>
          typeof review.id === 'number' &&
          typeof review.rating === 'number' &&
          review.rating >= 0 &&
          review.rating <= 5 &&
          typeof review.comment === 'string' &&
          typeof review.user === 'string' &&
          typeof review.date === 'string'
      )
    : [];
};

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
  const { addToCart } = useCartContext(); // استفاده از CartContext

  const { isValid, data, error } = useMemo(() => validateCourse(course), [course]);
  const validatedReviews = useMemo(() => validateReviews(courseReviews), [courseReviews]);

  const totalReviews = useMemo(() => validatedReviews.length, [validatedReviews]);
  const averageRating = useMemo(
    () => (totalReviews > 0 ? (validatedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1) : '0.0'),
    [validatedReviews, totalReviews]
  );

  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: sanitizeText(data.title),
      description: sanitizeText(data.description),
      provider: {
        '@type': 'Organization',
        name: sanitizeText(data.university),
      },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        startDate: sanitizeText(data.startDate),
        instructor: {
          '@type': 'Person',
          name: sanitizeText(data.instructor),
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: averageRating,
        reviewCount: totalReviews,
      },
      image: sanitizeText(data.image),
      keywords: data.tags?.map(sanitizeText).join(', ') || '',
      offers: {
        '@type': 'Offer',
        price: sanitizeText(data.discountPrice || data.price),
        priceCurrency: 'IRR',
      },
    }),
    [data, averageRating, totalReviews]
  );

  useEffect(() => {
    if (isShareDropdownOpen && dropdownRef.current) {
      dropdownRef.current.focus();
    }
  }, [isShareDropdownOpen, dropdownRef]);

  if (!isValid) {
    return (
      <div className={styles.error} role="alert">
        خطا: {error || 'اطلاعات دوره ناقص یا نامعتبر است. لطفاً با پشتیبانی تماس بگیرید.'}
      </div>
    );
  }

  const { id, title, instructor, description, duration, courseNumber, image, price, discountPrice, discountPercentage, startDate, university, tags } = data;

  return (
    <section className={styles.courseHeader} aria-label="جزئیات دوره">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <img
        src={sanitizeText(image)}
        alt={sanitizeText(`تصویر دوره ${title}`)}
        className={styles.courseImage}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = '/assets/fallback.jpg';
        }}
      />
      <div className={styles.courseInfo}>
        <h1 className={styles.courseTitle}>{sanitizeText(title)}</h1>
        <p className={styles.instructor}>
          استاد:{' '}
          <Link
            to={`/instructors/${sanitizeText(instructor.replace(/\s+/g, '-'))}`}
            className={styles.instructorLink}
          >
            {sanitizeText(instructor)}
          </Link>
        </p>
        <div className={styles.rating}>
          <StarIcon className={styles.starIcon} aria-hidden="true" />
          <span>
            {averageRating} ({totalReviews} نظر)
          </span>
        </div>
        <p className={styles.description}>{sanitizeText(description)}</p>
        <div className={styles.details}>
          <span>
            <AccessTimeIcon aria-hidden="true" /> مدت: {sanitizeText(duration)}
          </span>
          <span>
            <TrendingUpIcon aria-hidden="true" /> کورس: {sanitizeText(courseNumber)}
          </span>
          <span className={styles.priceContainer}>
            <span className={discountPrice ? styles.originalPrice : ''}>
              <AttachMoneyIcon aria-hidden="true" /> {sanitizeText(price)}
            </span>
            {discountPrice && (
              <>
                <span className={styles.discountPrice}>
                  <AttachMoneyIcon aria-hidden="true" /> {sanitizeText(discountPrice)}
                </span>
                {discountPercentage && (
                  <span className={styles.discountPercentage}>
                    ({discountPercentage}% تخفیف)
                  </span>
                )}
              </>
            )}
          </span>
          <span>
            <CalendarTodayIcon aria-hidden="true" /> شروع: {sanitizeText(startDate)}
          </span>
          <span>دانشگاه: {sanitizeText(university)}</span>
        </div>
        {tags?.length > 0 && (
          <div className={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <span key={`tag-${sanitizeText(tag)}-${index}`} className={styles.tag}>
                {sanitizeText(tag)}
              </span>
            ))}
          </div>
        )}
        <div className={styles.actionButtons}>
      
          <div className={styles.shareContainer}>
            <IconButton
              className={styles.shareButton}
              onClick={toggleShareDropdown}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleShareDropdown();
                }
              }}
              aria-label="اشتراک‌گذاری دوره"
              aria-expanded={isShareDropdownOpen}
              aria-controls="share-dropdown"
            >
              <ShareIcon />
            </IconButton>
            {isShareDropdownOpen && (
              <div
                id="share-dropdown"
                className={styles.shareDropdown}
                ref={dropdownRef}
                tabIndex={-1}
                role="menu"
                onKeyDown={(e) => e.key === 'Escape' && toggleShareDropdown()}
              >
                {navigator.share && (
                  <button
                    className={styles.shareOption}
                    onClick={() => shareCourse('native')}
                    role="menuitem"
                    aria-label="اشتراک‌گذاری از طریق مرورگر"
                  >
                    <ShareIcon aria-hidden="true" /> اشتراک‌گذاری
                  </button>
                )}
                <button
                  className={styles.shareOption}
                  onClick={() => shareCourse('telegram')}
                  role="menuitem"
                  aria-label="اشتراک‌گذاری در تلگرام"
                >
                  <TelegramIcon aria-hidden="true" /> تلگرام
                </button>
                <button
                  className={styles.shareOption}
                  onClick={() => shareCourse('whatsapp')}
                  role="menuitem"
                  aria-label="اشتراک‌گذاری در واتساپ"
                >
                  <WhatsAppIcon aria-hidden="true" /> واتساپ
                </button>
                <button
                  className={styles.shareOption}
                  onClick={() => shareCourse('copy')}
                  role="menuitem"
                  aria-label="کپی لینک دوره"
                >
                  <ContentCopyIcon aria-hidden="true" /> کپی لینک
                </button>
              </div>
            )}
          </div>
          <IconButton
            className={styles.likeButton}
            onClick={handleWishlistToggle}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleWishlistToggle();
              }
            }}
            aria-label={
              isInWishlist(id, 'course')
                ? 'حذف از لیست علاقه‌مندی‌ها'
                : 'افزودن به لیست علاقه‌مندی‌ها'
            }
          >
            {isInWishlist(id, 'course') ? (
              <FavoriteIcon className={styles.likedIcon} />
            ) : (
              <FavoriteBorderIcon />
            )}
          </IconButton>
        </div>
      </div>
    </section>
  );
};

export default CourseHeader;