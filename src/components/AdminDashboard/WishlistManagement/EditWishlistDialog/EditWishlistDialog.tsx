import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import { useWishlistContext } from '../../../../Context/WishlistContext';
import { useNotificationContext } from '../../../../Context/NotificationContext';
import { WishlistItem } from '../../../../types/types';
import styles from './EditWishlistDialog.module.css';

interface EditWishlistDialogProps {
  open: boolean;
  onClose: () => void;
  wishlistItem: WishlistItem | null;
}

const EditWishlistDialog: React.FC<EditWishlistDialogProps> = ({ open, onClose, wishlistItem }) => {
  const { setWishlistItems } = useWishlistContext();
  const { showNotification } = useNotificationContext();
  const [formData, setFormData] = useState({
    id: '',
    type: '' as 'course' | 'instructor' | 'blog',
    name: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (wishlistItem) {
      setFormData({
        id: wishlistItem.id.toString(),
        type: wishlistItem.type,
        name: wishlistItem.name || '',
      });
    } else {
      setFormData({ id: '', type: '' as 'course' | 'instructor' | 'blog', name: '' });
    }
  }, [wishlistItem]);

  const validateInputs = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.id.trim()) newErrors.id = 'شناسه مورد الزامی است.';
    else if (isNaN(Number(formData.id))) newErrors.id = 'شناسه باید عدد باشد.';
    if (!formData.type) newErrors.type = 'نوع مورد الزامی است.';
    if (!formData.name.trim()) newErrors.name = 'نام مورد الزامی است.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!validateInputs()) {
      showNotification('لطفاً تمام خطاها را برطرف کنید!', 'error');
      return;
    }

    if (!wishlistItem) {
      showNotification('مورد برای ویرایش یافت نشد!', 'error');
      return;
    }

    try {
      setWishlistItems((prev) =>
        prev.map((item) =>
          item.id === wishlistItem.id && item.type === wishlistItem.type
            ? {
                ...item,
                id: Number(formData.id),
                type: formData.type,
                name: formData.name,
                userId: item.userId, // Preserve existing userId
                likeDate: item.likeDate, // Preserve existing likeDate
              }
            : item
        )
      );
      showNotification('مورد با موفقیت ویرایش شد!', 'success');
      onClose();
    } catch (error: any) {
      showNotification(error.message || 'خطا در ویرایش مورد', 'error');
    }
  }, [formData, wishlistItem, setWishlistItems, showNotification, validateInputs, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={styles.dialog}
      aria-labelledby="edit-wishlist-dialog-title"
      aria-describedby="edit-wishlist-dialog-description"
    >
      <DialogTitle id="edit-wishlist-dialog-title" className={styles.dialogTitle}>
        ویرایش مورد علاقه‌مندی
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <TextField
          autoFocus
          margin="dense"
          name="id"
          label="شناسه مورد"
          type="number"
          fullWidth
          value={formData.id}
          onChange={handleInputChange}
          required
          error={!!errors.id}
          helperText={errors.id}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          select
          margin="dense"
          name="type"
          label="نوع"
          fullWidth
          value={formData.type}
          onChange={handleInputChange}
          required
          error={!!errors.type}
          helperText={errors.type}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        >
          <MenuItem value="course">دوره</MenuItem>
          <MenuItem value="instructor">استاد</MenuItem>
          <MenuItem value="blog">وبلاگ</MenuItem>
        </TextField>
        <TextField
          margin="dense"
          name="name"
          label="نام مورد"
          type="text"
          fullWidth
          value={formData.name}
          onChange={handleInputChange}
          required
          error={!!errors.name}
          helperText={errors.name}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelButton} aria-label="لغو ویرایش مورد">
          لغو
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className={styles.submitButton}
          aria-label="به‌روزرسانی مورد"
        >
          به‌روزرسانی
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditWishlistDialog;