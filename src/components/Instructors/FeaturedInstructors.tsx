import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { useInstructorContext } from '../../Context/InstructorContext';
import { Instructor } from '../../types/types';
import { useWishlistContext } from '../../Context/WishlistContext';
import { useNotificationContext } from '../../Context/NotificationContext';
import { useAuthContext } from '../../Context/Auth/UserAuthContext';
import InstructorCard from '../InstructorCard/InstructorCard';
import styles from './FeaturedInstructors.module.css';

const getRandomInstructors = (instructors: Instructor[], count: number): Instructor[] => {
  const shuffled = [...instructors].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, instructors.length));
};

const FeaturedInstructors: React.FC = () => {
  const { instructors, loading, fetchInstructors } = useInstructorContext();
  const { isInWishlist, toggleWishlist, isWishlistLoading } = useWishlistContext();
  const { showNotification } = useNotificationContext();
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayedInstructors = useMemo(() => {
    return getRandomInstructors(instructors, 3);
  }, [instructors]);

  useEffect(() => {
    const loadInstructors = async () => {
      if (instructors.length === 0) {
        try {
          await fetchInstructors();
        } catch (error: any) {
          console.error('Failed to fetch instructors:', error);
          setError('خطا در بارگذاری اساتید.');
          showNotification('خطا در بارگذاری اساتید.', 'error');
        }
      }
    };
    loadInstructors();
  }, [fetchInstructors, instructors.length]);

  useEffect(() => {
    if (!loading && !instructors.length && !error) {
      setError('هیچ استادی یافت نشد.');
      showNotification('هیچ استادی یافت نشد.', 'info');
    }
  }, [instructors.length, loading, showNotification, error]);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector(`.${styles.instructors}`);
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

  if (loading) {
    return (
      <section className={styles.instructors} role="region" aria-labelledby="instructors-title">
        <div className={styles.container}>
          <div className={styles.loading} role="status" aria-live="polite">
            در حال بارگذاری...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.instructors} role="region" aria-labelledby="instructors-title">
        <div className={styles.container}>
          <div className={styles.error} role="alert" aria-live="assertive">
            {error}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>اساتید برجسته روم دنتال</title>
        <meta
          name="description"
          content="با حرفه‌ای‌ترین اساتید دندانپزشکی ایران و جهان در روم دنتال آشنا شوید."
        />
        <meta name="keywords" content="اساتید دندانپزشکی, آموزش دندانپزشکی, روم دنتال" />
        <meta property="og:title" content="اساتید برجسته روم دنتال" />
        <meta
          property="og:description"
          content="با حرفه‌ای‌ترین اساتید دندانپزشکی ایران و جهان در روم دنتال آشنا شوید."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roomdental.com/instructors" />
        <meta property="og:site_name" content="روم دنتال" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: displayedInstructors.map((instructor, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Person',
                name: DOMPurify.sanitize(instructor.name),
                description: DOMPurify.sanitize(instructor.bio),
                jobTitle: DOMPurify.sanitize(instructor.specialty),
                image: instructor.image,
              },
            })),
          })}
        </script>
      </Helmet>
      <section className={`${styles.instructors} ${isVisible ? styles.visible : ''}`} role="region" aria-labelledby="instructors-title">
        <div className={styles.container}>
          <h2 id="instructors-title" className={`${styles.title} ${isVisible ? styles.titleVisible : ''}`}>
            اساتید روم دنتال
          </h2>
          <p className={`${styles.subtitle} ${isVisible ? styles.subtitleVisible : ''}`}>
            با حرفه‌ای‌ترین اساتید دندانپزشکی ایران و جهان آشنا شوید
          </p>
          <div className={styles.instructorList}>
            {displayedInstructors.length > 0 ? (
              displayedInstructors.map((instructor, index) => (
                <div
                  key={instructor.id}
                  style={{ transitionDelay: `${index * 0.2}s` }}
                  role="article"
                  aria-labelledby={`instructor-title-${instructor.id}`}
                >
                  <InstructorCard
                    instructor={instructor}
                    toggleWishlist={() => toggleWishlist(instructor.id, 'instructor', DOMPurify.sanitize(instructor.name))}
                    isInWishlist={isInWishlist}
                    isWishlistLoading={isWishlistLoading}
                  />
                </div>
              ))
            ) : (
              <p className={styles.noInstructors} role="alert" aria-live="polite">
                استادی برای نمایش وجود ندارد.
              </p>
            )}
          </div>
          <div className={styles.viewAllContainer}>
            <Link
              to="/instructors"
              className={`${styles.viewAllButton} ${styles.viewAllTransition}`}
              aria-label="مشاهده همه اساتید دندانپزشکی"
              tabIndex={0}
            >
              مشاهده همه اساتید
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturedInstructors;