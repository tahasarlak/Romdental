import React from 'react';
import { Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import styles from './CourseReviews.module.css';
import { ReviewItem, ReplyItem } from '../../pages/Courses/[title]/[title]';
import ReviewForm from '../ReviewForm/ReviewForm';

interface User {
  name: string;
  email: string;
  enrolledCourses: number[];
  wishlist: { id: number; type: 'course' | 'instructor' | 'blog' }[];
}

interface CourseReviewsProps {
  courseId: number;
  courseReviews: ReviewItem[];
  user: User | null;
  isAuthenticated: boolean;
  replyText: { [key: number]: string };
  setReplyText: React.Dispatch<React.SetStateAction<{ [key: number]: string }>>;
  replyFormVisible: { [key: number]: boolean };
  toggleReplyForm: (reviewId: number) => void;
  handleReplySubmit: (reviewId: number) => void;
}

const CourseReviews: React.FC<CourseReviewsProps> = ({
  courseId,
  courseReviews,
  user,
  isAuthenticated,
  replyText,
  setReplyText,
  replyFormVisible,
  toggleReplyForm,
  handleReplySubmit,
}) => {
  const getRoleLabel = (role: 'admin' | 'instructor' | 'student') => {
    switch (role) {
      case 'admin':
        return 'ادمین سایت';
      case 'instructor':
        return 'استاد';
      case 'student':
        return 'دانشجو';
      default:
        return 'کاربر';
    }
  };

  return (
    <>
      <h2>نظرات کاربران</h2>
      <div className={styles.reviews}>
        {isAuthenticated ? (
          <ReviewForm courseId={courseId} isEnrolled={courseReviews.some((r) => r.isEnrolled)} />
        ) : (
          <p className={styles.reviewPrompt}>
            برای ثبت نظر، لطفاً{' '}
            <Link to="/login" className={styles.loginLink}>
              وارد حساب کاربری خود شوید
            </Link>
            .
          </p>
        )}
        {courseReviews.length > 0 ? (
          courseReviews.map((review) => (
            <div key={review.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <span className={styles.reviewUser}>
                  {user && (user.email === review.user || user.name === review.user)
                    ? 'کاربر'
                    : review.user}{' '}
                  <span className={styles.reviewStatus}>
                    ({review.isEnrolled ? 'دانشجوی دوره' : 'کاربر'})
                  </span>
                </span>
                <div className={styles.reviewRating}>
                  {Array.from({ length: review.rating }, (_, i) => (
                    <StarIcon key={i} className={styles.starIcon} />
                  ))}
                </div>
              </div>
              <p className={styles.reviewComment}>{review.comment}</p>
              <span className={styles.reviewDate}>{review.date}</span>
              {isAuthenticated && (
                <button
                  className={styles.replyButton}
                  onClick={() => toggleReplyForm(review.id)}
                  aria-label={`پاسخ به نظر ${review.user}`}
                >
                  پاسخ
                </button>
              )}
              {isAuthenticated && replyFormVisible[review.id] && (
                <div className={styles.replyForm}>
                  <textarea
                    value={replyText[review.id] || ''}
                    onChange={(e) =>
                      setReplyText((prev) => ({ ...prev, [review.id]: e.target.value }))
                    }
                    placeholder="پاسخ خود را بنویسید..."
                    className={styles.replyTextarea}
                  />
                  <div className={styles.replyFormButtons}>
                    <button
                      className={styles.submitReplyButton}
                      onClick={() => handleReplySubmit(review.id)}
                    >
                      ارسال پاسخ
                    </button>
                    <button
                      className={styles.cancelReplyButton}
                      onClick={() => toggleReplyForm(review.id)}
                    >
                      لغو
                    </button>
                  </div>
                </div>
              )}
              {review.replies && review.replies.length > 0 && (
                <div className={styles.replies}>
                  {review.replies.map((reply: ReplyItem) => (
                    <div key={reply.id} className={styles.replyItem}>
                      <div className={styles.replyHeader}>
                        <span className={styles.replyUser}>
                          {user && (user.email === reply.user || user.name === reply.user)
                            ? 'کاربر'
                            : reply.user}{' '}
                          <span className={styles.replyRole}>
                            ({getRoleLabel(reply.role)})
                          </span>
                        </span>
                        <span className={styles.replyDate}>{reply.date}</span>
                      </div>
                      <p className={styles.replyComment}>{reply.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>هنوز نظری برای این دوره ثبت نشده است.</p>
        )}
      </div>
    </>
  );
};

export default CourseReviews;