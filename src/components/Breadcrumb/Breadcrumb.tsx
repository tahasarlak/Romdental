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
  const { id } = useParams<{ id?: string }>();
  const { courses } = useCourseContext();
  const { instructors } = useInstructorContext();

  // تابع برای تبدیل مسیر به نام‌های خوانا
  const getLabelFromPath = (pathSegment: string, index: number, pathnames: string[]): string => {
    const pathMap: { [key: string]: string } = {
      courses: 'دوره‌ها',
      instructors: 'اساتید',
      blog: 'وبلاگ',
      'instructor-details': 'جزئیات استاد',
    };

    // مدیریت مسیر courses با id
    if (pathSegment === 'courses' && pathnames[index + 1]) {
      const courseId = pathnames[index + 1];
      const course = courses.find((c) => c.id === parseInt(courseId));
      if (course) {
        return course.title;
      } else {
        console.warn(`دوره‌ای با id ${courseId} یافت نشد.`);
        return decodeURIComponent(courseId).replace(/-/g, ' ');
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

    for (let index = 0; index < pathnames.length; index++) {
      const segment = pathnames[index];
      currentPath += `/${segment}`;

      // اگر مسیر courses است
      if (segment === 'courses') {
        // اضافه کردن بخش "دوره‌ها"
        breadcrumbs.push({ label: 'دوره‌ها', path: '/courses' });

        // اگر id بعدی وجود دارد، عنوان دوره را اضافه کن
        if (pathnames[index + 1]) {
          const courseId = pathnames[index + 1];
          const course = courses.find((c) => c.id === parseInt(courseId));
          if (course) {
            breadcrumbs.push({ label: course.title, path: currentPath });
          } else {
            console.warn(`دوره‌ای با id ${courseId} یافت نشد.`);
            breadcrumbs.push({ label: decodeURIComponent(courseId).replace(/-/g, ' '), path: currentPath });
          }
          index++; // رد کردن id
        }
        continue;
      }

      // برای سایر مسیرها
      const label = getLabelFromPath(segment, index, pathnames);
      if (label) {
        breadcrumbs.push({ label, path: currentPath });
      }
    }

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