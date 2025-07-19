import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useInstructorContext } from './InstructorContext';
import { useNotificationContext } from './NotificationContext';
import { useAuthContext } from './Auth/UserAuthContext';
import { Course, SyllabusItem, ContentItem } from '../types/types';
import moment from 'moment-jalaali';
import DOMPurify from 'dompurify';

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
  fetchCourses: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const slugify = (text: string): string => {
  return DOMPurify.sanitize(text)
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
  const { slug } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState<string[]>(() => {
    const savedUniversities = localStorage.getItem('courseUniversities');
    return savedUniversities ? JSON.parse(savedUniversities) : ['Smashko', 'Piragova', 'RUDN', 'Sechenov'];
  });
  const [categories, setCategories] = useState<string[]>(() => {
    const savedCategories = localStorage.getItem('courseCategories');
    return savedCategories ? JSON.parse(savedCategories) : ['آناتومی', 'پروتز', 'ترمیمی', 'عمومی'];
  });
  const [countries, setCountries] = useState<string[]>(() => {
    const savedCountries = localStorage.getItem('courseCountries');
    return savedCountries ? JSON.parse(savedCountries) : ['China', 'Russia', 'Iran'];
  });
  const [courses, setCourses] = useState<Course[]>(() => {
    const savedCourses = localStorage.getItem('courses');
    let initialCourses: Course[] = [
      {
        id: 3,
        title: 'دوره ترمیمی دندانپزشکی',
        instructor: 'مریم حسینی',
        description: DOMPurify.sanitize('آموزش تکنیک‌های ترمیمی در دندانپزشکی با تمرکز بر روش‌های مدرن.'),
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
            title: DOMPurify.sanitize('آشنایی با مواد ترمیمی'),
            isLocked: false,
            previewContent: DOMPurify.sanitize('بررسی مواد مورد استفاده در ترمیم دندان.'),
            contents: [
              {
                type: 'text',
                text: DOMPurify.sanitize('توضیحات جامع درباره مواد ترمیمی و کاربردهای آن‌ها.'),
                title: DOMPurify.sanitize('مواد ترمیمی'),
              },
              {
                type: 'image',
                url: '/assets/images/restorative-materials.jpg',
                title: DOMPurify.sanitize('تصویر مواد ترمیمی'),
              },
            ],
            completed: false,
            duration: '40 دقیقه',
            isNew: false,
          },
          {
            id: 2,
            title: DOMPurify.sanitize('تکنیک‌های ترمیمی پیشرفته'),
            isLocked: false,
            previewContent: DOMPurify.sanitize('آموزش تکنیک‌های پیشرفته ترمیمی.'),
            contents: [
              {
                type: 'video',
                url: 'https://example.com/restorative-techniques.mp4',
                title: DOMPurify.sanitize('ویدیو تکنیک‌های ترمیمی'),
              },
            ],
            completed: false,
            duration: '50 دقیقه',
            isNew: true,
          },
        ],
        faqs: [
          { id: 1, question: DOMPurify.sanitize('آیا این دوره عملی است؟'), answer: DOMPurify.sanitize('بله، شامل جلسات عملی و تئوری است.') },
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
      {
        id: 2,
        title: 'دوره آنلاین جراحی دندانپزشکی پیشرفته',
        instructor: 'مریم حسینی',
        description: DOMPurify.sanitize('آموزش تکنیک‌های پیشرفته جراحی دندانپزشکی به صورت آنلاین با تمرکز بر روش‌های نوین.'),
        duration: '8 هفته',
        courseNumber: 'Course 4',
        category: 'جراحی',
        image: '/assets/courses/surgery.jpg',
        price: formatPriceWithCurrency(8000000, 'IRR'),
        discountPrice: formatPriceWithCurrency(7200000, 'IRR'),
        discountPercentage: 10,
        startDateJalali: '1404/05/01',
        startDateGregorian: '2025-07-23',
        isOpen: true,
        isFeatured: false,
        syllabus: [
          {
            id: 1,
            title: DOMPurify.sanitize('آشنایی با ابزارهای جراحی'),
            isLocked: false,
            previewContent: DOMPurify.sanitize('معرفی ابزارهای مورد استفاده در جراحی دندانپزشکی.'),
            contents: [
              {
                type: 'text',
                text: DOMPurify.sanitize('توضیحات جامع درباره ابزارهای جراحی و کاربردهای آن‌ها.'),
                title: DOMPurify.sanitize('ابزارهای جراحی'),
              },
              {
                type: 'image',
                url: '/assets/images/surgery-tools.jpg',
                title: DOMPurify.sanitize('تصویر ابزارهای جراحی'),
              },
            ],
            completed: false,
            duration: '45 دقیقه',
            isNew: true,
          },
          {
            id: 2,
            title: DOMPurify.sanitize('تکنیک‌های جراحی پیشرفته'),
            isLocked: true,
            previewContent: DOMPurify.sanitize('آموزش تکنیک‌های جراحی پیشرفته به صورت عملی.'),
            contents: [
              {
                type: 'video',
                url: 'https://example.com/surgery-techniques.mp4',
                title: DOMPurify.sanitize('ویدیو تکنیک‌های جراحی'),
              },
            ],
            completed: false,
            duration: '60 دقیقه',
            isNew: false,
          },
        ],
        faqs: [
          {
            id: 1,
            question: DOMPurify.sanitize('آیا این دوره شامل جلسات عملی است؟'),
            answer: DOMPurify.sanitize('بله، این دوره شامل ویدیوهای عملی و شبیه‌سازی‌های آنلاین است.'),
          },
        ],
        tags: ['جراحی', 'دندانپزشکی', 'آنلاین'],
        prerequisites: ['آشنایی با اصول اولیه جراحی دندانپزشکی'],
        courseType: 'Online',
        university: 'Sechenov',
        currency: 'IRR',
        countries: ['Iran', 'Russia'],
        level: 'Advanced',
        enrollmentCount: 0,
        slug: ''
      },
    ];
    return savedCourses ? JSON.parse(savedCourses) : initialCourses;
  });

  useEffect(() => {
    try {
      localStorage.setItem('courses', JSON.stringify(courses));
      localStorage.setItem('courseUniversities', JSON.stringify(universities));
      localStorage.setItem('courseCategories', JSON.stringify(categories));
      localStorage.setItem('courseCountries', JSON.stringify(countries));
    } catch (error) {
      showNotification('خطا در ذخیره‌سازی داده‌های دوره‌ها!', 'error');
    }
  }, [courses, universities, categories, countries, showNotification]);

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
    return (
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
      (item.isNew === undefined || typeof item.isNew === 'boolean')
    );
  };

  const validateCourse = (course: Course): boolean => {
    const instructorNames = new Set(instructors.map((i) => i.name));
    const validCourseTypes = ['Online', 'Offline', 'In-Person', 'Hybrid'];
    const validCurrencies = ['RUB', 'CNY', 'IRR'];

    if (!instructorNames.has(course.instructor)) return false;
    if (typeof course.category !== 'string' || course.category.trim() === '') return false;
    if (!validCourseTypes.includes(course.courseType)) return false;
    if (typeof course.university !== 'string' || course.university.trim() === '') return false;
    if (!Array.isArray(course.syllabus) || !course.syllabus.every(validateSyllabusItem)) return false;
    if (!validCurrencies.includes(course.currency)) return false;
    if (!Array.isArray(course.countries) || course.countries.length === 0 || !course.countries.every((c) => typeof c === 'string' && c.trim() !== '')) return false;
    const priceValue = parsePersianNumber(course.price);
    if (isNaN(priceValue) || priceValue <= 0) return false;
    if (course.discountPrice !== undefined && course.discountPercentage !== undefined) {
      const discountPriceValue = parsePersianNumber(course.discountPrice);
      if (isNaN(discountPriceValue) || discountPriceValue >= priceValue) return false;
      if (typeof course.discountPercentage !== 'number' || course.discountPercentage <= 0 || course.discountPercentage >= 100) return false;
      const calculatedDiscountPercentage = ((priceValue - discountPriceValue) / priceValue) * 100;
      if (Math.abs(calculatedDiscountPercentage - course.discountPercentage) > 0.1) return false;
    } else if (course.discountPrice !== undefined || course.discountPercentage !== undefined) return false;
    if (!isValidJalaliDate(course.startDateJalali) || !isValidGregorianDate(course.startDateGregorian)) return false;
    if (!areDatesConsistent(course.startDateJalali, course.startDateGregorian)) return false;
    return true;
  };

  const validateAndSetCourses = (newCourses: Course[] | ((prev: Course[]) => Course[])) => {
    setCourses((prev) => {
      const updatedCourses = typeof newCourses === 'function' ? newCourses(prev) : newCourses;
      return updatedCourses.filter(validateCourse);
    });
  };

  const addUniversity = (university: string) => {
    const sanitizedUniversity = DOMPurify.sanitize(university);
    if (sanitizedUniversity.trim() === '') {
      showNotification('نام دانشگاه نمی‌تواند خالی باشد', 'error');
      return;
    }
    if (universities.includes(sanitizedUniversity)) {
      showNotification('دانشگاه قبلاً وجود دارد', 'error');
      return;
    }
    setUniversities((prev) => [...prev, sanitizedUniversity]);
    showNotification(`دانشگاه ${sanitizedUniversity} با موفقیت اضافه شد`, 'success');
  };

  const addCategory = (category: string) => {
    const sanitizedCategory = DOMPurify.sanitize(category);
    if (sanitizedCategory.trim() === '') {
      showNotification('نام دسته‌بندی نمی‌تواند خالی باشد', 'error');
      return;
    }
    if (categories.includes(sanitizedCategory)) {
      showNotification('دسته‌بندی قبلاً وجود دارد', 'error');
      return;
    }
    setCategories((prev) => [...prev, sanitizedCategory]);
    showNotification(`دسته‌بندی ${sanitizedCategory} با موفقیت اضافه شد`, 'success');
  };

  const addCountry = (country: string) => {
    const sanitizedCountry = DOMPurify.sanitize(country);
    if (sanitizedCountry.trim() === '') {
      showNotification('نام کشور نمی‌تواند خالی باشد', 'error');
      return;
    }
    if (countries.includes(sanitizedCountry)) {
      showNotification('کشور قبلاً وجود دارد', 'error');
      return;
    }
    setCountries((prev) => [...prev, sanitizedCountry]);
    showNotification(`کشور ${sanitizedCountry} با موفقیت اضافه شد`, 'success');
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

      const sanitizedCourse: Omit<Course, 'id'> = {
        ...course,
        title: DOMPurify.sanitize(course.title),
        instructor: DOMPurify.sanitize(course.instructor),
        description: DOMPurify.sanitize(course.description),
        duration: DOMPurify.sanitize(course.duration),
        courseNumber: DOMPurify.sanitize(course.courseNumber),
        category: DOMPurify.sanitize(course.category),
        image: DOMPurify.sanitize(course.image),
        price: DOMPurify.sanitize(course.price),
        discountPrice: course.discountPrice ? DOMPurify.sanitize(course.discountPrice) : undefined,
        startDateJalali: DOMPurify.sanitize(startDateJalali),
        startDateGregorian: DOMPurify.sanitize(startDateGregorian),
        syllabus: course.syllabus.map((item) => ({
          ...item,
          title: DOMPurify.sanitize(item.title),
          previewContent: item.previewContent ? DOMPurify.sanitize(item.previewContent) : undefined,
          contents: item.contents.map((content) => ({
            ...content,
            title: content.title ? DOMPurify.sanitize(content.title) : undefined,
            text: content.text ? DOMPurify.sanitize(content.text) : undefined,
            url: content.url ? DOMPurify.sanitize(content.url) : undefined,
          })),
        })),
        faqs: course.faqs.map((faq) => ({
          id: faq.id,
          question: DOMPurify.sanitize(faq.question),
          answer: DOMPurify.sanitize(faq.answer),
        })),
        tags: course.tags.map((tag) => DOMPurify.sanitize(tag)),
        prerequisites: course.prerequisites.map((prereq) => DOMPurify.sanitize(prereq)),
        university: DOMPurify.sanitize(course.university),
      };

      let newCourse: Course = {
        ...sanitizedCourse,
        id: Math.max(...courses.map((c) => c.id), 0) + 1,
        enrollmentCount: 0,
        slug: slugify(sanitizedCourse.title),
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

  const fetchCourses = () => {
    setLoading(true);
    try {
      if (slug) {
        const filteredCourses = courses.filter((course) => course.slug === slug);
        validateAndSetCourses(filteredCourses);
      } else {
        validateAndSetCourses(courses);
      }
    } catch (error: any) {
      showNotification(error.message || 'خطا در بارگذاری دوره‌ها', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [slug]);

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