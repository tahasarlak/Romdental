import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { useInstructorContext } from '../../Context/InstructorContext';
import { Instructor } from '../../types/types';
import { useCourseContext } from '../../Context/CourseContext';
import { useWishlistContext } from '../../Context/WishlistContext';
import { useNotificationContext } from '../../Context/NotificationContext';
import InstructorCard from '../../components/InstructorCard/InstructorCard';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import styles from './Instructors.module.css';
import { useAuthContext } from '../../Context/Auth/UserAuthContext';

const Instructors: React.FC = () => {
  const { instructors, loading, fetchInstructors } = useInstructorContext();
  const { courses } = useCourseContext();
  const { isInWishlist, toggleWishlist, isWishlistLoading } = useWishlistContext();
  const { isAuthenticated } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const instructorsPerPage = 8;
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debounce function for search input
  const debounce = <F extends (...args: any[]) => void>(func: F, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<F>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Handle search input with debounce
  const handleSearchChange = useCallback(
    debounce((value: string) => {
      setSearchQuery(DOMPurify.sanitize(value));
    }, 300),
    []
  );

  // Filter instructors based on courses
  const instructorsWithMetrics = useMemo(() => {
    const courseInstructors = new Set(courses.map((course) => course.instructor));
    return instructors.filter((instructor) => courseInstructors.has(instructor.name));
  }, [instructors, courses]);

  // Filter and sort instructors
  const filteredInstructors = useMemo(() => {
    const parseExperience = (exp: string) => {
      const num = parseInt(exp.replace(/[^0-9]/g, '')) || 0;
      return isNaN(num) ? 0 : num;
    };

    return instructorsWithMetrics
      .filter((instructor) => (filterSpecialty === 'all' ? true : instructor.specialty === filterSpecialty))
      .filter(
        (instructor) =>
          instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          instructor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'experience') return parseExperience(b.experience) - parseExperience(a.experience);
        if (sortBy === 'rating') return parseFloat(b.averageRating || '0') - parseFloat(a.averageRating || '0');
        return 0;
      });
  }, [instructorsWithMetrics, filterSpecialty, searchQuery, sortBy]);

  const indexOfLastInstructor = currentPage * instructorsPerPage;
  const indexOfFirstInstructor = indexOfLastInstructor - instructorsPerPage;
  const currentInstructors = filteredInstructors.slice(indexOfFirstInstructor, indexOfLastInstructor);
  const totalPages = Math.ceil(filteredInstructors.length / instructorsPerPage);

  const paginate = useCallback(
    (pageNumber: number) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [totalPages]
  );

  const clearFilters = useCallback(() => {
    setFilterSpecialty('all');
    setSearchQuery('');
    setSortBy('name');
    setCurrentPage(1);
    showNotification('فیلترها با موفقیت پاک شدند.', 'success');
  }, [showNotification]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleCloseLoginModal = () => setOpenLoginModal(false);

  // Focus management for modal
  useEffect(() => {
    if (openModal && modalRef.current) {
      modalRef.current.focus();
    }
  }, [openModal]);

  const specialties = useMemo(() => ['all', ...new Set(instructorsWithMetrics.map((instructor) => instructor.specialty))].sort(), [
    instructorsWithMetrics,
  ]);

  const renderFilters = () => (
    <div className={styles.filterContainer}>
      <h3>فیلترها</h3>
      <div className={styles.filterGroup}>
        <label htmlFor="filter-specialty">تخصص:</label>
        {specialties.map((specialty) => (
          <button
            key={specialty}
            className={`${styles.filterButton} ${filterSpecialty === specialty ? styles.active : styles.filterTransition}`}
            onClick={() => setFilterSpecialty(specialty)}
            aria-pressed={filterSpecialty === specialty}
            tabIndex={0}
          >
            {specialty === 'all' ? 'همه تخصص‌ها' : specialty}
          </button>
        ))}
      </div>
      <button
        className={`${styles.clearButton} ${styles.filterTransition}`}
        onClick={clearFilters}
        aria-label="پاک کردن فیلترهای اساتید"
        tabIndex={0}
      >
        پاک کردن فیلترها
      </button>
    </div>
  );

  // Pagination with ellipsis
  const renderPagination = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;
    const halfWindow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - halfWindow);
      let endPage = Math.min(totalPages, currentPage + halfWindow);

      if (currentPage <= halfWindow) {
        endPage = maxPagesToShow;
      } else if (currentPage + halfWindow >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      if (startPage > 1) pages.push(1);
      if (startPage > 2) pages.push('...');
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      if (endPage < totalPages - 1) pages.push('...');
      if (endPage < totalPages) pages.push(totalPages);
    }

    return (
      <div className={styles.pagination}>
        <button
          className={`${styles.pageButton} ${styles.filterTransition}`}
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          aria-disabled={currentPage === 1}
          aria-label={`رفتن به صفحه قبلی (صفحه ${currentPage - 1})`}
          tabIndex={0}
        >
          قبلی
        </button>
        {pages.map((page, index) =>
          typeof page === 'string' ? (
            <span key={`ellipsis-${index}`} className={styles.ellipsisButton}>
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => paginate(page)}
              className={`${styles.pageButton} ${currentPage === page ? styles.activePage : styles.filterTransition}`}
              aria-current={currentPage === page ? 'page' : undefined}
              aria-label={`رفتن به صفحه ${page}`}
              tabIndex={0}
            >
              {page}
            </button>
          )
        )}
        <button
          className={`${styles.pageButton} ${styles.filterTransition}`}
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-disabled={currentPage === totalPages}
          aria-label={`رفتن به صفحه بعدی (صفحه ${currentPage + 1})`}
          tabIndex={0}
        >
          بعدی
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <section className={styles.instructorsSection} role="main">
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
      <section className={styles.instructorsSection} role="main">
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
        <title>اساتید روم دنتال</title>
        <meta
          name="description"
          content="با برترین اساتید دندانپزشکی در روم دنتال آشنا شوید و از تجربه و دانش آن‌ها بهره‌مند شوید."
        />
        <meta name="keywords" content="اساتید دندانپزشکی, آموزش دندانپزشکی, روم دنتال" />
        <meta property="og:title" content="اساتید روم دنتال" />
        <meta
          property="og:description"
          content="با برترین اساتید دندانپزشکی در روم دنتال آشنا شوید و از تجربه و دانش آن‌ها بهره‌مند شوید."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roomdental.com/instructors" />
        <meta property="og:site_name" content="روم دنتال" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: currentInstructors.map((instructor, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Person',
                name: DOMPurify.sanitize(instructor.name),
                description: DOMPurify.sanitize(instructor.bio),
                jobTitle: DOMPurify.sanitize(instructor.specialty),
                image: instructor.image || '/assets/logo.jpg',
              },
            })),
          })}
        </script>
      </Helmet>
      <section className={styles.instructorsSection} role="main">
        <div className={styles.container}>
          <Breadcrumb />
          <h1 className={styles.title}>اساتید روم دنتال</h1>
          <p className={styles.subtitle}>
            با برترین اساتید دندانپزشکی، دانش و تجربه را به دست آورید
          </p>

          <div className={styles.searchContainer}>
            <SearchIcon className={styles.searchIcon} aria-hidden="true" />
            <input
              type="text"
              placeholder="جستجو بر اساس نام یا تخصص..."
              onChange={(e) => handleSearchChange(e.target.value)}
              className={styles.searchInput}
              aria-label="جستجوی اساتید دندانپزشکی"
              id="search-input"
            />
            {isMobile && (
              <IconButton
                className={`${styles.filterToggle} ${styles.filterTransition}`}
                onClick={handleOpenModal}
                aria-label="باز کردن فیلترهای اساتید"
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
                  aria-label="مرتب‌سازی اساتید دندانپزشکی"
                >
                  <option value="name">نام</option>
                  <option value="experience">تجربه</option>
                  <option value="rating">محبوب‌ترین‌ها</option>
                </select>
              </div>
              <p className={styles.resultsCount} aria-live="polite">
                {filteredInstructors.length} استاد یافت شد
              </p>
              <div className={styles.instructorsGrid}>
                {currentInstructors.map((instructor) => (
                  <InstructorCard
                    key={instructor.id}
                    instructor={instructor}
                    toggleWishlist={() => toggleWishlist(instructor.id, 'instructor', DOMPurify.sanitize(instructor.name))}
                    isInWishlist={isInWishlist}
                    isWishlistLoading={isWishlistLoading}
                  />
                ))}
              </div>

              {filteredInstructors.length === 0 && (
                <p className={styles.noResults} role="alert" aria-live="polite">
                  هیچ استادی با فیلترهای انتخاب‌شده یافت نشد.
                </p>
              )}

              {totalPages > 1 && renderPagination()}
            </div>
          </div>

          <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="filter-modal-title"
            aria-modal="true"
            className={`${styles.modal} ${styles.modalTransition}`}
          >
            <div className={styles.modalContent} ref={modalRef} tabIndex={-1}>
              <div className={styles.modalHeader}>
                <h2 id="filter-modal-title">فیلترهای اساتید</h2>
                <IconButton onClick={handleCloseModal} aria-label="بستن مودال فیلترها" tabIndex={0}>
                  <TuneIcon />
                </IconButton>
              </div>
              {renderFilters()}
            </div>
          </Modal>

          <Modal
            open={openLoginModal}
            onClose={handleCloseLoginModal}
            aria-labelledby="login-modal-title"
            aria-modal="true"
            className={`${styles.modal} ${styles.modalTransition}`}
          >
            <div className={styles.modalContent} tabIndex={-1}>
              <div className={styles.modalHeader}>
                <h2 id="login-modal-title">نیاز به ورود</h2>
                <IconButton onClick={handleCloseLoginModal} aria-label="بستن مودال ورود" tabIndex={0}>
                  <TuneIcon />
                </IconButton>
              </div>
              <p>برای افزودن استاد به لیست علاقه‌مندی‌ها، لطفاً وارد حساب کاربری خود شوید.</p>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/login')}
                aria-label="رفتن به صفحه ورود"
                tabIndex={0}
              >
                ورود به حساب کاربری
              </Button>
            </div>
          </Modal>
        </div>
      </section>
    </>
  );
};

export default Instructors;