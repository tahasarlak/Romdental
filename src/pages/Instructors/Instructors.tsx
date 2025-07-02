import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import styles from './Instructors.module.css';
import { useInstructorContext } from '../../Context/InstructorContext';
import { useCourseContext } from '../../Context/CourseContext';
import { useReviewContext } from '../../Context/ReviewContext';
import { useWishlistContext } from '../../Context/WishlistContext';
import { useAuthContext } from '../../Context/AuthContext';
import InstructorCard from '../../components/InstructorCard/InstructorCard';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

interface Instructor {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  experience: string;
  coursesTaught: string[];
}

const Instructors: React.FC = () => {
  const { instructors } = useInstructorContext();
  const { courses } = useCourseContext();
  const { reviews } = useReviewContext();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
  const instructorsPerPage = 8;

  // Filter unique instructors from courses
  const uniqueInstructorsFromCourses = useMemo(() => {
    const courseInstructors = new Set(courses.map((course) => course.instructor));
    return instructors.filter((instructor) => courseInstructors.has(instructor.name));
  }, [instructors, courses]);

  // Map instructor names to their taught courses and calculate average rating
  const updatedInstructors = useMemo(() => {
    return uniqueInstructorsFromCourses.map((instructor) => {
      const instructorCourses = courses.filter((course) => course.instructor === instructor.name);
      const courseIds = instructorCourses.map((course) => course.id);
      const instructorReviews = reviews.filter((review) => courseIds.includes(review.courseId));
      const averageRating = instructorReviews.length > 0
        ? (instructorReviews.reduce((sum, r) => sum + r.rating, 0) / instructorReviews.length).toFixed(1)
        : '0.0';

      return {
        ...instructor,
        coursesTaught: instructorCourses.map((course) => course.title),
        averageRating,
        totalStudents: instructorCourses.reduce((sum, course) => sum + course.enrollmentCount, 0),
      };
    });
  }, [uniqueInstructorsFromCourses, courses, reviews]);

  // Filter and sort instructors
  const filteredInstructors = useMemo(() => {
    return updatedInstructors
      .filter((instructor) =>
        filterSpecialty === 'all' ? true : instructor.specialty === filterSpecialty
      )
      .filter((instructor) =>
        instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        instructor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'experience') return parseInt(b.experience) - parseInt(a.experience);
        if (sortBy === 'rating') return parseFloat(b.averageRating) - parseFloat(a.averageRating);
        if (sortBy === 'students') return b.totalStudents - a.totalStudents;
        return 0;
      });
  }, [updatedInstructors, filterSpecialty, searchQuery, sortBy]);

  // Pagination logic
  const indexOfLastInstructor = currentPage * instructorsPerPage;
  const indexOfFirstInstructor = indexOfLastInstructor - instructorsPerPage;
  const currentInstructors = filteredInstructors.slice(indexOfFirstInstructor, indexOfLastInstructor);
  const totalPages = Math.ceil(filteredInstructors.length / instructorsPerPage);

  // Handle loading and error states
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (!instructors.length) {
        setError('استادی یافت نشد.');
      }
    }, 500);
  }, [instructors]);

  // Pagination function
  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Toggle wishlist
  const toggleWishlist = useCallback((instructorId: number) => {
    if (!isAuthenticated) {
      setOpenLoginModal(true);
      return;
    }
    if (isInWishlist(instructorId, 'instructor')) {
      removeFromWishlist(instructorId, 'instructor');
    } else {
      addToWishlist(instructorId, 'instructor');
    }
  }, [addToWishlist, removeFromWishlist, isInWishlist, isAuthenticated]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilterSpecialty('all');
    setSearchQuery('');
    setSortBy('name');
    setCurrentPage(1);
  }, []);

  // Modal handlers
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleCloseLoginModal = () => setOpenLoginModal(false);

  // Unique specialties
  const specialties = useMemo(() => ['all', ...new Set(updatedInstructors.map((instructor) => instructor.specialty))], [updatedInstructors]);

  // Render filters
  const renderFilters = () => (
    <div className={styles.filterContainer}>
      <h3>فیلترها</h3>
      <div className={styles.filterGroup}>
        <label>تخصص:</label>
        {specialties.map((specialty) => (
          <button
            key={specialty}
            className={`${styles.filterButton} ${filterSpecialty === specialty ? styles.active : ''}`}
            onClick={() => setFilterSpecialty(specialty)}
            aria-pressed={filterSpecialty === specialty}
          >
            {specialty === 'all' ? 'همه تخصص‌ها' : specialty}
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
      <section className={styles.instructorsSection}>
        <div className={styles.container}>
          <div className={styles.loading}>در حال بارگذاری...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.instructorsSection}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.instructorsSection}>
      <div className={styles.container}><Breadcrumb />
        <h1 className={styles.title}>اساتید روم دنتال</h1>
        <p className={styles.subtitle}>
          با برترین اساتید دندانپزشکی، دانش و تجربه را به دست آورید
        </p>

        <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            placeholder="جستجو بر اساس نام یا تخصص..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            aria-label="جستجوی اساتید"
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
                aria-label="مرتب‌سازی اساتید"
              >
                <option value="name">نام</option>
                <option value="experience">تجربه</option>
                <option value="rating">امتیاز</option>
                <option value="students">تعداد دانشجویان</option>
              </select>
            </div>

            <div className={styles.instructorsGrid}>
              {currentInstructors.map((instructor) => (
                <InstructorCard
                  key={instructor.id}
                  instructor={instructor}
                  toggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist}
                />
              ))}
            </div>

            {filteredInstructors.length === 0 && (
              <p className={styles.noResults}>هیچ استادی یافت نشد.</p>
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

        <Modal
          open={openLoginModal}
          onClose={handleCloseLoginModal}
          aria-labelledby="login-modal-title"
          className={styles.modal}
        >
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 id="login-modal-title">نیاز به ورود</h2>
              <IconButton onClick={handleCloseLoginModal} aria-label="بستن مودال">
                <FilterListIcon />
              </IconButton>
            </div>
            <p>برای افزودن استاد به لیست علاقه‌مندی‌ها، لطفاً وارد حساب کاربری خود شوید.</p>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
              aria-label="رفتن به صفحه ورود"
            >
              ورود به حساب کاربری
            </Button>
          </div>
        </Modal>
      </div>
    </section>
  );
};

export default Instructors;