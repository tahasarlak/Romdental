import React from 'react';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import styles from './StickyEnrollBar.module.css';

interface StickyEnrollBarProps {
  course: {
    id: number;
    title: string;
    price: string;
    discountPrice?: string;
    isOpen: boolean;
    courseType: 'Online' | 'Offline' | 'In-Person' | 'Hybrid';
  };
  isEnrolled: boolean;
  handleEnroll: () => void;
  handleJoinClass: () => void;
}

const StickyEnrollBar: React.FC<StickyEnrollBarProps> = ({
  course,
  isEnrolled,
  handleEnroll,
  handleJoinClass,
}) => {
  return (
    <div className={styles.stickyEnrollBar}>
      <button
        className={styles.enrollButton}
        disabled={!course.isOpen || isEnrolled}
        onClick={handleEnroll}
        aria-label={
          isEnrolled
            ? 'شما در این دوره ثبت‌نام کرده‌اید'
            : course.isOpen
            ? 'افزودن به سبد خرید'
            : 'ثبت‌نام بسته است'
        }
        title="برای تکمیل خرید، ورود به حساب کاربری لازم است"
      >
        {isEnrolled
          ? 'شما ثبت‌نام کرده‌اید'
          : course.isOpen
          ? `افزودن به سبد خرید (${course.discountPrice || course.price})`
          : 'ثبت‌نام بسته است'}
      </button>
      {course.courseType === 'Online' && isEnrolled && (
        <button
          className={styles.joinClassButton}
          onClick={handleJoinClass}
          aria-label="ورود به کلاس آنلاین"
        >
          <VideoCallIcon /> ورود به کلاس آنلاین
        </button>
      )}
    </div>
  );
};

export default StickyEnrollBar;