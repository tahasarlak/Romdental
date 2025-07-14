import React, { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useReviewContext } from '../../../Context/ReviewContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import ReviewDialog from './ReviewDialog/ReviewDialog';
import EditReviewDialog from './EditReviewDialog/EditReviewDialog';
import styles from './ReviewManagement.module.css';

const ReviewManagement: React.FC = () => {
  const { reviews, setReviews } = useReviewContext();
  const { showNotification } = useNotificationContext();
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [openEditReviewDialog, setOpenEditReviewDialog] = useState(false);
  const [editReviewId, setEditReviewId] = useState<number | null>(null);

  const handleDeleteReview = (id: number) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این نظر را حذف کنید؟')) {
      setReviews(reviews.filter((review) => review.id !== id));
      showNotification('نظر با موفقیت حذف شد!', 'success');
    }
  };

  const handleEditReview = (id: number) => {
    setEditReviewId(id);
    setOpenEditReviewDialog(true);
  };

  return (
    <Box className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        مدیریت نظرات
      </Typography>
      <Button
        variant="contained"
        className={styles.createButton}
        onClick={() => setOpenReviewDialog(true)}
      >
        افزودن نظر جدید
      </Button>
      {reviews.length === 0 ? (
        <Typography className={styles.emptyMessage}>هیچ نظری یافت نشد.</Typography>
      ) : (
        <Table className={styles.table}>
          <TableHead>
            <TableRow className={styles.tableHeader}>
              <TableCell className={styles.tableCell}>کاربر</TableCell>
              <TableCell className={styles.tableCell}>دوره (ID)</TableCell>
              <TableCell className={styles.tableCell}>امتیاز</TableCell>
              <TableCell className={styles.tableCell}>نظر</TableCell>
              <TableCell className={styles.tableCell}>تاریخ</TableCell>
              <TableCell className={styles.tableCell}>اقدامات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id} className={styles.tableRow}>
                <TableCell className={styles.tableCell}>{review.user}</TableCell>
                <TableCell className={styles.tableCell}>{review.courseId}</TableCell>
                <TableCell className={styles.tableCell}>{review.rating}</TableCell>
                <TableCell className={styles.tableCell}>{review.comment}</TableCell>
                <TableCell className={styles.tableCell}>{review.date}</TableCell>
                <TableCell className={styles.tableCell}>
                  <IconButton
                    className={styles.editButton}
                    onClick={() => handleEditReview(review.id)}
                    aria-label="ویرایش نظر"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    className={styles.deleteButton}
                    onClick={() => handleDeleteReview(review.id)}
                    aria-label="حذف نظر"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ReviewDialog
        open={openReviewDialog}
        onClose={() => setOpenReviewDialog(false)}
      />
      <EditReviewDialog
        open={openEditReviewDialog}
        onClose={() => {
          setOpenEditReviewDialog(false);
          setEditReviewId(null);
        }}
        reviewId={editReviewId}
      />
    </Box>
  );
};

export default ReviewManagement;