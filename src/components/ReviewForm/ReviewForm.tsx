import React, { useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import styles from './ReviewForm.module.css';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../Context/AuthContext';
import { useReviewContext } from '../../Context/ReviewContext';

interface ReviewFormProps {
  courseId: number;
  isEnrolled: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ courseId }) => {
  const { addReview } = useReviewContext();
  const { isAuthenticated } = useAuthContext();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addReview(courseId, rating, comment);
      setRating(0);
      setComment('');
      setError('');
    } catch (err: any) {
      setError(err.message);
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
      <div className={styles.rating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`${styles.star} ${rating >= star ? styles.filled : ''}`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="نظر خود را بنویسید..."
        className={styles.textarea}
      />
      <button onClick={handleSubmit} className={styles.submitButton}>
        ارسال نظر
      </button>
    </div>
  );
};

export default ReviewForm;