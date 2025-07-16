// CourseContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useInstructorContext } from './InstructorContext';
import { useNotificationContext } from './NotificationContext';
import { useAuthContext } from './AuthContext';
import { useEnrollmentContext } from './EnrollmentContext';
import { Course, SyllabusItem, ContentItem, Enrollment } from '../types/types';
import moment from 'moment-jalaali';

moment.loadPersian({ dialect: 'persian-modern' });

interface CourseContextType {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  universities: string[];
  addUniversity: (university: string) => void;
  categories: string[];
  addCategory: (category: string) => void;
  countries: string[];
  addCountry: (country: string) => void;
  loading: boolean;
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  deleteCourse: (courseId: number) => Promise<void>;
  fetchCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const slugify = (text: string): string => {
  return text
    .trim()
    .replace(/[\s+]/g, '-')
    .replace(/[^\u0600-\u06FF\w-]/g, '')
    .replace(/-+/g, '-')
    .toLowerCase();
};

const parsePersianNumber = (numberStr: string): number => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const standardDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let cleanedStr = numberStr.replace(/[, ]/g, '');
  persianDigits.forEach((digit, index) => {
    cleanedStr = cleanedStr.replace(new RegExp(digit, 'g'), standardDigits[index]);
  });
  return parseFloat(cleanedStr);
};

const formatPriceWithCurrency = (price: number, currency: string): string => {
  const currencySymbols: { [key: string]: string } = {
    IRR: 'ریال',
    RUB: 'روبل',
    CNY: 'یوان',
  };
  return `${price.toLocaleString('fa-IR')} ${currencySymbols[currency] || currency}`;
};

const isValidJalaliDate = (dateStr: string): boolean => {
  const jalaliDatePattern = /^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;
  if (!jalaliDatePattern.test(dateStr)) return false;
  try {
    const jalaliDate = moment(dateStr, 'jYYYY/jMM/jDD');
    return jalaliDate.isValid();
  } catch (error) {
    return false;
  }
};

const isValidGregorianDate = (dateStr: string): boolean => {
  const gregorianDatePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!gregorianDatePattern.test(dateStr)) return false;
  try {
    const gregorianDate = moment(dateStr, 'YYYY-MM-DD');
    return gregorianDate.isValid();
  } catch (error) {
    return false;
  }
};

const jalaliToGregorian = (jalaliDate: string): string | null => {
  if (!isValidJalaliDate(jalaliDate)) return null;
  const jalaliMoment = moment(jalaliDate, 'jYYYY/jMM/jDD');
  return jalaliMoment.format('YYYY-MM-DD');
};

const gregorianToJalali = (gregorianDate: string): string | null => {
  if (!isValidGregorianDate(gregorianDate)) return null;
  const gregorianMoment = moment(gregorianDate, 'YYYY-MM-DD');
  return gregorianMoment.format('jYYYY/jMM/jDD');
};

const areDatesConsistent = (jalaliDate: string, gregorianDate: string): boolean => {
  if (!isValidJalaliDate(jalaliDate) || !isValidGregorianDate(gregorianDate)) return false;
  const jalaliToGreg = jalaliToGregorian(jalaliDate);
  return jalaliToGreg === gregorianDate;
};

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { instructors } = useInstructorContext();
  const { showNotification } = useNotificationContext();
  const { user } = useAuthContext();
  const { enrollments } = useEnrollmentContext();
  const { slug } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [universities, setUniversities] = useState<string[]>(['Smashko', 'Piragova', 'RUDN', 'Sechenov']);
  const [categories, setCategories] = useState<string[]>(['آناتومی', 'پروتز', 'ترمیمی', 'عمومی']);
  const [countries, setCountries] = useState<string[]>(['China', 'Russia', 'Iran']);
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 3,
      title: 'دوره ترمیمی دندانپزشکی',
      instructor: 'مریم حسینی',
      description: 'آموزش تکنیک‌های ترمیمی در دندانپزشکی با تمرکز بر روش‌های مدرن.',
      duration: '10 هفته',
      courseNumber: 'Course 3',
      category: 'ترمیمی',
      image: '/assets/courses/restorative.jpg',
      price: formatPriceWithCurrency(6000000, 'CNY'),
      discountPrice: undefined,
      discountPercentage: undefined,
      startDateJalali: '1404/04/01',
      startDateGregorian: '2025-06-22',
      isOpen: true,
      isFeatured: true,
      enrollmentCount: 0,
      syllabus: [
        {
          id: 1,
          title: 'آشنایی با مواد ترمیمی',
          isLocked: false,
          previewContent: 'بررسی مواد مورد استفاده در ترمیم دندان.',
          contents: [
            {
              type: 'text',
              text: 'توضیحات جامع درباره مواد ترمیمی و کاربردهای آن‌ها.',
              title: 'مواد ترمیمی',
            },
            {
              type: 'image',
              url: '/assets/images/restorative-materials.jpg',
              title: 'تصویر مواد ترمیمی',
            },
          ],
          completed: false,
          duration: '40 دقیقه',
          isNew: false,
        },
        {
          id: 2,
          title: 'تکنیک‌های ترمیمی پیشرفته',
          isLocked: false,
          previewContent: 'آموزش تکنیک‌های پیشرفته ترمیمی.',
          contents: [
            {
              type: 'video',
              url: 'https://example.com/restorative-techniques.mp4',
              title: 'ویدیو تکنیک‌های ترمیمی',
            },
          ],
          completed: false,
          duration: '50 دقیقه',
          isNew: true,
        },
      ],
      faqs: [
        { id: 1, question: 'آیا این دوره عملی است؟', answer: 'بله، شامل جلسات عملی و تئوری است.' },
      ],
      tags: ['ترمیمی', 'دندانپزشکی', 'عم عملی'],
      prerequisites: ['آشنایی با آناتومی دندان'],
      courseType: 'In-Person',
      university: 'RUDN',
      slug: slugify('دوره ترمیمی دندانپزشکی'),
      currency: 'CNY',
      countries: ['China', 'Iran'],
      level: 'Intermediate',
    },
  ]);

  const updateCoursesWithEnrollmentCount = (courses: Course[], enrollments: Enrollment[]): Course[] => {
    return courses.map((course) => ({
      ...course,
      enrollmentCount: enrollments.filter((e) => e.courseId === course.id).length,
    }));
  };

  const validateContentItem = (content: ContentItem): boolean => {
    const validTypes = ['video', 'image', 'text', 'quiz'];
    const isValidType = validTypes.includes(content.type);
    const isValidUrl =
      content.url === undefined ||
      (typeof content.url === 'string' &&
        (content.type === 'image'
          ? content.url.startsWith('/assets/') || /^https?:\/\/.*/.test(content.url)
          : /^https?:\/\/.*/.test(content.url)));
    const isValidText =
      content.text === undefined || (typeof content.text === 'string' && content.text.length <= 500);
    const isValidTitle =
      content.title === undefined || (typeof content.title === 'string' && content.title.length <= 100);

    return isValidType && isValidUrl && isValidText && isValidTitle;
  };

  const validateSyllabusItem = (item: SyllabusItem): boolean => {
    const isValid =
      typeof item.id === 'number' &&
      typeof item.title === 'string' &&
      item.title.trim() !== '' &&
      item.title.length <= 100 &&
      typeof item.duration === 'string' &&
      item.duration.trim() !== '' &&
      item.duration.length <= 50 &&
      typeof item.completed === 'boolean' &&
      typeof item.isLocked === 'boolean' &&
      (item.previewContent === undefined || (typeof item.previewContent === 'string' && item.previewContent.length <= 500)) &&
      Array.isArray(item.contents) &&
      item.contents.every(validateContentItem) &&
      (item.isNew === undefined || typeof item.isNew === 'boolean');
    console.log(`Validating syllabus item ${item.id}:`, isValid, item);
    return isValid;
  };

  const validateCourse = (course: Course): boolean => {
    const instructorNames = new Set(instructors.map((i) => i.name));
    const validCourseTypes = ['Online', 'Offline', 'In-Person', 'Hybrid'];
    const validCurrencies = ['RUB', 'CNY', 'IRR'];

    if (!instructorNames.has(course.instructor)) {
      console.warn(`استاد ${course.instructor} برای دوره ${course.title} یافت نشد.`);
      return false;
    }
    if (typeof course.category !== 'string' || course.category.trim() === '') {
      console.warn(`دسته‌بندی ${course.category} نامعتبر است.`);
      return false;
    }
    if (!validCourseTypes.includes(course.courseType)) {
      console.warn(`نوع دوره ${course.courseType} نامعتبر است.`);
      return false;
    }
    if (typeof course.university !== 'string' || course.university.trim() === '') {
      console.warn(`دانشگاه ${course.university} نامعتبر است.`);
      return false;
    }
    if (!Array.isArray(course.syllabus) || !course.syllabus.every(validateSyllabusItem)) {
      console.warn(`سرفصل‌های دوره ${course.title} نامعتبر است.`);
      return false;
    }
    if (!validCurrencies.includes(course.currency)) {
      console.warn(`ارز ${course.currency} نامعتبر است.`);
      return false;
    }
    if (
      !Array.isArray(course.countries) ||
      course.countries.length === 0 ||
      !course.countries.every((c) => typeof c === 'string' && c.trim() !== '')
    ) {
      console.warn(`کشورهای ${course.countries} نامعتبر است.`);
      return false;
    }
    const priceValue = parsePersianNumber(course.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      console.warn(`قیمت ${course.price} نامعتبر است.`);
      return false;
    }
    if (course.discountPrice !== undefined && course.discountPercentage !== undefined) {
      const discountPriceValue = parsePersianNumber(course.discountPrice);
      if (isNaN(discountPriceValue) || discountPriceValue >= priceValue) {
        console.warn(`قیمت تخفیفی ${course.discountPrice} نامعتبر است.`);
        return false;
      }
      if (typeof course.discountPercentage !== 'number' || course.discountPercentage <= 0 || course.discountPercentage >= 100) {
        console.warn(`درصد تخفیف ${course.discountPercentage} نامعتبر است.`);
        return false;
      }
      const calculatedDiscountPercentage = ((priceValue - discountPriceValue) / priceValue) * 100;
      if (Math.abs(calculatedDiscountPercentage - course.discountPercentage) > 0.1) {
        console.warn(`درصد تخفیف ${course.discountPercentage} با قیمت تخفیفی ${course.discountPrice} همخوانی ندارد.`);
        return false;
      }
    } else if (course.discountPrice !== undefined || course.discountPercentage !== undefined) {
      console.warn(`قیمت تخفیفی و درصد تخفیف باید هر دو مشخص شوند یا هیچ‌کدام.`);
      return false;
    }
    if (!isValidJalaliDate(course.startDateJalali)) {
      console.warn(`تاریخ شروع جلالی ${course.startDateJalali} نامعتبر است. باید در فرمت YYYY/MM/DD باشد.`);
      return false;
    }
    if (!isValidGregorianDate(course.startDateGregorian)) {
      console.warn(`تاریخ شروع میلادی ${course.startDateGregorian} نامعتبر است. باید در فرمت YYYY-MM-DD باشد.`);
      return false;
    }
    if (!areDatesConsistent(course.startDateJalali, course.startDateGregorian)) {
      console.warn(`تاریخ‌های جلالی ${course.startDateJalali} و میلادی ${course.startDateGregorian} همخوانی ندارند.`);
      return false;
    }
    return true;
  };

  const validateAndSetCourses = (newCourses: Course[] | ((prev: Course[]) => Course[])) => {
    setCourses((prev) => {
      const updatedCourses = typeof newCourses === 'function' ? newCourses(prev) : newCourses;
      const validatedCourses = updatedCourses.filter(validateCourse);
      console.log('Validated courses:', validatedCourses);
      return updateCoursesWithEnrollmentCount(validatedCourses, enrollments);
    });
  };

  const addUniversity = (university: string) => {
    if (university.trim() === '') {
      showNotification('نام دانشگاه نمی‌تواند خالی باشد', 'error');
      return;
    }
    if (universities.includes(university)) {
      showNotification('دانشگاه قبلاً وجود دارد', 'error');
      return;
    }
    setUniversities((prev) => [...prev, university]);
    showNotification(`دانشگاه ${university} با موفقیت اضافه شد`, 'success');
  };

  const addCategory = (category: string) => {
    if (category.trim() === '') {
      showNotification('نام دسته‌بندی نمی‌تواند خالی باشد', 'error');
      return;
    }
    if (categories.includes(category)) {
      showNotification('دسته‌بندی قبلاً وجود دارد', 'error');
      return;
    }
    setCategories((prev) => [...prev, category]);
    showNotification(`دسته‌بندی ${category} با موفقیت اضافه شد`, 'success');
  };

  const addCountry = (country: string) => {
    if (country.trim() === '') {
      showNotification('نام کشور نمی‌تواند خالی باشد', 'error');
      return;
    }
    if (countries.includes(country)) {
      showNotification('کشور قبلاً وجود دارد', 'error');
      return;
    }
    setCountries((prev) => [...prev, country]);
    showNotification(`کشور ${country} با موفقیت اضافه شد`, 'success');
  };

  const addCourse = async (course: Omit<Course, 'id'>) => {
    setLoading(true);
    try {
      if (!user || !['SuperAdmin', 'Admin', 'Instructor'].includes(user.role)) {
        throw new Error('فقط سوپرادمین، ادمین یا استاد می‌توانند دوره اضافه کنند');
      }
      const instructorNames = new Set(instructors.map((i) => i.name));
      if (!instructorNames.has(course.instructor)) {
        throw new Error(`استاد ${course.instructor} وجود ندارد`);
      }

      let { startDateJalali, startDateGregorian } = course;
      if (!startDateJalali || !startDateGregorian) {
        throw new Error('هر دو تاریخ جلالی و میلادی باید مشخص شوند');
      }
      if (!isValidJalaliDate(startDateJalali)) {
        throw new Error('تاریخ شروع جلالی نامعتبر است. باید در فرمت YYYY/MM/DD باشد.');
      }
      if (!isValidGregorianDate(startDateGregorian)) {
        throw new Error('تاریخ شروع میلادی نامعتبر است. باید در فرمت YYYY-MM-DD باشد.');
      }
      if (!areDatesConsistent(startDateJalali, startDateGregorian)) {
        const correctedGregorian = jalaliToGregorian(startDateJalali);
        if (correctedGregorian) {
          startDateGregorian = correctedGregorian;
        } else {
          throw new Error('تاریخ‌های جلالی و میلادی همخوانی ندارند');
        }
      }

      let newCourse: Course = {
        ...course,
        id: Math.max(...courses.map((c) => c.id), 0) + 1,
        enrollmentCount: 0,
        startDateJalali,
        startDateGregorian,
        slug: slugify(course.title),
      };

      if (newCourse.discountPrice && !newCourse.discountPercentage) {
        const priceValue = parsePersianNumber(newCourse.price);
        const discountPriceValue = parsePersianNumber(newCourse.discountPrice);
        newCourse.discountPercentage = ((priceValue - discountPriceValue) / priceValue) * 100;
      } else if (newCourse.discountPercentage && !newCourse.discountPrice) {
        const priceValue = parsePersianNumber(newCourse.price);
        newCourse.discountPrice = formatPriceWithCurrency(
          priceValue * (100 - newCourse.discountPercentage) / 100,
          newCourse.currency
        );
      }

      if (!validateCourse(newCourse)) {
        throw new Error('دوره نامعتبر است');
      }
      if (!universities.includes(newCourse.university)) {
        addUniversity(newCourse.university);
      }
      if (!categories.includes(newCourse.category)) {
        addCategory(newCourse.category);
      }
      newCourse.countries.forEach((country) => {
        if (!countries.includes(country)) {
          addCountry(country);
        }
      });
      validateAndSetCourses((prev) => [...prev, newCourse]);
      showNotification('دوره با موفقیت اضافه شد', 'success');
    } catch (error: any) {
      showNotification(error.message, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId: number) => {
    setLoading(true);
    try {
      if (!user || !['SuperAdmin', 'Admin'].includes(user.role)) {
        throw new Error('فقط سوپرادمین و ادمین می‌توانند دوره را حذف کنند');
      }
      validateAndSetCourses((prev) => prev.filter((course) => course.id !== courseId));
      showNotification('دوره با موفقیت حذف شد', 'success');
    } catch (error: any) {
      showNotification(error.message, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/courses${slug ? `/${slug}` : ''}`);
      const data = await response.json();
      const coursesData = Array.isArray(data) ? data : data.course ? [data.course] : [];
      validateAndSetCourses(coursesData);
    } catch (error: any) {
      console.error('Failed to fetch courses:', error);
      showNotification('خطایی در بارگذاری دوره‌ها رخ داد. لطفاً دوباره تلاش کنید.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [instructors, slug, location.pathname]);

  return (
    <CourseContext.Provider
      value={{
        courses,
        setCourses: validateAndSetCourses,
        universities,
        addUniversity,
        categories,
        addCategory,
        countries,
        addCountry,
        loading,
        addCourse,
        deleteCourse,
        fetchCourses,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourseContext = () => {
  const context = useContext(CourseContext);
  if (!context) throw new Error('useCourseContext must be used within a CourseProvider');
  return context;
};