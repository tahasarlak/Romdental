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
import { useEnrollmentContext } from '../../../../Context/EnrollmentContext';
import { useNotificationContext } from '../../../../Context/NotificationContext';
import { useAuthContext } from '../../../../Context/Auth/UserAuthContext';
import { Course } from '../../../../types/types';
import DOMPurify from 'dompurify';
import styles from './CreateStudentGroupDialog.module.css';

interface CreateStudentGroupDialogProps {
  open: boolean;
  onClose: () => void;
  instructorCourses: Course[];
}

const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i'],
    ALLOWED_ATTR: [],
  });
};

const CreateStudentGroupDialog: React.FC<CreateStudentGroupDialogProps> = ({ open, onClose, instructorCourses }) => {
  const { enrollStudent } = useEnrollmentContext();
  const { users } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const [formData, setFormData] = useState<{
    studentId: number | '';
    courseId: number | '';
    group: string;
  }>({
    studentId: '',
    courseId: '',
    group: 'Default',
  });

  useEffect(() => {
    setFormData({
      studentId: '',
      courseId: '',
      group: 'Default',
    });
  }, [open]);

  const handleSubmit = async () => {
    if (!formData.studentId || !formData.courseId) {
      showNotification('لطفاً همه فیلدهای لازم را پر کنید!', 'error');
      return;
    }
    try {
      await enrollStudent(Number(formData.studentId), Number(formData.courseId), formData.group);
      showNotification('دانشجو با موفقیت ثبت‌نام شد!', 'success');
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'خطایی در ثبت‌نام دانشجو رخ داد!';
      showNotification(errorMessage, 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className={styles.dialog}>
      <DialogTitle className={styles.dialogTitle}>ثبت‌نام دانشجوی جدید</DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <FormControl fullWidth className={styles.select}>
            <InputLabel>دانشجو</InputLabel>
            <Select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: Number(e.target.value) })}
              label="دانشجو"
              required
            >
              {users
                .filter((user) => user.role === 'Student')
                .map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {sanitizeText(user.name)}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl fullWidth className={styles.select}>
            <InputLabel>دوره</InputLabel>
            <Select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: Number(e.target.value) })}
              label="دوره"
              required
            >
              {instructorCourses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {sanitizeText(course.title)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="گروه"
            value={formData.group}
            onChange={(e) => setFormData({ ...formData, group: sanitizeText(e.target.value) })}
            fullWidth
            className={styles.textField}
            placeholder="مثال: گروه A"
          />
        </Box>
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelButton} aria-label="لغو ثبت‌نام">
          لغو
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className={styles.submitButton}
          aria-label="ثبت‌نام"
        >
          ثبت‌نام
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateStudentGroupDialog;