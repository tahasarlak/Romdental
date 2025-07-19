import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import StarIcon from '@mui/icons-material/Star';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './CourseReviews.module.css';
import ReviewForm from '../ReviewForm/ReviewForm';
import { useAuthContext } from '../../Context/Auth/UserAuthContext';
import { useReviewContext } from '../../Context/ReviewContext';

interface User {
  id: number;
  name: string;
  email: string;
  enrolledCourses: number[];
  wishlist: { id: number; type: 'course' | 'instructor' | 'blog' }[];
  role: 'SuperAdmin' | 'Admin' | 'Instructor' | 'Student' | 'Blogger';
}

interface ReplyItem {
  id: number;
  reviewId: number;
  user: string;
  comment: string;
  date: string;
  role: 'admin' | 'instructor' | 'student' | 'owner';
  userId?: number;
}

interface ReviewItem {
  id: number;
  courseId: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
  isEnrolled: boolean;
  role: 'admin' | 'instructor' | 'student' | 'owner' | 'user';
  userId?: number;
  replies: ReplyItem[]; // Updated to non-optional as per types/types.ts
}

interface CourseReviewsProps {
  courseId: number;
  courseReviews: ReviewItem[];
  user: User | null;
  isAuthenticated: boolean;
  instructorId: number;
  replyText: { [key: number]: string };
  setReplyText: React.Dispatch<React.SetStateAction<{ [key: number]: string }>>;
  replyFormVisible: { [key: number]: boolean };
  toggleReplyForm: (reviewId: number) => void;
  handleReplySubmit: (reviewId: number) => void;
}

/**
 * Sanitizes input text to prevent XSS attacks.
 * @param text - The input text to sanitize.
 * @returns Sanitized text.
 */
const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'iframe', 'object'],
  }).trim();
};

/**
 * Validates reviews to ensure they have required fields.
 * @param reviews - Array of review items to validate.
 * @returns Array of valid review items.
 */
const validateReviews = (reviews: ReviewItem[]): ReviewItem[] => {
  return Array.isArray(reviews)
    ? reviews.filter(
        (review): review is ReviewItem =>
          typeof review.id === 'number' &&
          typeof review.courseId === 'number' &&
          typeof review.user === 'string' &&
          review.user.trim() !== '' &&
          typeof review.comment === 'string' &&
          review.comment.trim() !== '' &&
          typeof review.rating === 'number' &&
          review.rating >= 0 &&
          review.rating <= 5 &&
          typeof review.date === 'string' &&
          review.date.trim() !== '' &&
          typeof review.isEnrolled === 'boolean' &&
          ['admin', 'instructor', 'student', 'owner', 'user'].includes(review.role) &&
          Array.isArray(review.replies)
      )
    : [];
};

/**
 * Maps user role to a display label.
 * @param role - The user's role.
 * @param isCourseOwner - Whether the user is the course owner.
 * @param isEnrolled - Whether the user is enrolled in the course.
 * @returns Display label for the role.
 */
const getRoleLabel = (
  role: 'admin' | 'instructor' | 'student' | 'owner' | 'user',
  isCourseOwner: boolean,
  isEnrolled: boolean
): string => {
  if (role === 'owner' || (role === 'instructor' && isCourseOwner)) {
    return 'صاحب دوره';
  }
  switch (role) {
    case 'admin':
      return 'ادمین سایت';
    case 'instructor':
      return 'کاربر';
    case 'student':
      return isEnrolled ? 'دانشجوی دوره' : 'دانشجو';
    default:
      return 'کاربر';
  }
};

/**
 * CourseReviews component displays a list of reviews for a course with reply and delete functionality.
 * @param props - Component props including courseId, reviews, user, and reply handlers.
 */
const CourseReviews: React.FC<CourseReviewsProps> = ({
  courseId,
  courseReviews,
  user,
  isAuthenticated,
  instructorId,
  replyText,
  setReplyText,
  replyFormVisible,
  toggleReplyForm,
  handleReplySubmit,
}) => {
  const { deleteReview, deleteReply } = useReviewContext();
  const { user: authUser } = useAuthContext();

  // Memoize validated reviews
  const validatedReviews = useMemo(() => validateReviews(courseReviews), [courseReviews]);

  // Memoize structured data for SEO
  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Review',
      itemReviewed: {
        '@type': 'Course',
        identifier: courseId.toString(),
      },
      review: validatedReviews.map((review) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: sanitizeText(review.user),
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
        },
        reviewBody: sanitizeText(review.comment),
        datePublished: sanitizeText(review.date),
      })),
    }),
    [validatedReviews, courseId]
  );

  // Check if user can delete a review
  const canDeleteReview = (review: ReviewItem) =>
    authUser &&
    (authUser.email === review.user ||
      authUser.name === review.user ||
      ['Admin', 'SuperAdmin'].includes(authUser.role));

  // Check if user can delete a reply
  const canDeleteReply = (reply: ReplyItem) =>
    authUser &&
    (authUser.email === reply.user ||
      authUser.name === reply.user ||
      ['Admin', 'SuperAdmin'].includes(authUser.role));

  return (
    <section className={styles.reviewsSection} aria-label="نظرات کاربران دوره">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <h2 className={styles.title}>نظرات کاربران</h2>
      <div className={styles.reviews}>
        {isAuthenticated ? (
          <ReviewForm
            courseId={courseId}
            isEnrolled={
              user?.enrolledCourses.includes(courseId) ||
              user?.role === 'Instructor' ||
              user?.role === 'Admin' ||
              user?.role === 'SuperAdmin'
            }
          />
        ) : (
          <p className={styles.reviewPrompt}>
            برای ثبت نظر، لطفاً{' '}
            <Link to="/login" className={styles.loginLink}>
              وارد حساب کاربری خود شوید
            </Link>
            .
          </p>
        )}
        {validatedReviews.length > 0 ? (
          validatedReviews.map((review) => {
            const isCourseOwner = review.role === 'instructor' && review.userId === instructorId;
            return (
              <div key={review.id} className={styles.reviewItem} role="article">
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewUser}>
                    {user && (user.email === review.user || user.name === review.user)
                      ? 'کاربر'
                      : sanitizeText(review.user)}{' '}
                    <span className={styles.reviewStatus}>
                      ({getRoleLabel(review.role, isCourseOwner, review.isEnrolled)})
                    </span>
                    {review.replies && review.replies.length > 0 && (
                      <span className={styles.repliedBadge}>پاسخ داده شده</span>
                    )}
                  </span>
                  <div className={styles.reviewRating}>
                    {Array.from({ length: Math.min(Math.max(review.rating, 0), 5) }, (_, i) => (
                      <StarIcon key={i} className={styles.starIcon} aria-hidden="true" />
                    ))}
                  </div>
                  {canDeleteReview(review) && (
                    <IconButton
                      className={styles.deleteButton}
                      onClick={() => deleteReview(review.id)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === 'Space') && deleteReview(review.id)}
                      aria-label={`حذف نظر از ${sanitizeText(review.user)}`}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </div>
                <p className={styles.reviewComment}>{sanitizeText(review.comment)}</p>
                <span className={styles.reviewDate}>{sanitizeText(review.date)}</span>
                {isAuthenticated && (
                  <button
                    className={styles.replyButton}
                    onClick={() => toggleReplyForm(review.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === 'Space') && toggleReplyForm(review.id)}
                    aria-label={`پاسخ به نظر ${sanitizeText(review.user)}`}
                    aria-controls={`reply-form-${review.id}`}
                  >
                    پاسخ
                  </button>
                )}
                {isAuthenticated && replyFormVisible[review.id] && (
                  <div
                    id={`reply-form-${review.id}`}
                    className={styles.replyForm}
                    role="form"
                    aria-labelledby={`reply-label-${review.id}`}
                  >
                    <label id={`reply-label-${review.id}`} className={styles.replyLabel}>
                      پاسخ به نظر {sanitizeText(review.user)}
                    </label>
                    <textarea
                      value={replyText[review.id] || ''}
                      onChange={(e) =>
                        setReplyText((prev) => ({ ...prev, [review.id]: sanitizeText(e.target.value) }))
                      }
                      placeholder="پاسخ خود را بنویسید..."
                      className={styles.replyTextarea}
                      aria-label="متن پاسخ"
                    />
                    <div className={styles.replyFormButtons}>
                      <button
                        className={styles.submitReplyButton}
                        onClick={() => handleReplySubmit(review.id)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === 'Space') && handleReplySubmit(review.id)}
                      >
                        ارسال پاسخ
                      </button>
                      <button
                        className={styles.cancelReplyButton}
                        onClick={() => toggleReplyForm(review.id)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === 'Space') && toggleReplyForm(review.id)}
                      >
                        لغو
                      </button>
                    </div>
                  </div>
                )}
                {review.replies && review.replies.length > 0 && (
                  <div className={styles.replies} role="list">
                    {review.replies.map((reply) => {
                      const isReplyCourseOwner = reply.role === 'instructor' && reply.userId === instructorId;
                      return (
                        <div key={reply.id} className={styles.replyItem} role="listitem">
                          <div className={styles.replyHeader}>
                            <span className={styles.replyUser}>
                              {user && (user.email === reply.user || user.name === reply.user)
                                ? 'کاربر'
                                : sanitizeText(reply.user)}{' '}
                              <span className={styles.replyRole}>
                                ({getRoleLabel(reply.role, isReplyCourseOwner, false)})
                              </span>
                            </span>
                            <span className={styles.replyDate}>{sanitizeText(reply.date)}</span>
                            {canDeleteReply(reply) && (
                              <IconButton
                                className={styles.deleteButton}
                                onClick={() => deleteReply(review.id, reply.id)}
                                onKeyDown={(e) =>
                                  (e.key === 'Enter' || e.key === 'Space') && deleteReply(review.id, reply.id)
                                }
                                aria-label={`حذف پاسخ از ${sanitizeText(reply.user)}`}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </div>
                          <p className={styles.replyComment}>{sanitizeText(reply.comment)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className={styles.noReviews}>هنوز نظری برای این دوره ثبت نشده است.</p>
        )}
      </div>
    </section>
  );
};

export default CourseReviews;