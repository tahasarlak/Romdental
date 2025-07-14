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
import { useCourseContext } from '../../../../Context/CourseContext';
import { useNotificationContext } from '../../../../Context/NotificationContext';
import { Course } from '../../../../types/types';
import styles from './CreateCourseDialog.module.css';

interface CreateCourseDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateCourseDialog: React.FC<CreateCourseDialogProps> = ({ open, onClose }) => {
  const { courses, setCourses } = useCourseContext();
  const { showNotification } = useNotificationContext();
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    courseType: undefined,
    university: '',
    instructor: '',
    image: '',
    slug: '',
    enrollmentCount: 0,
    syllabus: [],
  });

  useEffect(() => {
    setFormData({
      title: '',
      courseType: undefined,
      university: '',
      instructor: '',
      image: '',
      slug: '',
      enrollmentCount: 0,
      syllabus: [],
    });
  }, [open]);

  const handleSubmit = () => {
    if (!formData.title || !formData.courseType || !formData.university || !formData.instructor) {
      showNotification('لطفاً همه فیلدهای لازم را پر کنید!', 'error');
      return;
    }

    const generatedSlug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    try {
      const newCourse: Course = {
        ...formData,
        id: Math.max(...courses.map((c) => c.id), 0) + 1,
        slug: generatedSlug,
        enrollmentCount: 0,
        syllabus: [],
      } as Course;
      setCourses([...courses, newCourse]);
      showNotification('دوره با موفقیت اضافه شد!', 'success');
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'خطایی در افزودن دوره رخ داد!';
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
      <DialogTitle className={styles.dialogTitle}>ایجاد دوره جدید</DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="عنوان دوره"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
            className={styles.textField}
            error={!formData.title}
            helperText={!formData.title ? 'عنوان دوره الزامی است' : ''}
          />
          <FormControl fullWidth className={styles.select}>
            <InputLabel>نوع دوره</InputLabel>
            <Select
              value={formData.courseType || ''}
              onChange={(e) => setFormData({ ...formData, courseType: e.target.value as 'Online' | 'Offline' | 'In-Person' | 'Hybrid' })}
              label="نوع دوره"
              required
            >
              <MenuItem value="Online">آنلاین</MenuItem>
              <MenuItem value="Offline">آفلاین</MenuItem>
              <MenuItem value="In-Person">حضوری</MenuItem>
              <MenuItem value="Hybrid">ترکیبی</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="دانشگاه"
            value={formData.university || ''}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            fullWidth
            required
            className={styles.textField}
            error={!formData.university}
            helperText={!formData.university ? 'نام دانشگاه الزامی است' : ''}
          />
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
        <Button onClick={onClose} className={styles.cancelButton} aria-label="لغو ایجاد دوره">
          لغو
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className={styles.submitButton}
          aria-label="ایجاد دوره"
        >
          ایجاد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateCourseDialog;