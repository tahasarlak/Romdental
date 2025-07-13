import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useCourseContext } from '../../Context/CourseContext';
import { useInstructorContext } from '../../Context/InstructorContext';
import styles from './Breadcrumb.module.css';

// Define interfaces for type safety
interface Course {
  id: number;
  title: string;
}

interface Instructor {
  name: string;
}

interface BreadcrumbItem {
  label: string;
  path: string;
}

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { courses } = useCourseContext();
  const { instructors } = useInstructorContext();

  // Sanitize input to prevent XSS
  const sanitizePathSegment = (segment: string): string => {
    return DOMPurify.sanitize(segment, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
      .replace(/[<>{}]/g, '')
      .trim();
  };

  // Map path segments to readable labels
  const getLabelFromPath = (segment: string, index: number, pathnames: string[]): string => {
    const pathMap: { [key: string]: string } = {
      courses: 'دوره‌ها',
      instructors: 'اساتید',
      blog: 'وبلاگ',
      'instructor-details': 'جزئیات استاد',
    };

    const sanitizedSegment = sanitizePathSegment(segment).toLowerCase();

    // Handle courses with ID
    if (sanitizedSegment === 'courses' && pathnames[index + 1]) {
      const courseId = sanitizePathSegment(pathnames[index + 1]);
      const parsedId = parseInt(courseId, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        return 'دوره نامعتبر';
      }
      const course = Array.isArray(courses) ? courses.find((c: Course) => c.id === parsedId) : null;
      return course?.title ?? 'دوره یافت نشد';
    }

    // Handle instructor-details
    if (sanitizedSegment === 'instructor-details' && pathnames[index + 1]) {
      const formattedName = decodeURIComponent(sanitizePathSegment(pathnames[index + 1])).replace(/-/g, ' ');
      const instructor = Array.isArray(instructors)
        ? instructors.find((inst: Instructor) => inst.name.toLowerCase() === formattedName.toLowerCase())
        : null;
      return (instructor?.name ?? formattedName) || 'استاد یافت نشد';
    }

    // General path handling
    return (pathMap[sanitizedSegment] ?? decodeURIComponent(sanitizedSegment).replace(/-/g, ' ')) || 'صفحه';
  };

  // Generate breadcrumbs with useMemo for performance
  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter((x) => x && x.length > 0);
    const breadcrumbItems: BreadcrumbItem[] = [{ label: 'خانه', path: '/' }];
    let currentPath = '';

    for (let index = 0; index < pathnames.length; index++) {
      const segment = pathnames[index];
      currentPath += `/${sanitizePathSegment(segment)}`;

      // Handle courses path
      if (segment.toLowerCase() === 'courses') {
        breadcrumbItems.push({ label: 'دوره‌ها', path: '/courses' });
        if (pathnames[index + 1]) {
          const courseId = sanitizePathSegment(pathnames[index + 1]);
          const parsedId = parseInt(courseId, 10);
          if (!isNaN(parsedId) && parsedId > 0) {
            const course = Array.isArray(courses)
              ? courses.find((c: Course) => c.id === parsedId)
              : null;
            breadcrumbItems.push({
              label: course?.title ?? 'دوره یافت نشد',
              path: currentPath,
            });
          }
          index++; // Skip the ID segment
        }
        continue;
      }

      // Handle other paths
      const label = getLabelFromPath(segment, index, pathnames);
      if (label) {
        breadcrumbItems.push({ label, path: currentPath });
      }
    }

    return breadcrumbItems;
  }, [location.pathname, courses, instructors]);

  return (
    <nav role="navigation" aria-label="breadcrumb" className={styles.breadcrumb}>
      <ol
        className={styles.breadcrumbList}
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {breadcrumbs.map((item, index) => (
          <li
            key={item.path}
            className={styles.breadcrumbItem}
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {index === breadcrumbs.length - 1 ? (
              <span
                className={styles.active}
                itemProp="name"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className={styles.link}
                itemProp="item"
                title={`رفتن به ${item.label}`}
                itemScope
                itemType="https://schema.org/WebPage"
              >
                <span itemProp="name">{item.label}</span>
              </Link>
            )}
            {index < breadcrumbs.length - 1 && (
              <span className={styles.separator} aria-hidden="true">
                {' / '}
              </span>
            )}
            <meta itemProp="position" content={`${index + 1}`} />
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;