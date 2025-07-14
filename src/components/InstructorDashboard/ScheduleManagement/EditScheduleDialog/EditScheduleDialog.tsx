import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { useScheduleContext, ScheduleItem } from '../../../../Context/ScheduleContext';
import { useNotificationContext } from '../../../../Context/NotificationContext';
import { useCourseContext } from '../../../../Context/CourseContext';
import styles from './EditScheduleDialog.module.css';

interface EditScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  scheduleId: number | null;
}

const EditScheduleDialog: React.FC<EditScheduleDialogProps> = ({ open, onClose, scheduleId }) => {
  const { weeklySchedule, setWeeklySchedule } = useScheduleContext();
  const { courses } = useCourseContext();
  const { showNotification } = useNotificationContext();
  const schedule = weeklySchedule.find((item: ScheduleItem) => item.id === scheduleId);

  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    day: '',
    time: '',
    course: '',
    instructor: '',
    image: '',
  });

  useEffect(() => {
    if (schedule && scheduleId) {
      setFormData({
        day: schedule.day,
        time: schedule.time,
        course: schedule.course,
        instructor: schedule.instructor,
        image: schedule.image,
      });
    } else {
      setFormData({
        day: '',
        time: '',
        course: '',
        instructor: '',
        image: '',
      });
    }
  }, [schedule, scheduleId]);

  const handleSubmit = () => {
    if (!formData.day || !formData.time || !formData.course || !formData.instructor) {
      showNotification('لطفاً همه فیلدهای لازم را پر کنید!', 'error');
      return;
    }

    try {
      if (scheduleId) {
        setWeeklySchedule(
          weeklySchedule.map((item: ScheduleItem) =>
            item.id === scheduleId ? { ...formData, id: scheduleId } as ScheduleItem : item
          )
        );
        showNotification('برنامه با موفقیت ویرایش شد!', 'success');
      }
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'خطایی در ویرایش برنامه رخ داد!';
      showNotification(errorMessage, 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, image: url });
      showNotification('عکس با موفقیت انتخاب شد!', 'success');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className={styles.dialog}>
      <DialogTitle className={styles.dialogTitle}>ویرایش برنامه</DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <FormControl fullWidth className={styles.select}>
            <InputLabel>روز</InputLabel>
            <Select
              value={formData.day || ''}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              label="روز"
              required
            >
              <MenuItem value="شنبه">شنبه</MenuItem>
              <MenuItem value="یکشنبه">یکشنبه</MenuItem>
              <MenuItem value="دوشنبه">دوشنبه</MenuItem>
              <MenuItem value="سه‌شنبه">سه‌شنبه</MenuItem>
              <MenuItem value="چهارشنبه">چهارشنبه</MenuItem>
              <MenuItem value="پنج‌شنبه">پنج‌شنبه</MenuItem>
              <MenuItem value="جمعه">جمعه</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="ساعت"
            value={formData.time || ''}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            fullWidth
            required
            className={styles.textField}
            error={!formData.time}
            helperText={!formData.time ? 'ساعت الزامی است' : ''}
            placeholder="مثال: 14:00-16:00"
          />
          <FormControl fullWidth className={styles.select}>
            <InputLabel>دوره</InputLabel>
            <Select
              value={formData.course || ''}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              label="دوره"
              required
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.title}>
                  {course.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="استاد"
            value={formData.instructor || ''}
            onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
            fullWidth
            required
            className={styles.textField}
            error={!formData.instructor}
            helperText={!formData.instructor ? 'نام استاد الزامی است' : ''}
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className={styles.fileInput}
            />
            {formData.image && (
              <Typography variant="body2" className={styles.imagePreview}>
                عکس انتخاب شده: {formData.image}
              </Typography>
            )}
          </Box>
        </Box>
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