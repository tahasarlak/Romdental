
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useInstructorContext } from './InstructorContext';
import { useNotificationContext } from './NotificationContext';
import { useAuthContext } from './AuthContext';
import { Course, SyllabusItem, ContentItem } from '../types/types';

interface CourseContextType {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  universities: string[];
  addUniversity: (university: string) => void;
  categories: string[];
  addCategory: (category: string) => void;
  loading: boolean;
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  deleteCourse: (courseId: number) => Promise<void>;
  fetchCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { instructors } = useInstructorContext();
  const { showNotification } = useNotificationContext();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [universities, setUniversities] = useState<string[]>(['Smashko', 'Piragova', 'RUDN', 'Sechenov']);
  const [categories, setCategories] = useState<string[]>(['آناتومی', 'پروتز', 'ترمیمی', 'عمومی']);
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: "دوره جامع آناتومی دندان",
      instructor: "سارا احمدی",
      description: "آموزش کامل آناتومی دندان با تمرکز بر تکنیک‌های عملی و تئوری پیشرفته.",
      duration: "8 هفته",
      courseNumber: "Course 1",
      category: "آناتومی",
      image: "/assets/courses/anatomy.jpg",
      price: "۴,۵۰۰,۰۰۰ تومان",
      discountPrice: "۳,۸۰۰,۰۰۰ تومان",
      discountPercentage: 15,
      startDate: "اردیبهشت ۱۴۰۴",
      isOpen: true, 
      isFeatured: true,
      enrollmentCount: 120,
      syllabus: [
        {
          id: 1,
          title: "مقدمه‌ای بر آناتومی دندان",
          isLocked: false,
          previewContent: "بررسی ساختار دندان و اجزای آن.",
          contents: [
            {
              type: "video",
              url: "https://example.com/videos/anatomy-intro.mp4",
              title: "ویدیو معرفی آناتومی",
            },
            {
              type: "image",
              url: "/assets/images/anatomy-diagram.jpg",
              title: "دیاگرام ساختار دندان",
            },
            {
              type: "text",
              text: "توضیحات متنی درباره ساختار دندان و کاربردهای آن در دندانپزشکی.",
              title: "متن آموزشی",
            },
          ],
          completed: true,
          duration: "30 دقیقه",
          isNew: true,
        },
      ],
      faqs: [
        { id: 1, question: "آیا این دوره پیش‌نیاز دارد؟", answer: "خیر، این دوره برای سطح متوسط طراحی شده است." },
      ],
      tags: ["آناتومی", "دندانپزشکی", "عملی"],
      prerequisites: ["آشنایی اولیه با دندانپزشکی"],
      courseType: "Online",
      university: "Smashko",
      slug: "anatomy-course",
      currency: ''
    },
    {
      id: 2,
      title: "دوره پیشرفته پروتز دندانی",
      instructor: "علی محمدی",
      description: "آموزش تکنیک‌های پیشرفته در طراحی و ساخت پروتزهای دندانی با تمرکز بر مواد جدید.",
      duration: "6 هفته",
      courseNumber: "Course 2",
      category: "پروتز",
      image: "/assets/courses/prosthodontics.jpg",
      price: "۵,۲۰۰,۰۰۰ تومان",
      discountPrice: "۴,۵۰۰,۰۰۰ تومان",
      discountPercentage: 13,
      startDate: "خرداد ۱۴۰۴",
      isOpen: true,
      isFeatured: false,
      enrollmentCount: 80,
      syllabus: [
        {
          id: 1,
          title: "مقدمه‌ای بر پروتزهای دندانی",
          isLocked: false,
          previewContent: "آشنایی با انواع پروتزهای دندانی.",
          contents: [
            {
              type: "video",
              url: "https://example.com/videos/prosthodontics-intro.mp4",
              title: "ویدیو معرفی پروتز",
            },
            {
              type: "quiz",
              text: "آزمون کوتاه درباره انواع پروتزهای دندانی.",
              title: "آزمون اولیه",
            },
          ],
          completed: false,
          duration: "45 دقیقه",
          isNew: true,
        },
      ],
      faqs: [
        { id: 1, question: "چه مهارت‌هایی در این دوره کسب می‌شود؟", answer: "طراحی پروتزهای دندانی و استفاده از مواد جدید." },
      ],
      tags: ["پروتز", "دندانپزشکی", "پیشرفته"],
      prerequisites: ["دانش پایه آناتومی دندان"],
      courseType: "Hybrid",
      university: "Sechenov",
      slug: "prosthodontics-course",
      currency: ''
    },
    {
      id: 3,
      title: "دوره ترمیمی دندانپزشکی",
      instructor: "مریم حسینی",
      description: "آموزش تکنیک‌های ترمیمی در دندانپزشکی با تمرکز بر روش‌های مدرن.",
      duration: "10 هفته",
      courseNumber: "Course 3",
      category: "ترمیمی",
      image: "/assets/courses/restorative.jpg",
      price: "۶,۰۰۰,۰۰۰ تومان",
      discountPrice: undefined,
      discountPercentage: undefined,
      startDate: "تیر ۱۴۰۴",
      isOpen: false,
      isFeatured: true,
      enrollmentCount: 50,
      syllabus: [
        {
          id: 1,
          title: "آشنایی با مواد ترمیمی",
          isLocked: true,
          previewContent: "بررسی مواد مورد استفاده در ترمیم دندان.",
          contents: [
            {
              type: "text",
              text: "توضیحات جامع درباره مواد ترمیمی و کاربردهای آن‌ها.",
              title: "مواد ترمیمی",
            },
            {
              type: "image",
              url: "/assets/images/restorative-materials.jpg",
              title: "تصویر مواد ترمیمی",
            },
          ],
          completed: false,
          duration: "40 دقیقه",
          isNew: false,
        },
      ],
      faqs: [
        { id: 1, question: "آیا این دوره عملی است؟", answer: "بله، شامل جلسات عملی و تئوری است." },
      ],
      tags: ["ترمیمی", "دندانپزشکی", "عملی"],
      prerequisites: ["آشنایی با آناتومی دندان"],
      courseType: "In-Person",
      university: "RUDN",
      slug: "restorative-dentistry-course",
      currency: ''
    },
  ]);

  const validateContentItem = (content: ContentItem): boolean => {
    const validTypes = ['video', 'image', 'text', 'quiz'];
    return (
      validTypes.includes(content.type) &&
      (content.url === undefined ||
        (typeof content.url === 'string' &&
          (content.type === 'image' ? content.url.startsWith('/assets/') || /^https?:\/\/.*/.test(content.url) : /^https?:\/\/.*/.test(content.url)))) &&
      (content.text === undefined || (typeof content.text === 'string' && content.text.length <= 500)) &&
      (content.title === undefined || (typeof content.title === 'string' && content.title.length <= 100))
    );
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

    return true;
  };
console.log('Initial courses in CourseProvider:', courses);
  const validateAndSetCourses = (newCourses: Course[] | ((prev: Course[]) => Course[])) => {
    setCourses((prev) => {
      const updatedCourses = typeof newCourses === 'function' ? newCourses(prev) : newCourses;
      return updatedCourses.filter(validateCourse);
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
      const newCourse: Course = { ...course, id: Math.max(...courses.map((c) => c.id), 0) + 1 };
      if (!validateCourse(newCourse)) {
        throw new Error('دوره نامعتبر است');
      }
      if (!universities.includes(newCourse.university)) {
        addUniversity(newCourse.university);
      }
      if (!categories.includes(newCourse.category)) {
        addCategory(newCourse.category);
      }
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
      validateAndSetCourses(courses);
    } catch (error: any) {
      console.error('Failed to fetch courses:', error);
      showNotification('خطایی در بارگذاری دوره‌ها رخ داد. لطفاً دوباره تلاش کنید.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [instructors]);

  return (
    <CourseContext.Provider value={{ courses, setCourses: validateAndSetCourses, universities, addUniversity, categories, addCategory, loading, addCourse, deleteCourse, fetchCourses }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourseContext = () => {
  const context = useContext(CourseContext);
  if (!context) throw new Error('useCourseContext must be used within a CourseProvider');
  return context;
};