import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { useParams } from 'react-router-dom';
import { useCourseContext } from '../../Context/CourseContext';
import styles from './CourseAbout.module.css';
import { Course, VALID_COURSE_TYPES } from '../../types/types';
import Skeleton from '../Skeleton/Skeleton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import moment from 'moment-jalaali';

moment.loadPersian({ dialect: 'persian-modern' });

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

const getCurrencySymbol = (currency: string): string => {
  switch (currency) {
    case 'IRR':
      return 'تومان';
    case 'RUB':
      return '₽';
    case 'CNY':
      return '¥';
    default:
      return '';
  }
};

const validateCourse = (course: Course | null): { isValid: boolean; data: Course } => {
  const defaultCourse: Course = {
    id: 0,
    slug: '',
    title: '',
    instructor: '',
    description: '',
    duration: '',
    courseNumber: '',
    category: 'عمومی',
    image: '',
    price: '۰',
    currency: 'IRR',
    countries: [],
    startDateJalali: '',
    startDateGregorian: '',
    isOpen: false,
    isFeatured: false,
    enrollmentCount: 0,
    syllabus: [],
    faqs: [],
    tags: [],
    prerequisites: [],
    courseType: 'Online',
    university: '',
  };

  if (
    !course ||
    typeof course.id !== 'number' ||
    typeof course.slug !== 'string' ||
    typeof course.title !== 'string' ||
    course.title.trim() === '' ||
    typeof course.university !== 'string' ||
    course.university.trim() === '' ||
    typeof course.description !== 'string' ||
    !VALID_COURSE_TYPES.includes(course.courseType) ||
    !['RUB', 'CNY', 'IRR'].includes(course.currency) ||
    !Array.isArray(course.countries) ||
    course.countries.length === 0 ||
    !course.countries.every((c) => typeof c === 'string' && c.trim() !== '') ||
    (course.discountPrice !== undefined && course.discountPercentage === undefined) ||
    (course.discountPrice === undefined && course.discountPercentage !== undefined)
  ) {
    return { isValid: false, data: defaultCourse };
  }

  const prerequisites = Array.isArray(course.prerequisites)
    ? course.prerequisites
        .filter((prereq): prereq is string => typeof prereq === 'string' && prereq.trim() !== '' && prereq.length <= MAX_PREREQ_LENGTH)
        .map(sanitizeText)
    : [];

  if (course.discountPrice && course.discountPercentage) {
    const priceValue = parseFloat(course.price.replace(/[, تومان₽¥]/g, ''));
    const discountPriceValue = parseFloat(course.discountPrice.replace(/[, تومان₽¥]/g, ''));
    const calculatedDiscountPercentage = ((priceValue - discountPriceValue) / priceValue) * 100;
    if (Math.abs(calculatedDiscountPercentage - course.discountPercentage) > 0.1) {
      return { isValid: false, data: defaultCourse };
    }
  }

  return { isValid: true, data: { ...course, prerequisites } };
};

const CourseAbout: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const context = useCourseContext();

  const decodedSlug = useMemo(() => (slug ? decodeURIComponent(slug) : ''), [slug]);
  const courseMap = useMemo(() => new Map(context?.courses?.map((c) => [c.slug, c]) ?? []), [context?.courses]);
  const course = useMemo(() => (decodedSlug ? courseMap.get(decodedSlug) || null : null), [courseMap, decodedSlug]);
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
        location: data.countries.join(', '),
        startDate: data.startDateGregorian,
        offers: {
          '@type': 'Offer',
          price: parseFloat(data.price.replace(/[, تومان₽¥]/g, '')),
          priceCurrency: data.currency,
          ...(data.discountPrice && {
            discount: parseFloat(data.discountPrice.replace(/[, تومان₽¥]/g, '')),
            discountPercentage: data.discountPercentage,
          }),
        },
      },
    };
  }, [isValid, data]);

  const formatJalaliDate = (jalaliDate: string): string => {
    if (!jalaliDate || jalaliDate === '') return 'نامشخص';
    try {
      return moment(jalaliDate, 'jYYYY/jMM/jDD').format('jD jMMMM jYYYY');
    } catch {
      return 'نامشخص';
    }
  };

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

  if (!decodedSlug) {
    return (
      <div className={styles.error} role="alert" aria-live="assertive">
        خطا: شناسه دوره نامعتبر است.
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.error} role="alert" aria-live="assertive">
        خطا: دوره‌ای با شناسه {decodedSlug} در دانشگاه {data.university || 'نامشخص'} یافت نشد.
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className={styles.error} role="alert" aria-live="assertive">
        خطا: اطلاعات دوره با شناسه {decodedSlug} ناقص یا نامعتبر است.
      </div>
    );
  }

  const { title, university, prerequisites, description, price, currency, discountPrice, countries, startDateJalali } = data;

  return (
    <section className={styles.container} aria-label={`اطلاعات دوره ${sanitizeText(title)}`}>
      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      )}
      <h2 className={styles.title}>درباره دوره</h2>
      <Typography className={styles.description}>
        دوره <strong>{sanitizeText(title)}</strong> توسط دانشگاه{' '}
        <strong>{sanitizeText(university)}</strong> ارائه شده و با هدف {sanitizeText(description)} طراحی شده است.
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          قیمت: {price} {getCurrencySymbol(currency)}
          {discountPrice && (
            <>
              {' | '}قیمت با تخفیف: {discountPrice} {getCurrencySymbol(currency)} (
              {data.discountPercentage}% تخفیف)
            </>
          )}
        </Typography>
        <Typography variant="body2">
          کشورها: {countries.length > 0 ? countries.join(', ') : 'نامشخص'}
        </Typography>
        <Typography variant="body2">
          تاریخ شروع: {formatJalaliDate(startDateJalali)}
        </Typography>
      </Box>
      {prerequisites.length > 0 ? (
        <div className={styles.prerequisitesContainer}>
          <h3 className={styles.subtitle}>پیش‌نیازها</h3>
          <ul className={styles.prerequisites} role="list" aria-label="لیست پیش‌نیازهای دوره">
            {prerequisites.map((prereq, index) => (
              <li
                key={`${data.id}-${index}`}
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