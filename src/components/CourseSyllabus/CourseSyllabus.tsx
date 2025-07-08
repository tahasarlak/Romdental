import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from './CourseSyllabus.module.css';
import { SyllabusItem } from '../../pages/Courses/[title]/[title]';

interface CourseSyllabusProps {
  course: {
    syllabus: SyllabusItem[];
  };
  isEnrolled: boolean;
  expandedSyllabus: number | null;
  toggleSyllabus: (id: number) => void;
  openPreviewModal: (item: SyllabusItem) => void;
}

const CourseSyllabus: React.FC<CourseSyllabusProps> = ({
  course,
  isEnrolled,
  expandedSyllabus,
  toggleSyllabus,
  openPreviewModal,
}) => {
  const completedItems = (course.syllabus || []).filter((item) => item.completed).length;
  const totalItems = (course.syllabus || []).length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const getSessionLabel = (index: number): string => {
    const persianNumbers = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم'];
    return index < persianNumbers.length ? `جلسه ${persianNumbers[index]}` : `جلسه ${index + 1}`;
  };

  return (
    <>
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
        {(course.syllabus || []).map((item, index) => (
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
                  <span>
                    {getSessionLabel(index)}: {item.title}
                  </span>
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
    </>
  );
};

export default CourseSyllabus;