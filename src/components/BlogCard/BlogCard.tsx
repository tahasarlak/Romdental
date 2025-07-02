import React from 'react';
import { Link } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TagIcon from '@mui/icons-material/Tag';
import styles from '../../pages/Blog/Blog.module.css';

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
        </div>
      </div>
    </div>
  );
};

export default BlogCard;