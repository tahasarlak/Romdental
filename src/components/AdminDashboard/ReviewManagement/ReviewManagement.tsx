import React from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Box } from '@mui/material';
import { useReviewContext } from '../../../Context/ReviewContext';
import { useNotificationContext } from '../../../Context/NotificationContext';

const ReviewManagement: React.FC = () => {
  const { reviews, setReviews } = useReviewContext();
  const { showNotification } = useNotificationContext();

  const handleDeleteReview = (id: number) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این نظر را حذف کنید؟')) {
      setReviews(reviews.filter(review => review.id !== id));
      showNotification('نظر با موفقیت حذف شد!', 'success');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>کاربر</TableCell>
            <TableCell>دوره (ID)</TableCell>
            <TableCell>امتیاز</TableCell>
            <TableCell>نظر</TableCell>
            <TableCell>تاریخ</TableCell>
            <TableCell>اقدامات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reviews.map(review => (
            <TableRow key={review.id}>
              <TableCell>{review.user}</TableCell>
              <TableCell>{review.courseId}</TableCell>
              <TableCell>{review.rating}</TableCell>
              <TableCell>{review.comment}</TableCell>
              <TableCell>{review.date}</TableCell>
              <TableCell>
                <Button color="error" onClick={() => handleDeleteReview(review.id)}>حذف</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ReviewManagement;