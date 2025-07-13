import React, { memo, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import StarIcon from '@mui/icons-material/Star';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TelegramIcon from '@mui/icons-material/Telegram';
import InstagramIcon from '@mui/icons-material/Instagram';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { useInstructorContext, useInstructorMetrics } from '../../../Context/InstructorContext';
import { Instructor } from '../../../types/types';
import { useCourseContext } from '../../../Context/CourseContext';
import { useWishlistContext } from '../../../Context/WishlistContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import { useAuthContext } from '../../../Context/AuthContext';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import styles from './InstructorDetails.module.css';

const InstructorDetails: React.FC = memo(() => {
  const { instructorName } = useParams<{ instructorName: string }>();
  const { instructors, loading: instructorsLoading } = useInstructorContext();
  const { courses, loading: coursesLoading } = useCourseContext();
  const { isInWishlist, toggleWishlist, isWishlistLoading } = useWishlistContext();
  const { isAuthenticated } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const navigate = useNavigate();

  const formattedName = useMemo(() => DOMPurify.sanitize(instructorName?.replace('-', ' ') || ''), [instructorName]);
  const instructor = useMemo(() => instructors.find((inst) => inst.name === formattedName), [instructors, formattedName]);
  const metrics = useInstructorMetrics(instructor || null);

  const sanitizedName = useMemo(() => DOMPurify.sanitize(instructor?.name || ''), [instructor]);
  const sanitizedBio = useMemo(() => DOMPurify.sanitize(instructor?.bio || ''), [instructor]);
  const sanitizedSpecialty = useMemo(() => DOMPurify.sanitize(instructor?.specialty || ''), [instructor]);
  const sanitizedExperience = useMemo(() => DOMPurify.sanitize(instructor?.experience || ''), [instructor]);

  const defaultImage = '/assets/logo.jpg';
  const instructorImage = useMemo(() => (instructor?.image && instructor.image.trim() !== '' ? instructor.image : defaultImage), [instructor]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src !== defaultImage) {
      console.warn(`Failed to load image: ${img.src} for instructor ${sanitizedName}`);
      img.src = defaultImage;
      img.alt = `تصویر پیش‌فرض برای استاد ${sanitizedName}`;
    }
  }, [sanitizedName, defaultImage]);

  const instructorCourses = useMemo(
    () =>
      courses
        .filter((course) => course.instructor === instructor?.name)
        .map((course) => ({
          ...course,
          sanitizedTitle: DOMPurify.sanitize(course.title),
          sanitizedDescription: DOMPurify.sanitize(course.description),
          image: course.image && course.image.trim() !== '' ? course.image : '/assets/fallback.jpg',
        })),
    [courses, instructor]
  );

  const getInstructorStructuredData = useCallback(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: sanitizedName,
      description: sanitizedBio,
      jobTitle: sanitizedSpecialty,
      image: instructorImage,
    }),
    [sanitizedName, sanitizedBio, sanitizedSpecialty, instructorImage]
  );

  if (instructorsLoading || coursesLoading) {
    return (
      <section className={styles.instructorDetailsSection} role="main">
        <div className={styles.container}>
          <div className={styles.loading} role="status" aria-live="polite">
            در حال بارگذاری...
          </div>
        </div>
      </section>
    );
  }

  if (!instructor) {
    return (
      <section className={styles.instructorDetailsSection} role="main">
        <div className={styles.container}>
          <div className={styles.error} role="alert" aria-live="assertive">
            استاد یافت نشد!
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{sanitizedName} - روم دنتال</title>
        <meta name="description" content={sanitizedBio} />
        <meta name="keywords" content={`${sanitizedName}, ${sanitizedSpecialty}, آموزش دندانپزشکی, روم دنتال`} />
        <meta property="og:title" content={sanitizedName} />
        <meta property="og:description" content={sanitizedBio} />
        <meta property="og:image" content={instructorImage} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://roomdental.com/instructors/${instructorName}`} />
        <meta property="og:site_name" content="روم دنتال" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(getInstructorStructuredData())}</script>
      </Helmet>
      <section className={styles.instructorDetailsSection} role="main">
        <div className={styles.container}>
          <Breadcrumb />
          <div className={styles.header}>
            <h1 className={styles.title}>{sanitizedName}</h1>
            <div className={styles.rating}>
              <StarIcon className={styles.starIcon} aria-hidden="true" />
              <span aria-live="polite">{metrics.averageRating} ({metrics.totalStudents} دانشجو)</span>
            </div>
            <Tooltip
              title={isInWishlist(instructor.id, 'instructor') ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
              enterDelay={500}
              disableInteractive
            >
              <Button
                className={`${styles.wishlistButton} ${isInWishlist(instructor.id, 'instructor') ? styles.wishlistActive : styles.wishlistTransition}`}
                onClick={() => toggleWishlist(instructor.id, 'instructor', sanitizedName)}
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

          <div className={styles.contentWrapper}>
            <div className={styles.imageContainer}>
              <img
                src={instructorImage}
                srcSet={`${instructorImage}?w=200 200w, ${instructorImage}?w=400 400w`}
                sizes="(max-width: 600px) 200px, 400px"
                alt={`تصویر استاد ${sanitizedName}`}
                className={styles.instructorImage}
                loading="lazy"
                onError={handleImageError}
              />
            </div>

            <div className={styles.detailsContainer}>
              <div className={styles.infoCard}>
                <h2 className={styles.subtitle}>
                  <MedicalServicesIcon className={styles.sectionIcon} aria-hidden="true" /> مشخصات
                </h2>
                <p>
                  <MedicalServicesIcon className={styles.infoIcon} aria-hidden="true" />
                  <strong>تخصص:</strong> {sanitizedSpecialty}
                </p>
                <p>
                  <ScheduleIcon className={styles.infoIcon} aria-hidden="true" />
                  <strong>تجربه:</strong> {sanitizedExperience}
                </p>
                <p>
                  <PeopleIcon className={styles.infoIcon} aria-hidden="true" />
                  <strong>تعداد دانشجویان:</strong> {metrics.totalStudents}
                </p>
                <p>
                  <StarIcon className={styles.infoIcon} aria-hidden="true" />
                  <strong>امتیاز:</strong> {metrics.averageRating} / 5
                </p>
              </div>

              <div className={styles.bioCard}>
                <h2 className={styles.subtitle}>
                  <BookIcon className={styles.sectionIcon} aria-hidden="true" /> بیوگرافی
                </h2>
                <p>{sanitizedBio}</p>
              </div>

              <div className={styles.coursesCard}>
                <h2 className={styles.subtitle}>
                  <SchoolIcon className={styles.sectionIcon} aria-hidden="true" /> دوره‌های تدریس‌شده
                </h2>
                {instructorCourses.length > 0 ? (
                  <div className={styles.courseGrid} role="list">
                    {instructorCourses.map((course) => (
                      <Link
                        key={course.id}
                        to={`/courses/${course.id}`}
                        className={styles.courseCard}
                        role="listitem"
                        tabIndex={0}
                      >
                        <img
                          src={course.image}
                          srcSet={`${course.image}?w=150 150w, ${course.image}?w=300 300w`}
                          sizes="(max-width: 600px) 150px, 300px"
                          alt={`تصویر دوره ${course.sanitizedTitle}`}
                          className={styles.courseImage}
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (img.src !== '/assets/fallback.jpg') {
                              console.warn(`Failed to load course image: ${img.src} for course ${course.sanitizedTitle}`);
                              img.src = '/assets/fallback.jpg';
                              img.alt = `تصویر پیش‌فرض برای دوره ${course.sanitizedTitle}`;
                            }
                          }}
                        />
                        <div className={styles.courseContent}>
                          <h3 className={styles.courseTitle}>{course.sanitizedTitle}</h3>
                          <p className={styles.courseDescription}>
                            {course.sanitizedDescription.length > 100
                              ? `${course.sanitizedDescription.substring(0, 100)}...`
                              : course.sanitizedDescription}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noCourses} aria-live="polite">
                    بدون دوره
                  </p>
                )}
              </div>

              <div className={styles.socialMedia}>
                <h2 className={styles.subtitle}>
                  <ShareIcon className={styles.sectionIcon} aria-hidden="true" /> شبکه‌های اجتماعی
                </h2>
                <div className={styles.socialLinks}>
                  {instructor.whatsappLink && (
                    <a
                      href={DOMPurify.sanitize(instructor.whatsappLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialIcon}
                      aria-label={`واتساپ استاد ${sanitizedName}`}
                      tabIndex={0}
                    >
                      <WhatsAppIcon />
                    </a>
                  )}
                  {instructor.telegramLink && (
                    <a
                      href={DOMPurify.sanitize(instructor.telegramLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialIcon}
                      aria-label={`تلگرام استاد ${sanitizedName}`}
                      tabIndex={0}
                    >
                      <TelegramIcon />
                    </a>
                  )}
                  {instructor.instagramLink && (
                    <a
                      href={DOMPurify.sanitize(instructor.instagramLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialIcon}
                      aria-label={`اینستاگرام استاد ${sanitizedName}`}
                      tabIndex={0}
                    >
                      <InstagramIcon />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Link to="/instructors" className={styles.backLink} tabIndex={0} aria-label="بازگشت به لیست اساتید">
            بازگشت به لیست اساتید
          </Link>
        </div>
      </section>
    </>
  );
});

InstructorDetails.displayName = 'InstructorDetails';
export default InstructorDetails;