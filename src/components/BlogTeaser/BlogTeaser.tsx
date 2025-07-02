import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TagIcon from '@mui/icons-material/Tag';
import { useBlogContext } from '../../Context/BlogContext';
import styles from './BlogTeaser.module.css';
import BlogCard from '../BlogCard/BlogCard';

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

const BlogTeaser: React.FC = () => {
  const { blogPosts } = useBlogContext();
  const [isVisible, setIsVisible] = useState(false);

  // کش کردن سه پست آخر با useMemo
  const latestPosts = useMemo(() => {
    return blogPosts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // نزولی (جدیدترین اول)
      .slice(0, 3); // فقط سه پست
  }, [blogPosts]);

  // تشخیص اسکرول برای انیمیشن
  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector(`.${styles.blog}`);
      if (section) {
        const { top } = section.getBoundingClientRect();
        if (top < window.innerHeight * 0.8 && !isVisible) {
          console.log('Section is visible, triggering animation');
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  return (
    <section className={`${styles.blog} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.container}>
        <h2
          className={`${styles.title} ${isVisible ? styles.titleVisible : ''}`}
        >
          آخرین مقالات آموزشی
        </h2>
        <div className={styles.posts}>
          {latestPosts.length > 0 ? (
            latestPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))
          ) : (
            <p className={styles.noPosts}>مقاله‌ای برای نمایش وجود ندارد.</p>
          )}
        </div>
        <div className={styles.viewAllContainer}>
          <Link to="/blog" className={styles.viewAllButton}>
            مشاهده همه مقالات
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogTeaser;