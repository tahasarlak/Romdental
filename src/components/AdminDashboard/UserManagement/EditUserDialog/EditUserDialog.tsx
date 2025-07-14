import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useAuthContext } from '../../../../Context/AuthContext';
import { useNotificationContext } from '../../../../Context/NotificationContext';
import { User } from '../../../../types/types';
import styles from './EditUserDialog.module.css';

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ open, onClose, user: userToEdit }) => {
  const { user: currentUser, manageUser, setUsers, setUser, universities, addUniversity } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<User>({ ...userToEdit });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setFormData({ ...userToEdit });
    setImageInputMode(userToEdit.profilePicture?.startsWith('blob:') ? 'upload' : 'url');
  }, [userToEdit]);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'name':
        return !value || value.trim() === '' ? 'نام الزامی است' : '';
      case 'email':
        return !value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'ایمیل باید معتبر باشد' : '';
      case 'phone':
        return !value || !/^\d{10,}$/.test(value) ? 'شماره تلفن باید معتبر باشد' : '';
      case 'university':
        return !value || value.trim() === '' ? 'دانشگاه الزامی است' : '';
      case 'gender':
        return !value || !['مرد', 'زن'].includes(value) ? 'جنسیت باید "مرد" یا "زن" باشد' : '';
      case 'profilePicture':
        if (imageInputMode === 'url') {
          return value && !/^https?:\/\/.*/.test(value) ? 'لینک تصویر باید معتبر باشد' : '';
        }
        return selectedFile ? '' : value ? '' : 'تصویر یا لینک تصویر الزامی است';
      default:
        return '';
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleAutocompleteChange = (name: string, value: string | null) => {
    setFormData((prev) => ({ ...prev, [name]: value || undefined }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleImageInputModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'url' | 'upload'
  ) => {
    if (newMode) {
      setImageInputMode(newMode);
      setFormData((prev) => ({ ...prev, profilePicture: '' }));
      setSelectedFile(null);
      setErrors((prev) => ({ ...prev, profilePicture: validateField('profilePicture', '') }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setFormData((prev) => ({ ...prev, profilePicture: file ? URL.createObjectURL(file) : '' }));
    setErrors((prev) => ({ ...prev, profilePicture: validateField('profilePicture', file ? file.name : '') }));
  };

  const handleUpdate = async () => {
    const newErrors: { [key: string]: string } = {};
    ['name', 'email', 'phone', 'university', 'gender', 'profilePicture'].forEach((field) => {
      const error = validateField(field, formData[field as keyof User]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification('لطفاً تمام فیلدهای الزامی را به درستی پر کنید!', 'error');
      return;
    }

    if (formData.role === 'SuperAdmin' && currentUser?.role !== 'SuperAdmin') {
      showNotification('شما نمی‌توانید نقش سوپر ادمین را تغییر دهید!', 'error');
      return;
    }

    if (formData.university && !universities.includes(formData.university)) {
      addUniversity(formData.university);
    }

    try {
      const updatedUser: User = {
        ...formData,
        wishlist: formData.wishlist || [],
        enrolledCourses: formData.enrolledCourses || [],
        cart: formData.cart || [],
        password: formData.password || userToEdit.password,
        token: formData.token || userToEdit.token,
        profilePicture: formData.profilePicture || undefined,
      };

      await manageUser(updatedUser.email, updatedUser);
      setUsers((prev: User[]) =>
        prev.map((u: User) => (u.email === updatedUser.email ? updatedUser : u))
      );
      if (currentUser?.email === updatedUser.email) {
        await setUser(updatedUser);
      }
      showNotification('کاربر با موفقیت به‌روزرسانی شد', 'success');
      setSelectedFile(null);
      setImageInputMode('url');
      onClose();
    } catch (error: any) {
      showNotification(error.message || 'خطایی در به‌روزرسانی کاربر رخ داد', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className={styles.dialog}>
      <DialogTitle className={styles.dialogTitle}>ویرایش کاربر</DialogTitle>
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
        />
        <TextField
          margin="dense"
          name="email"
          label="ایمیل"
          type="email"
          fullWidth
          value={formData.email}
          onChange={handleInputChange}
          required
          disabled
          error={!!errors.email}
          helperText={errors.email}
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="phone"
          label="شماره تلفن"
          type="text"
          fullWidth
          value={formData.phone}
          onChange={handleInputChange}
          required
          error={!!errors.phone}
          helperText={errors.phone}
          className={styles.textField}
        />
        <Autocomplete
          freeSolo
          options={universities}
          value={formData.university || ''}
          onChange={(event, value) => handleAutocompleteChange('university', value)}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="dense"
              name="university"
              label="دانشگاه"
              fullWidth
              required
              error={!!errors.university}
              helperText={errors.university || 'دانشگاه را وارد کنید یا از موجود انتخاب کنید'}
              className={styles.textField}
            />
          )}
        />
        <FormControl fullWidth margin="dense" error={!!errors.gender}>
          <InputLabel>جنسیت</InputLabel>
          <Select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            label="جنسیت"
            className={styles.select}
          >
            <MenuItem value="مرد">مرد</MenuItem>
            <MenuItem value="زن">زن</MenuItem>
          </Select>
          {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>نقش</InputLabel>
          <Select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            label="نقش"
            disabled={currentUser?.role !== 'SuperAdmin' || formData.role === 'SuperAdmin'}
            className={styles.select}
          >
            <MenuItem value="Student">دانشجو</MenuItem>
            <MenuItem value="Instructor">استاد</MenuItem>
            <MenuItem value="Blogger">وبلاگ‌نویس</MenuItem>
            {currentUser?.role === 'SuperAdmin' && <MenuItem value="Admin">ادمین</MenuItem>}
            {currentUser?.role === 'SuperAdmin' && <MenuItem value="SuperAdmin">سوپر ادمین</MenuItem>}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          name="course"
          label="کورس (اختیاری)"
          type="text"
          fullWidth
          value={formData.course || ''}
          onChange={handleInputChange}
          className={styles.textField}
        />
        <ToggleButtonGroup
          value={imageInputMode}
          exclusive
          onChange={handleImageInputModeChange}
          aria-label="image input mode"
          className={styles.toggleButtonGroup}
        >
          <ToggleButton value="url" aria-label="url input">
            لینک تصویر
          </ToggleButton>
          <ToggleButton value="upload" aria-label="file upload">
            آپلود تصویر
          </ToggleButton>
        </ToggleButtonGroup>
        {imageInputMode === 'url' ? (
          <TextField
            margin="dense"
            name="profilePicture"
            label="لینک تصویر پروفایل"
            type="text"
            fullWidth
            value={formData.profilePicture}
            onChange={handleInputChange}
            required
            error={!!errors.profilePicture}
            helperText={errors.profilePicture}
            className={styles.textField}
          />
        ) : (
          <TextField
            margin="dense"
            name="profilePicture"
            type="file"
            fullWidth
            onChange={handleFileChange}
            required
            error={!!errors.profilePicture}
            helperText={errors.profilePicture}
            className={styles.textField}
            InputProps={{ inputProps: { accept: 'image/*' } }}
          />
        )}
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelButton}>
          لغو
        </Button>
        <Button onClick={handleUpdate} variant="contained" className={styles.createButton}>
          به‌روزرسانی
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;