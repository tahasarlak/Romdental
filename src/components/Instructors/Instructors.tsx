// src/components/Instructors/Instructors.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './Instructors.module.css';
import { useInstructorContext, Instructor } from '../../Context/InstructorContext'; // Import Instructor interface
import InstructorCard from '../InstructorCard/InstructorCard';

const getRandomInstructors = (instructors: Instructor[], count: number): Instructor[] => {
  const shuffled = [...instructors].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const Instructors: React.FC = () => {
  const { instructors } = useInstructorContext();
  const [isVisible, setIsVisible] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Select three random instructors
  const displayedInstructors = useMemo(() => {
    return getRandomInstructors(instructors, 3);
  }, [instructors]);

  // Scroll animation
  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector(`.${styles.instructors}`);
      if (section) {
        const { top } = section.getBoundingClientRect();
        if (top < window.innerHeight - 100) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleWishlist = (instructorId: number) => {
    setWishlist((prev) =>
      prev.includes(instructorId)
        ? prev.filter((id) => id !== instructorId)
        : [...prev, instructorId]
    );
  };

  const isInWishlist = (id: number, type: 'course' | 'instructor') => {
    if (type === 'instructor') {
      return wishlist.includes(id);
    }
    return false;
  };

  return (
    <section className={`${styles.instructors} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.container}>
        <h2 className={`${styles.title} ${isVisible ? styles.titleVisible : ''}`}>
          اساتید روم دنتال
        </h2>
        <p className={`${styles.subtitle} ${isVisible ? styles.subtitleVisible : ''}`}>
          با حرفه‌ای‌ترین اساتید دندانپزشکی ایران و جهان آشنا شوید
        </p>
        <div className={styles.instructorList}>
          {displayedInstructors.length > 0 ? (
            displayedInstructors.map((instructor, index) => (
              <div
                key={instructor.id}
                style={{ transitionDelay: `${index * 0.2}s` }}
              >
                <InstructorCard
                  instructor={instructor}
                  toggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist}
                />
              </div>
            ))
          ) : (
            <p className={styles.noInstructors}>استادی برای نمایش وجود ندارد.</p>
          )}
        </div>
        <div className={styles.viewAllContainer}>
          <Link to="/instructors" className={styles.viewAllButton}>
            مشاهده همه اساتید
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Instructors;