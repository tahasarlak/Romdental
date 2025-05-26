// src/pages/Instructors.tsx
import React, { useState, useEffect } from 'react';
import styles from './Instructors.module.css';
import { useInstructorContext } from '../../Context/InstructorContext';

const Instructors: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { instructors } = useInstructorContext();

  // انیمیشن هنگام اسکرول
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
    handleScroll(); // چک کردن اولیه
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className={styles.instructors}>
      <div className={styles.container}>
        <h2 className={`${styles.title} ${isVisible ? styles.titleVisible : ''}`}>
          اساتید ما
        </h2>
        <p className={styles.subtitle}>
          با حرفه‌ای‌ترین اساتید دندانپزشکی ایران و جهان آشنا شوید
        </p>
        <div className={styles.instructorList}>
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className={`${styles.card} ${isVisible ? styles.cardVisible : ''}`}
              style={{ transitionDelay: `${instructor.id * 0.2}s` }}
            >
              <img
                src={instructor.image}
                alt={instructor.name}
                className={styles.instructorImage}
                loading="lazy"
              />
              <h3 className={styles.instructorName}>{instructor.name}</h3>
              <p className={styles.instructorSpecialty}>{instructor.specialty}</p>
              <p className={styles.instructorDesc}>{instructor.bio}</p>
              <p className={styles.instructorExperience}>تجربه: {instructor.experience}</p>
              <div className={styles.coursesTaught}>
                <strong>دوره‌های تدریس‌شده:</strong>
                <ul>
                  {instructor.coursesTaught.map((course, index) => (
                    <li key={index}>{course}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Instructors;