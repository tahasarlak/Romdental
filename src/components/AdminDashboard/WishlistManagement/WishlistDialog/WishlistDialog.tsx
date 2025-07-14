import React, { useState, useCallback } from 'react';
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
import styles from './WishlistDialog.module.css';

interface WishlistDialogProps {
  open: boolean;
  onClose: () => void;
}

const WishlistDialog: React.FC<WishlistDialogProps> = ({ open, onClose }) => {
  const { toggleWishlist } = useWishlistContext();
  const { showNotification } = useNotificationContext();
  const [newWishlistItem, setNewWishlistItem] = useState({
    id: '',
    type: '' as 'course' | 'instructor' | 'blog',
    name: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateInputs = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!newWishlistItem.id.trim()) newErrors.id = 'شناسه مورد الزامی است.';
    else if (isNaN(Number(newWishlistItem.id))) newErrors.id = 'شناسه باید عدد باشد.';
    if (!newWishlistItem.type) newErrors.type = 'نوع مورد الزامی است.';
    if (!newWishlistItem.name.trim()) newErrors.name = 'نام مورد الزامی است.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newWishlistItem]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewWishlistItem((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!validateInputs()) {
      showNotification('لطفاً تمام خطاها را برطرف کنید!', 'error');
      return;
    }

    try {
      await toggleWishlist(Number(newWishlistItem.id), newWishlistItem.type, newWishlistItem.name);
      setNewWishlistItem({ id: '', type: '' as 'course' | 'instructor' | 'blog', name: '' });
      showNotification('مورد با موفقیت به لیست علاقه‌مندی‌ها اضافه شد!', 'success');
      onClose();
    } catch (error: any) {
      showNotification(error.message || 'خطا در افزودن به علاقه‌مندی‌ها', 'error');
    }
  }, [newWishlistItem, toggleWishlist, showNotification, onClose, validateInputs]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={styles.dialog}
      aria-labelledby="wishlist-dialog-title"
      aria-describedby="wishlist-dialog-description"
    >
      <DialogTitle id="wishlist-dialog-title" className={styles.dialogTitle}>
        افزودن مورد جدید به علاقه‌مندی‌ها
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <TextField
          autoFocus
          margin="dense"
          name="id"
          label="شناسه مورد"
          type="number"
          fullWidth
          value={newWishlistItem.id}
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
          value={newWishlistItem.type}
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
          value={newWishlistItem.name}
          onChange={handleInputChange}
          required
          error={!!errors.name}
          helperText={errors.name}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelButton} aria-label="لغو افزودن مورد">
          لغو
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          className={styles.submitButton}
          aria-label="ایجاد مورد جدید"
        >
          ایجاد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WishlistDialog;