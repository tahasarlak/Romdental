// src/components/BlogTeaser.tsx
import React from 'react';
import styles from './BlogTeaser.module.css';
import { useBlogContext } from '../../Context/BlogContext';

const BlogTeaser: React.FC = () => {
  const { blogPosts } = useBlogContext();

  // مرتب‌سازی بر اساس تاریخ و گرفتن چهار تای آخر
  const latestPosts = blogPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // نزولی (جدیدترین اول)
    .slice(0, 3); // فقط چهار تا

  return (
    <section className={styles.blog}>
      <h2 className={styles.title}>آخرین مقالات آموزشی</h2>
      <div className={styles.posts}>
        {latestPosts.map((post) => (
          <div key={post.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{post.title}</h3>
            <p>{post.excerpt}</p>
            <a href="#blog" className={styles.readMore}>بیشتر بخوانید</a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogTeaser;