import React, { useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuthContext } from '../../../Context/AuthContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import UserDialog from './UserDialog/UserDialog';
import EditUserDialog from './EditUserDialog/EditUserDialog';
import { User } from '../../../types/types';
import styles from './UserManagement.module.css';

const UserManagement: React.FC = () => {
  const { users, user, deleteUser } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟')) {
      try {
        await deleteUser(userId);
        showNotification('کاربر با موفقیت حذف شد', 'success');
      } catch (error: any) {
        showNotification('خطایی در حذف کاربر رخ داد', 'error');
      }
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setOpenEditDialog(true);
  };

  return (
    <Box sx={{ mt: 4, px: 2 }} className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        مدیریت کاربران
      </Typography>
      <Button
        variant="contained"
        onClick={() => setOpenUserDialog(true)}
        className={styles.createButton}
      >
        ایجاد کاربر جدید
      </Button>
      {users.length === 0 ? (
        <Typography className={styles.emptyMessage}>هیچ کاربری یافت نشد.</Typography>
      ) : (
        <Table className={styles.table}>
          <TableHead>
            <TableRow className={styles.tableHeader}>
              <TableCell className={styles.tableCell}>نام</TableCell>
              <TableCell className={styles.tableCell}>ایمیل</TableCell>
              <TableCell className={styles.tableCell}>شماره تلفن</TableCell>
              <TableCell className={styles.tableCell}>دانشگاه</TableCell>
              <TableCell className={styles.tableCell}>جنسیت</TableCell>
              <TableCell className={styles.tableCell}>نقش</TableCell>
              <TableCell className={styles.tableCell}>کورس</TableCell>
              <TableCell className={styles.tableCell}>تصویر پروفایل</TableCell>
              <TableCell className={styles.tableCell}>اقدامات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.email} className={styles.tableRow}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell>{u.university}</TableCell>
                <TableCell>{u.gender}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.course || '-'}</TableCell>
                <TableCell>
                  {u.profilePicture ? (
                    <img src={u.profilePicture} alt={u.name} className={styles.userImage} />
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEditUser(u)}
                    className={styles.editButton}
                    title="ویرایش"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteUser(u.id)}
                    className={styles.deleteButton}
                    disabled={user?.role !== 'SuperAdmin' || u.role === 'SuperAdmin'}
                    title="حذف"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <UserDialog
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
      />
      {selectedUser && (
        <EditUserDialog
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}
    </Box>
  );
};

export default UserManagement;