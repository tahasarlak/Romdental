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
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const { isAuthenticated, user } = useAuthContext();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      alert('لطفاً برای افزودن به لیست علاقه‌مندی‌ها وارد شوید.');
      return;
    }
    if (isInWishlist(post.id, 'course')) {
      removeFromWishlist(post.id, 'course');
    } else {
      addToWishlist(post.id, 'course');
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
          <button
            onClick={handleWishlistToggle}
            className={styles.wishlistButton}
            title={isInWishlist(post.id, 'course') ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          >
            {isInWishlist(post.id, 'course') ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;