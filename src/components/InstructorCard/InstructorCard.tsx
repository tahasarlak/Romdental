import React, { memo, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import WorkIcon from '@mui/icons-material/Work';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PeopleIcon from '@mui/icons-material/People';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { useNotificationContext } from '../../Context/NotificationContext';
import { useAuthContext } from '../../Context/Auth/UserAuthContext';
import { Instructor } from '../../types/types';
import styles from './InstructorCard.module.css';

interface InstructorCardProps {
  instructor: Instructor;
  toggleWishlist: (instructorId: number, type: 'instructor', name: string) => Promise<void>;
  isInWishlist: (id: number, type: 'instructor') => boolean;
  isWishlistLoading: boolean;
}

const getInstructorStructuredData = (instructor: Instructor) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: DOMPurify.sanitize(instructor.name),
  description: DOMPurify.sanitize(instructor.bio),
  jobTitle: DOMPurify.sanitize(instructor.specialty),
  image: instructor.image || '/assets/logo.jpg',
});

const InstructorCard: React.FC<InstructorCardProps> = memo(({ instructor, toggleWishlist, isInWishlist, isWishlistLoading }) => {
  const { showNotification } = useNotificationContext();
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  // Sanitize instructor data
  const sanitizedName = useMemo(() => DOMPurify.sanitize(instructor.name), [instructor.name]);
  const sanitizedSpecialty = useMemo(() => DOMPurify.sanitize(instructor.specialty), [instructor.specialty]);
  const sanitizedBio = useMemo(() => DOMPurify.sanitize(instructor.bio), [instructor.bio]);
  const sanitizedExperience = useMemo(() => DOMPurify.sanitize(instructor.experience), [instructor.experience]);
  const sanitizedCoursesTaught = useMemo(
    () => instructor.coursesTaught.map((course: string) => DOMPurify.sanitize(course)),
    [instructor.coursesTaught]
  );

  // Default image
  const defaultImage = '/assets/logo.jpg';
  const instructorImage = instructor.image && instructor.image.trim() !== '' ? instructor.image : defaultImage;

  // Unique IDs for accessibility
  const articleId = `instructor-title-${instructor.id}-${Math.random().toString(36).substring(2, 9)}`;
  const bioId = `instructor-bio-${instructor.id}-${Math.random().toString(36).substring(2, 9)}`;

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src !== defaultImage) {
      console.warn(`Failed to load image: ${img.src} for instructor ${sanitizedName}`);
      img.src = defaultImage;
      img.alt = `تصویر پیش‌فرض برای استاد ${sanitizedName}`;
    }
  }, [sanitizedName, defaultImage]);

  const handleWishlistToggle = useCallback(async () => {
    if (!isAuthenticated) {
      showNotification('برای افزودن به لیست علاقه‌مندی‌ها، لطفاً ابتدا وارد حساب کاربری شوید.', 'warning');
      navigate('/login');
      return;
    }

    try {
      await toggleWishlist(instructor.id, 'instructor', sanitizedName);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showNotification('خطایی در به‌روزرسانی لیست علاقه‌مندی‌ها رخ داد.', 'error');
    }
  }, [instructor.id, sanitizedName, isAuthenticated, navigate, showNotification, toggleWishlist]);

  return (
    <>
      <Helmet>
        <meta name="description" content={sanitizedBio} />
        <meta property="og:title" content={sanitizedName} />
        <meta property="og:description" content={sanitizedBio} />
        <meta property="og:image" content={instructorImage} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://roomdental.com/instructors/${sanitizedName.replace(' ', '-')}`} />
        <meta property="og:site_name" content="روم دنتال" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(getInstructorStructuredData(instructor))}</script>
      </Helmet>
      <article className={styles.instructorCard} role="article" aria-labelledby={articleId} aria-describedby={bioId}>
        <div className={styles.imageWrapper}>
          <img
            src={instructorImage}
            alt={`تصویر استاد ${sanitizedName}`}
            className={styles.instructorImage}
            loading="lazy"
            onError={handleImageError}
          />
        </div>
        <div className={styles.instructorContent}>
          <h2 id={articleId} className={styles.instructorName}>{sanitizedName}</h2>
          <p className={styles.specialty}>تخصص: {sanitizedSpecialty}</p>
          <div className={styles.rating}>
            <StarIcon className={styles.starIcon} aria-hidden="true" />
            <span aria-live="polite">
              {instructor.averageRating} ({instructor.reviewCount} نظر)
            </span>
          </div>
          <p id={bioId} className={styles.bio}>{sanitizedBio}</p>
          <div className={styles.details}>
            <Tooltip title="تجربه" enterDelay={500} disableInteractive>
              <span>
                <AccessTimeIcon aria-hidden="true" /> تجربه: {sanitizedExperience}
              </span>
            </Tooltip>
            <Tooltip title="تعداد دوره‌ها" enterDelay={500} disableInteractive>
              <span>
                <WorkIcon aria-hidden="true" /> دوره‌ها:{' '}
                {sanitizedCoursesTaught.length > 0 ? sanitizedCoursesTaught.join(', ') : 'بدون دوره'}
              </span>
            </Tooltip>
            <Tooltip title="تعداد دانشجویان" enterDelay={500} disableInteractive>
              <span>
                <PeopleIcon aria-hidden="true" /> دانشجویان: {instructor.totalStudents} نفر
              </span>
            </Tooltip>
          </div>
          <div className={styles.actions}>
            <Link
              to={`/instructors/${sanitizedName.replace(' ', '-')}`}
              className={`${styles.detailsLink} ${styles.detailsLinkHover}`}
              aria-label={`جزئیات بیشتر درباره استاد ${sanitizedName}`}
            >
              جزئیات بیشتر
            </Link>
            <Tooltip
              title={isInWishlist(instructor.id, 'instructor') ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
              enterDelay={500}
              disableInteractive
            >
              <Button
                className={`${styles.wishlistButton} ${isInWishlist(instructor.id, 'instructor') ? styles.wishlistActive : styles.wishlistTransition}`}
                onClick={handleWishlistToggle}
                aria-label={
                  isInWishlist(instructor.id, 'instructor')
                    ? `حذف استاد ${sanitizedName} از علاقه‌مندی‌ها`
                    : `افزودن استاد ${sanitizedName} به علاقه‌مندی‌ها`
                }
                aria-busy={isWishlistLoading}
                disabled={isWishlistLoading}
                tabIndex={0}
              >
                {isWishlistLoading ? (
                  <CircularProgress size={20} className={styles.loadingIcon} aria-hidden="true" />
                ) : isInWishlist(instructor.id, 'instructor') ? (
                  <FavoriteIcon className={styles.wishlistIconActive} aria-hidden="true" />
                ) : (
                  <FavoriteBorderIcon className={styles.wishlistIcon} aria-hidden="true" />
                )}
              </Button>
            </Tooltip>
          </div>
        </div>
      </article>
    </>
  );
});

InstructorCard.displayName = 'InstructorCard';
export default InstructorCard;