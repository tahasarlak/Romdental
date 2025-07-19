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
import { useOrderContext } from '../../../Context/OrderContext';
import { useCourseContext } from '../../../Context/CourseContext';
import styles from './OrderManagement.module.css';

const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i'],
    ALLOWED_ATTR: [],
  });
};

const OrderManagement: React.FC = () => {
  const { isAuthenticated, user, users } = useAuthContext();
  const { orders } = useOrderContext();
  const { courses } = useCourseContext();

  // Filter orders related to the instructor or SuperAdmin
  const instructorOrders = useMemo(() => {
    if (!isAuthenticated || !user) return [];

    // If SuperAdmin, show all completed orders
    if (user.role === 'SuperAdmin') {
      return orders.filter((order) =>
        order.items.some((item) => item.status === 'completed')
      );
    }

    // For instructors, show only orders related to their courses
    const instructorCourses = courses.filter((course) => {
      const normalizeName = (name: string) => name.replace(/دکتر\s*/g, '').trim();
      return normalizeName(course.instructor) === normalizeName(user.name || '');
    });

    return orders.filter((order) =>
      order.items.some(
        (item) =>
          item.status === 'completed' &&
          instructorCourses.some((course) => course.id === item.courseId) // Fixed: replaced affirmedCourseId with item.courseId
      )
    );
  }, [orders, courses, user, isAuthenticated]);

  return (
    <Box className={styles.container}>
      <Typography variant="h5" className={styles.title}>
        مدیریت سفارش‌های انجام‌شده
      </Typography>
      {instructorOrders.length === 0 ? (
        <Typography className={styles.emptyMessage}>
          هیچ سفارش انجام‌شده‌ای یافت نشد.
        </Typography>
      ) : (
        <Table className={styles.table}>
          <TableHead>
            <TableRow className={styles.tableHeader}>
              <TableCell className={styles.tableCell}>شناسه سفارش</TableCell>
              <TableCell className={styles.tableCell}>عنوان دوره</TableCell>
              <TableCell className={styles.tableCell}>مبلغ</TableCell>
              <TableCell className={styles.tableCell}>تاریخ خرید</TableCell>
              <TableCell className={styles.tableCell}>وضعیت</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {instructorOrders.map((order) =>
              order.items
                .filter((item) => item.status === 'completed')
                .map((item, index) => (
                  <TableRow key={`${order.id}-${index}`} className={styles.tableRow}>
                    <TableCell className={styles.tableCell}>{order.id}</TableCell>
                    <TableCell className={styles.tableCell}>{sanitizeText(item.courseTitle)}</TableCell>
                    <TableCell className={styles.tableCell}>{sanitizeText(item.price)}</TableCell>
                    <TableCell className={styles.tableCell}>{sanitizeText(item.purchaseDate)}</TableCell>
                    <TableCell className={styles.tableCell}>انجام‌شده</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default OrderManagement;