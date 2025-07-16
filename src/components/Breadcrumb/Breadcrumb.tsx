import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useCourseContext } from '../../Context/CourseContext';
import { useInstructorContext } from '../../Context/InstructorContext';
import styles from './Breadcrumb.module.css';

interface Course {
  id: number;
  title: string;
  slug: string;
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

  const sanitizePathSegment = (segment: string): string => {
    return DOMPurify.sanitize(segment, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
      .replace(/[<>{}]/g, '')
      .trim();
  };

  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter((x) => x && x.length > 0);
    const breadcrumbItems: BreadcrumbItem[] = [{ label: 'خانه', path: '/' }];
    let currentPath = '';

    pathnames.forEach((segment, index) => {
      currentPath += `/${sanitizePathSegment(segment)}`;
      const sanitizedSegment = sanitizePathSegment(segment).toLowerCase();

      if (sanitizedSegment === 'courses') {
        breadcrumbItems.push({ label: 'دوره‌ها', path: '/courses' });
        if (pathnames[index + 1]) {
          const courseSlug = decodeURIComponent(sanitizePathSegment(pathnames[index + 1]));
          const course = Array.isArray(courses)
            ? courses.find((c: Course) => c.slug === courseSlug)
            : null;
          breadcrumbItems.push({
            label: course?.title ?? decodeURIComponent(pathnames[index + 1]).replace(/-/g, ' '),
            path: currentPath,
          });
        }
      } else if (sanitizedSegment === 'instructors' && pathnames[index + 1]) {
        const formattedName = decodeURIComponent(sanitizePathSegment(pathnames[index + 1])).replace(/-/g, ' ');
        const instructor = Array.isArray(instructors)
          ? instructors.find((inst: Instructor) => inst.name.toLowerCase() === formattedName.toLowerCase())
          : null;
        breadcrumbItems.push({
          label: instructor?.name ?? formattedName,
          path: currentPath,
        });
      } else {
        const labelMap: { [key: string]: string } = {
          instructors: 'اساتید',
          blog: 'وبلاگ',
          'instructor-details': 'جزئیات استاد',
        };
        const label = labelMap[sanitizedSegment] ?? decodeURIComponent(sanitizedSegment).replace(/-/g, ' ');
        breadcrumbItems.push({ label, path: currentPath });
      }
    });

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
            key={`${item.path}-${index}`}
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
  );};

export default Breadcrumb;