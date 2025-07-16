import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Typography,
  Dialog as ConfirmDialog,
  DialogContentText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './CourseEnrollmentsDialog.module.css';
import { useAuthContext } from '../../../../Context/AuthContext';
import { useCourseContext } from '../../../../Context/CourseContext';
import { useNotificationContext } from '../../../../Context/NotificationContext';
import { User, Course } from '../../../../types/types';

interface CourseEnrollmentsDialogProps {
  open: boolean;
  onClose: () => void;
  courseId: number | null;
}

const CourseEnrollmentsDialog: React.FC<CourseEnrollmentsDialogProps> = ({ open, onClose, courseId }) => {
  const { users, manageUser } = useAuthContext();
  const { courses } = useCourseContext();
  const { showNotification } = useNotificationContext();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToUnenroll, setUserToUnenroll] = useState<User | null>(null);

  const course = courses.find((c: Course) => c.id === courseId);
  const enrolledUsers = users.filter((user: User) => user.enrolledCourses.includes(courseId || 0));

  const handleUnenroll = async (user: User) => {
    try {
      await manageUser(user.id, {
        enrolledCourses: user.enrolledCourses.filter((id) => id !== courseId),
      });
      showNotification(`کاربر ${user.name} با موفقیت از دوره حذف شد.`, 'success');
      setConfirmDialogOpen(false);
      setUserToUnenroll(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'خطایی در حذف کاربر از دوره رخ داد!';
      showNotification(errorMessage, 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth className={styles.dialog}>
      <DialogTitle className={styles.dialogTitle}>
        ثبت‌نام‌های دوره: {course ? course.title : 'دوره نامشخص'}
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>
        {enrolledUsers.length === 0 ? (
          <Typography className={styles.emptyMessage}>هیچ کاربری در این دوره ثبت‌نام نکرده است.</Typography>
        ) : (
          <Table className={styles.table}>
            <TableHead>
              <TableRow className={styles.tableHeader}>
                <TableCell className={styles.tableCell}>نام</TableCell>
                <TableCell className={styles.tableCell}>ایمیل</TableCell>
                <TableCell className={styles.tableCell}>دانشگاه</TableCell>
                <TableCell className={styles.tableCell}>اقدامات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enrolledUsers.map((user: User) => (
                <TableRow key={user.id} className={styles.tableRow}>
                  <TableCell className={styles.tableCell}>{user.name}</TableCell>
                  <TableCell className={styles.tableCell}>{user.email}</TableCell>
                  <TableCell className={styles.tableCell}>{user.university}</TableCell>
                  <TableCell className={styles.tableCell}>
                    <IconButton
                      className={styles.deleteButton}
                      onClick={() => {
                        setUserToUnenroll(user);
                        setConfirmDialogOpen(true);
                      }}
                      title={`حذف ${user.name} از دوره`}
                      aria-label={`حذف ${user.name} از دوره`}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelButton} aria-label="بستن">
          بستن
        </Button>
      </DialogActions>
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        className={styles.dialog}
        aria-labelledby="unenroll-dialog-title"
      >
        <DialogTitle id="unenroll-dialog-title" className={styles.dialogTitle}>
          تأیید حذف ثبت‌نام
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <DialogContentText>
            آیا مطمئن هستید که می‌خواهید کاربر{' '}
            <strong>{userToUnenroll ? userToUnenroll.name : ''}</strong> را از دوره حذف کنید؟
          </DialogContentText>
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            className={styles.cancelButton}
            aria-label="لغو حذف ثبت‌نام"
          >
            لغو
          </Button>
          <Button
            onClick={() => userToUnenroll && handleUnenroll(userToUnenroll)}
            className={styles.deleteButton}
            aria-label="تأیید حذف ثبت‌نام"
          >
            حذف
          </Button>
        </DialogActions>
      </ConfirmDialog>
    </Dialog>
  );
};

export default CourseEnrollmentsDialog;