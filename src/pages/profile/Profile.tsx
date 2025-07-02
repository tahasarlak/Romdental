import React, { useState, useRef } from 'react';
import { useAuthContext } from '../../Context/AuthContext';
import styles from './Profile.module.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

const Profile: React.FC = () => {
  const { user, setUser, updatePassword } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    university: user?.university || '',
    gender: user?.gender || '' as 'مرد' | 'زن' | '',
    course: user?.course || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = 'نام الزامی است';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'ایمیل معتبر وارد کنید';
    if (!formData.phone || !/^\d{10,11}$/.test(formData.phone)) newErrors.phone = 'شماره تلفن معتبر وارد کنید';
    if (!formData.university) newErrors.university = 'دانشگاه الزامی است';
    if (!formData.gender) newErrors.gender = 'جنسیت را انتخاب کنید';
    return newErrors;
  };

  const validatePassword = () => {
    const newErrors: { [key: string]: string } = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'رمز عبور فعلی الزامی است';
    if (!passwordData.newPassword || passwordData.newPassword.length < 8) newErrors.newPassword = 'رمز جدید باید حداقل ۸ کاراکتر باشد';
    if (passwordData.newPassword !== passwordData.confirmPassword) newErrors.confirmPassword = 'رمزهای عبور مطابقت ندارند';
    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleGenderChange = (e: SelectChangeEvent<string>) => {
    setFormData((prev) => ({ ...prev, gender: e.target.value as 'مرد' | 'زن' }));
    setErrors((prev) => ({ ...prev, gender: '' }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (user) {
      setLoading(true);
      try {
        const updatedUser = {
          ...user,
          ...formData,
          gender: formData.gender as 'مرد' | 'زن' | '',
          profilePicture: profilePicture ? URL.createObjectURL(profilePicture) : user.profilePicture,
        };
        await setUser(updatedUser);
        setSuccessMessage('پروفایل با موفقیت به‌روزرسانی شد');
        setIsEditing(false);
        setProfilePicture(null);
      } catch (error) {
        setErrors({ general: 'خطا در به‌روزرسانی پروفایل' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePasswordUpdate = async () => {
    const passwordErrors = validatePassword();
    if (Object.keys(passwordErrors).length > 0) {
      setErrors(passwordErrors);
      return;
    }

    setLoading(true);
    try {
      await updatePassword(user!.email, passwordData.currentPassword, passwordData.newPassword);
      setSuccessMessage('رمز عبور با موفقیت تغییر کرد');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (error) {
      setErrors({ general: (error as Error).message || 'خطا در تغییر رمز عبور' });
    } finally {
      setLoading(false);
    }
  };

  const defaultProfilePicture = user?.gender === 'مرد'
    ? '/assets/male-profile.jpg'
    : user?.gender === 'زن'
    ? '/assets/female-profile.jpg'
    : '/assets/default-profile.jpg';

  return (
    <div className={styles.profileContainer}>
      <AppBar position="static" className={styles.navBar}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            داشبورد کاربر
          </Typography>
          <Button color="inherit" component={Link} to="/profile">پروفایل</Button>
          <Button color="inherit" component={Link} to="/wishlist">لیست علاقه‌مندی‌ها</Button>
        </Toolbar>
      </AppBar>
      <Card className={styles.profileCard} role="region" aria-labelledby="profile-title">
        <CardContent>
          {successMessage && (
            <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          {errors.general && (
            <Alert severity="error" onClose={() => setErrors({})} sx={{ mb: 2 }}>
              {errors.general}
            </Alert>
          )}
          <div className={styles.profileHeader}>
            <Typography id="profile-title" variant="h5" className={styles.profileTitle}>
              پروفایل کاربر
            </Typography>
            <div className={styles.avatarContainer}>
              <Avatar
                src={user?.profilePicture || defaultProfilePicture}
                alt={user?.name}
                className={styles.profileAvatar}
                sx={{ width: 150, height: 150 }}
              />
              {isEditing && (
                <IconButton
                  className={styles.uploadButton}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="آپلود تصویر پروفایل"
                >
                  <PhotoCamera />
                </IconButton>
              )}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleProfilePictureChange}
                aria-hidden="true"
              />
            </div>
            <Typography variant="h6" className={styles.profileName}>
              {user?.name.split(' ')[0]}
            </Typography>
          </div>

          {isEditing ? (
            <div className={styles.formContainer}>
              <div className={styles.formRow}>
                <TextField
                  fullWidth
                  label="نام"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.formField}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
                <TextField
                  fullWidth
                  label="ایمیل"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.formField}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <TextField
                  fullWidth
                  label="شماره تلفن"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={styles.formField}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  required
                />
                <TextField
                  fullWidth
                  label="دانشگاه"
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  className={styles.formField}
                  error={!!errors.university}
                  helperText={errors.university}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <FormControl fullWidth className={styles.formField}>
                  <InputLabel>جنسیت</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleGenderChange}
                    error={!!errors.gender}
                    required
                  >
                    <MenuItem value="مرد">مرد</MenuItem>
                    <MenuItem value="زن">زن</MenuItem>
                  </Select>
                  {errors.gender && <Typography color="error">{errors.gender}</Typography>}
                </FormControl>
                <TextField
                  fullWidth
                  label="دوره"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className={styles.formField}
                />
              </div>
              <div className={styles.formActions}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  className={styles.saveButton}
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  ذخیره
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsEditing(false);
                    setProfilePicture(null);
                    setErrors({});
                  }}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  لغو
                </Button>
              </div>
            </div>
          ) : isChangingPassword ? (
            <div className={styles.formContainer}>
              <TextField
                fullWidth
                label="رمز عبور فعلی"
                name="currentPassword"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={styles.formField}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="نمایش/مخفی کردن رمز عبور"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="رمز عبور جدید"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={styles.formField}
                error={!!errors.newPassword}
                helperText={errors.newPassword}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="نمایش/مخفی کردن رمز عبور"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="تکرار رمز عبور جدید"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={styles.formField}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="نمایش/مخفی کردن رمز عبور"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <div className={styles.formActions}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePasswordUpdate}
                  className={styles.saveButton}
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  تغییر رمز عبور
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setErrors({});
                  }}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  لغو
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.profileInfo}>
              <Typography variant="body1"><strong>نام:</strong> {user?.name}</Typography>
              <Typography variant="body1"><strong>ایمیل:</strong> {user?.email}</Typography>
              <Typography variant="body1"><strong>شماره تلفن:</strong> {user?.phone}</Typography>
              <Typography variant="body1"><strong>دانشگاه:</strong> {user?.university}</Typography>
              <Typography variant="body1"><strong>جنسیت:</strong> {user?.gender}</Typography>
              {user?.course && (
                <Typography variant="body1"><strong>دوره:</strong> {user?.course}</Typography>
              )}
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsEditing(true)}
                  className={styles.editButton}
                >
                  ویرایش پروفایل
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setIsChangingPassword(true)}
                  className={styles.editButton}
                >
                  تغییر رمز عبور
                </Button>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/wishlist"
                  className={styles.editButton}
                >
                  مشاهده لیست علاقه‌مندی‌ها
                </Button>
              </Box>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;