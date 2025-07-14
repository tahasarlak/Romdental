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
import { useScheduleContext } from '../../../../Context/ScheduleContext';
import { useNotificationContext } from '../../../../Context/NotificationContext';
import styles from './ScheduleDialog.module.css';

interface ScheduleDialogProps {
  open: boolean;
  onClose: () => void;
}

const ScheduleDialog: React.FC<ScheduleDialogProps> = ({ open, onClose }) => {
  const { setWeeklySchedule } = useScheduleContext();
  const { showNotification } = useNotificationContext();
  const [newSchedule, setNewSchedule] = useState({
    id: '',
    day: '',
    time: '',
    course: '',
    instructor: '',
    image: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateInputs = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!newSchedule.id.trim()) newErrors.id = 'شناسه الزامی است.';
    else if (isNaN(Number(newSchedule.id))) newErrors.id = 'شناسه باید عدد باشد.';
    if (!newSchedule.day.trim()) newErrors.day = 'روز الزامی است.';
    if (!newSchedule.time.trim()) newErrors.time = 'ساعت الزامی است.';
    if (!newSchedule.course.trim()) newErrors.course = 'دوره الزامی است.';
    if (!newSchedule.instructor.trim()) newErrors.instructor = 'استاد الزامی است.';
    if (!newSchedule.image.trim()) newErrors.image = 'لینک تصویر الزامی است.';
    else if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(newSchedule.image)) {
      newErrors.image = 'لینک تصویر نامعتبر است.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newSchedule]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSchedule((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!validateInputs()) {
      showNotification('لطفاً تمام خطاها را برطرف کنید!', 'error');
      return;
    }

    try {
      setWeeklySchedule((prev) => [
        ...prev,
        {
          id: Number(newSchedule.id),
          day: newSchedule.day,
          time: newSchedule.time,
          course: newSchedule.course,
          instructor: newSchedule.instructor,
          image: newSchedule.image,
        },
      ]);
      setNewSchedule({ id: '', day: '', time: '', course: '', instructor: '', image: '' });
      showNotification('برنامه با موفقیت ایجاد شد!', 'success');
      onClose();
    } catch (error: any) {
      showNotification(error.message || 'خطا در ایجاد برنامه', 'error');
    }
  }, [newSchedule, setWeeklySchedule, showNotification, onClose, validateInputs]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={styles.dialog}
      aria-labelledby="schedule-dialog-title"
      aria-describedby="schedule-dialog-description"
    >
      <DialogTitle id="schedule-dialog-title" className={styles.dialogTitle}>
        ایجاد برنامه جدید
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <TextField
          autoFocus
          margin="dense"
          name="id"
          label="شناسه"
          type="number"
          fullWidth
          value={newSchedule.id}
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
          name="day"
          label="روز"
          fullWidth
          value={newSchedule.day}
          onChange={handleInputChange}
          required
          error={!!errors.day}
          helperText={errors.day}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        >
          <MenuItem value="شنبه">شنبه</MenuItem>
          <MenuItem value="یک‌شنبه">یک‌شنبه</MenuItem>
          <MenuItem value="دوشنبه">دوشنبه</MenuItem>
          <MenuItem value="سه‌شنبه">سه‌شنبه</MenuItem>
          <MenuItem value="چهارشنبه">چهارشنبه</MenuItem>
          <MenuItem value="پنج‌شنبه">پنج‌شنبه</MenuItem>
          <MenuItem value="جمعه">جمعه</MenuItem>
        </TextField>
        <TextField
          margin="dense"
          name="time"
          label="ساعت"
          type="text"
          fullWidth
          value={newSchedule.time}
          onChange={handleInputChange}
          required
          error={!!errors.time}
          helperText={errors.time}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="course"
          label="دوره"
          type="text"
          fullWidth
          value={newSchedule.course}
          onChange={handleInputChange}
          required
          error={!!errors.course}
          helperText={errors.course}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="instructor"
          label="استاد"
          type="text"
          fullWidth
          value={newSchedule.instructor}
          onChange={handleInputChange}
          required
          error={!!errors.instructor}
          helperText={errors.instructor}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="image"
          label="لینک تصویر"
          type="text"
          fullWidth
          value={newSchedule.image}
          onChange={handleInputChange}
          required
          error={!!errors.image}
          helperText={errors.image}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelButton} aria-label="لغو ایجاد برنامه">
          لغو
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          className={styles.submitButton}
          aria-label="ایجاد برنامه جدید"
        >
          ایجاد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleDialog;