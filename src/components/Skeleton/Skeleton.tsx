/**
 * Skeleton Component
 * A reusable loading skeleton component for displaying placeholders during content loading.
 * Supports dynamic item counts, variant types, and RTL direction.
 *
 * @param {Object} props - Component props
 * @param {number} [props.itemCount=3] - Number of list items to display in the prerequisites section
 * @param {'list' | 'card' | 'table'} [props.variant='list'] - Variant of the skeleton (list, card, or table)
 * @param {boolean} [props.isRTL=false] - Enable RTL support for right-to-left languages
 */
import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  itemCount?: number;
  variant?: 'list' | 'card' | 'table';
  isRTL?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = React.memo(({ itemCount = 3, variant = 'list', isRTL = false }) => {
  return (
    <div
      className={styles.skeletonContainer}
      role="status"
      aria-label="در حال بارگذاری"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {variant !== 'table' && (
        <>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonDescription} />
        </>
      )}
      <div className={styles.skeletonPrerequisites}>
        {variant !== 'card' && <div className={styles.skeletonSubtitle} />}
        {variant === 'list' && (
          <ul className={styles.skeletonList}>
            {Array.from({ length: itemCount }, (_, index) => (
              <li key={index} className={styles.skeletonItem} />
            ))}
          </ul>
        )}
        {variant === 'card' && <div className={styles.skeletonCard} />}
        {variant === 'table' && (
          <div className={styles.skeletonTable}>
            {Array.from({ length: itemCount }, (_, index) => (
              <div key={index} className={styles.skeletonTableRow} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

Skeleton.displayName = 'Skeleton';

export default Skeleton;