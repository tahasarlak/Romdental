import React, { useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DOMPurify from 'dompurify';
import { useAuthContext } from '../../../Context/Auth/UserAuthContext';
import { useCourseContext } from '../../../Context/CourseContext';
import { useWishlistContext } from '../../../Context/WishlistContext';
import styles from './WishlistManagement.module.css';

const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i'],
    ALLOWED_ATTR: [],
  });
};

const WishlistManagement: React.FC = () => {
  const { user, isAuthenticated, users } = useAuthContext();
  const { courses } = useCourseContext();
  const { wishlistItems } = useWishlistContext();

  // Filter wishlist items related to the instructor or SuperAdmin
  const instructorWishlistItems = useMemo(() => {
    if (!isAuthenticated || !user) return [];

    // If SuperAdmin, show all wishlist items for courses
    if (user.role === 'SuperAdmin') {
      return wishlistItems.filter((item) => item.type === 'course');
    }

    // For instructors, show only wishlist items for their own courses
    const instructorCourses = courses.filter((course) => {
      const normalizeName = (name: string) => name.replace(/دکتر\s*/g, '').trim();
      return normalizeName(course.instructor) === normalizeName(user.name || '');
    });

    return wishlistItems.filter(
      (item) => item.type === 'course' && instructorCourses.some((course) => course.id === item.id)
    );
  }, [wishlistItems, courses, user, isAuthenticated]);

  // Add user details to wishlist items
  const wishlistWithUserDetails = useMemo(() => {
    return instructorWishlistItems.map((item) => {
      const user = users.find((u) => u.id === item.userId);
      return {
        ...item,
        userName: user ? user.name : 'کاربر ناشناس',
        likeDate: item.likeDate || 'نامشخص', // Fallback for likeDate
      };
    });
  }, [instructorWishlistItems, users]);

  return (
    <Box className={styles.container}>
      <Typography variant="h5" className={styles.title}>
        مدیریت علاقه‌مندی‌ها
      </Typography>
      {wishlistWithUserDetails.length === 0 ? (
        <Typography className={styles.emptyMessage}>
          هیچ دوره‌ای به لیست علاقه‌مندی‌ها اضافه نشده است.
        </Typography>
      ) : (
        <Table className={styles.table}>
          <TableHead>
            <TableRow className={styles.tableHeader}>
              <TableCell className={styles.tableCell}>نام کاربر</TableCell>
              <TableCell className={styles.tableCell}>عنوان دوره</TableCell>
              <TableCell className={styles.tableCell}>تاریخ اضافه شدن</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wishlistWithUserDetails.map((item) => (
              <TableRow key={`${item.id}-${item.type}`} className={styles.tableRow}>
                <TableCell className={styles.tableCell}>{sanitizeText(item.userName)}</TableCell>
                <TableCell className={styles.tableCell}>{sanitizeText(item.name)}</TableCell>
                <TableCell className={styles.tableCell}>{sanitizeText(item.likeDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default WishlistManagement;