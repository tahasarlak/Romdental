import React, { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import styles from './CourseCard.module.css';
import { useNotificationContext } from '../../Context/NotificationContext';
import { useCartContext } from '../../Context/CartContext';
import { Course } from '../../types/types';

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  handleWishlistToggle: (courseId: number, title: string) => Promise<void>;
  isInWishlist: (id: number, type: 'course' | 'instructor' | 'blog') => boolean;
  instructorNames: Set<string>;
  averageRating: string;
  courseReviewsLength: number;
  handleAddToCart: (course: Course) => void;
  isInCart: boolean;
  isWishlistLoading: boolean;
}

const getCourseTypeLabel = (type: Course['courseType']) => {
  switch (type) {
    case 'Online':
      return 'آنلاین';
    case 'Offline':
      return 'آفلاین';
    case 'In-Person':
      return 'حضوری';
    case 'Hybrid':
      return 'ترکیبی';
    default:
      return type;
  }
};

const isValidImageUrl = (url: string) => {
  return /^https?:\/\//.test(url) || url.startsWith('/assets/');
};

const getCourseStructuredData = (course: Course) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: DOMPurify.sanitize(course.title),
  description: DOMPurify.sanitize(course.description),
  provider: { '@type': 'Organization', name: DOMPurify.sanitize(course.university) },
  courseMode: course.courseType,
  instructor: { '@type': 'Person', name: DOMPurify.sanitize(course.instructor) },
});

const CourseCard: React.FC<CourseCardProps> = memo(
  ({
    course,
    isEnrolled,
    handleWishlistToggle,
    isInWishlist,
    instructorNames,
    averageRating,
    courseReviewsLength,
    handleAddToCart,
    isInCart,
    isWishlistLoading,
  }) => {
    const { showNotification } = useNotificationContext();
    const { cartItems, removeFromCart } = useCartContext();
    const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const progressPercentage = useMemo(() => {
      const syllabus = course.syllabus || [];
      const completedItems = syllabus.filter((item) => item.completed).length;
      const totalItems = syllabus.length;
      return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    }, [course.syllabus]);

    const isInstructorValid = useMemo(() => instructorNames.has(course.instructor), [
      instructorNames,
      course.instructor,
    ]);

    const sanitizedTitle = useMemo(() => DOMPurify.sanitize(course.title), [course.title]);
    const sanitizedDescription = useMemo(() => DOMPurify.sanitize(course.description), [course.description]);
    const sanitizedInstructor = useMemo(() => DOMPurify.sanitize(course.instructor), [course.instructor]);
    const sanitizedUniversity = useMemo(() => DOMPurify.sanitize(course.university), [course.university]);
    const sanitizedPrice = useMemo(() => DOMPurify.sanitize(course.price), [course.price]);
    const sanitizedDiscountPrice = course.discountPrice ? DOMPurify.sanitize(course.discountPrice) : undefined;

    const imageSrc = isValidImageUrl(course.image) ? course.image : '/assets/fallback.jpg';
    const baseUrl = process.env.REACT_APP_BASE_URL || 'https://roomdental.com';

    const articleId = `course-title-${course.id}-${Math.random().toString(36).substring(2, 9)}`;
    const descriptionId = `course-description-${course.id}-${Math.random().toString(36).substring(2, 9)}`;

    const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      if (img.src !== '/assets/fallback.jpg') {
        console.warn(`Failed to load image: ${img.src} for course ${sanitizedTitle}`);
        img.src = '/assets/fallback.jpg';
        img.alt = 'تصویر پیش‌فرض دوره';
      }
    }, [sanitizedTitle]);

    const handleCartAction = useCallback(async () => {
      try {
        if (isInCart) {
          const cartItem = cartItems.find((item) => item.courseId === course.id);
          if (!cartItem) return;
          const confirmRemove = window.confirm(
            `آیا مطمئن هستید که می‌خواهید دوره "${sanitizedTitle}" را از سبد خرید حذف کنید؟`
          );
          if (!confirmRemove) return;
          await removeFromCart(cartItem.id);
          showNotification(`دوره "${sanitizedTitle}" از سبد خرید حذف شد.`, 'success');
        } else {
          await handleAddToCart(course);
        }
      } catch (error) {
        console.error('Error handling cart action:', error);
        showNotification('خطایی در به‌روزرسانی سبد خرید رخ داد.', 'error');
      }
    }, [isInCart, course, handleAddToCart, removeFromCart, sanitizedTitle, showNotification, cartItems]);

    const handleWishlistAction = useCallback(async () => {
      try {
        await handleWishlistToggle(course.id, course.title);
      } catch (error) {
        console.error('Error toggling wishlist:', error);
        showNotification('خطایی در به‌روزرسانی علاقه‌مندی‌ها رخ داد.', 'error');
      }
    }, [course.id, course.title, handleWishlistToggle, showNotification]);

    const toggleShareDropdown = useCallback(() => {
      setIsShareDropdownOpen((prev) => !prev);
    }, []);

    const handleClickOutside = useCallback((event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsShareDropdownOpen(false);
      }
    }, []);

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [handleClickOutside]);

    const shareCourse = useCallback(
      async (platform: 'native' | 'telegram' | 'whatsapp' | 'copy') => {
        const shareUrl = encodeURI(`${baseUrl}/courses/${course.id}`);
        const shareText = DOMPurify.sanitize(`دوره "${course.title}" را در روم دنتال بررسی کنید!`);
        try {
          if (platform === 'native' && navigator.share) {
            await navigator.share({ title: course.title, text: shareText, url: shareUrl });
            showNotification('دوره با موفقیت به اشتراک گذاشته شد!', 'success');
          } else if (platform === 'telegram') {
            window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
            showNotification('لینک دوره در تلگرام به اشتراک گذاشته شد!', 'success');
          } else if (platform === 'whatsapp') {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
            showNotification('لینک دوره در واتساپ به اشتراک گذاشته شد!', 'success');
          } else if (platform === 'copy') {
            await navigator.clipboard.writeText(shareUrl);
            showNotification('لینک دوره با موفقیت کپی شد!', 'success');
          }
        } catch (error) {
          console.error('Error sharing:', error);
          showNotification('خطایی در اشتراک‌گذاری رخ داد. لطفاً دوباره تلاش کنید.', 'error');
        }
        setIsShareDropdownOpen(false);
      },
      [course, baseUrl, showNotification]
    );

    return (
      <>
        <Helmet>
          <meta name="description" content={sanitizedDescription} />
          <meta property="og:title" content={sanitizedTitle} />
          <meta property="og:description" content={sanitizedDescription} />
          <meta property="og:image" content={imageSrc} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={`${baseUrl}/courses/${course.slug}`} />
          <meta property="og:site_name" content="روم دنتال" />
          <meta name="twitter:card" content="summary_large_image" />
          <script type="application/ld+json">{JSON.stringify(getCourseStructuredData(course))}</script>
        </Helmet>

        <article className={styles.courseCard} aria-labelledby={articleId} aria-describedby={descriptionId}>
          <div className={styles.imageWrapper}>
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
                aria-controls={`share-dropdown-${course.id}`}
              >
                <ShareIcon />
              </IconButton>
              {isShareDropdownOpen && (
                <div
                  id={`share-dropdown-${course.id}`}
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
            <div className={styles.imageContainer}>
              <img
                src={imageSrc}
                alt={`تصویر دوره ${sanitizedTitle}`}
                className={styles.courseImage}
                loading="lazy"
                onError={handleImageError}
              />
              <div className={styles.imageSkeleton} />
            </div>
            {course.isFeatured && (
              <span className={styles.featuredBadge} aria-label="دوره ویژه">
                ویژه
              </span>
            )}
          </div>
          <div className={styles.courseContent}>
            <h2 id={articleId} className={styles.courseTitle}>
              {sanitizedTitle}
            </h2>
            <p className={styles.instructor}>
              استاد:{' '}
              {isInstructorValid ? (
                <Link
                  to={`/instructors/${sanitizedInstructor.replace(' ', '-')}`}
                  className={styles.instructorLink}
                  aria-label={`مشاهده پروفایل استاد ${sanitizedInstructor}`}
                >
                  {sanitizedInstructor}
                </Link>
              ) : (
                <span>{sanitizedInstructor} (اطلاعات استاد در دسترس نیست)</span>
              )}
            </p>
            <div className={styles.rating}>
              <StarIcon className={styles.starIcon} aria-hidden="true" />
              <span aria-live="polite">
                {DOMPurify.sanitize(averageRating)} ({courseReviewsLength} نظر)
              </span>
            </div>
            <p id={descriptionId} className={styles.description}>
              {sanitizedDescription}
            </p>
            <div className={styles.details}>
              <Tooltip title="کورس" enterDelay={500}>
                <span>
                  <TrendingUpIcon aria-hidden="true" /> {course.courseNumber}
                </span>
              </Tooltip>
              <Tooltip title="قیمت دوره" enterDelay={500}>
                <div className={styles.priceContainer}>
                  <span className={sanitizedDiscountPrice ? styles.originalPrice : ''}>
                    <AttachMoneyIcon aria-hidden="true" /> {sanitizedPrice}
                  </span>
                  {sanitizedDiscountPrice && (
                    <>
                      <span className={styles.discountPrice}>
                        <AttachMoneyIcon aria-hidden="true" /> {sanitizedDiscountPrice}
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
              <Tooltip title="نوع دوره" enterDelay={500}>
                <span>{getCourseTypeLabel(course.courseType)}</span>
              </Tooltip>
              <Tooltip title="دانشگاه" enterDelay={500}>
                <span>{sanitizedUniversity}</span>
              </Tooltip>
              <Tooltip title="تعداد شرکت‌کنندگان" enterDelay={500}>
                <span>{course.enrollmentCount} شرکت‌کننده</span>
              </Tooltip>
            </div>
            {course.tags?.length > 0 && (
              <div className={styles.tagsContainer}>
                {course.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {DOMPurify.sanitize(tag)}
                  </span>
                ))}
              </div>
            )}
            {isEnrolled && course.syllabus.length > 0 && (
              <div className={styles.progressContainer}>
                <div
                  className={styles.progressBar}
                  role="progressbar"
                  aria-valuenow={Math.round(progressPercentage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`پیشرفت دوره ${sanitizedTitle}`}
                >
                  <div
                    className={`${styles.progressFill} ${styles.progressTransition}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className={styles.progressText} aria-live="polite">
                  {Math.round(progressPercentage)}% کامل شده
                </span>
              </div>
            )}
            <div className={styles.actions}>
              <button
                className={`${styles.enrollButton} ${isInCart ? styles.addedToCart : ''}`}
                disabled={!course.isOpen}
                aria-disabled={!course.isOpen}
                onClick={handleCartAction}
                tabIndex={0}
                aria-label={
                  isInCart
                    ? `حذف دوره ${sanitizedTitle} از سبد خرید`
                    : course.isOpen
                    ? `افزودن دوره ${sanitizedTitle} به سبد خرید`
                    : `ثبت‌نام دوره ${sanitizedTitle} بسته است، دوره در حال حاضر غیرفعال است`
                }
              >
                {isInCart ? (
                  <>
                    <DeleteIcon className={styles.removeIcon} aria-hidden="true" />
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
                aria-label={`جزئیات بیشتر درباره دوره ${sanitizedTitle}`}
              >
                جزئیات بیشتر
              </Link>
              <button
                className={`${styles.wishlistButton} ${isInWishlist(course.id, 'course') ? styles.wishlistActive : ''}`}
                onClick={handleWishlistAction}
                tabIndex={0}
                aria-label={
                  isInWishlist(course.id, 'course')
                    ? `حذف دوره ${sanitizedTitle} از علاقه‌مندی‌ها`
                    : `افزودن دوره ${sanitizedTitle} به علاقه‌مندی‌ها`
                }
                disabled={isWishlistLoading}
              >
                {isInWishlist(course.id, 'course') ? (
                  <FavoriteIcon className={styles.wishlistIconActive} aria-hidden="true" />
                ) : (
                  <FavoriteBorderIcon className={styles.wishlistIcon} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </article>
      </>
    );
  }
);

CourseCard.displayName = 'CourseCard';
export default CourseCard;