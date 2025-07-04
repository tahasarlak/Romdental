import React, { useState, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ReactPlayer from 'react-player';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ShareIcon from '@mui/icons-material/Share';
import StarIcon from '@mui/icons-material/Star';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import styles from './CourseDetails.module.css';
import { useCourseContext } from '../../../Context/CourseContext';
import { useReviewContext } from '../../../Context/ReviewContext';
import { useAuthContext } from '../../../Context/AuthContext';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';

// Interface for syllabus items
interface SyllabusItem {
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

// Interface for FAQ items
interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

// Interface for review items
interface ReviewItem {
  id: number;
  courseId: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

// Interface for course
interface Course {
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
  const { reviews } = useReviewContext();
  const { users } = useAuthContext();
  const [expandedSyllabus, setExpandedSyllabus] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    text?: string;
    videoUrl?: string;
  }>({});
  const [isEnrolled, setIsEnrolled] = useState(false); // Mock enrollment status

  const course = courses.find((c) => c.id === parseInt(id || ''));

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

  const shareCourse = useCallback(() => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    alert('لینک دوره کپی شد!');
    trackEvent('share_course', { courseId: id }); // Analytics
  }, [id]);

  const handleEnroll = useCallback(() => {
    if (!isEnrolled) {
      trackEvent('enroll_click', { courseId: id }); // Analytics
      navigate(`/checkout/${id}`);
    }
  }, [id, isEnrolled, navigate]);

  const handleJoinClass = useCallback(() => {
    if (!isEnrolled) {
      alert('شما در این دوره ثبت‌نام نکرده‌اید.');
      navigate(`/checkout/${id}`);
      return;
    }
    trackEvent('join_class_click', { courseId: id }); // Analytics
    navigate(`/classroom/${id}`); // Navigate to internal classroom page
  }, [id, isEnrolled, navigate]);

  // Mock analytics function (replace with real implementation)
  const trackEvent = (event: string, data: any) => {
    console.log(`Analytics: ${event}`, data);
    // Integrate with Google Analytics or similar
  };

  // Simulate enrollment status (replace with auth context or API)
  useEffect(() => {
    // Mock: Assume user is enrolled for course ID 1
    if (course?.id === 1) {
      setIsEnrolled(true);
    }
  }, [course]);

  // Calculate progress for enrolled users
  const completedItems = (course?.syllabus || []).filter((item) => item.completed).length;
  const totalItems = (course?.syllabus || []).length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Calculate average rating and total reviews
  const totalReviews = courseReviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          courseReviews.reduce((sum: number, review: ReviewItem) => sum + review.rating, 0) /
          totalReviews
        ).toFixed(1)
      : '0.0';

  // Convert index to Persian session number
  const getSessionLabel = (index: number): string => {
    const persianNumbers = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم'];
    return index < persianNumbers.length ? `جلسه ${persianNumbers[index]}` : `جلسه ${index + 1}`;
  };

  // Determine if reviewer is enrolled
  const getReviewerRole = (review: ReviewItem): string => {
    const user = users.find((u) => u.name === review.user);
    if (user && user.wishlist.includes(review.courseId)) {
      return 'دانشجو';
    }
    return 'کاربر';
  };

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
    <>
      <Helmet>
        <title>{course.title} | دوره‌های آموزشی دندانپزشکی</title>
        <meta name="description" content={course.description} />
        <meta
          name="keywords"
          content={`${course.title}, ${course.university}, دندانپزشکی, آموزش, دوره ${course.courseType}`}
        />
      </Helmet>

      <section className={styles.courseDetailsSection}>
        <div className={styles.container}>
          <Breadcrumb />
         
          {/* Course Header */}
          <div className={styles.courseHeader}>
            <img
              src={course.image}
              alt={course.title}
              className={styles.courseImage}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = '/assets/fallback.jpg'; // Fallback image
              }}
            />
            <div className={styles.courseInfo}>
              <h1 className={styles.courseTitle}>{course.title}</h1>
              <p className={styles.instructor}>
                استاد:{' '}
                <Link
                  to={`/instructors/${course.instructor.replace(' ', '-')}`}
                  className={styles.instructorLink}
                >
                  {course.instructor}
                </Link>
              </p>
              <div className={styles.rating}>
                <StarIcon className={styles.starIcon} />
                <span>
                  {averageRating} ({totalReviews} نظر)
                </span>
              </div>
              <p className={styles.description}>{course.description}</p>
              <div className={styles.details}>
                <span>
                  <AccessTimeIcon /> مدت: {course.duration}
                </span>
                <span>
                  <TrendingUpIcon /> کورس: {course.courseNumber}
                </span>
                <span className={styles.priceContainer}>
                  <span className={course.discountPrice ? styles.originalPrice : ''}>
                    <AttachMoneyIcon /> {course.price}
                  </span>
                  {course.discountPrice && (
                    <>
                      <span className={styles.discountPrice}>
                        <AttachMoneyIcon /> {course.discountPrice}
                      </span>
                      {course.discountPercentage && (
                        <span className={styles.discountPercentage}>
                          ({course.discountPercentage}% تخفیف)
                        </span>
                      )}
                    </>
                  )}
                </span>
                <span>
                  <CalendarTodayIcon /> شروع: {course.startDate}
                </span>
                <span>دانشگاه: {course.university}</span>
              </div>
              {course.tags && course.tags.length > 0 && (
                <div className={styles.tagsContainer}>
                  {course.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <button
                className={styles.shareButton}
                onClick={shareCourse}
                aria-label="اشتراک‌گذاری دوره"
              >
                <ShareIcon /> اشتراک‌گذاری
              </button>
            </div>
          </div>

          {/* Sticky Enrollment Bar */}
          <div className={styles.stickyEnrollBar}>
            <button
              className={styles.enrollButton}
              disabled={!course.isOpen || isEnrolled}
              onClick={handleEnroll}
              aria-label={
                isEnrolled
                  ? 'شما در این دوره ثبت‌نام کرده‌اید'
                  : course.isOpen
                  ? 'ثبت‌نام در دوره'
                  : 'ثبت‌نام بسته است'
              }
            >
              {isEnrolled
                ? 'شما ثبت‌نام کرده‌اید'
                : course.isOpen
                ? `ثبت‌نام در دوره (${course.discountPrice || course.price})`
                : 'ثبت‌نام بسته است'}
            </button>
          </div>

          {/* Course Content */}
          <div className={styles.courseContent}>
            <h2>درباره این دوره</h2>
            <p>
              این دوره با هدف ارتقای مهارت‌های شما در زمینه {course.title} برای دانشگاه {course.university} طراحی شده است. با شرکت در این دوره، شما با جدیدترین تکنیک‌ها و ابزارهای مرتبط آشنا خواهید شد.
            </p>

            {/* Online Class Section */}
            {course.courseType === 'Online' && (
              <div className={styles.onlineClassSection}>
                <h2>ورود به کلاس آنلاین</h2>
                <p>برای شرکت در جلسات آنلاین این دوره، از دکمه زیر استفاده کنید:</p>
                <button
                  className={styles.joinClassButton}
                  onClick={handleJoinClass}
                  aria-label="ورود به کلاس آنلاین"
                >
                  <VideoCallIcon /> ورود به کلاس آنلاین
                </button>
              </div>
            )}

            <h2>سرفصل‌های دوره</h2>
            {isEnrolled && totalItems > 0 && (
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className={styles.progressText}>
                  {completedItems} از {totalItems} درس کامل شده (
                  {Math.round(progressPercentage)}%)
                </span>
              </div>
            )}
            <ul className={styles.syllabus}>
              {(course.syllabus || []).map((item: SyllabusItem, index) => (
                <li
                  key={item.id}
                  className={`${styles.syllabusItem} ${
                    item.isLocked && !isEnrolled ? styles.locked : styles.unlocked
                  }`}
                >
                  <div className={styles.syllabusTimeline}>
                    <div className={styles.timelineDot}>
                      {item.completed ? (
                        <CheckCircleIcon className={styles.completedIcon} />
                      ) : item.isLocked && !isEnrolled ? (
                        <LockIcon className={styles.lockIcon} />
                      ) : (
                        <PlayCircleOutlineIcon className={styles.playIcon} />
                      )}
                    </div>
                    {index < (course.syllabus || []).length - 1 && (
                      <div className={styles.timelineLine} />
                    )}
                  </div>
                  <div className={styles.syllabusContent}>
                    <div
                      className={styles.syllabusHeader}
                      onClick={() => toggleSyllabus(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && toggleSyllabus(item.id)}
                      aria-expanded={expandedSyllabus === item.id}
                    >
                      <div className={styles.syllabusTitle}>
                        <span>{getSessionLabel(index)}: {item.title}</span>
                        {item.isNew && <span className={styles.newBadge}>جدید</span>}
                      </div>
                      <div className={styles.syllabusMeta}>
                        <span className={styles.metaItem}>
                          {item.contentType === 'video' && <VideoLibraryIcon />}
                          {item.contentType === 'text' && <DescriptionIcon />}
                          {item.contentType === 'quiz' && <StarIcon />}
                          {item.contentType}
                        </span>
                        <span className={styles.metaItem}>
                          <AccessTimeIcon /> {item.duration}
                        </span>
                        <ExpandMoreIcon
                          className={`${styles.expandIcon} ${
                            expandedSyllabus === item.id ? styles.expanded : ''
                          }`}
                        />
                      </div>
                    </div>
                    {expandedSyllabus === item.id && (!item.isLocked || isEnrolled) && (
                      <div className={styles.previewContent}>
                        {item.previewContent && <p>{item.previewContent}</p>}
                        {(item.previewContent || item.videoUrl) && (
                          <button
                            className={styles.previewButton}
                            onClick={() => openPreviewModal(item)}
                            aria-label={`مشاهده پیش‌نمایش ${item.title}`}
                          >
                            مشاهده پیش‌نمایش
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* FAQ Section */}
            <h2>سوالات متداول</h2>
            <div className={styles.faq}>
              {(course.faqs || []).map((faq: FaqItem) => (
                <div
                  key={faq.id}
                  className={styles.faqItem}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleFaq(faq.id)}
                  onKeyDown={(e) => e.key === 'Enter' && toggleFaq(faq.id)}
                  aria-expanded={expandedFaq === faq.id}
                >
                  <div className={styles.faqHeader}>
                    <h3>{faq.question}</h3>
                    <ExpandMoreIcon
                      className={`${styles.expandIcon} ${
                        expandedFaq === faq.id ? styles.expanded : ''
                      }`}
                    />
                  </div>
                  {expandedFaq === faq.id && (
                    <div className={styles.faqContent}>
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
              {(!course.faqs || course.faqs.length === 0) && (
                <p>سوالی برای این دوره ثبت نشده است.</p>
              )}
            </div>

            {/* Reviews Section */}
            <h2>نظرات کاربران</h2>
            <div className={styles.reviews}>
              {courseReviews.length > 0 ? (
                courseReviews.map((review) => (
                  <div key={review.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewUser}>
                        {review.user}{' '}
                        <span className={styles.reviewRole}>({getReviewerRole(review)})</span>
                      </span>
                      <div className={styles.reviewRating}>
                        {Array.from({ length: review.rating }, (_, i) => (
                          <StarIcon key={i} className={styles.starIcon} />
                        ))}
                      </div>
                    </div>
                    <p className={styles.reviewComment}>{review.comment}</p>
                    <span className={styles.reviewDate}>{review.date}</span>
                  </div>
                ))
              ) : (
                <p>هنوز نظری برای این دوره ثبت نشده است.</p>
              )}
            </div>
          </div> {/* Close courseContent div */}
        </div> {/* Close container div */}
      </section>

      {/* Preview Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button
              className={styles.closeModalButton}
              onClick={closeModal}
              aria-label="بستن پیش‌نمایش"
            >
              ×
            </button>
            <div className={styles.modalContent}>
              {modalContent.videoUrl && (
                <ReactPlayer
                  url={modalContent.videoUrl}
                  width="100%"
                  height="auto"
                  controls
                  className={styles.videoPlayer}
                />
              )}
              {modalContent.text && <p>{modalContent.text}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseDetails;