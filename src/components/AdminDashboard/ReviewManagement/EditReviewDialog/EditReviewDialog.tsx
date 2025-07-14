import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { useReviewContext } from '../../../../Context/ReviewContext';
import { useNotificationContext } from '../../../../Context/NotificationContext';
import styles from './EditReviewDialog.module.css';

interface EditReviewDialogProps {
  open: boolean;
  onClose: () => void;
  reviewId: number | null;
}

const EditReviewDialog: React.FC<EditReviewDialogProps> = ({ open, onClose, reviewId }) => {
  const { reviews, setReviews } = useReviewContext();
  const { showNotification } = useNotificationContext();
  const review = reviews.find((r) => r.id === reviewId);

  const [formData, setFormData] = useState({
    user: '',
    courseId: 0, // Changed to number
    rating: '',
    comment: '',
    date: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (review && reviewId) {
      setFormData({
        user: review.user,
        courseId: review.courseId, // courseId is now a number
        rating: review.rating.toString(),
        comment: review.comment,
        date: review.date,
      });
    } else {
      setFormData({
        user: '',
        courseId: 0, // Initialize as number
        rating: '',
        comment: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [review, reviewId]);

  const validateInputs = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.user.trim()) newErrors.user = 'نام کاربر الزامی است.';
    if (formData.courseId === 0) newErrors.courseId = 'شناسه دوره الزامی است.';
    if (!formData.rating.trim()) newErrors.rating = 'امتیاز الزامی است.';
    else if (isNaN(Number(formData.rating)) || Number(formData.rating) < 0 || Number(formData.rating) > 5) {
      newErrors.rating = 'امتیاز باید بین 0 تا 5 باشد.';
    }
    if (!formData.comment.trim()) newErrors.comment = 'نظر الزامی است.';
    if (!formData.date) newErrors.date = 'تاریخ الزامی است.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'courseId' ? Number(value) : value, // Convert courseId to number
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateInputs()) {
      showNotification('لطفاً تمام خطاها را برطرف کنید!', 'error');
      return;
    }

    try {
      if (reviewId) {
        setReviews(
          reviews.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  user: formData.user,
                  courseId: formData.courseId, // courseId is now a number
                  rating: Number(formData.rating),
                  comment: formData.comment,
                  date: formData.date,
                }
              : r
          )
        );
        showNotification('نظر با موفقیت ویرایش شد!', 'success');
      }
      onClose();
    } catch (error: any) {
      showNotification(error.message || 'خطا در ویرایش نظر', 'error');
    }
  }, [formData, reviewId, setReviews, showNotification, onClose, validateInputs]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={styles.dialog}
      aria-labelledby="edit-review-dialog-title"
      aria-describedby="edit-review-dialog-description"
    >
      <DialogTitle id="edit-review-dialog-title" className={styles.dialogTitle}>
        ویرایش نظر
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <TextField
          autoFocus
          margin="dense"
          name="user"
          label="کاربر"
          type="text"
          fullWidth
          value={formData.user}
          onChange={handleInputChange}
          required
          error={!!errors.user}
          helperText={errors.user}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="courseId"
          label="شناسه دوره"
          type="number" // Changed to number input
          fullWidth
          value={formData.courseId}
          onChange={handleInputChange}
          required
          error={!!errors.courseId}
          helperText={errors.courseId}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="rating"
          label="امتیاز (0-5)"
          type="number"
          fullWidth
          value={formData.rating}
          onChange={handleInputChange}
          required
          error={!!errors.rating}
          helperText={errors.rating}
          className={styles.textField}
          inputProps={{ 'aria-required': true, min: 0, max: 5 }}
        />
        <TextField
          margin="dense"
          name="comment"
          label="نظر"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={formData.comment}
          onChange={handleInputChange}
          required
          error={!!errors.comment}
          helperText={errors.comment}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="date"
          label="تاریخ"
          type="date"
          fullWidth
          value={formData.date}
          onChange={handleInputChange}
          required
          error={!!errors.date}
          helperText={errors.date}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelButton} aria-label="لغو ویرایش نظر">
          لغو
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className={styles.submitButton}
          aria-label="به‌روزرسانی نظر"
        >
          به‌روزرسانی
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditReviewDialog;