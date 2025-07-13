import React, { useState } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAuthContext } from '../../../Context/AuthContext';
import { useNotificationContext } from '../../../Context/NotificationContext';


interface User {
  token: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  gender: 'مرد' | 'زن' | '';
  course?: string;
  profilePicture?: string;
  wishlist: { id: number; type: 'course' | 'instructor' | 'blog' }[];
  enrolledCourses: number[];
  password: string;
  role: 'SuperAdmin' | 'Admin' | 'Instructor' | 'Student';
}

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
}

const UserDialog: React.FC<UserDialogProps> = ({ open, onClose }) => {
  const { user, signup } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    password: '',
    phone: '',
    university: '',
    gender: '',
    role: 'Student',
  });

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.phone || !newUser.university || !newUser.gender) {
      showNotification('لطفاً تمام فیلدهای الزامی را پر کنید!', 'error');
      return;
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
        newUser.role as 'Student' | 'Instructor' | 'Admin'
      );
      showNotification('کاربر با موفقیت ایجاد شد!', 'success');
      setNewUser({
        name: '',
        email: '',
        password: '',
        phone: '',
        university: '',
        gender: '',
        role: 'Student',
      });
      onClose();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>ایجاد کاربر جدید</DialogTitle>
      <DialogContent>
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
        />
        <TextField
          margin="dense"
          name="university"
          label="دانشگاه"
          type="text"
          fullWidth
          value={newUser.university}
          onChange={handleUserInputChange}
          required
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>جنسیت</InputLabel>
          <Select
            name="gender"
            value={newUser.gender}
            onChange={handleUserInputChange}
            label="جنسیت"
          >
            <MenuItem value="مرد">مرد</MenuItem>
            <MenuItem value="زن">زن</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>نقش</InputLabel>
          <Select
            name="role"
            value={newUser.role}
            onChange={handleUserInputChange}
            label="نقش"
            disabled={user?.role !== 'SuperAdmin'}
          >
            <MenuItem value="Student">دانشجو</MenuItem>
            <MenuItem value="Instructor">استاد</MenuItem>
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
          value={newUser.course}
          onChange={handleUserInputChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>لغو</Button>
        <Button onClick={handleCreate} variant="contained">ایجاد</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDialog;