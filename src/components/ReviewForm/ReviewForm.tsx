import React, { useState, useContext } from 'react';
import StarIcon from '@mui/icons-material/Star';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../Context/AuthContext';
import { useReviewContext } from '../../Context/ReviewContext';
import styles from './ReviewForm.module.css';

interface ReviewFormProps {
  courseId: number;
  isEnrolled: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ courseId, isEnrolled }) => {
  const { addReview } = useReviewContext() || {
    addReview: () => Promise.reject(new Error('Review context unavailable')),
  };
  const { user: authUser, isAuthenticated } = useAuthContext() || { isAuthenticated: false, user: null };
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Validate courseId
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return <div className={styles.error}>شناسه دوره نامعتبر است</div>;
  }

  // Validate form inputs
  const validateForm = (): string => {

    if (rating === 0) return 'لطفاً یک امتیاز انتخاب کنید';
    if (!comment.trim()) return 'لطفاً نظر خود را وارد کنید';
    if (comment.length > 500) return 'نظر شما نباید بیشتر از ۵۰۰ کاراکتر باشد';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const role =
        authUser?.role === 'SuperAdmin' || authUser?.role === 'Admin'
          ? 'admin'
          : authUser?.role === 'Instructor'
            ? 'instructor'
            : authUser?.role === 'Student'
              ? 'student'
              : 'user';
      await addReview(courseId, rating, comment, { role, userId: authUser?.id });
      setSuccess('نظر شما با موفقیت ثبت شد');
      setRating(0);
      setComment('');
    } catch (err: any) {
      setError(err.message || 'خطایی در ثبت نظر رخ داد');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.reviewPromptContainer}>
        <p className={styles.reviewPrompt}>
          برای ثبت نظر، ابتدا باید{' '}
          <Link to="/login" className={styles.loginLink}>
            وارد حساب کاربری
          </Link>{' '}
          خود شوید.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.reviewForm}>
      <h3>ثبت نظر</h3>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className={styles.rating} role="radiogroup" aria-label="امتیازدهی">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`امتیاز ${star} ستاره`}
              className={`${styles.star} ${rating >= star ? styles.filled : ''}`}
              onClick={() => setRating(star)}
              disabled={isSubmitting}
            >
              <StarIcon />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="نظر خود را بنویسید..."
          className={styles.textarea}
          rows={4}
          aria-label="متن نظر"
          disabled={isSubmitting}
        />
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'در حال ارسال...' : 'ارسال نظر'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;