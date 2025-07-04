import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TelegramIcon from '@mui/icons-material/Telegram';
import InstagramIcon from '@mui/icons-material/Instagram';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import ShareIcon from '@mui/icons-material/Share';
import styles from './InstructorDetails.module.css';
import { useInstructorContext } from '../../../Context/InstructorContext';
import { useCourseContext } from '../../../Context/CourseContext';
import { useReviewContext } from '../../../Context/ReviewContext';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';

const InstructorDetails: React.FC = () => {
  const { instructorName } = useParams<{ instructorName: string }>();
  const { instructors } = useInstructorContext();
  const { courses } = useCourseContext();
  const { reviews } = useReviewContext();

  const formattedName = instructorName?.replace('-', ' ');
  const instructor = instructors.find((inst) => inst.name === formattedName);

  // Calculate the average rating for the instructor based on their courses
  const averageRating = useMemo(() => {
    const instructorCourses = courses.filter((course) => course.instructor === formattedName);
    const courseIds = instructorCourses.map((course) => course.id);
    const instructorReviews = reviews.filter((review) => courseIds.includes(review.courseId));

    if (instructorReviews.length === 0) return '0.0';
    const totalRating = instructorReviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / instructorReviews.length).toFixed(1);
  }, [courses, reviews, formattedName]);

  if (!instructor) {
    return (
      <section className={styles.instructorDetailsSection}>
        <div className={styles.container}>
          <div className={styles.error}>استاد یافت نشد!</div>
        </div>
      </section>
    );
  }

  // Get the courses taught by the instructor
  const instructorCourses = courses.filter((course) => course.instructor === instructor.name);

  return (
    <section className={styles.instructorDetailsSection}>
      <div className={styles.container}>
        <Breadcrumb />
        <div className={styles.header}>
          <h1 className={styles.title}>{instructor.name}</h1>
          <div className={styles.rating}>
            <StarIcon className={styles.starIcon} />
            <span>{averageRating} ({instructor.totalStudents} دانشجو)</span>
          </div>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.imageContainer}>
            <img
              src={instructor.image}
              alt={instructor.name}
              className={styles.instructorImage}
              onError={(e) => { e.currentTarget.src = '/assets/logo.jpg'; }}
            />
          </div>

          <div className={styles.detailsContainer}>
            <div className={styles.infoCard}>
              <h2 className={styles.subtitle}>
                <MedicalServicesIcon className={styles.sectionIcon} /> مشخصات
              </h2>
              <p>
                <MedicalServicesIcon className={styles.infoIcon} />
                <strong>تخصص:</strong> {instructor.specialty}
              </p>
              <p>
                <ScheduleIcon className={styles.infoIcon} />
                <strong>تجربه:</strong> {instructor.experience}
              </p>
              <p>
                <PeopleIcon className={styles.infoIcon} />
                <strong>تعداد دانشجویان:</strong> {instructor.totalStudents}
              </p>
              <p>
                <StarIcon className={styles.infoIcon} />
                <strong>امتیاز:</strong> {averageRating} / 5
              </p>
            </div>

            <div className={styles.bioCard}>
              <h2 className={styles.subtitle}>
                <BookIcon className={styles.sectionIcon} /> بیوگرافی
              </h2>
              <p>{instructor.bio}</p>
            </div>

            <div className={styles.coursesCard}>
              <h2 className={styles.subtitle}>
                <SchoolIcon className={styles.sectionIcon} /> دوره‌های تدریس‌شده
              </h2>
              {instructorCourses.length > 0 ? (
                <div className={styles.courseGrid}>
                  {instructorCourses.map((course) => (
                    <Link
                      key={course.id}
                      to={`/courses/${course.id}`}
                      className={styles.courseCard}
                    >
                      <img
                        src={course.image}
                        alt={course.title}
                        className={styles.courseImage}
                        onError={(e) => { e.currentTarget.src = '/assets/fallback.jpg'; }}
                      />
                      <div className={styles.courseContent}>
                        <h3 className={styles.courseTitle}>{course.title}</h3>
                        <p className={styles.courseDescription}>
                          {course.description.length > 100
                            ? `${course.description.substring(0, 100)}...`
                            : course.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className={styles.noCourses}>بدون دوره</p>
              )}
            </div>

            <div className={styles.socialMedia}>
              <h2 className={styles.subtitle}>
                <ShareIcon className={styles.sectionIcon} /> شبکه‌های اجتماعی
              </h2>
              <div className={styles.socialLinks}>
                {instructor.whatsappLink && (
                  <a
                    href={instructor.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIcon}
                    aria-label="واتساپ استاد"
                  >
                    <WhatsAppIcon />
                  </a>
                )}
                {instructor.telegramLink && (
                  <a
                    href={instructor.telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIcon}
                    aria-label="تلگرام استاد"
                  >
                    <TelegramIcon />
                  </a>
                )}
                {instructor.instagramLink && (
                  <a
                    href={instructor.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIcon}
                    aria-label="اینستاگرام استاد"
                  >
                    <InstagramIcon />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <Link to="/instructors" className={styles.backLink}>
          بازگشت به لیست اساتید
        </Link>
      </div>
    </section>
  );
};

export default InstructorDetails;