import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LazyLoad from 'react-lazyload';
import debounce from 'lodash.debounce';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import styles from './Blog.module.css';
import { useBlogContext } from '../../Context/BlogContext';
import { useAuthContext } from '../../Context/AuthContext';
import { useWishlistContext } from '../../Context/WishlistContext';
import { useNotificationContext } from '../../Context/NotificationContext';
import BlogCard from '../../components/BlogCard/BlogCard';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import DOMPurify from 'dompurify';
import { POSTS_PER_PAGE } from '../../config'; // تنظیمات ثابت

/**
 * Blog Component
 * Displays a list of blog posts with search, filter, sort, and pagination functionality.
 * Supports responsive design with a modal for filters on mobile devices.
 * Includes SEO optimization and lazy loading for performance.
 */
const Blog: React.FC = () => {
  const { blogPosts } = useBlogContext();
  const { isAuthenticated } = useAuthContext();
  const { isInWishlist, toggleWishlist, isWishlistLoading } = useWishlistContext();
  const { showNotification } = useNotificationContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAuthor, setFilterAuthor] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  // مدیریت تغییر اندازه صفحه
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoized unique filters
  const uniqueCategories = useMemo(() => ['all', ...new Set(blogPosts.map((post) => post.category))].sort(), [blogPosts]);
  const uniqueAuthors = useMemo(() => ['all', ...new Set(blogPosts.map((post) => post.author))].sort(), [blogPosts]);
  const uniqueTags = useMemo(() => ['all', ...new Set(blogPosts.flatMap((post) => post.tags))].sort(), [blogPosts]);

  // مدیریت لودینگ و خطاها
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (!blogPosts.length) {
        setError('هیچ پستی یافت نشد. لطفاً فیلترها را بررسی کنید یا بعداً تلاش کنید.');
      }
    }, 500);
  }, [blogPosts]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
        setCurrentPage(1); // Reset to first page on search
      }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // Filtered and sorted posts
  const filteredPosts = useMemo(() => {
    return blogPosts
      .filter((post) => (filterCategory === 'all' ? true : post.category === filterCategory))
      .filter((post) => (filterAuthor === 'all' ? true : post.author === filterAuthor))
      .filter((post) => (filterTag === 'all' ? true : post.tags.includes(filterTag)))
      .filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'author') return a.author.localeCompare(b.author);
        return 0;
      });
  }, [blogPosts, filterCategory, filterAuthor, filterTag, searchQuery, sortBy]);

  // Pagination logic
  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  /**
   * Paginate to a specific page
   * @param pageNumber - The page number to navigate to
   */
  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /**
   * Toggle wishlist for a blog post
   * @param postId - The ID of the blog post
   * @param title - The title of the blog post
   */
  const toggleWishlistHandler = useCallback(
    async (postId: number, title: string) => {
      if (!isAuthenticated) {
        showNotification('برای افزودن به علاقه‌مندی‌ها، لطفاً وارد شوید.', 'warning');
        navigate('/login');
        return;
      }
      try {
        await toggleWishlist(postId, 'blog', DOMPurify.sanitize(title));
      } catch (error: any) {
        showNotification(error.message || 'خطایی در به‌روزرسانی علاقه‌مندی‌ها رخ داد.', 'error');
      }
    },
    [isAuthenticated, toggleWishlist, navigate, showNotification]
  );

  /**
   * Clear all filters and reset to default state
   */
  const clearFilters = useCallback(() => {
    setFilterCategory('all');
    setFilterAuthor('all');
    setFilterTag('all');
    setSearchQuery('');
    setSortBy('date');
    setCurrentPage(1);
    setError(null); // Reset error on clear filters
  }, []);

  // Modal handlers
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  /**
   * Render filter buttons for categories, authors, and tags
   */
  const renderFilters = () => (
    <div className={styles.filterContainer}>
      <h3>فیلترها</h3>
      <div className={styles.filterGroup}>
        <label>دسته‌بندی:</label>
        {uniqueCategories.map((category) => (
          <button
            key={category}
            className={`${styles.filterButton} ${filterCategory === category ? styles.active : ''}`}
            onClick={() => setFilterCategory(category)}
            aria-pressed={filterCategory === category}
          >
            {category === 'all' ? 'همه دسته‌بندی‌ها' : category}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label>نویسنده:</label>
        {uniqueAuthors.map((author) => (
          <button
            key={author}
            className={`${styles.filterButton} ${filterAuthor === author ? styles.active : ''}`}
            onClick={() => setFilterAuthor(author)}
            aria-pressed={filterAuthor === author}
          >
            {author === 'all' ? 'همه نویسندگان' : author}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label>برچسب:</label>
        {uniqueTags.map((tag) => (
          <button
            key={tag}
            className={`${styles.filterButton} ${filterTag === tag ? styles.active : ''}`}
            onClick={() => setFilterTag(tag)}
            aria-pressed={filterTag === tag}
          >
            {tag === 'all' ? 'همه برچسب‌ها' : tag}
          </button>
        ))}
      </div>
      <button className={styles.clearButton} onClick={clearFilters} aria-label="پاک کردن فیلترها">
        پاک کردن فیلترها
      </button>
      {isMobile && (
        <Button
          className={styles.applyButton}
          onClick={handleCloseModal}
          aria-label="اعمال فیلترها"
          variant="contained"
        >
          اعمال فیلترها
        </Button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <section className={styles.blogSection}>
        <div className={styles.container}>
          <div className={styles.loading}>در حال بارگذاری...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.blogSection}>
        <div className={styles.container}>
          <div className={styles.error}>
            {error}
            <Button
              className={styles.retryButton}
              onClick={clearFilters}
              aria-label="تلاش مجدد یا بازنشانی فیلترها"
              variant="outlined"
            >
              تلاش مجدد
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.blogSection}>
      {/* SEO Metadata */}
      <Helmet>
        <title>وبلاگ روم دنتال | مقالات و نکات دندانپزشکی</title>
        <meta
          name="description"
          content="آخرین اخبار، مقالات و نکات دندانپزشکی را در وبلاگ روم دنتال بخوانید. جستجو، فیلتر و مرتب‌سازی پست‌ها بر اساس دسته‌بندی، نویسنده و برچسب."
        />
        <meta name="keywords" content="دندانپزشکی, مقالات دندانپزشکی, وبلاگ روم دنتال, سلامت دهان و دندان" />
      </Helmet>

      <div className={styles.container}>
        <Breadcrumb />
        <h1 className={styles.title}>وبلاگ روم دنتال</h1>
        <p className={styles.subtitle}>
          آخرین اخبار، مقالات و نکات دندانپزشکی را اینجا بخوانید
        </p>

        <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            placeholder="جستجو بر اساس عنوان، نویسنده یا برچسب..."
            onChange={handleSearchChange}
            className={styles.searchInput}
            aria-label="جستجوی مقالات"
          />
          {isMobile && (
            <IconButton
              className={styles.filterToggle}
              onClick={handleOpenModal}
              aria-label="باز کردن فیلترها"
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
                aria-label="مرتب‌سازی مقالات"
              >
                <option value="date">تاریخ</option>
                <option value="title">عنوان</option>
                <option value="author">نویسنده</option>
              </select>
            </div>

            <div className={styles.blogGrid}>
              {currentPosts.map((post) => (
                <LazyLoad key={post.id} height={300} offset={100} once>
                  <BlogCard
                    post={post}
                    toggleWishlist={() => toggleWishlistHandler(post.id, post.title)}
                    isInWishlist={isInWishlist}
                    isWishlistLoading={isWishlistLoading}
                  />
                </LazyLoad>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <p className={styles.noResults}>هیچ پستی یافت نشد.</p>
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
          className={`${styles.modal} ${styles.modalAnimation}`}
        >
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 id="filter-modal-title">فیلترها</h2>
              <IconButton onClick={handleCloseModal} aria-label="بستن مودال">
                <TuneIcon />
              </IconButton>
            </div>
            {renderFilters()}
          </div>
        </Modal>

        {!isAuthenticated && (
          <p className={styles.authMessage}>
            برای افزودن مقالات به لیست علاقه‌مندی‌ها، لطفاً{' '}
            <a href="/login">وارد شوید</a> یا <a href="/signup">ثبت‌نام کنید</a>.
          </p>
        )}
      </div>
    </section>
  );
};

export default Blog;