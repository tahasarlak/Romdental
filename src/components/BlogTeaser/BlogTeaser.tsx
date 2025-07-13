import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBlogContext } from '../../Context/BlogContext';
import styles from './BlogTeaser.module.css';
import BlogCard from '../BlogCard/BlogCard';

const BlogTeaser: React.FC = () => {
  const { blogPosts } = useBlogContext();
  const [isVisible, setIsVisible] = useState(false);

  // Cache the latest three posts with useMemo
  const latestPosts = useMemo(() => {
    return blogPosts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [blogPosts]);

  // Detect scroll for animation
  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector(`.${styles.blog}`);
      if (section) {
        const { top } = section.getBoundingClientRect();
        if (top < window.innerHeight * 0.8 && !isVisible) {
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
        <h2 className={`${styles.title} ${isVisible ? styles.titleVisible : ''}`}>
          آخرین مقالات آموزشی
        </h2>
        <div className={styles.posts}>
          {latestPosts.length > 0 ? (
            latestPosts.map((post) => <BlogCard key={post.id} post={post} />)
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