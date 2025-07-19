import React, { useState } from 'react';
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
import { useAuthContext } from '../../../../Context/Auth/UserAuthContext';
import { useNotificationContext } from '../../../../Context/NotificationContext';
import { User } from '../../../../types/types';
import styles from './UserDialog.module.css';

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
}

const UserDialog: React.FC<UserDialogProps> = ({ open, onClose }) => {
  const { user, signup, universities, addUniversity } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    password: '',
    phone: '',
    university: '',
    gender: undefined,
    role: 'Student',
    course: '',
    profilePicture: '',
  });

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'name':
        return !value || value.trim() === '' ? 'نام الزامی است' : '';
      case 'email':
        return !value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'ایمیل باید معتبر باشد' : '';
      case 'password':
        return !value || value.length < 6 ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : '';
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

  const handleUserInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleAutocompleteChange = (name: string, value: string | null) => {
    setNewUser((prev) => ({ ...prev, [name]: value || undefined }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleImageInputModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'url' | 'upload'
  ) => {
    if (newMode) {
      setImageInputMode(newMode);
      setNewUser((prev) => ({ ...prev, profilePicture: '' }));
      setSelectedFile(null);
      setErrors((prev) => ({ ...prev, profilePicture: validateField('profilePicture', '') }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setNewUser((prev) => ({ ...prev, profilePicture: file ? URL.createObjectURL(file) : '' }));
    setErrors((prev) => ({ ...prev, profilePicture: validateField('profilePicture', file ? file.name : '') }));
  };

  const handleCreate = async () => {
    const newErrors: { [key: string]: string } = {};
    ['name', 'email', 'password', 'phone', 'university', 'gender', 'profilePicture'].forEach((field) => {
      const error = validateField(field, newUser[field as keyof User]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification('لطفاً تمام فیلدهای الزامی را به درستی پر کنید!', 'error');
      return;
    }

    if (newUser.role === 'SuperAdmin' && user?.role !== 'SuperAdmin') {
      showNotification('شما نمی‌توانید نقش سوپر ادمین را اختصاص دهید!', 'error');
      return;
    }

    if (newUser.university && !universities.includes(newUser.university)) {
      addUniversity(newUser.university);
    }

    try {
  await signup(
  newUser.name,
  newUser.email,
  newUser.password,
  newUser.phone,
  newUser.university,
  newUser.gender as 'مرد' | 'زن',
  newUser.course,
  newUser.role as 'Student' | 'Instructor' | 'Admin' | 'SuperAdmin'
);
      showNotification('کاربر با موفقیت ایجاد شد', 'success');
      setNewUser({
        name: '',
        email: '',
        password: '',
        phone: '',
        university: '',
        gender: undefined,
        role: 'Student',
        course: '',
        profilePicture: '',
      });
      setSelectedFile(null);
      setImageInputMode('url');
      onClose();
    } catch (error: any) {
      showNotification(error.message || 'خطایی در ایجاد کاربر رخ داد', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className={styles.dialog}>
      <DialogTitle className={styles.dialogTitle}>ایجاد کاربر جدید</DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="نام"
          type="text"
          fullWidth
          value={newUser.name}
          onChange={handleUserInputChange}
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
          value={newUser.email}
          onChange={handleUserInputChange}
          required
          error={!!errors.email}
          helperText={errors.email}
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="password"
          label="رمز عبور"
          type="password"
          fullWidth
          value={newUser.password}
          onChange={handleUserInputChange}
          required
          error={!!errors.password}
          helperText={errors.password}
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="phone"
          label="شماره تلفن"
          type="text"
          fullWidth
          value={newUser.phone}
          onChange={handleUserInputChange}
          required
          error={!!errors.phone}
          helperText={errors.phone}
          className={styles.textField}
        />
        <Autocomplete
          freeSolo
          options={universities}
          value={newUser.university || ''}
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
            value={newUser.gender || ''}
            onChange={handleUserInputChange}
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
            value={newUser.role}
            onChange={handleUserInputChange}
            label="نقش"
            disabled={user?.role !== 'SuperAdmin'}
            className={styles.select}
          >
            <MenuItem value="Student">دانشجو</MenuItem>
            <MenuItem value="Instructor">استاد</MenuItem>
            <MenuItem value="Blogger">وبلاگ‌نویس</MenuItem>
            {user?.role === 'SuperAdmin' && <MenuItem value="Admin">ادمین</MenuItem>}
            {user?.role === 'SuperAdmin' && <MenuItem value="SuperAdmin">سوپر ادمین</MenuItem>}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          name="course"
          label="کورس (اختیاری)"
          type="text"
          fullWidth
          value={newUser.course || ''}
          onChange={handleUserInputChange}
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
            value={newUser.profilePicture}
            onChange={handleUserInputChange}
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
        <Button onClick={handleCreate} variant="contained" className={styles.createButton}>
          ایجاد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDialog;