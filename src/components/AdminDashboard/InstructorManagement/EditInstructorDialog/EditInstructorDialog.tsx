import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { useInstructorContext } from '../../../../Context/InstructorContext';
import { Instructor } from '../../../../types/types';
import { useNotificationContext } from '../../../../Context/NotificationContext';
import styles from './EditInstructorDialog.module.css';

interface EditInstructorDialogProps {
  open: boolean;
  onClose: () => void;
  instructorId: number | null;
}

const EditInstructorDialog: React.FC<EditInstructorDialogProps> = ({ open, onClose, instructorId }) => {
  const { instructors, setInstructors } = useInstructorContext();
  const { showNotification } = useNotificationContext();
  const instructor = instructors.find((i: Instructor) => i.id === instructorId);

  const [formData, setFormData] = useState<Partial<Instructor>>({
    name: '',
    specialty: '',
    bio: '',
    image: '',
    experience: '',
    coursesTaught: [],
    averageRating: '0',
    totalStudents: 0,
    reviewCount: 0,
    whatsappLink: '',
    telegramLink: '',
    instagramLink: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (instructor && instructorId) {
      setFormData({
        name: instructor.name,
        specialty: instructor.specialty,
        bio: instructor.bio,
        image: instructor.image,
        experience: instructor.experience,
        coursesTaught: instructor.coursesTaught || [],
        averageRating: instructor.averageRating || '0',
        totalStudents: instructor.totalStudents || 0,
        reviewCount: instructor.reviewCount || 0,
        whatsappLink: instructor.whatsappLink || '',
        telegramLink: instructor.telegramLink || '',
        instagramLink: instructor.instagramLink || '',
      });
    } else {
      setFormData({
        name: '',
        specialty: '',
        bio: '',
        image: '',
        experience: '',
        coursesTaught: [],
        averageRating: '0',
        totalStudents: 0,
        reviewCount: 0,
        whatsappLink: '',
        telegramLink: '',
        instagramLink: '',
      });
    }
  }, [instructor, instructorId]);

  const validateInputs = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name?.trim()) newErrors.name = 'نام الزامی است.';
    if (!formData.specialty?.trim()) newErrors.specialty = 'تخصص الزامی است.';
    if (!formData.bio?.trim()) newErrors.bio = 'بیوگرافی الزامی است.';
    if (!formData.image?.trim()) newErrors.image = 'لینک تصویر الزامی است.';
    else if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(formData.image)) {
      newErrors.image = 'لینک تصویر نامعتبر است.';
    }
    if (!formData.experience?.trim()) newErrors.experience = 'تجربه الزامی است.';
    if (formData.totalStudents && isNaN(Number(formData.totalStudents))) {
      newErrors.totalStudents = 'تعداد دانشجویان باید عدد باشد.';
    }
    if (formData.whatsappLink && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(formData.whatsappLink)) {
      newErrors.whatsappLink = 'لینک واتساپ نامعتبر است.';
    }
    if (formData.telegramLink && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(formData.telegramLink)) {
      newErrors.telegramLink = 'لینک تلگرام نامعتبر است.';
    }
    if (formData.instagramLink && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(formData.instagramLink)) {
      newErrors.instagramLink = 'لینک اینستاگرام نامعتبر است.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (name === 'coursesTaught') {
        setFormData((prev: Partial<Instructor>) => ({
          ...prev,
          coursesTaught: value.split(',').map((course) => course.trim()).filter(Boolean),
        }));
      } else {
        setFormData((prev: Partial<Instructor>) => ({ ...prev, [name]: value }));
      }
      setErrors((prev) => ({ ...prev, [name]: '' }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!validateInputs()) {
      showNotification('لطفاً تمام خطاها را برطرف کنید!', 'error');
      return;
    }

    try {
      if (instructorId) {
        setInstructors(
          instructors.map((i: Instructor) =>
            i.id === instructorId
              ? {
                  ...formData,
                  id: instructorId,
                  reviewCount: instructor?.reviewCount || 0,
                } as Instructor
              : i
          )
        );
        showNotification('استاد با موفقیت ویرایش شد!', 'success');
      }
      onClose();
    } catch (error: any) {
      showNotification(error.message || 'خطا در ویرایش استاد', 'error');
    }
  }, [formData, instructorId, setInstructors, showNotification, onClose, validateInputs, instructor]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className={styles.dialog}
      aria-labelledby="edit-instructor-dialog-title"
      aria-describedby="edit-instructor-dialog-description"
    >
      <DialogTitle id="edit-instructor-dialog-title" className={styles.dialogTitle}>
        ویرایش استاد
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="نام"
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
        <TextField
          margin="dense"
          name="specialty"
          label="تخصص"
          type="text"
          fullWidth
          value={formData.specialty}
          onChange={handleInputChange}
          required
          error={!!errors.specialty}
          helperText={errors.specialty}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="bio"
          label="بیوگرافی"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={formData.bio}
          onChange={handleInputChange}
          required
          error={!!errors.bio}
          helperText={errors.bio}
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
        <TextField
          margin="dense"
          name="experience"
          label="تجربه (سال)"
          type="text"
          fullWidth
          value={formData.experience}
          onChange={handleInputChange}
          required
          error={!!errors.experience}
          helperText={errors.experience}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="coursesTaught"
          label="دوره‌های تدریس‌شده (با کاما جدا کنید)"
          type="text"
          fullWidth
          value={formData.coursesTaught?.join(', ')}
          onChange={handleInputChange}
          helperText="مثال: دوره ایمپلنت, دوره ارتودنسی"
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="averageRating"
          label="امتیاز میانگین"
          type="text"
          fullWidth
          value={formData.averageRating}
          onChange={handleInputChange}
          helperText="بین 0 تا 5 (پیش‌فرض: 0)"
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="totalStudents"
          label="تعداد دانشجویان"
          type="number"
          fullWidth
          value={formData.totalStudents}
          onChange={handleInputChange}
          error={!!errors.totalStudents}
          helperText={errors.totalStudents}
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="whatsappLink"
          label="لینک واتساپ (اختیاری)"
          type="text"
          fullWidth
          value={formData.whatsappLink}
          onChange={handleInputChange}
          error={!!errors.whatsappLink}
          helperText={errors.whatsappLink}
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="telegramLink"
          label="لینک تلگرام (اختیاری)"
          type="text"
          fullWidth
          value={formData.telegramLink}
          onChange={handleInputChange}
          error={!!errors.telegramLink}
          helperText={errors.telegramLink}
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="instagramLink"
          label="لینک اینستاگرام (اختیاری)"
          type="text"
          fullWidth
          value={formData.instagramLink}
          onChange={handleInputChange}
          error={!!errors.instagramLink}
          helperText={errors.instagramLink}
          className={styles.textField}
        />
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelButton} aria-label="لغو ویرایش استاد">
          لغو
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className={styles.submitButton}
          aria-label="به‌روزرسانی استاد"
        >
          به‌روزرسانی
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditInstructorDialog;