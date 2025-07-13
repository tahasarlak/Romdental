import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import DOMPurify from 'dompurify';
import { useCourseContext } from '../../Context/CourseContext';
import { useInstructorContext } from '../../Context/InstructorContext';
import { useReviewContext } from '../../Context/ReviewContext';
import { useCartContext } from '../../Context/CartContext';
import { useAuthContext } from '../../Context/AuthContext';
import { useNotificationContext } from '../../Context/NotificationContext';
import { useWishlistContext } from '../../Context/WishlistContext';
import CourseCard from '../../components/CourseCard/CourseCard';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import styles from './Courses.module.css';
import { Helmet } from 'react-helmet-async';
import { Course, ReviewItem } from '../../types/types';

const Courses: React.FC = () => {
  const { courses, loading, fetchCourses } = useCourseContext();
  const { instructors } = useInstructorContext();
  const { reviews } = useReviewContext();
  const { cartItems, addToCart, removeFromCart } = useCartContext();
  const { user, isAuthenticated } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const { isInWishlist, toggleWishlist, isWishlistLoading } = useWishlistContext();
  const navigate = useNavigate();
  const [filterCourseNumber, setFilterCourseNumber] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterInstructor, setFilterInstructor] = useState<string>('all');
  const [filterCourseType, setFilterCourseType] = useState<string>('all');
  const [filterUniversity, setFilterUniversity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('title');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const coursesPerPage = 8;

  const enrolledCourses = useMemo(() => user?.enrolledCourses || [], [user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        await fetchCourses();
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setError('خطایی در بارگذاری دوره‌ها رخ داد. لطفاً دوباره تلاش کنید.');
        showNotification('خطایی در بارگذاری دوره‌ها رخ داد.', 'error');
      }
    };
    if (!courses.length && !loading) {
      loadCourses();
    }
  }, [courses, loading, fetchCourses, showNotification]);

  const instructorNames = useMemo(() => new Set(instructors.map((instructor) => instructor.name)), [instructors]);

  const uniqueCourseNumbers = useMemo(() => ['all', ...new Set(courses.map((course) => course.courseNumber))].sort(), [courses]);
  const uniqueCategories = useMemo(() => ['all', ...new Set(courses.map((course) => course.category))].sort(), [courses]);
  const uniqueInstructors = useMemo(() => ['all', ...new Set(courses.map((course) => course.instructor))].sort(), [courses]);
  const uniqueStatuses = useMemo(() => ['all', 'open', 'closed'], []);
  const uniqueCourseTypes = useMemo(() => ['all', 'Online', 'Offline', 'In-Person', 'Hybrid'], []);
  const uniqueUniversities = useMemo(() => ['all', 'Smashko', 'Piragova', 'RUDN', 'Sechenov'].sort(), []);

  const getAverageRating = useCallback((courseId: number) => {
    const courseReviews = reviews.filter((review) => review.courseId === courseId);
    return courseReviews.length > 0
      ? (courseReviews.reduce((sum: number, r: ReviewItem) => sum + r.rating, 0) / courseReviews.length).toFixed(1)
      : '0.0';
  }, [reviews]);

  const filteredCourses = useMemo(() => {
    const sanitizedQuery = DOMPurify.sanitize(searchQuery, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    const parsePrice = (price: string) => parseInt(price.replace(/[^0-9]/g, '')) || 0;

    return courses
      .filter((course) => (filterCourseNumber === 'all' ? true : course.courseNumber === filterCourseNumber))
      .filter((course) => (filterCategory === 'all' ? true : course.category === filterCategory))
      .filter((course) => (filterStatus === 'all' ? true : filterStatus === 'open' ? course.isOpen : !course.isOpen))
      .filter((course) => (filterInstructor === 'all' ? true : course.instructor === filterInstructor))
      .filter((course) => (filterCourseType === 'all' ? true : course.courseType === filterCourseType))
      .filter((course) => (filterUniversity === 'all' ? true : course.university === filterUniversity))
      .filter(
        (course) =>
          course.title.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
          course.instructor.toLowerCase().includes(sanitizedQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'price') {
          const priceA = a.discountPrice ? parsePrice(a.discountPrice) : parsePrice(a.price);
          const priceB = b.discountPrice ? parsePrice(b.discountPrice) : parsePrice(b.price);
          return priceA - priceB;
        }
        if (sortBy === 'startDate') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        if (sortBy === 'rating') {
          const avgRatingA = parseFloat(getAverageRating(a.id));
          const avgRatingB = parseFloat(getAverageRating(b.id));
          return avgRatingB - avgRatingA;
        }
        if (sortBy === 'enrollment') return b.enrollmentCount - a.enrollmentCount;
        return 0;
      });
  }, [
    courses,
    filterCourseNumber,
    filterCategory,
    filterStatus,
    filterInstructor,
    filterCourseType,
    filterUniversity,
    searchQuery,
    sortBy,
    getAverageRating,
  ]);

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const paginate = useCallback((pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  const isCartItem = useCallback((courseId: number) => {
    return cartItems.some((item) => item.courseId === courseId);
  }, [cartItems]);

  const isEnrolled = useCallback((courseId: number) => {
    return enrolledCourses.includes(courseId);
  }, [enrolledCourses]);

  const handleAddToCart = useCallback(
    async (course: Course) => {
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
    },
    [addToCart, removeFromCart, isCartItem, showNotification, isAuthenticated, navigate, cartItems]
  );

  const handleWishlistToggle = useCallback(
    async (courseId: number, title: string) => {
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
    },
    [isAuthenticated, toggleWishlist, navigate, showNotification]
  );

  const clearFilters = useCallback(() => {
    setFilterCourseNumber('all');
    setFilterCategory('all');
    setFilterStatus('all');
    setFilterInstructor('all');
    setFilterCourseType('all');
    setFilterUniversity('all');
    setSearchQuery('');
    setSortBy('title');
    setCurrentPage(1);
    showNotification('فیلترها با موفقیت پاک شدند.', 'success');
  }, [showNotification]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const renderFilters = () => (
    <div className={styles.filterContainer}>
      <h3>فیلترها</h3>
      <div className={styles.filterGroup}>
        <label htmlFor="filter-course-number">کورس:</label>
        {uniqueCourseNumbers.map((courseNumber) => (
          <button
            key={courseNumber}
            className={`${styles.filterButton} ${filterCourseNumber === courseNumber ? styles.active : styles.filterTransition}`}
            onClick={() => setFilterCourseNumber(courseNumber)}
            aria-pressed={filterCourseNumber === courseNumber}
            tabIndex={0}
          >
            {courseNumber === 'all' ? 'همه' : courseNumber}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label htmlFor="filter-category">دسته‌بندی:</label>
        {uniqueCategories.map((category) => (
          <button
            key={category}
            className={`${styles.filterButton} ${filterCategory === category ? styles.active : styles.filterTransition}`}
            onClick={() => setFilterCategory(category)}
            aria-pressed={filterCategory === category}
            tabIndex={0}
          >
            {category === 'all' ? 'همه' : category}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label htmlFor="filter-status">وضعیت:</label>
        {uniqueStatuses.map((status) => (
          <button
            key={status}
            className={`${styles.filterButton} ${filterStatus === status ? styles.active : styles.filterTransition}`}
            onClick={() => setFilterStatus(status)}
            aria-pressed={filterStatus === status}
            tabIndex={0}
          >
            {status === 'all' ? 'همه' : status === 'open' ? 'باز' : 'بسته'}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label htmlFor="filter-instructor">استاد:</label>
        {uniqueInstructors.map((instructor) => (
          <button
            key={instructor}
            className={`${styles.filterButton} ${filterInstructor === instructor ? styles.active : styles.filterTransition}`}
            onClick={() => setFilterInstructor(instructor)}
            aria-pressed={filterInstructor === instructor}
            tabIndex={0}
          >
            {instructor === 'all' ? 'همه' : instructor}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label htmlFor="filter-course-type">نوع دوره:</label>
        {uniqueCourseTypes.map((courseType) => (
          <button
            key={courseType}
            className={`${styles.filterButton} ${filterCourseType === courseType ? styles.active : styles.filterTransition}`}
            onClick={() => setFilterCourseType(courseType)}
            aria-pressed={filterCourseType === courseType}
            tabIndex={0}
          >
            {courseType === 'all' ? 'همه' : courseType === 'Online' ? 'آنلاین' : courseType === 'Offline' ? 'آفلاین' : courseType === 'In-Person' ? 'حضوری' : 'ترکیبی'}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label htmlFor="filter-university">دانشگاه:</label>
        {uniqueUniversities.map((university) => (
          <button
            key={university}
            className={`${styles.filterButton} ${filterUniversity === university ? styles.active : styles.filterTransition}`}
            onClick={() => setFilterUniversity(university)}
            aria-pressed={filterUniversity === university}
            tabIndex={0}
          >
            {university === 'all' ? 'همه' : university}
          </button>
        ))}
      </div>
      <button
        className={`${styles.clearButton} ${styles.filterTransition}`}
        onClick={clearFilters}
        aria-label="پاک کردن همه فیلترها"
        tabIndex={0}
      >
        پاک کردن فیلترها
      </button>
    </div>
  );

  if (loading) {
    return (
      <section className={styles.coursesSection} role="main">
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
      <section className={styles.coursesSection} role="main">
        <div className={styles.container}>
          <div className={styles.error} role="alert" aria-live="assertive">
            {error}
          </div>
        </div>
      </section>
    );
  }

  if (!courses.length && !loading) {
    return (
      <section className={styles.coursesSection} role="main">
        <div className={styles.container}>
          <div className={styles.error} role="alert" aria-live="assertive">
            هیچ دوره‌ای یافت نشد. لطفاً بعداً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>دوره‌های آموزشی دندانپزشکی | روم دنتال</title>
        <meta
          name="description"
          content="دوره‌های آنلاین و حضوری دندانپزشکی با بهترین اساتید و محتوای به‌روز در روم دنتال"
        />
        <meta
          name="keywords"
          content="دوره‌های دندانپزشکی, آموزش آنلاین دندانپزشکی, دوره‌های حرفه‌ای دندانپزشکی, روم دنتال"
        />
        <meta property="og:title" content="دوره‌های آموزشی دندانپزشکی | روم دنتال" />
        <meta
          property="og:description"
          content="دوره‌های آنلاین و حضوری دندانپزشکی با بهترین اساتید و محتوای به‌روز در روم دنتال"
        />
        <meta property="og:type" content="website" />
        <link rel="alternate" hrefLang="fa" href="/courses" />
      </Helmet>
      <section className={styles.coursesSection} role="main">
        <div className={styles.container}>
          <Breadcrumb />
          <h1 className={styles.title}>دوره‌های آموزشی روم دنتال</h1>
          <p className={styles.subtitle}>
            دوره‌های آنلاین و حضوری دندانپزشکی با بهترین اساتید و محتوای به‌روز
          </p>

          <div className={styles.searchContainer}>
            <SearchIcon className={styles.searchIcon} aria-hidden="true" />
            <input
              type="text"
              placeholder="جستجو بر اساس عنوان یا استاد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(DOMPurify.sanitize(e.target.value))}
              className={styles.searchInput}
              aria-label="جستجوی دوره‌های دندانپزشکی"
              id="search-input"
            />
            {isMobile && (
              <IconButton
                className={`${styles.filterToggle} ${styles.filterTransition}`}
                onClick={handleOpenModal}
                aria-label="باز کردن فیلترهای دوره‌ها"
                tabIndex={0}
              >
                <TuneIcon />
              </IconButton>
            )}
          </div>

          <div className={styles.contentWrapper}>
            {!isMobile && <div className={styles.sidebar}>{renderFilters()}</div>}
            <div className={styles.mainContent}>
              <div className={styles.sortContainer}>
                <label htmlFor="sort">مرتب‌سازی: </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                  aria-label="مرتب‌سازی دوره‌های دندانپزشکی"
                >
                  <option value="title">عنوان</option>
                  <option value="price">قیمت</option>
                  <option value="startDate">تاریخ شروع</option>
                  <option value="rating">محبوب‌ترین</option>
                  <option value="enrollment">تعداد ثبت‌نام</option>
                </select>
              </div>
              <p className={styles.resultsCount} aria-live="polite">
                {filteredCourses.length} دوره یافت شد
              </p>
              <div className={styles.coursesGrid}>
                {currentCourses.map((course) => {
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

              {filteredCourses.length === 0 && (
                <p className={styles.noResults} role="alert" aria-live="polite">
                  هیچ دوره‌ای با فیلترهای انتخاب‌شده یافت نشد.
                </p>
              )}

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={`${styles.pageButton} ${styles.filterTransition}`}
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-disabled={currentPage === 1}
                    aria-label="صفحه قبلی دوره‌ها"
                    tabIndex={0}
                  >
                    قبلی
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`${styles.pageButton} ${currentPage === page ? styles.activePage : styles.filterTransition}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                      tabIndex={0}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className={`${styles.pageButton} ${styles.filterTransition}`}
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-disabled={currentPage === totalPages}
                    aria-label="صفحه بعدی دوره‌ها"
                    tabIndex={0}
                  >
                    بعدی
                  </button>
                </div>
              )}
            </div>
          </div>

          <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="filter-modal-title"
            aria-modal="true"
            className={`${styles.modal} ${styles.modalTransition}`}
          >
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 id="filter-modal-title">فیلترهای دوره‌ها</h2>
                <IconButton
                  onClick={handleCloseModal}
                  aria-label="بستن مودال فیلترها"
                  tabIndex={0}
                >
                  <TuneIcon />
                </IconButton>
              </div>
              {renderFilters()}
            </div>
          </Modal>
        </div>
      </section>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: currentCourses.map((course, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Course',
              name: DOMPurify.sanitize(course.title),
              description: DOMPurify.sanitize(course.description),
              provider: {
                '@type': 'Organization',
                name: DOMPurify.sanitize(course.university),
              },
              instructor: {
                '@type': 'Person',
                name: DOMPurify.sanitize(course.instructor),
              },
              offers: {
                '@type': 'Offer',
                price: DOMPurify.sanitize(course.discountPrice || course.price),
                priceCurrency: 'IRR',
              },
              courseMode: course.courseType,
              image: course.image,
            },
          })),
        })}
      </script>
    </>
  );
};

export default Courses;