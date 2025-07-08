import React from 'react';
import { Link } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TagIcon from '@mui/icons-material/Tag';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import styles from './BlogCard.module.css';
import { useAuthContext } from '../../Context/AuthContext';
import { useWishlistContext } from '../../Context/WishlistContext';

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

interface BlogCardProps {
  post: BlogPost;
  toggleWishlist?: (postId: number) => void;
  isInWishlist?: (id: number, type: 'course' | 'instructor' | 'blog') => boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, toggleWishlist, isInWishlist }) => {
  const { isAuthenticated } = useAuthContext();

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      alert('لطفاً برای افزودن به لیست علاقه‌مندی‌ها وارد شوید.');
      return;
    }
    if (toggleWishlist) {
      toggleWishlist(post.id);
    }
  };

  return (
    <div className={styles.blogCard}>
      <img
        src={post.image}
        alt={post.title}
        className={styles.blogImage}
      />
      <div className={styles.blogContent}>
        <h2 className={styles.blogTitle}>{post.title}</h2>
        <p className={styles.author}>نویسنده: {post.author}</p>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <div className={styles.details}>
          <span><CalendarTodayIcon /> تاریخ: {post.date}</span>
          <span><TagIcon /> برچسب‌ها: {post.tags.join(', ')}</span>
        </div>
        <div className={styles.actions}>
          <Link
            to={`/blog/${post.id}`}
            className={styles.detailsLink}
          >
            ادامه مطلب
          </Link>
          {toggleWishlist && isInWishlist && (
            <button
              onClick={handleWishlistToggle}
              className={styles.wishlistButton}
              title={isInWishlist(post.id, 'blog') ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
            >
              {isInWishlist(post.id, 'blog') ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogCard;