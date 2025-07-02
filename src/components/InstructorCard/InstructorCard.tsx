import React from 'react';
import { Link } from 'react-router-dom';
import WorkIcon from '@mui/icons-material/Work';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PeopleIcon from '@mui/icons-material/People';
import Tooltip from '@mui/material/Tooltip';
import styles from './InstructorCard.module.css';

interface Instructor {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  experience: string;
  coursesTaught: string[];
  averageRating: string;
  totalStudents: number;
}

interface InstructorCardProps {
  instructor: Instructor;
  toggleWishlist: (instructorId: number) => void;
  isInWishlist: (id: number, type: 'course' | 'instructor') => boolean;
}

const InstructorCard: React.FC<InstructorCardProps> = ({ instructor, toggleWishlist, isInWishlist }) => {
  return (
    <div className={styles.instructorCard} role="article" aria-labelledby={`instructor-title-${instructor.id}`}>
      <div className={styles.imageWrapper}>
        <img
          src={instructor.image}
          alt={instructor.name}
          className={styles.instructorImage}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = '/assets/logo.jpg'; }}
        />
      </div>
      <div className={styles.instructorContent}>
        <h2 id={`instructor-title-${instructor.id}`} className={styles.instructorName}>{instructor.name}</h2>
        <p className={styles.specialty}>تخصص: {instructor.specialty}</p>
        <div className={styles.rating}>
          <StarIcon className={styles.starIcon} />
          <span>{instructor.averageRating} ({instructor.coursesTaught.length} دوره)</span>
        </div>
        <p className={styles.bio}>{instructor.bio}</p>
        <div className={styles.details}>
          <Tooltip title="تجربه">
            <span><AccessTimeIcon /> تجربه: {instructor.experience}</span>
          </Tooltip>
          <Tooltip title="تعداد دوره‌ها">
            <span><WorkIcon /> دوره‌ها: {instructor.coursesTaught.length > 0 ? instructor.coursesTaught.join(', ') : 'بدون دوره'}</span>
          </Tooltip>
          <Tooltip title="تعداد دانشجویان">
            <span><PeopleIcon /> دانشجویان: {instructor.totalStudents} نفر</span>
          </Tooltip>
        </div>
        <div className={styles.actions}>
          <Link
            to={`/instructors/${instructor.name.replace(' ', '-')}`}
            className={styles.detailsLink}
            aria-label={`جزئیات بیشتر درباره ${instructor.name}`}
          >
            جزئیات بیشتر
          </Link>
          <Tooltip title={isInWishlist(instructor.id, 'instructor') ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}>
            <button
              className={styles.wishlistButton}
              onClick={() => toggleWishlist(instructor.id)}
              aria-label={isInWishlist(instructor.id, 'instructor') ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
            >
              {isInWishlist(instructor.id, 'instructor') ? (
                <FavoriteIcon className={styles.wishlistIconActive} />
              ) : (
                <FavoriteBorderIcon className={styles.wishlistIcon} />
              )}
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default InstructorCard;