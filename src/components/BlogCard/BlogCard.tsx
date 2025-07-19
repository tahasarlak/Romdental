import React from 'react';
import { Link } from 'react-router-dom';
import LazyLoad from 'react-lazyload';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale'; // برای فرمت فارسی
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TagIcon from '@mui/icons-material/Tag';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import styles from './BlogCard.module.css';
import { useAuthContext } from '../../Context/Auth/UserAuthContext';
import { useNotificationContext } from '../../Context/NotificationContext';
import { BlogPost } from '../../Context/BlogContext';

/**
 * Props for the BlogCard component
 */
interface BlogCardProps {
  post: BlogPost;
  toggleWishlist?: (id: number, title: string) => Promise<void>;
  isInWishlist?: (id: number, type: 'course' | 'instructor' | 'blog') => boolean;
  isWishlistLoading?: boolean;
}

/**
 * BlogCard Component
 * Displays a single blog post card with title, author, date, tags, and wishlist functionality.
 * Supports lazy loading for images and accessibility features.
 * @param props - BlogCardProps
 */
const BlogCard: React.FC<BlogCardProps> = ({ post, toggleWishlist, isInWishlist, isWishlistLoading }) => {
  const { isAuthenticated } = useAuthContext();
  const { showNotification } = useNotificationContext();

  /**
   * Handle wishlist toggle action
   */
  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      showNotification('برای افزودن به علاقه‌مندی‌ها، لطفاً وارد شوید.', 'warning');
      return;
    }
    if (toggleWishlist && isInWishlist) {
      toggleWishlist(post.id, post.title);
    }
  };

  // فرمت‌بندی تاریخ
  const formattedDate = format(new Date(post.date), 'dd MMMM yyyy', { locale: faIR });

  return (
    <div className={styles.blogCard}>
      <LazyLoad height={200} offset={100} once>
        <img
          src={post.images[0] || '/assets/placeholder.jpg'}
          alt={post.title}
          className={styles.blogImage}
          loading="lazy"
        />
      </LazyLoad>
      <div className={styles.blogContent}>
        <h2 className={styles.blogTitle}>{post.title}</h2>
        <p className={styles.author}>نویسنده: {post.author}</p>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <div className={styles.details}>
          <span>
            <CalendarTodayIcon /> تاریخ: {formattedDate}
          </span>
          <span>
            <TagIcon /> برچسب‌ها: {post.tags.join(', ')}
          </span>
        </div>
        <div className={styles.actions}>
          <Link to={`/blog/${post.id}`} className={styles.detailsLink} aria-label={`مشاهده جزئیات پست ${post.title}`}>
            ادامه مطلب
          </Link>
          {toggleWishlist && isInWishlist && (
            <button
              onClick={handleWishlistToggle}
              className={styles.wishlistButton}
              aria-label={isInWishlist(post.id, 'blog') ? `حذف ${post.title} از علاقه‌مندی‌ها` : `افزودن ${post.title} به علاقه‌مندی‌ها`}
              disabled={isWishlistLoading}
            >
              {isInWishlist(post.id, 'blog') ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(BlogCard);