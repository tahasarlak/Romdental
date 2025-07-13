// src/components/AdminDashboard/EditUserDialog/EditUserDialog.tsx
import React from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAuthContext } from '../../../Context/AuthContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import { User } from '../../../types/types';

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  userToEdit: User | null;
  onUpdate: (updatedUser: User) => Promise<void>;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ open, onClose, userToEdit, onUpdate }) => {
  const { user } = useAuthContext();
  const { showNotification } = useNotificationContext();

  const handleEditUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    if (userToEdit) {
      onUpdate({ ...userToEdit, [name]: value } as User);
    }
  };

  const handleSubmit = async () => {
    if (!userToEdit) return;

    if (!userToEdit.name || !userToEdit.email || !userToEdit.phone || !userToEdit.university || !userToEdit.gender) {
      showNotification('لطفاً تمام فیلدهای الزامی را پر کنید!', 'error');
      return;
    }

    if (userToEdit.role === 'SuperAdmin' && user?.role !== 'SuperAdmin') {
      showNotification('شما نمی‌توانید نقش سوپر ادمین را تغییر دهید!', 'error');
      return;
    }

    try {
      await onUpdate(userToEdit);
      onClose();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>ویرایش کاربر</DialogTitle>
      <DialogContent>
        {userToEdit && (
          <>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="نام"
              type="text"
              fullWidth
              value={userToEdit.name}
              onChange={handleEditUserInputChange}
              required
            />
            <TextField
              margin="dense"
              name="email"
              label="ایمیل"
              type="email"
              fullWidth
              value={userToEdit.email}
              onChange={handleEditUserInputChange}
              required
              disabled
            />
            <TextField
              margin="dense"
              name="phone"
              label="شماره تلفن"
              type="text"
              fullWidth
              value={userToEdit.phone}
              onChange={handleEditUserInputChange}
              required
            />
            <TextField
              margin="dense"
              name="university"
              label="دانشگاه"
              type="text"
              fullWidth
              value={userToEdit.university}
              onChange={handleEditUserInputChange}
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>جنسیت</InputLabel>
              <Select
                name="gender"
                value={userToEdit.gender}
                onChange={handleEditUserInputChange}
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
                value={userToEdit.role}
                onChange={handleEditUserInputChange}
                label="نقش"
                disabled={user?.role !== 'SuperAdmin' || userToEdit.role === 'SuperAdmin'}
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
              value={userToEdit.course || ''}
              onChange={handleEditUserInputChange}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>لغو</Button>
        <Button onClick={handleSubmit} variant="contained">به‌روزرسانی</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;