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
import { useScheduleContext } from '../../../../Context/ScheduleContext';
import { useNotificationContext } from '../../../../Context/NotificationContext';
import styles from './EditScheduleDialog.module.css';

interface ScheduleItem {
  id: number;
  day: string;
  time: string;
  course: string;
  instructor: string;
  image: string;
}

interface EditScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  scheduleId: number | null;
}

const EditScheduleDialog: React.FC<EditScheduleDialogProps> = ({ open, onClose, scheduleId }) => {
  const { weeklySchedule, setWeeklySchedule } = useScheduleContext();
  const { showNotification } = useNotificationContext();
  const schedule = weeklySchedule.find((s) => s.id === scheduleId);

  const [formData, setFormData] = useState({
    id: '',
    day: '',
    time: '',
    course: '',
    instructor: '',
    image: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (schedule && scheduleId) {
      setFormData({
        id: schedule.id.toString(),
        day: schedule.day,
        time: schedule.time,
        course: schedule.course,
        instructor: schedule.instructor,
        image: schedule.image,
      });
    } else {
      setFormData({ id: '', day: '', time: '', course: '', instructor: '', image: '' });
    }
  }, [schedule, scheduleId]);

  const validateInputs = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.id.trim()) newErrors.id = 'شناسه الزامی است.';
    else if (isNaN(Number(formData.id))) newErrors.id = 'شناسه باید عدد باشد.';
    if (!formData.day.trim()) newErrors.day = 'روز الزامی است.';
    if (!formData.time.trim()) newErrors.time = 'ساعت الزامی است.';
    if (!formData.course.trim()) newErrors.course = 'دوره الزامی است.';
    if (!formData.instructor.trim()) newErrors.instructor = 'استاد الزامی است.';
    if (!formData.image.trim()) newErrors.image = 'لینک تصویر الزامی است.';
    else if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(formData.image)) {
      newErrors.image = 'لینک تصویر نامعتبر است.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateInputs()) {
      showNotification('لطفاً تمام خطاها را برطرف کنید!', 'error');
      return;
    }

    try {
      if (scheduleId) {
        setWeeklySchedule(
          weeklySchedule.map((s) =>
            s.id === scheduleId
              ? {
                  id: Number(formData.id),
                  day: formData.day,
                  time: formData.time,
                  course: formData.course,
                  instructor: formData.instructor,
                  image: formData.image,
                }
              : s
          )
        );
        showNotification('برنامه با موفقیت ویرایش شد!', 'success');
      }
      onClose();
    } catch (error: any) {
      showNotification(error.message || 'خطا در ویرایش برنامه', 'error');
    }
  }, [formData, scheduleId, setWeeklySchedule, showNotification, onClose, validateInputs]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={styles.dialog}
      aria-labelledby="edit-schedule-dialog-title"
      aria-describedby="edit-schedule-dialog-description"
    >
      <DialogTitle id="edit-schedule-dialog-title" className={styles.dialogTitle}>
        ویرایش برنامه
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <TextField
          autoFocus
          margin="dense"
          name="id"
          label="شناسه"
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
          name="day"
          label="روز"
          fullWidth
          value={formData.day}
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
          value={formData.time}
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
          value={formData.course}
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
          value={formData.instructor}
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
          value={formData.image}
          onChange={handleInputChange}
          required
          error={!!errors.image}
          helperText={errors.image}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelButton} aria-label="لغو ویرایش برنامه">
          لغو
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className={styles.submitButton}
          aria-label="به‌روزرسانی برنامه"
        >
          به‌روزرسانی
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditScheduleDialog;