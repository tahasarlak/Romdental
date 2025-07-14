import React, { useState, useCallback } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useInstructorContext } from '../../../../Context/InstructorContext';
import { Instructor } from '../../../../types/types'; // وارد کردن مستقیم Instructor از types
import { useNotificationContext } from '../../../../Context/NotificationContext';

/**
 * Props for the InstructorDialog component
 */
interface InstructorDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * InstructorDialog component for creating a new instructor
 * @param props - The component props
 * @returns JSX.Element
 */
const InstructorDialog: React.FC<InstructorDialogProps> = ({ open, onClose }) => {
  const { addInstructor } = useInstructorContext();
  const { showNotification } = useNotificationContext();
  const [newInstructor, setNewInstructor] = useState<Partial<Instructor>>({
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

  /**
   * Validates input fields
   * @returns True if all inputs are valid, false otherwise
   */
  const validateInputs = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!newInstructor.name?.trim()) newErrors.name = 'نام الزامی است.';
    if (!newInstructor.specialty?.trim()) newErrors.specialty = 'تخصص الزامی است.';
    if (!newInstructor.bio?.trim()) newErrors.bio = 'بیوگرافی الزامی است.';
    if (!newInstructor.image?.trim()) newErrors.image = 'لینک تصویر الزامی است.';
    else if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(newInstructor.image)) {
      newErrors.image = 'لینک تصویر نامعتبر است.';
    }
    if (!newInstructor.experience?.trim()) newErrors.experience = 'تجربه الزامی است.';
    if (newInstructor.totalStudents && isNaN(Number(newInstructor.totalStudents))) {
      newErrors.totalStudents = 'تعداد دانشجویان باید عدد باشد.';
    }
    if (newInstructor.whatsappLink && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(newInstructor.whatsappLink)) {
      newErrors.whatsappLink = 'لینک واتساپ نامعتبر است.';
    }
    if (newInstructor.telegramLink && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(newInstructor.telegramLink)) {
      newErrors.telegramLink = 'لینک تلگرام نامعتبر است.';
    }
    if (newInstructor.instagramLink && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(newInstructor.instagramLink)) {
      newErrors.instagramLink = 'لینک اینستاگرام نامعتبر است.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newInstructor]);

  /**
   * Handles input changes for form fields
   * @param e - The input change event
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (name === 'coursesTaught') {
        setNewInstructor((prev: Partial<Instructor>) => ({
          ...prev,
          coursesTaught: value.split(',').map((course) => course.trim()).filter(Boolean),
        }));
      } else {
        setNewInstructor((prev: Partial<Instructor>) => ({ ...prev, [name]: value }));
      }
      setErrors((prev) => ({ ...prev, [name]: '' }));
    },
    []
  );

  /**
   * Creates a new instructor
   */
  const handleCreate = useCallback(async () => {
    if (!validateInputs()) {
      showNotification('لطفاً تمام خطاها را برطرف کنید!', 'error');
      return;
    }

    try {
      const instructor: Omit<Instructor, 'id'> = {
        name: newInstructor.name!,
        specialty: newInstructor.specialty!,
        bio: newInstructor.bio!,
        image: newInstructor.image!,
        experience: newInstructor.experience!,
        coursesTaught: newInstructor.coursesTaught || [],
        averageRating: newInstructor.averageRating || '0',
        totalStudents: Number(newInstructor.totalStudents) || 0,
        reviewCount: 0,
        whatsappLink: newInstructor.whatsappLink || undefined,
        telegramLink: newInstructor.telegramLink || undefined,
        instagramLink: newInstructor.instagramLink || undefined,
      };

      await addInstructor(instructor);
      setNewInstructor({
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
      onClose();
    } catch (error: any) {
      showNotification(error.message || 'خطا در ایجاد استاد', 'error');
    }
  }, [newInstructor, addInstructor, showNotification, onClose, validateInputs]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="instructor-dialog-title"
      aria-describedby="instructor-dialog-description"
    >
      <DialogTitle id="instructor-dialog-title">ایجاد استاد جدید</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="نام"
          type="text"
          fullWidth
          value={newInstructor.name}
          onChange={handleInputChange}
          required
          error={!!errors.name}
          helperText={errors.name}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="specialty"
          label="تخصص"
          type="text"
          fullWidth
          value={newInstructor.specialty}
          onChange={handleInputChange}
          required
          error={!!errors.specialty}
          helperText={errors.specialty}
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
          value={newInstructor.bio}
          onChange={handleInputChange}
          required
          error={!!errors.bio}
          helperText={errors.bio}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="image"
          label="لینک تصویر"
          type="text"
          fullWidth
          value={newInstructor.image}
          onChange={handleInputChange}
          required
          error={!!errors.image}
          helperText={errors.image}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="experience"
          label="تجربه (سال)"
          type="text"
          fullWidth
          value={newInstructor.experience}
          onChange={handleInputChange}
          required
          error={!!errors.experience}
          helperText={errors.experience}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="coursesTaught"
          label="دوره‌های تدریس‌شده (با کاما جدا کنید)"
          type="text"
          fullWidth
          value={newInstructor.coursesTaught?.join(', ')}
          onChange={handleInputChange}
          helperText="مثال: دوره ایمپلنت, دوره ارتودنسی"
        />
        <TextField
          margin="dense"
          name="averageRating"
          label="امتیاز میانگین"
          type="text"
          fullWidth
          value={newInstructor.averageRating}
          onChange={handleInputChange}
          helperText="بین 0 تا 5 (پیش‌فرض: 0)"
        />
        <TextField
          margin="dense"
          name="totalStudents"
          label="تعداد دانشجویان"
          type="number"
          fullWidth
          value={newInstructor.totalStudents}
          onChange={handleInputChange}
          error={!!errors.totalStudents}
          helperText={errors.totalStudents}
        />
        <TextField
          margin="dense"
          name="whatsappLink"
          label="لینک واتساپ (اختیاری)"
          type="text"
          fullWidth
          value={newInstructor.whatsappLink}
          onChange={handleInputChange}
          error={!!errors.whatsappLink}
          helperText={errors.whatsappLink}
        />
        <TextField
          margin="dense"
          name="telegramLink"
          label="لینک تلگرام (اختیاری)"
          type="text"
          fullWidth
          value={newInstructor.telegramLink}
          onChange={handleInputChange}
          error={!!errors.telegramLink}
          helperText={errors.telegramLink}
        />
        <TextField
          margin="dense"
          name="instagramLink"
          label="لینک اینستاگرام (اختیاری)"
          type="text"
          fullWidth
          value={newInstructor.instagramLink}
          onChange={handleInputChange}
          error={!!errors.instagramLink}
          helperText={errors.instagramLink}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} aria-label="لغو ایجاد استاد">
          لغو
        </Button>
        <Button onClick={handleCreate} variant="contained" aria-label="ایجاد استاد جدید">
          ایجاد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstructorDialog;