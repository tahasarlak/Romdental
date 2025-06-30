import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './FeaturedCourses.module.css';
import { useCourseContext } from '../../Context/CourseContext';
import { useInstructorContext } from '../../Context/InstructorContext';

interface Course {
  isOpen: boolean;
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  image: string;
  price: string;
  courseNumber: string;
  courseType: 'Online' | 'Offline' | 'In-Person' | 'Hybrid';
  isFeatured: boolean;
  university: string;
}

const getRandomCourses = (courses: Course[], count: number): Course[] => {
  const featuredCourses = courses.filter((course) => course.isFeatured && course.isOpen);
  const otherCourses = courses.filter((course) => !course.isFeatured && course.isOpen);
  
  const shuffledFeatured = [...featuredCourses].sort(() => Math.random() - 0.5);
  const shuffledOthers = [...otherCourses].sort(() => Math.random() - 0.5);
  
  const selectedCourses = [
    ...shuffledFeatured.slice(0, Math.min(count, featuredCourses.length)),
    ...shuffledOthers.slice(0, count - Math.min(count, featuredCourses.length)),
  ].slice(0, count);
  
  return selectedCourses;
};

const FeaturedCourses: React.FC = () => {
  const { courses } = useCourseContext();
  const { instructors } = useInstructorContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector(`.${styles.featured}`);
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

  const instructorImageMap = useMemo(() => {
    const map = new Map<string, string>();
    instructors.forEach((instructor) => map.set(instructor.name, instructor.image));
    return map;
  }, [instructors]);

  const featuredCourses = useMemo(() => {
    return getRandomCourses(courses, 3);
  }, [courses]);

  return (
    <section className={`${styles.featured} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.container}>
        <h2 className={`${styles.title} ${isVisible ? styles.titleVisible : ''}`}>
          دوره‌های برجسته روم دنتال
        </h2>
        <div className={styles.courses}>
          {featuredCourses.length > 0 ? (
            featuredCourses.map((course, index) => (
              <div
                key={course.id}
                className={`${styles.card} ${isVisible ? styles.cardVisible : ''}`}
                style={{ transitionDelay: `${index * 0.2}s` }}
              >
                <img
                  src={course.image}
                  alt={course.title}
                  className={styles.cardImage}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/courses/placeholder.jpg';
                  }}
                />
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{course.title}</h3>
                  <p className={styles.cardDescription}>{course.description}</p>
                  <div className={styles.cardDetails}>
                    <div className={styles.instructorInfo}>
                      <img
                        src={instructorImageMap.get(course.instructor) || '/assets/instructors/placeholder.jpg'}
                        alt={course.instructor}
                        className={styles.instructorImage}
                        loading="lazy"
                      />
                      <p>مدرس: {course.instructor}</p>
                    </div>
                    <p>مدت: {course.duration}</p>
                    <p>کورس: {course.courseNumber}</p>
                    <p>نوع: {course.courseType === 'Online' ? 'آنلاین' : course.courseType === 'Offline' ? 'آفلاین' : course.courseType === 'In-Person' ? 'حضوری' : 'ترکیبی'}</p>
                    <p>دانشگاه: {course.university}</p>
                    <p className={styles.cardPrice}>قیمت: {course.price}</p>
                  </div>
                  <button className={styles.enrollButton}>ثبت‌نام</button>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noCourses}>دوره‌ای برای نمایش وجود ندارد.</p>
          )}
        </div>
        <div className={styles.viewAllContainer}>
          <Link to="/courses" className={styles.viewAllButton}>
            مشاهده همه دوره‌ها
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;