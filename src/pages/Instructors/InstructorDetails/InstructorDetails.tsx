// src/components/Instructors/InstructorDetails.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './InstructorDetails.module.css';
import { useInstructorContext } from '../../../Context/InstructorContext';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';

const InstructorDetails: React.FC = () => {
  const { instructorName } = useParams<{ instructorName: string }>();
  const { instructors } = useInstructorContext();

  const formattedName = instructorName?.replace('-', ' ');
  const instructor = instructors.find((inst) => inst.name === formattedName);

  if (!instructor) {
    return <div className={styles.error}>استاد یافت نشد!</div>;
  }

  return (
    <section className={styles.instructorDetailsSection}>
      <div className={styles.container}><Breadcrumb />
        <h1>{instructor.name}</h1>
        <img
          src={instructor.image}
          alt={instructor.name}
          className={styles.instructorImage}
          onError={(e) => { e.currentTarget.src = '/assets/logo.jpg'; }}
        />
        <p><strong>تخصص:</strong> {instructor.specialty}</p>
        <p><strong>تجربه:</strong> {instructor.experience}</p>
        <p><strong>بیوگرافی:</strong> {instructor.bio}</p>
        <h2>دوره‌های تدریس‌شده:</h2>
        <ul>
          {instructor.coursesTaught.length > 0 ? (
            instructor.coursesTaught.map((course, index) => (
              <li key={index}>{course}</li>
            ))
          ) : (
            <li>بدون دوره</li>
          )}
        </ul>
        <Link to="/instructors" className={styles.backLink}>
          بازگشت به لیست اساتید
        </Link>
      </div>
    </section>
  );
};

export default InstructorDetails;