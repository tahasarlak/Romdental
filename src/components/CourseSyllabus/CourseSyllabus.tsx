import React from 'react';
import DOMPurify from 'dompurify';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import StarIcon from '@mui/icons-material/Star';
import ImageIcon from '@mui/icons-material/Image';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button } from '@mui/material';
import styles from './CourseSyllabus.module.css';
import { SyllabusItem, ContentItem } from '../../types/types';

interface Course {
  syllabus: SyllabusItem[];
}

interface CourseSyllabusProps {
  course: Course;
  isEnrolled: boolean;
  expandedSyllabus: number | null;
  toggleSyllabus: (id: number) => void;
  openPreviewModal: (item: SyllabusItem, content?: ContentItem) => void;
}

const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i'],
    ALLOWED_ATTR: [],
  });
};

const isValidUrl = (url: string): boolean => /^https?:\/\/.*/.test(url);

const validateSyllabus = (syllabus: SyllabusItem[]): SyllabusItem[] => {
  console.log('Validating syllabus:', syllabus); // لاگ برای بررسی داده‌های ورودی
  return Array.isArray(syllabus)
    ? syllabus.filter(
        (item): item is SyllabusItem =>
          typeof item.id === 'number' &&
          typeof item.title === 'string' &&
          item.title.trim() !== '' &&
          item.title.length <= 100 &&
          typeof item.duration === 'string' &&
          item.duration.trim() !== '' &&
          item.duration.length <= 50 &&
          typeof item.completed === 'boolean' &&
          typeof item.isLocked === 'boolean' &&
          (item.previewContent === undefined || (typeof item.previewContent === 'string' && item.previewContent.length <= 500)) &&
          Array.isArray(item.contents) &&
          item.contents.every(
            (content) =>
              ['video', 'image', 'text', 'quiz'].includes(content.type) &&
              (content.url === undefined || (typeof content.url === 'string' && isValidUrl(content.url))) &&
              (content.text === undefined || (typeof content.text === 'string' && content.text.length <= 500)) &&
              (content.title === undefined || (typeof content.title === 'string' && content.title.length <= 100))
          ) &&
          (item.isNew === undefined || typeof item.isNew === 'boolean')
      )
    : [];
};

const logError = (message: string, data: unknown) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(message, data);
  }
};

const getSessionLabel = (index: number): string => {
  const persianNumbers = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم'];
  return index < persianNumbers.length ? `جلسه ${persianNumbers[index]}` : `جلسه ${index + 1}`;
};

const getContentIcon = (type: ContentItem['type']) => {
  switch (type) {
    case 'video':
      return <VideoLibraryIcon />;
    case 'image':
      return <ImageIcon />;
    case 'text':
      return <DescriptionIcon />;
    case 'quiz':
      return <StarIcon />;
    default:
      return null;
  }
};

const CourseSyllabus: React.FC<CourseSyllabusProps> = ({
  course,
  isEnrolled,
  expandedSyllabus,
  toggleSyllabus,
  openPreviewModal,
}) => {
  console.log('Course data:', course);
  console.log('Syllabus data:', course?.syllabus);

  if (!course || !Array.isArray(course.syllabus)) {
    logError('CourseSyllabus: Invalid course or syllabus', { course });
    return (
      <div className={styles.error} role="alert">
        <p>خطا: اطلاعات سرفصل‌های دوره ناقص است.</p>
        <Button variant="contained" href="/support">
          تماس با پشتیبانی
        </Button>
      </div>
    );
  }

  const validatedSyllabus = validateSyllabus(course.syllabus);
  console.log('Validated syllabus:', validatedSyllabus);

  const completedItems = validatedSyllabus.filter((item) => item.completed).length;
  const totalItems = validatedSyllabus.length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Syllabus',
    inLanguage: 'fa',
    provider: {
      '@type': 'Organization',
      name: 'MyClassWebsite',
    },
    hasPart: validatedSyllabus.flatMap((item) =>
      item.contents.map((content) => ({
        '@type': 'LearningResource',
        name: content.title ? sanitizeText(content.title) : sanitizeText(item.title),
        description: content.text ? sanitizeText(content.text) : item.previewContent ? sanitizeText(item.previewContent) : undefined,
        educationalLevel: content.type,
        timeRequired: sanitizeText(item.duration),
      }))
    ),
  };

  return (
    <section className={styles.syllabusSection} aria-label="سرفصل‌های دوره">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
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
      <ul className={styles.syllabus} role="list">
        {validatedSyllabus.length > 0 ? (
          validatedSyllabus.map((item, index) => (
            <li
              key={item.id}
              className={`${styles.syllabusItem} ${
                item.isLocked && !isEnrolled ? styles.locked : styles.unlocked
              }`}
              role="listitem"
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
                {index < validatedSyllabus.length - 1 && (
                  <div className={styles.timelineLine} />
                )}
              </div>
              <div className={styles.syllabusContent}>
                <div
                  className={styles.syllabusHeader}
                  onClick={() => toggleSyllabus(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') toggleSyllabus(item.id);
                    if (e.key === 'ArrowDown' && index < validatedSyllabus.length - 1) toggleSyllabus(validatedSyllabus[index + 1].id);
                    if (e.key === 'ArrowUp' && index > 0) toggleSyllabus(validatedSyllabus[index - 1].id);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandedSyllabus === item.id}
                  aria-label={`باز کردن سرفصل ${sanitizeText(item.title)}`}
                >
                  <div className={styles.syllabusTitle}>
                    <span>
                      {getSessionLabel(index)}: {sanitizeText(item.title)}
                    </span>
                    {item.isNew && <span className={styles.newBadge}>جدید</span>}
                  </div>
                  <div className={styles.syllabusMeta}>
                    <span className={styles.metaItem}>
                      <AccessTimeIcon /> {sanitizeText(item.duration)}
                    </span>
                    <ExpandMoreIcon
                      className={`${styles.expandIcon} ${
                        expandedSyllabus === item.id ? styles.expanded : ''
                      }`}
                      aria-label={expandedSyllabus === item.id ? 'بستن سرفصل' : 'باز کردن سرفصل'}
                    />
                  </div>
                </div>
                {expandedSyllabus === item.id && (!item.isLocked || isEnrolled) && (
                  <div className={styles.previewContent}>
                    {item.previewContent && <p>{sanitizeText(item.previewContent)}</p>}
                    {item.contents.length > 0 && (
                      <ul className={styles.contentList}>
                        {item.contents.map((content, contentIndex) => (
                          <li key={contentIndex} className={styles.contentItem}>
                            <div className={styles.contentMeta}>
                              {getContentIcon(content.type)}
                              <span>{content.title ? sanitizeText(content.title) : content.type}</span>
                            </div>
                            {(content.text || content.url) && (
                              <button
                                className={styles.previewButton}
                                onClick={() => openPreviewModal(item, content)}
                                aria-label={`مشاهده پیش‌نمایش ${content.title || content.type} از ${sanitizeText(item.title)}`}
                              >
                                مشاهده پیش‌نمایش
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))
        ) : (
          <p>سرفصلی برای این دوره ثبت نشده است.</p>
        )}
      </ul>
    </section>
  );
};

export default CourseSyllabus;