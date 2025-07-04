import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import styles from './Courses.module.css';
import { useCourseContext } from '../../Context/CourseContext';
import { useInstructorContext } from '../../Context/InstructorContext';
import { useReviewContext } from '../../Context/ReviewContext';
import { useCartContext } from '../../Context/CartContext';
import { useWishlistContext } from '../../Context/WishlistContext';
import CourseCard from '../../components/CourseCard/CourseCard';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

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
  discountMiPercentage?: number;
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

interface ReviewItem {
  id: number;
  courseId: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

const Courses: React.FC = () => {
  const { courses } = useCourseContext();
  const { instructors } = useInstructorContext();
  const { reviews } = useReviewContext();
  const { addToCart, removeFromCart, cartItems } = useCartContext();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const coursesPerPage = 8;

  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([1]);

  const instructorNames = useMemo(() => new Set(instructors.map((instructor) => instructor.name)), [instructors]);

  const uniqueCourseNumbers = useMemo(() => ['all', ...new Set(courses.map((course) => course.courseNumber))].sort(), [courses]);
  const uniqueCategories = useMemo(() => ['all', ...new Set(courses.map((course) => course.category))].sort(), [courses]);
  const uniqueInstructors = useMemo(() => ['all', ...new Set(courses.map((course) => course.instructor))].sort(), [courses]);
  const uniqueStatuses = useMemo(() => ['all', 'open', 'closed'], [courses]);
  const uniqueCourseTypes = useMemo(() => ['all', 'Online', 'Offline', 'In-Person', 'Hybrid'], [courses]);
  const uniqueUniversities = useMemo(() => ['all', 'Smashko', 'Piragova', 'RUDN', 'Sechenov'].sort(), [courses]);

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
      .filter((course) => filterCourseNumber === 'all' ? true : course.courseNumber === filterCourseNumber)
      .filter((course) => filterCategory === 'all' ? true : course.category === filterCategory)
      .filter((course) => filterStatus === 'all' ? true : filterStatus === 'open' ? course.isOpen : !course.isOpen)
      .filter((course) => filterInstructor === 'all' ? true : course.instructor === filterInstructor)
      .filter((course) => filterCourseType === 'all' ? true : course.courseType === filterCourseType)
      .filter((course) => filterUniversity === 'all' ? true : course.university === filterUniversity)
      .filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'price') {
          const priceA = a.discountPrice ? parseInt(a.discountPrice.replace(/[^0-9]/g, '')) : parseInt(a.price.replace(/[^0-9]/g, ''));
          const priceB = b.discountPrice ? parseInt(b.discountPrice.replace(/[^0-9]/g, '')) : parseInt(b.price.replace(/[^0-9]/g, ''));
          return priceA - priceB;
        }
        if (sortBy === 'startDate') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        if (sortBy === 'rating') {
          const courseReviewsA = reviews.filter((review) => review.courseId === a.id);
          const courseReviewsB = reviews.filter((review) => review.courseId === b.id);
          const avgRatingA = courseReviewsA.length > 0
            ? courseReviewsA.reduce((sum: number, r: ReviewItem) => sum + r.rating, 0) / courseReviewsA.length
            : 0;
          const avgRatingB = courseReviewsB.length > 0
            ? courseReviewsB.reduce((sum: number, r: ReviewItem) => sum + r.rating, 0) / courseReviewsB.length
            : 0;
          return avgRatingB - avgRatingA;
        }
        if (sortBy === 'enrollment') return b.enrollmentCount - a.enrollmentCount;
        return 0;
      });
  }, [courses, filterCourseNumber, filterCategory, filterStatus, filterInstructor, filterCourseType, filterUniversity, searchQuery, sortBy, reviews]);

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isCartItem = useCallback((courseId: number) => {
    return cartItems.some((item) => item.id === courseId);
  }, [cartItems]);

  const handleAddToCart = useCallback((course: Course) => {
    if (isCartItem(course.id)) {
      removeFromCart(course.id);
      setEnrolledCourses((prev) => prev.filter((id) => id !== course.id));
    } else {
      addToCart({ id: course.id, title: course.title, price: course.discountPrice || course.price });
      setEnrolledCourses((prev) => [...prev, course.id]);
    }
  }, [addToCart, removeFromCart, isCartItem, setEnrolledCourses]);

  const handleWishlistToggle = useCallback((courseId: number) => {
    if (isInWishlist(courseId, 'course')) {
      removeFromWishlist(courseId, 'course');
    } else {
      addToWishlist(courseId, 'course');
    }
  }, [addToWishlist, removeFromWishlist, isInWishlist]);

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
  }, []);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const renderFilters = () => (
    <div className={styles.filterContainer}>
      <h3>فیلترها</h3>
      <div className={styles.filterGroup}>
        <label>کورس:</label>
        {uniqueCourseNumbers.map((courseNumber) => (
          <button
            key={courseNumber}
            className={`${styles.filterButton} ${filterCourseNumber === courseNumber ? styles.active : ''}`}
            onClick={() => setFilterCourseNumber(courseNumber)}
            aria-pressed={filterCourseNumber === courseNumber}
          >
            {courseNumber === 'all' ? 'همه' : courseNumber}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label>دسته‌بندی:</label>
        {uniqueCategories.map((category) => (
          <button
            key={category}
            className={`${styles.filterButton} ${filterCategory === category ? styles.active : ''}`}
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
            className={`${styles.filterButton} ${filterStatus === status ? styles.active : ''}`}
            onClick={() => setFilterStatus(status)}
            aria-pressed={filterStatus === status}
          >
            {status === 'all' ? 'همه' : status === 'open' ? 'باز' : 'بسته'}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label>استاد:</label>
        {uniqueInstructors.map((instructor) => (
          <button
            key={instructor}
            className={`${styles.filterButton} ${filterInstructor === instructor ? styles.active : ''}`}
            onClick={() => setFilterInstructor(instructor)}
            aria-pressed={filterInstructor === instructor}
          >
            {instructor === 'all' ? 'همه' : instructor}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label>نوع دوره:</label>
        {uniqueCourseTypes.map((courseType) => (
          <button
            key={courseType}
            className={`${styles.filterButton} ${filterCourseType === courseType ? styles.active : ''}`}
            onClick={() => setFilterCourseType(courseType)}
            aria-pressed={filterCourseType === courseType}
          >
            {courseType === 'all' ? 'همه' : courseType === 'Online' ? 'آنلاین' : courseType === 'Offline' ? 'آفلاین' : courseType === 'In-Person' ? 'حضوری' : 'ترکیبی'}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label>دانشگاه:</label>
        {uniqueUniversities.map((university) => (
          <button
            key={university}
            className={`${styles.filterButton} ${filterUniversity === university ? styles.active : ''}`}
            onClick={() => setFilterUniversity(university)}
            aria-pressed={filterUniversity === university}
          >
            {university === 'all' ? 'همه' : university}
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
  );

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
      <Breadcrumb />
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
          <IconButton
            className={styles.filterToggle}
            onClick={handleOpenModal}
            aria-label="باز کردن فیلترها"
          >
            <FilterListIcon />
          </IconButton>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.sidebar}>
            {renderFilters()}
          </div>
          <div className={styles.mainContent}>
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
                <option value="rating">محبوب‌ترین</option>
                <option value="enrollment">تعداد ثبت‌نام</option>
              </select>
            </div>

            <div className={styles.coursesGrid}>
              {currentCourses.map((course) => {
                const courseReviews = reviews.filter((review: ReviewItem) => review.courseId === course.id);
                const averageRating = courseReviews.length > 0
                  ? (courseReviews.reduce((sum: number, r: ReviewItem) => sum + r.rating, 0) / courseReviews.length).toFixed(1)
                  : '0.0';
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={enrolledCourses.includes(course.id)}
                    isCartItem={isCartItem}
                    handleAddToCart={handleAddToCart}
                    handleWishlistToggle={handleWishlistToggle}
                    isInWishlist={isInWishlist}
                    instructorNames={instructorNames}
                    averageRating={averageRating}
                    courseReviewsLength={courseReviews.length}
                  />
                );
              })}
            </div>

            {filteredCourses.length === 0 && (
              <p className={styles.noResults}>هیچ دوره‌ای یافت نشد。</p>
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
                    className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
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
        </div>

        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="filter-modal-title"
          className={styles.modal}
        >
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 id="filter-modal-title">فیلترها</h2>
              <IconButton onClick={handleCloseModal} aria-label="بستن مودال">
                <FilterListIcon />
              </IconButton>
            </div>
            {renderFilters()}
          </div>
        </Modal>
      </div>
    </section>
  );
};

export default Courses;