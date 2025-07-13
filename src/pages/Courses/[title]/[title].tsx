import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styles from './CourseDetails.module.css';

import { useAuthContext } from '../../../Context/AuthContext';
import { useCartContext } from '../../../Context/CartContext';
import { useCourseContext } from '../../../Context/CourseContext';
import { useInstructorContext } from '../../../Context/InstructorContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import { useReviewContext } from '../../../Context/ReviewContext';
import { useWishlistContext } from '../../../Context/WishlistContext';
import { Course, SyllabusItem, ContentItem, User, ReviewItem } from '../../../types/types';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import CourseAbout from '../../../components/CourseAbout/CourseAbout';
import CourseFaqs from '../../../components/CourseFaqs/CourseFaqs';
import CourseHeader from '../../../components/CourseHeader/CourseHeader';
import CourseReviews from '../../../components/CourseReviews/CourseReviews';
import CourseSyllabus from '../../../components/CourseSyllabus/CourseSyllabus';
import PreviewModal from '../../../components/PreviewModal/PreviewModal';
import StickyEnrollBar from '../../../components/StickyEnrollBar/StickyEnrollBar';

const CourseDetails: React.FC = memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, loading, fetchCourses } = useCourseContext();
  const { instructors } = useInstructorContext();
  const { reviews, addReply } = useReviewContext();
  const { user, isAuthenticated, setUser } = useAuthContext();
  const { addToCart, cartItems } = useCartContext();
  const { showNotification } = useNotificationContext();
  const { isInWishlist, toggleWishlist, isWishlistLoading } = useWishlistContext();
  const [expandedSyllabus, setExpandedSyllabus] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    text?: string;
    videoUrl?: string;
    imageUrl?: string;
    type?: 'video' | 'image' | 'text' | 'quiz';
  }>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [replyFormVisible, setReplyFormVisible] = useState<{ [key: number]: boolean }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const courseId = id && !isNaN(parseInt(id)) ? parseInt(id) : null;
  const course = courses.find((c) => c.id === courseId);
  const courseIds = new Set(courses.map((c) => c.id));
  const instructorIds = new Set(instructors.map((i) => i.id));
  const courseReviews = reviews.filter((review) => review.courseId === courseId);
  const instructor = course ? instructors.find((i) => i.name === course.instructor) : null;
  const instructorId = instructor ? instructor.id : 0;

  useEffect(() => {
    const loadCourses = async () => {
      try {
        await fetchCourses();
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        showNotification('خطایی در بارگذاری دوره‌ها رخ داد. لطفاً دوباره تلاش کنید.', 'error');
      }
    };
    if (!courses.length && !loading) {
      loadCourses();
    }
  }, [courses, loading, fetchCourses, showNotification]);

  const toggleSyllabus = useCallback((id: number) => {
    setExpandedSyllabus(expandedSyllabus === id ? null : id);
  }, [expandedSyllabus]);

  const toggleFaq = useCallback((id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  }, [expandedFaq]);

  const openPreviewModal = useCallback((item: SyllabusItem, content?: ContentItem) => {
    setModalContent({
      text: content?.text || (item.previewContent ? DOMPurify.sanitize(item.previewContent) : undefined),
      videoUrl: content?.type === 'video' ? content.url : undefined,
      imageUrl: content?.type === 'image' ? content.url : undefined,
      type: content?.type,
    });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalContent({});
  }, []);

  const toggleShareDropdown = useCallback(() => {
    setIsShareDropdownOpen((prev) => !prev);
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsShareDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const shareCourse = useCallback(
    async (platform: 'native' | 'telegram' | 'whatsapp' | 'copy') => {
      if (!course) return;
      const shareUrl = encodeURI(window.location.href);
      const shareText = DOMPurify.sanitize(`دوره "${course.title}" را در روم دنتال بررسی کنید!`);
      try {
        if (platform === 'native' && navigator.share) {
          await navigator.share({ title: course.title, text: shareText, url: shareUrl });
          showNotification('دوره با موفقیت به اشتراک گذاشته شد!', 'success');
        } else if (platform === 'telegram') {
          window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
          showNotification('لینک دوره در تلگرام به اشتراک گذاشته شد!', 'success');
        } else if (platform === 'whatsapp') {
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
          showNotification('لینک دوره در واتساپ به اشتراک گذاشته شد!', 'success');
        } else if (platform === 'copy') {
          await navigator.clipboard.writeText(shareUrl);
          showNotification('لینک دوره با موفقیت کپی شد!', 'success');
        }
      } catch (error) {
        console.error('Error sharing:', error);
        showNotification('خطایی در اشتراک‌گذاری رخ داد. لطفاً دوباره تلاش کنید.', 'error');
      }
      setIsShareDropdownOpen(false);
    },
    [course, showNotification]
  );

  const handleEnroll = useCallback(async () => {
    if (!course || isEnrolled) return;
    const isInCart = cartItems.some((item) => item.courseId === course.id);
    if (isInCart) {
      showNotification('این دوره قبلاً به سبد خرید اضافه شده است.', 'warning');
    } else {
      try {
        await addToCart(course.id);
        showNotification(`دوره "${DOMPurify.sanitize(course.title)}" به سبد خرید اضافه شد!`, 'success');
      } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('خطایی در افزودن به سبد خرید رخ داد.', 'error');
      }
    }
  }, [course, isEnrolled, addToCart, cartItems, showNotification]);

  const handleJoinClass = useCallback(() => {
    if (!courseId) return;
    if (!isAuthenticated) {
      showNotification('برای ورود به کلاس آنلاین، لطفاً ابتدا وارد حساب کاربری شوید.', 'warning');
      navigate('/login');
      return;
    }
    if (!isEnrolled) {
      showNotification('شما در این دوره ثبت‌نام نکرده‌اید. لطفاً ابتدا ثبت‌نام کنید.', 'warning');
      navigate(`/checkout/${courseId}`);
      return;
    }
    try {
      navigate(`/classroom/${courseId}`);
      showNotification('در حال ورود به کلاس آنلاین...', 'info');
    } catch (error) {
      console.error('Error joining class:', error);
      showNotification('خطایی در ورود به کلاس آنلاین رخ داد.', 'error');
    }
  }, [courseId, isAuthenticated, isEnrolled, navigate, showNotification]);

  const handleWishlistToggle = useCallback(async () => {
    if (!isAuthenticated) {
      showNotification('برای افزودن به لیست علاقه‌مندی‌ها، لطفاً ابتدا وارد حساب کاربری شوید.', 'warning');
      navigate('/login');
      return;
    }
    if (!courseId || !course) {
      showNotification('دوره یافت نشد.', 'error');
      return;
    }
    try {
      await toggleWishlist(courseId, 'course', DOMPurify.sanitize(course.title));
    } catch (error: any) {
      showNotification(error.message || 'خطایی در به‌روزرسانی لیست علاقه‌مندی‌ها رخ داد.', 'error');
    }
  }, [courseId, course, isInWishlist, toggleWishlist, isAuthenticated, navigate, showNotification]);

  const handleReplySubmit = useCallback(
    async (reviewId: number) => {
      if (!replyText[reviewId]?.trim()) {
        showNotification('لطفاً پاسخ خود را وارد کنید.', 'warning');
        return;
      }
      try {
        await addReply(reviewId, DOMPurify.sanitize(replyText[reviewId]));
        showNotification('پاسخ شما با موفقیت ثبت شد!', 'success');
        setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
        setReplyFormVisible((prev) => ({ ...prev, [reviewId]: false }));
      } catch (error) {
        console.error('Error submitting reply:', error);
        showNotification('خطایی در ثبت پاسخ رخ داد.', 'error');
      }
    },
    [replyText, addReply, showNotification]
  );

  const toggleReplyForm = useCallback((reviewId: number) => {
    setReplyFormVisible((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  }, []);

  useEffect(() => {
    if (user && course) {
      const validEnrolledCourses = user.enrolledCourses.filter((id) => courseIds.has(id));
      const validWishlist = user.wishlist.filter(
        (item) =>
          (item.type === 'course' && courseIds.has(item.id)) ||
          (item.type === 'instructor' && instructorIds.has(item.id)) ||
          (item.type === 'blog')
      );
      if (
        validEnrolledCourses.length !== user.enrolledCourses.length ||
        validWishlist.length !== user.wishlist.length
      ) {
        setUser({
          ...user,
          enrolledCourses: validEnrolledCourses,
          wishlist: validWishlist,
          cart: user.cart || [],
        });
      }
      setIsEnrolled(validEnrolledCourses.includes(course.id));
    }
  }, [user, course, courseIds, instructorIds, setUser]);

  if (loading) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        در حال بارگذاری...
      </div>
    );
  }

  if (!course || !courseId) {
    return (
      <section className={styles.courseDetailsSection} ref={sectionRef} role="main">
        <div className={styles.container}>
          <h1 className={styles.title}>دوره یافت نشد</h1>
          <Link
            to="/courses"
            className={styles.backLink}
            aria-label="بازگشت به لیست دوره‌های دندانپزشکی"
          >
            <ArrowBackIcon /> بازگشت به لیست دوره‌ها
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{DOMPurify.sanitize(course.title)} - دوره‌های دندانپزشکی</title>
        <meta
          name="description"
          content={DOMPurify.sanitize(`دوره ${course.title} (${course.courseType}) ارائه‌شده توسط ${course.university}`)}
        />
        <meta
          name="keywords"
          content={DOMPurify.sanitize(`دوره ${course.title}, آموزش دندانپزشکی, ${course.courseType}, ${course.university}`)}
        />
        <meta property="og:title" content={DOMPurify.sanitize(course.title)} />
        <meta
          property="og:description"
          content={DOMPurify.sanitize(`دوره ${course.title} (${course.courseType}) ارائه‌شده توسط ${course.university}`)}
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${course.image}?format=webp`} />
        <link rel="alternate" hrefLang="fa" href={`/courses/${courseId}`} />
        <script type="application/ld+json">{JSON.stringify(getCourseStructuredData(course))}</script>
      </Helmet>
      <section className={styles.courseDetailsSection} ref={sectionRef} role="main">
        <div className={styles.container}>
          <Breadcrumb />
          <CourseHeader
            course={{ ...course, image: `${course.image}?format=webp` }}
            courseReviews={courseReviews}
            isInWishlist={isInWishlist}
            toggleShareDropdown={toggleShareDropdown}
            isShareDropdownOpen={isShareDropdownOpen}
            shareCourse={shareCourse}
            handleWishlistToggle={handleWishlistToggle}
            dropdownRef={dropdownRef}
            aria-expanded={isShareDropdownOpen}
            isWishlistLoading={isWishlistLoading}
          />
          <StickyEnrollBar
            course={course}
            isEnrolled={isEnrolled}
            handleEnroll={handleEnroll}
            handleJoinClass={handleJoinClass}
          />
          <main className={styles.courseContent}>
            <CourseAbout />
            <CourseSyllabus
              course={course}
              isEnrolled={isEnrolled}
              expandedSyllabus={expandedSyllabus}
              toggleSyllabus={toggleSyllabus}
              openPreviewModal={openPreviewModal}
            />
            <CourseFaqs faqs={course.faqs} expandedFaq={expandedFaq} toggleFaq={toggleFaq} />
            <CourseReviews
              courseId={courseId}
              courseReviews={courseReviews}
              user={user}
              isAuthenticated={isAuthenticated}
              instructorId={instructorId}
              replyText={replyText}
              setReplyText={setReplyText}
              replyFormVisible={replyFormVisible}
              toggleReplyForm={toggleReplyForm}
              handleReplySubmit={handleReplySubmit}
            />
          </main>
          <PreviewModal
            isModalOpen={isModalOpen}
            modalContent={modalContent}
            closeModal={closeModal}
          />
        </div>
      </section>
    </>
  );
});

export const getCourseStructuredData = (course: Course) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: DOMPurify.sanitize(course.title),
  description: DOMPurify.sanitize(course.description),
  provider: {
    '@type': 'Organization',
    name: course.university,
  },
  instructor: {
    '@type': 'Person',
    name: course.instructor,
  },
  offers: {
    '@type': 'Offer',
    price: DOMPurify.sanitize(course.discountPrice || course.price),
    priceCurrency: 'IRR',
    availability: course.isOpen ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
  },
  courseMode: course.courseType,
  image: `${course.image}?format=webp`,
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: course.courseType,
    startDate: course.startDate,
  },
});

export default CourseDetails;