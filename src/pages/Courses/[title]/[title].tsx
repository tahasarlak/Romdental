import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCourseContext } from '../../../Context/CourseContext';
import { useInstructorContext } from '../../../Context/InstructorContext';
import { useReviewContext } from '../../../Context/ReviewContext';
import { useAuthContext } from '../../../Context/AuthContext';
import { useWishlistContext } from '../../../Context/WishlistContext';
import { useCartContext } from '../../../Context/CartContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styles from './CourseDetails.module.css';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import CourseAbout from '../../../components/CourseAbout/CourseAbout';
import CourseFaqs from '../../../components/CourseFaqs/CourseFaqs';
import CourseHeader from '../../../components/CourseHeader/CourseHeader';
import CourseReviews from '../../../components/CourseReviews/CourseReviews';
import CourseSyllabus from '../../../components/CourseSyllabus/CourseSyllabus';
import PreviewModal from '../../../components/PreviewModal/PreviewModal';
import StickyEnrollBar from '../../../components/StickyEnrollBar/StickyEnrollBar';

export interface SyllabusItem {
  id: number;
  title: string;
  isLocked: boolean;
  previewContent?: string;
  videoUrl?: string;
  completed?: boolean;
  duration: string;
  contentType: 'video' | 'text' | 'quiz';
  isNew?: boolean;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export interface ReplyItem {
  id: number;
  reviewId: number;
  user: string;
  comment: string;
  date: string;
  role: 'admin' | 'instructor' | 'student';
}

export interface ReviewItem {
  id: number;
  courseId: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
  isEnrolled: boolean;
  replies?: ReplyItem[];
}

export interface User {
  name: string;
  email: string;
  enrolledCourses: number[];
  wishlist: { id: number; type: 'course' | 'instructor' | 'blog' }[];
}

export interface Course {
  id: number;
  title: string;
  instructor: string;
  description: string;
  duration: string;
  courseNumber: string;
  image: string;
  price: string;
  discountPrice?: string;
  discountPercentage?: number;
  startDate: string;
  isOpen: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  syllabus: SyllabusItem[];
  faqs: FaqItem[];
  tags?: string[];
  prerequisites?: string[];
  courseType: 'Online' | 'Offline' | 'In-Person' | 'Hybrid';
  university: string;
}

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses } = useCourseContext();
  const { instructors } = useInstructorContext();
  const { reviews, addReply } = useReviewContext();
  const { user, isAuthenticated, setUser } = useAuthContext();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();
  const { addToCart, cartItems } = useCartContext();
  const { showNotification } = useNotificationContext();
  const [expandedSyllabus, setExpandedSyllabus] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    text?: string;
    videoUrl?: string;
  }>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [replyFormVisible, setReplyFormVisible] = useState<{ [key: number]: boolean }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const course = courses.find((c) => c.id === parseInt(id || ''));
  const courseIds = new Set(courses.map((c) => c.id));
  const instructorIds = new Set(instructors.map((i) => i.id));
  const courseReviews = reviews.filter((review) => review.courseId === parseInt(id || ''));

  const toggleSyllabus = useCallback((id: number) => {
    setExpandedSyllabus(expandedSyllabus === id ? null : id);
  }, [expandedSyllabus]);

  const toggleFaq = useCallback((id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  }, [expandedFaq]);

  const openPreviewModal = useCallback((item: SyllabusItem) => {
    setModalContent({
      text: item.previewContent,
      videoUrl: item.videoUrl,
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
      const shareUrl = window.location.href;
      const shareText = `دوره "${course?.title}" را در روم دنتال بررسی کنید!`;
      trackEvent('share_course', { courseId: id, platform });

      try {
        if (platform === 'native' && navigator.share) {
          await navigator.share({
            title: course?.title,
            text: shareText,
            url: shareUrl,
          });
          showNotification('دوره با موفقیت به اشتراک گذاشته شد!', 'success');
        } else if (platform === 'telegram') {
          window.open(
            `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
              shareText
            )}`,
            '_blank'
          );
          showNotification('لینک دوره در تلگرام به اشتراک گذاشته شد!', 'success');
        } else if (platform === 'whatsapp') {
          window.open(
            `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
            '_blank'
          );
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
    [id, course?.title, showNotification]
  );

  const handleEnroll = useCallback(() => {
    if (!course || isEnrolled) return;

    const isInCart = cartItems.some((item) => item.id === course.id);
    if (isInCart) {
      showNotification('این دوره قبلاً به سبد خرید اضافه شده است.', 'warning');
    } else {
      addToCart({
        id: course.id,
        title: course.title,
        price: course.discountPrice || course.price,
      });
      showNotification(`دوره "${course.title}" با موفقیت به سبد خرید اضافه شد!`, 'success');
      trackEvent('add_to_cart', { courseId: course.id });
    }
  }, [course, isEnrolled, addToCart, cartItems, showNotification]);

  const handleJoinClass = useCallback(() => {
    if (!isEnrolled) {
      showNotification(
        'شما در این دوره ثبت‌نام نکرده‌اید. لطفاً ابتدا ثبت‌نام کنید.',
        'warning'
      );
      navigate(`/checkout/${id}`);
      return;
    }
    trackEvent('join_class_click', { courseId: id });
    navigate(`/classroom/${id}`);
  }, [id, isEnrolled, navigate, showNotification]);

  const handleWishlistToggle = useCallback(() => {
    if (!isAuthenticated) {
      showNotification(
        'برای افزودن به لیست علاقه‌مندی‌ها، لطفاً ابتدا وارد حساب کاربری خود شوید.',
        'warning'
      );
      navigate('/login');
      return;
    }

    const courseId = parseInt(id || '0');
    if (isInWishlist(courseId, 'course')) {
      removeFromWishlist(courseId, 'course');
      trackEvent('remove_from_wishlist', { courseId });
      showNotification(`دوره "${course?.title}" از لیست علاقه‌مندی‌ها حذف شد.`, 'success');
    } else {
      addToWishlist(courseId, 'course');
      trackEvent('add_to_wishlist', { courseId });
      showNotification(`دوره "${course?.title}" به لیست علاقه‌مندی‌ها اضافه شد.`, 'success');
    }
  }, [id, isInWishlist, addToWishlist, removeFromWishlist, course?.title, isAuthenticated, navigate, showNotification]);

  const handleReplySubmit = useCallback(
    (reviewId: number) => {
      if (!replyText[reviewId]?.trim()) {
        showNotification('لطفاً پاسخ خود را وارد کنید.', 'warning');
        return;
      }
      try {
        addReply(reviewId, replyText[reviewId]);
        showNotification('پاسخ شما با موفقیت ثبت شد!', 'success');
        setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
        setReplyFormVisible((prev) => ({ ...prev, [reviewId]: false }));
      } catch (error: any) {
        showNotification(error.message, 'error');
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

  const trackEvent = (event: string, data: any) => {
    console.log(`Analytics: ${event}`, data);
  };

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
        });
      }
      const enrolled = validEnrolledCourses.includes(course.id);
      setIsEnrolled(enrolled || course.id === 1);
    }
  }, [user, course, courseIds, instructorIds, setUser]);

  if (!course) {
    return (
      <section className={styles.courseDetailsSection}>
        <div className={styles.container}>
          <h1 className={styles.title}>دوره یافت نشد</h1>
          <Link to="/courses" className={styles.backLink}>
            <ArrowBackIcon /> بازگشت به لیست دوره‌ها
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.courseDetailsSection}>
      <div className={styles.container}>
        <Breadcrumb />
        <CourseHeader
          course={course}
          courseReviews={courseReviews}
          isInWishlist={isInWishlist}
          toggleShareDropdown={toggleShareDropdown}
          isShareDropdownOpen={isShareDropdownOpen}
          shareCourse={shareCourse}
          handleWishlistToggle={handleWishlistToggle}
          dropdownRef={dropdownRef}
        />
        <StickyEnrollBar
          course={course}
          isEnrolled={isEnrolled}
          handleEnroll={handleEnroll}
          handleJoinClass={handleJoinClass}
        />
        <div className={styles.courseContent}>
          <CourseAbout course={course} />
          <CourseSyllabus
            course={course}
            isEnrolled={isEnrolled}
            expandedSyllabus={expandedSyllabus}
            toggleSyllabus={toggleSyllabus}
            openPreviewModal={openPreviewModal}
          />
          <CourseFaqs faqs={course.faqs} expandedFaq={expandedFaq} toggleFaq={toggleFaq} />
          <CourseReviews
            courseId={parseInt(id || '0')}
            courseReviews={courseReviews}
            user={user}
            isAuthenticated={isAuthenticated}
            replyText={replyText}
            setReplyText={setReplyText}
            replyFormVisible={replyFormVisible}
            toggleReplyForm={toggleReplyForm}
            handleReplySubmit={handleReplySubmit}
          />
        </div>
        <PreviewModal
          isModalOpen={isModalOpen}
          modalContent={modalContent}
          closeModal={closeModal}
        />
      </div>
    </section>
  );
};

export default CourseDetails;