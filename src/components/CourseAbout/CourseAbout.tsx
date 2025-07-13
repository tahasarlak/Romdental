import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { useParams } from 'react-router-dom';
import { useCourseContext } from '../../Context/CourseContext';
import styles from './CourseAbout.module.css';
import { Course, VALID_COURSE_TYPES } from '../../types/types';
import Skeleton from '../Skeleton/Skeleton';

const MAX_PREREQ_LENGTH = process.env.REACT_APP_MAX_PREREQ_LENGTH
  ? parseInt(process.env.REACT_APP_MAX_PREREQ_LENGTH, 10)
  : 500;

const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['strong', 'em'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'iframe', 'object'],
  }).trim();
};

const validateCourse = (course: Course | null): { isValid: boolean; data: Course } => {
  const defaultCourse: Course = {
    id: 0,
    title: '',
    university: '',
    prerequisites: [],
    description: '',
    courseType: 'Online',
    slug: '',
    instructor: '',
    duration: '',
    courseNumber: '',
    category: 'عمومی',
    image: '',
    price: '',
    startDate: '',
    isOpen: false,
    isFeatured: false,
    enrollmentCount: 0,
    syllabus: [],
    faqs: [],
  };

  if (
    !course ||
    typeof course.id !== 'number' ||
    typeof course.title !== 'string' ||
    course.title.trim() === '' ||
    typeof course.university !== 'string' ||
    course.university.trim() === '' ||
    typeof course.description !== 'string' ||
    !VALID_COURSE_TYPES.includes(course.courseType)
  ) {
    return { isValid: false, data: defaultCourse };
  }

  const prerequisites = Array.isArray(course.prerequisites)
    ? course.prerequisites
        .filter((prereq): prereq is string => typeof prereq === 'string' && prereq.trim() !== '' && prereq.length <= MAX_PREREQ_LENGTH)
        .map(sanitizeText)
    : [];

  return { isValid: true, data: { ...course, prerequisites } };
};

const CourseAbout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const context = useCourseContext();

  const parsedCourseId = useMemo(() => (id ? parseInt(id, 10) : NaN), [id]);
  const courseMap = useMemo(() => new Map(context?.courses?.map((c) => [c.id, c]) ?? []), [context?.courses]);
  const course = useMemo(() => (isNaN(parsedCourseId) ? null : courseMap.get(parsedCourseId) || null), [courseMap, parsedCourseId]);
  const { isValid, data } = useMemo(() => validateCourse(course), [course]);
  const structuredData = useMemo(() => {
    if (!isValid) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Course',
      identifier: data.id.toString(),
      name: sanitizeText(data.title),
      description: sanitizeText(data.description),
      provider: {
        '@type': 'Organization',
        name: sanitizeText(data.university),
      },
      courseLevel: data.level || 'Intermediate',
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: data.courseType,
      },
    };
  }, [isValid, data]);

  if (!context || !context.courses) {
    return (
      <div className={styles.error} role="alert" aria-live="assertive">
        خطا: تنظیمات دوره یا لیست دوره‌ها در دسترس نیست.
      </div>
    );
  }

  const { loading } = context;

  if (loading) {
    return <Skeleton />;
  }

  if (isNaN(parsedCourseId)) {
    return (
      <div className={styles.error} role="alert" aria-live="assertive">
        خطا: شناسه دوره {id} نامعتبر است.
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.error} role="alert" aria-live="assertive">
        خطا: دوره‌ای با شناسه {id} در دانشگاه {data.university || 'نامشخص'} یافت نشد.
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className={styles.error} role="alert" aria-live="assertive">
        خطا: اطلاعات دوره با شناسه {id} ناقص یا نامعتبر است.
      </div>
    );
  }

  const { id: courseId, title, university, prerequisites, description } = data;

  return (
    <section className={styles.container} aria-label={`اطلاعات دوره ${sanitizeText(title)}`}>
      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      )}
      <h2 className={styles.title}>درباره دوره</h2>
      <p className={styles.description}>
        دوره <strong>{sanitizeText(title)}</strong> توسط دانشگاه{' '}
        <strong>{sanitizeText(university)}</strong> ارائه شده و با هدف {sanitizeText(description)} طراحی شده است.
      </p>
      {prerequisites.length > 0 ? (
        <div className={styles.prerequisitesContainer}>
          <h3 className={styles.subtitle}>پیش‌نیازها</h3>
          <ul className={styles.prerequisites} role="list" aria-label="لیست پیش‌نیازهای دوره">
            {prerequisites.map((prereq, index) => (
              <li
                key={`${courseId}-${index}`}
                className={styles.prerequisiteItem}
                role="listitem"
              >
                {sanitizeText(prereq)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className={styles.noPrerequisites}>
          <span className={styles.noPrerequisitesIcon}>✔</span> این دوره نیازی به پیش‌نیاز ندارد.
        </p>
      )}
    </section>
  );
};

export default CourseAbout;