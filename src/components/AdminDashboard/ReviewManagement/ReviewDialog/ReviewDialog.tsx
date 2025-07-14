// ReviewDialog.tsx
import React, { useState, useCallback } from 'react';
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
import styles from './ReviewDialog.module.css';

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({ open, onClose }) => {
  const { addReview } = useReviewContext();
  const { showNotification } = useNotificationContext();
  const [newReview, setNewReview] = useState({
    user: '',
    courseId: '',
    rating: '',
    comment: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateInputs = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!newReview.user.trim()) newErrors.user = 'نام کاربر الزامی است.';
    if (!newReview.courseId.trim()) newErrors.courseId = 'شناسه دوره الزامی است.';
    if (!newReview.rating.trim()) newErrors.rating = 'امتیاز الزامی است.';
    else if (isNaN(Number(newReview.rating)) || Number(newReview.rating) < 0 || Number(newReview.rating) > 5) {
      newErrors.rating = 'امتیاز باید بین 0 تا 5 باشد.';
    }
    if (!newReview.comment.trim()) newErrors.comment = 'نظر الزامی است.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newReview]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!validateInputs()) {
      showNotification('لطفاً تمام خطاها را برطرف کنید!', 'error');
      return;
    }

    try {
      await addReview(
        Number(newReview.courseId),
        Number(newReview.rating),
        newReview.comment,
        { role: 'user' } // metadata اختیاری
      );
      setNewReview({
        user: '',
        courseId: '',
        rating: '',
        comment: '',
      });
      showNotification('نظر با موفقیت ایجاد شد!', 'success');
      onClose();
    } catch (error: any) {
      showNotification(error.message || 'خطا در ایجاد نظر', 'error');
    }
  }, [newReview, addReview, showNotification, onClose, validateInputs]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={styles.dialog}
      aria-labelledby="review-dialog-title"
      aria-describedby="review-dialog-description"
    >
      <DialogTitle id="review-dialog-title" className={styles.dialogTitle}>
        افزودن نظر جدید
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <TextField
          autoFocus
          margin="dense"
          name="user"
          label="کاربر"
          type="text"
          fullWidth
          value={newReview.user}
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
          type="number"
          fullWidth
          value={newReview.courseId}
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
          value={newReview.rating}
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
          value={newReview.comment}
          onChange={handleInputChange}
          required
          error={!!errors.comment}
          helperText={errors.comment}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelButton} aria-label="لغو افزودن نظر">
          لغو
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          className={styles.submitButton}
          aria-label="ایجاد نظر جدید"
        >
          ایجاد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewDialog;