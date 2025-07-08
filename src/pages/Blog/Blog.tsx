import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import styles from './Blog.module.css';
import { useBlogContext } from '../../Context/BlogContext';
import { useAuthContext } from '../../Context/AuthContext';
import { useWishlistContext } from '../../Context/WishlistContext';
import BlogCard from '../../components/BlogCard/BlogCard';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

interface BlogPost {
  id: number;
  title: string;
  author: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  tags: string[];
}

const Blog: React.FC = () => {
  const { blogPosts } = useBlogContext();
  const { isAuthenticated } = useAuthContext();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();
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
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
  const postsPerPage = 6;

  // Memoized unique filters
  const uniqueCategories = useMemo(() => ['all', ...new Set(blogPosts.map((post) => post.category))].sort(), [blogPosts]);
  const uniqueAuthors = useMemo(() => ['all', ...new Set(blogPosts.map((post) => post.author))].sort(), [blogPosts]);
  const uniqueTags = useMemo(() => ['all', ...new Set(blogPosts.flatMap((post) => post.tags))].sort(), [blogPosts]);

  // Handle loading and error states
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (!blogPosts.length) {
        setError('پستی یافت نشد.');
      }
    }, 500);
  }, [blogPosts]);

  // Filtered and sorted posts
  const filteredPosts = useMemo(() => {
    return blogPosts
      .filter((post) => filterCategory === 'all' ? true : post.category === filterCategory)
      .filter((post) => filterAuthor === 'all' ? true : post.author === filterAuthor)
      .filter((post) => filterTag === 'all' ? true : post.tags.includes(filterTag))
      .filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === ' oat') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'author') return a.author.localeCompare(b.author);
        return 0;
      });
  }, [blogPosts, filterCategory, filterAuthor, filterTag, searchQuery, sortBy]);

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Pagination function
  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Toggle wishlist
  const toggleWishlist = useCallback((postId: number) => {
    if (!isAuthenticated) {
      setOpenLoginModal(true);
      return;
    }
    if (isInWishlist(postId, 'blog')) {
      removeFromWishlist(postId, 'blog');
    } else {
      addToWishlist(postId, 'blog');
    }
  }, [addToWishlist, removeFromWishlist, isInWishlist, isAuthenticated]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilterCategory('all');
    setFilterAuthor('all');
    setFilterTag('all');
    setSearchQuery('');
    setSortBy('date');
    setCurrentPage(1);
  }, []);

  // Modal handlers
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleCloseLoginModal = () => setOpenLoginModal(false);

  // Render filters
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
          <div className={styles.error}>{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.blogSection}>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            aria-label="جستجوی مقالات"
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
                aria-label="مرتب‌سازی مقالات"
              >
                <option value="date">تاریخ</option>
                <option value="title">عنوان</option>
                <option value="author">نویسنده</option>
              </select>
            </div>

            <div className={styles.blogGrid}>
              {currentPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  toggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist}
                />
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
            <p>برای افزودن مقاله به لیست علاقه‌مندی‌ها، لطفاً وارد حساب کاربری خود شوید.</p>
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

        {!isAuthenticated && (
          <p className={styles.authMessage}>
            برای افزودن مقالات به لیست علاقه‌مندی‌ها، لطفاً{' '}
            <a href="/login">وارد شوید</a> یا{' '}
            <a href="/signup">ثبت‌نام کنید</a>.
          </p>
        )}
      </div>
    </section>
  );
};

export default Blog;