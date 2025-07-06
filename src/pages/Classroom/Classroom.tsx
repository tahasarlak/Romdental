import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseContext } from '../../Context/CourseContext';
import { useAuthContext } from '../../Context/AuthContext';
import styles from './Classroom.module.css';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Course {
  id: number;
  title: string;
  courseType: 'Online' | 'Offline' | 'In-Person' | 'Hybrid';
}

const Classroom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses } = useCourseContext();
  const { user } = useAuthContext();

  const course = courses.find((c) => c.id === parseInt(id || ''));

  const isEnrolled = course?.id === 1;

  useEffect(() => {
    if (!course || course.courseType !== 'Online') {
      alert('این دوره آنلاین نیست یا یافت نشد.');
      navigate('/courses');
      return;
    }
    if (!isEnrolled) {
      alert('شما در این دوره ثبت‌نام نکرده‌اید.');
      navigate(`/checkout/${id}`);
      return;
    }
  }, [course, isEnrolled, id, navigate]);

  if (!course || !isEnrolled) {
    return null;
  }

  // لینک جلسه Google Meet
  const meetUrl = 'https://meet.google.com/gwd-zkmf-qtv?pli=1'; // لینک Google Meet خودت

  return (
    <section className={styles.classroomSection}>
      <div className={styles.container}>
        <div className={styles.navigation}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/courses/${id}`)}
            className={styles.backButton}
            aria-label="بازگشت به صفحه دوره"
          >
            بازگشت به دوره
          </Button>
        </div>
        <h1 className={styles.title}>کلاس آنلاین: {course.title}</h1>
        <div className={styles.classroomContent}>
          <iframe
            src={meetUrl}
            width="100%"
            height="500px"
            allow="camera; microphone; fullscreen"
            style={{ border: 'none' }}
          />
          <div className={styles.classInfo}>
            <p>خوش آمدید، {user?.name || 'کاربر'}!</p>
            <p>این صفحه کلاس آنلاین برای دوره <strong>{course.title}</strong> است.</p>
            <p>شما در حال مشاهده جلسه Google Meet هستید.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Classroom;