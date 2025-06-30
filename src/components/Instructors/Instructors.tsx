import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './Instructors.module.css';
import { useInstructorContext } from '../../Context/InstructorContext';

const getRandomInstructors = (instructors: Instructor[], count: number): Instructor[] => {
  const shuffled = [...instructors].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

interface Instructor {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  experience: string;
  coursesTaught: string[];
}

const Instructors: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { instructors } = useInstructorContext();

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
                className={`${styles.card} ${isVisible ? styles.cardVisible : ''}`}
                style={{ transitionDelay: `${index * 0.2}s` }}
              >
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className={styles.instructorImage}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/instructors/placeholder.jpg';
                  }}
                />
                <h3 className={styles.instructorName}>{instructor.name}</h3>
                <p className={styles.instructorSpecialty}>{instructor.specialty}</p>
                <p className={styles.instructorDesc}>{instructor.bio}</p>
                <p className={styles.instructorExperience}>تجربه: {instructor.experience}</p>
                <div className={styles.coursesTaught}>
                  <strong>دوره‌های تدریس‌شده:</strong>
                  <ul>
                    {instructor.coursesTaught.map((course, courseIndex) => (
                      <li key={courseIndex}>{course}</li>
                    ))}
                  </ul>
                </div>
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