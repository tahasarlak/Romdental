import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PeopleIcon from '@mui/icons-material/People';
import Tooltip from '@mui/material/Tooltip';
import styles from './Courses.module.css';
import { useCourseContext } from '../../Context/CourseContext';

interface Course {
  id: number;
  title: string;
  instructor: string;
  description: string;
  duration: string;
  level: string;
  category: string;
  image: string;
  price: string;
  startDate: string;
  isOpen: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  syllabus: { completed?: boolean }[];
  reviews: { rating: number }[];
  tags?: string[];
  prerequisites?: string[];
}

const Courses: React.FC = () => {
  const { courses } = useCourseContext();
  const navigate = useNavigate();
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterInstructor, setFilterInstructor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('title');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const coursesPerPage = 6;

  // Mock enrollment status (replace with auth context or API)
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([1]); // Mock: enrolled in course ID 1
  const [wishlist, setWishlist] = useState<number[]>([]); // Mock wishlist

  // Derive unique filter options from courses
  const uniqueLevels = useMemo(() => {
    const levels = Array.from(new Set(courses.map((course) => course.level)));
    return ['all', ...levels.sort()];
  }, [courses]);

  const uniqueCategories = useMemo(() => {
    const categories = Array.from(new Set(courses.map((course) => course.category)));
    return ['all', ...categories.sort()];
  }, [courses]);

  const uniqueInstructors = useMemo(() => {
    const instructors = Array.from(new Set(courses.map((course) => course.instructor)));
    return ['all', ...instructors.sort()];
  }, [courses]);

  const uniqueStatuses = useMemo(() => {
    return ['all', 'open', 'closed'];
  }, [courses]);

  // Simulate data fetching (replace with API in production)
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (!courses.length) {
        setError('دوره‌ای یافت نشد.');
      }
    }, 500);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) =>
        filterLevel === 'all' ? true : course.level === filterLevel
      )
      .filter((course) =>
        filterCategory === 'all' ? true : course.category === filterCategory
      )
      .filter((course) =>
        filterStatus === 'all'
          ? true
          : filterStatus === 'open'
          ? course.isOpen
          : !course.isOpen
      )
      .filter((course) =>
        filterInstructor === 'all' ? true : course.instructor === filterInstructor
      )
      .filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'price')
          return (
            parseInt(a.price.replace(/[^0-9]/g, '')) -
            parseInt(b.price.replace(/[^0-9]/g, ''))
          );
        if (sortBy === 'startDate')
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        if (sortBy === 'rating') {
          const avgRatingA =
            a.reviews.length > 0
              ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length
              : 0;
          const avgRatingB =
            b.reviews.length > 0
              ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
              : 0;
          return avgRatingB - avgRatingA;
        }
        if (sortBy === 'enrollment') return b.enrollmentCount - a.enrollmentCount;
        return 0;
      });
  }, [
    courses,
    filterLevel,
    filterCategory,
    filterStatus,
    filterInstructor,
    searchQuery,
    sortBy,
  ]);

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleEnroll = useCallback(
    (courseId: number) => {
      if (!enrolledCourses.includes(courseId)) {
        navigate(`/checkout/${courseId}`);
      }
    },
    [enrolledCourses, navigate]
  );

  const toggleWishlist = useCallback((courseId: number) => {
    setWishlist((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setFilterLevel('all');
    setFilterCategory('all');
    setFilterStatus('all');
    setFilterInstructor('all');
    setSearchQuery('');
    setSortBy('title');
    setCurrentPage(1);
  }, []);

  if (isLoading) {
    return (
      <section className={styles.coursesSection}>
        <div className={styles.container}>
          <div className={styles.loading}>در حال بارگذاری...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.coursesSection}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.coursesSection}>
      <div className={styles.container}>
        <h1 className={styles.title}>دوره‌های آموزشی روم دنتال</h1>
        <p className={styles.subtitle}>
          با بهترین اساتید و محتوای به‌روز، مهارت‌های خود را ارتقا دهید
        </p>

        <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            placeholder="جستجو بر اساس عنوان یا استاد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            aria-label="جستجوی دوره‌ها"
          />
        </div>

        <div className={styles.controls}>
          <div className={styles.filterContainer}>
            <h3>فیلترها</h3>
            <div className={styles.filterGroup}>
              <label>سطح:</label>
              {uniqueLevels.map((level) => (
                <button
                  key={level}
                  className={`${styles.filterButton} ${
                    filterLevel === level ? styles.active : ''
                  }`}
                  onClick={() => setFilterLevel(level)}
                  aria-pressed={filterLevel === level}
                >
                  {level === 'all' ? 'همه' : level}
                </button>
              ))}
            </div>
            <div className={styles.filterGroup}>
              <label>دسته‌بندی:</label>
              {uniqueCategories.map((category) => (
                <button
                  key={category}
                  className={`${styles.filterButton} ${
                    filterCategory === category ? styles.active : ''
                  }`}
                  onClick={() => setFilterCategory(category)}
                  aria-pressed={filterCategory === category}
                >
                  {category === 'all' ? 'همه' : category}
                </button>
              ))}
            </div>
            <div className={styles.filterGroup}>
              <label>وضعیت:</label>
              {uniqueStatuses.map((status) => (
                <button
                  key={status}
                  className={`${styles.filterButton} ${
                    filterStatus === status ? styles.active : ''
                  }`}
                  onClick={() => setFilterStatus(status)}
                  aria-pressed={filterStatus === status}
                >
                  {status === 'all'
                    ? 'همه'
                    : status === 'open'
                    ? 'باز'
                    : 'بسته'}
                </button>
              ))}
            </div>
            <div className={styles.filterGroup}>
              <label>استاد:</label>
              {uniqueInstructors.map((instructor) => (
                <button
                  key={instructor}
                  className={`${styles.filterButton} ${
                    filterInstructor === instructor ? styles.active : ''
                  }`}
                  onClick={() => setFilterInstructor(instructor)}
                  aria-pressed={filterInstructor === instructor}
                >
                  {instructor === 'all' ? 'همه' : instructor}
                </button>
              ))}
            </div>
            <button
              className={styles.clearButton}
              onClick={clearFilters}
              aria-label="پاک کردن فیلترها"
            >
              پاک کردن فیلترها
            </button>
          </div>

          <div className={styles.sortContainer}>
            <label htmlFor="sort">مرتب‌سازی: </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
              aria-label="مرتب‌سازی دوره‌ها"
            >
              <option value="title">عنوان</option>
              <option value="price">قیمت</option>
              <option value="startDate">تاریخ شروع</option>
              <option value="rating">امتیاز</option>
              <option value="enrollment">تعداد ثبت‌نام</option>
            </select>
          </div>
        </div>

        <div className={styles.coursesGrid}>
          {currentCourses.map((course) => {
            const isEnrolled = enrolledCourses.includes(course.id);
            const completedItems = (course.syllabus || []).filter(
              (item) => item.completed
            ).length;
            const totalItems = (course.syllabus || []).length;
            const progressPercentage =
              totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
            const averageRating =
              course.reviews.length > 0
                ? (
                    course.reviews.reduce((sum, r) => sum + r.rating, 0) /
                    course.reviews.length
                  ).toFixed(1)
                : '0.0';

            return (
              <div
                key={course.id}
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
                      onError={(e) => {
                        e.currentTarget.src = '/assets/logo.jpg';
                      }}
                    />
                    <div className={styles.imageSkeleton} />
                  </div>
                  {course.isFeatured && (
                    <span className={styles.featuredBadge}>ویژه</span>
                  )}
                </div>
                <div className={styles.courseContent}>
                  <h2
                    id={`course-title-${course.id}`}
                    className={styles.courseTitle}
                  >
                    {course.title}
                  </h2>
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
                      {averageRating} ({course.reviews.length} نظر)
                    </span>
                  </div>
                  <p className={styles.description}>{course.description}</p>
                  <div className={styles.details}>
                    <Tooltip title="مدت دوره">
                      <span>
                        <AccessTimeIcon /> {course.duration}
                      </span>
                    </Tooltip>
                    <Tooltip title="سطح دوره">
                      <span>
                        <TrendingUpIcon /> {course.level}
                      </span>
                    </Tooltip>
                    <Tooltip title="قیمت دوره">
                      <span>
                        <AttachMoneyIcon /> {course.price}
                      </span>
                    </Tooltip>
                    <Tooltip title="تاریخ شروع">
                      <span>
                        <CalendarTodayIcon /> {course.startDate}
                      </span>
                    </Tooltip>
                    <Tooltip title="تعداد ثبت‌نام">
                      <span>
                        <PeopleIcon /> {course.enrollmentCount} نفر
                      </span>
                    </Tooltip>
                  </div>
                  {isEnrolled && totalItems > 0 && (
                    <div className={styles.progressContainer}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <span className={styles.progressText}>
                        {Math.round(progressPercentage)}% کامل شده
                      </span>
                    </div>
                  )}
                  <div className={styles.actions}>
                    <button
                      className={styles.enrollButton}
                      disabled={!course.isOpen || isEnrolled}
                      onClick={() => handleEnroll(course.id)}
                      aria-label={
                        isEnrolled
                          ? 'شما در این دوره ثبت‌نام کرده‌اید'
                          : course.isOpen
                          ? 'ثبت‌نام در دوره'
                          : 'ثبت‌نام بسته است'
                      }
                    >
                      {isEnrolled
                        ? 'ثبت‌نام شده'
                        : course.isOpen
                        ? 'ثبت‌نام در دوره'
                        : 'ثبت‌نام بسته است'}
                    </button>
                    <Link
                      to={`/courses/${course.id}`}
                      className={styles.detailsLink}
                      aria-label={`جزئیات بیشتر درباره ${course.title}`}
                    >
                      جزئیات بیشتر
                    </Link>
                    <Tooltip title={wishlist.includes(course.id) ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}>
                      <button
                        className={styles.wishlistButton}
                        onClick={() => toggleWishlist(course.id)}
                        aria-label={wishlist.includes(course.id) ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                      >
                        <FavoriteBorderIcon
                          className={
                            wishlist.includes(course.id)
                              ? styles.wishlistIconActive
                              : styles.wishlistIcon
                          }
                        />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <p className={styles.noResults}>هیچ دوره‌ای یافت نشد.</p>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="صفحه قبلی"
            >
              قبلی
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`${styles.pageButton} ${
                  currentPage === page ? styles.activePage : ''
                }`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
            <button
              className={styles.pageButton}
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="صفحه بعدی"
            >
              بعدی
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Courses;
