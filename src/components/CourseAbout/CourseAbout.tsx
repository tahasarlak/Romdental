import React from 'react';
import styles from './CourseAbout.module.css';

interface CourseAboutProps {
  course: {
    title: string;
    university: string;
    prerequisites?: string[];
  };
}

const CourseAbout: React.FC<CourseAboutProps> = ({ course }) => {
  return (
    <>
      <h2>درباره این دوره</h2>
      <p>
        این دوره با هدف ارتقای مهارت‌های شما در زمینه {course.title} برای دانشگاه{' '}
        {course.university} طراحی شده است. با شرکت در این دوره، شما با جدیدترین تکنیک‌ها و
        ابزارهای مرتبط آشنا خواهید شد.
      </p>
      {course.prerequisites && course.prerequisites.length > 0 && (
        <>
          <h3>پیش‌نیازها</h3>
          <ul className={styles.prerequisites}>
            {course.prerequisites.map((prereq, index) => (
              <li key={index}>{prereq}</li>
            ))}
          </ul>
        </>
      )}
    </>
  );
};

export default CourseAbout;