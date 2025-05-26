import React from 'react';
import styles from './FeaturedCourses.module.css';
import { useCourseContext } from '../../Context/CourseContext';

interface Course {
  id: number;
  title: string;
  description: string; // معادل desc
  instructor: string;  // معادل teacher
  duration: string;
}

const FeaturedCourses: React.FC = () => {
  const { courses } = useCourseContext(); // گرفتن دوره‌ها از کانتکست

  // تبدیل داده‌ها به فرمت مورد نیاز (در صورت نیاز می‌تونیم فیلتر کنیم)
  const featuredCourses: Course[] = courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    instructor: course.instructor,
    duration: course.duration,
  }));

  return (
    <section className={styles.featured}>
      <h2 className={styles.title}>دوره‌های تخصصی دندانپزشکی</h2>
      <div className={styles.courses}>
        {featuredCourses.map((course) => (
          <div key={course.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{course.title}</h3>
            <p>{course.description}</p>
            <p>مدرس: {course.instructor}</p>
            <p>مدت: {course.duration}</p>
            <button className={styles.enrollButton}>ثبت‌نام</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCourses;