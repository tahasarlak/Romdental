// src/pages/Wishlist/Wishlist.tsx
import React from 'react';
import { useWishlistContext } from '../../Context/WishlistContext';
import { useCourseContext } from '../../Context/CourseContext';
import { useInstructorContext } from '../../Context/InstructorContext';
import styles from './Wishlist.module.css';

const Wishlist: React.FC = () => {
  const { wishlist } = useWishlistContext();
  const { courses } = useCourseContext();
  const { instructors } = useInstructorContext();

  const courseWishlist = wishlist
    .filter((item) => item.type === 'course')
    .map((item) => courses.find((course) => course.id === item.id))
    .filter((course): course is NonNullable<typeof course> => !!course);

  const instructorWishlist = wishlist
    .filter((item) => item.type === 'instructor')
    .map((item) => instructors.find((instructor) => instructor.id === item.id))
    .filter((instructor): instructor is NonNullable<typeof instructor> => !!instructor);

  return (
    <section className={styles.wishlistSection}>
      <div className={styles.container}>
        <h1 className={styles.title}>لیست علاقه‌مندی‌ها</h1>
        {wishlist.length === 0 ? (
          <p className={styles.noItems}>هیچ موردی در لیست علاقه‌مندی‌ها وجود ندارد.</p>
        ) : (
          <>
            <h2>دوره‌ها</h2>
            <div className={styles.coursesGrid}>
              {courseWishlist.map((course) => (
                <div key={course.id} className={styles.item}>
                  <h3>{course.title}</h3>
                  <p>استاد: {course.instructor}</p>
                </div>
              ))}
            </div>
            <h2>اساتید</h2>
            <div className={styles.instructorsGrid}>
              {instructorWishlist.map((instructor) => (
                <div key={instructor.id} className={styles.item}>
                  <h3>{instructor.name}</h3>
                  <p>تخصص: {instructor.specialty}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Wishlist;