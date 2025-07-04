import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
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
  image: string;
  date: string;
  tags: string[];
}

const Blog: React.FC = () => {
  const { blogPosts } = useBlogContext();
  const { isAuthenticated } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 6;

  // فیلتر، جستجو و مرتب‌سازی پست‌ها
  const filteredPosts = blogPosts
    .filter((post) =>
      filter === 'all' ? true : post.category === filter
    )
    .filter((post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      return 0;
    });

  // صفحه‌بندی
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // لیست دسته‌بندی‌ها برای فیلتر
  const categories = ['all', ...new Set(blogPosts.map((post) => post.category))];

  return (
    <section className={styles.blogSection}>
      <div className={styles.container}>
        <Breadcrumb />
        <h1 className={styles.title}>وبلاگ روم دنتال</h1>
        <p className={styles.subtitle}>
          آخرین اخبار، مقالات و نکات دندانپزشکی را اینجا بخوانید
        </p>

        {/* جستجو */}
        <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            placeholder="جستجو بر اساس عنوان یا نویسنده..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* فیلتر و مرتب‌سازی */}
        <div className={styles.controls}>
          <div className={styles.filterContainer}>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.filterButton} ${filter === category ? styles.active : ''}`}
                onClick={() => setFilter(category)}
              >
                {category === 'all' ? 'همه دسته‌بندی‌ها' : category}
              </button>
            ))}
          </div>

          <div className={styles.sortContainer}>
            <label htmlFor="sort">مرتب‌سازی: </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="date">تاریخ</option>
              <option value="title">عنوان</option>
            </select>
          </div>
        </div>

        {/* گرید پست‌ها */}
        <div className={styles.blogGrid}>
          {currentPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {/* صفحه‌بندی */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        {/* پیام برای کاربران غیر احراز هویت شده */}
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