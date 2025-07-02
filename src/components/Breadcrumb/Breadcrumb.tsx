import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useCourseContext } from '../../Context/CourseContext';
import { useInstructorContext } from '../../Context/InstructorContext';
import styles from './Breadcrumb.module.css';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { slug, instructorName } = useParams<{ slug?: string; instructorName?: string }>();
  const { courses } = useCourseContext();
  const { instructors } = useInstructorContext();

  // تابع برای تبدیل مسیر به نام‌های خوانا
  const getLabelFromPath = (pathSegment: string, index: number, pathnames: string[]): string => {
    const pathMap: { [key: string]: string } = {
      courses: 'دوره‌ها',
      instructors: 'اساتید',
      blog: 'وبلاگ',
      'course-details': 'جزئیات دوره',
      'instructor-details': 'جزئیات استاد',
    };

    // مدیریت مسیر course-details
    if (pathSegment === 'course-details' && pathnames[index + 1]) {
      const courseSlug = pathnames[index + 1];
      const course = courses.find((c) => c.slug === courseSlug);

      if (course) {
        return course.title;
      } else {
        console.warn(`دوره‌ای با slug ${courseSlug} یافت نشد.`);
        return decodeURIComponent(courseSlug).replace(/-/g, ' ');
      }
    }

    // مدیریت مسیر instructor-details
    if (pathSegment === 'instructor-details' && pathnames[index + 1]) {
      const formattedName = decodeURIComponent(pathnames[index + 1]).replace(/-/g, ' ');
      const instructor = instructors.find(
        (inst) => inst.name.toLowerCase() === formattedName.toLowerCase()
      );
      return instructor ? instructor.name : formattedName;
    }

    // مدیریت مسیرهای عمومی
    return pathMap[pathSegment.toLowerCase()] || decodeURIComponent(pathSegment).replace(/-/g, ' ');
  };

  // ایجاد مسیرهای breadcrumb داینامیک
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'خانه', path: '/' }];

    let currentPath = '';

    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = getLabelFromPath(segment, index, pathnames);
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav aria-label="breadcrumb" className={styles.breadcrumb}>
      <ul className={styles.breadcrumbList}>
        {breadcrumbs.map((item, index) => (
          <li key={item.path} className={styles.breadcrumbItem}>
            {index === breadcrumbs.length - 1 ? (
              <span className={styles.active}>{item.label}</span>
            ) : (
              <Link to={item.path} className={styles.link}>
                {item.label}
              </Link>
            )}
            {index < breadcrumbs.length - 1 && <span className={styles.separator}> / </span>}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Breadcrumb;