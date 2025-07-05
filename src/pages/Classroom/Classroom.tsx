import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseContext } from '../../Context/CourseContext';
import { useAuthContext } from '../../Context/AuthContext';
import ReactPlayer from 'react-player';
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

  // Mock enrollment check (replace with actual logic, e.g., API or context)
  const isEnrolled = course?.id === 1; // Mock: Assume enrolled for course ID 1

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
    return null; // Redirects handled in useEffect
  }

  // لینک پخش زنده داخلی از سرور شما
  const liveStreamUrl = `http://your-domain.com/live/${course.id}/stream.m3u8`; // جایگزین با آدرس سرور استریمینگ

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
          <ReactPlayer
            url={liveStreamUrl}
            width="100%"
            height="auto"
            controls
            className={styles.videoPlayer}
            playing
            config={{
              file: {
                hlsOptions: {
                  xhrSetup: (xhr: XMLHttpRequest) => {
                    // افزودن توکن احراز هویت برای دسترسی امن
                    xhr.setRequestHeader('Authorization', `Bearer ${user?.token || ''}`);
                  },
                },
              },
            }}
          />
          <div className={styles.classInfo}>
            <p>خوش آمدید، {user?.name || 'کاربر'}!</p>
            <p>این صفحه کلاس آنلاین برای دوره <strong>{course.title}</strong> است.</p>
            <p>شما در حال مشاهده پخش زنده کلاس هستید.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Classroom;