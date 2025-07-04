import React from 'react';
import { useParams, Link } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TagIcon from '@mui/icons-material/Tag';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import { useBlogContext } from '../../../Context/BlogContext';
import { useAuthContext } from '../../../Context/AuthContext';
import { useWishlistContext } from '../../../Context/WishlistContext';
import styles from './BlogPostDetails.module.css';

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

const BlogPostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { blogPosts } = useBlogContext();
  const { isAuthenticated } = useAuthContext();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();

  const post = blogPosts.find((post) => post.id === parseInt(id || ''));

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      alert('لطفاً برای افزودن به لیست علاقه‌مندی‌ها وارد شوید.');
      return;
    }
    if (post && isInWishlist(post.id, 'course')) {
      removeFromWishlist(post.id, 'course');
    } else if (post) {
      addToWishlist(post.id, 'course');
    }
  };

  if (!post) {
    return (
      <section className={styles.section}>
        <Breadcrumb />
        <h1 className={styles.notFoundTitle}>مقاله یافت نشد</h1>
        <p className={styles.notFoundText}>
          مقاله‌ای با این شناسه وجود ندارد.{' '}
          <Link to="/blog" className={styles.link}>
            بازگشت به وبلاگ
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <Breadcrumb />
      <div className={styles.container}>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.metaContainer}>
          <div className={styles.meta}>
            <p className={styles.metaText}>
              <CalendarTodayIcon className={styles.icon} /> تاریخ: {post.date}
            </p>
            <p className={styles.metaText}>نویسنده: {post.author}</p>
          </div>
          <button
            onClick={handleWishlistToggle}
            className={styles.wishlistButton}
            title={isInWishlist(post.id, 'course') ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          >
            {isInWishlist(post.id, 'course') ? (
              <BookmarkIcon className={styles.icon} />
            ) : (
              <BookmarkBorderIcon className={styles.icon} />
            )}
          </button>
        </div>
        <img src={post.image} alt={post.title} className={styles.image} />
        <div className={styles.tagsContainer}>
          <TagIcon className={styles.icon} />
          <span className={styles.tagsText}>برچسب‌ها: {post.tags.join('، ')}</span>
        </div>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <div className={styles.content}>{post.content}</div>
        {!isAuthenticated && (
          <p className={styles.authPrompt}>
            برای افزودن این مقاله به لیست علاقه‌مندی‌ها، لطفاً{' '}
            <Link to="/login" className={styles.link}>
              وارد شوید
            </Link>{' '}
            یا{' '}
            <Link to="/signup" className={styles.link}>
              ثبت‌نام کنید
            </Link>.
          </p>
        )}
        <div className={styles.backLinkContainer}>
          <Link to="/blog" className={styles.link}>
            بازگشت به وبلاگ
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPostDetails;