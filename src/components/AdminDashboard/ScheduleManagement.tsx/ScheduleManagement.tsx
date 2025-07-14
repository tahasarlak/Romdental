import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useScheduleContext } from '../../../Context/ScheduleContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import ScheduleDialog from './ScheduleDialog/ScheduleDialog';
import EditScheduleDialog from './EditScheduleDialog/EditScheduleDialog';
import styles from './ScheduleManagement.module.css';

interface ScheduleItem {
  id: number;
  day: string;
  time: string;
  course: string;
  instructor: string;
  image: string;
}

const ScheduleManagement: React.FC = () => {
  const { weeklySchedule, setWeeklySchedule } = useScheduleContext();
  const { showNotification } = useNotificationContext();
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [openEditScheduleDialog, setOpenEditScheduleDialog] = useState(false);
  const [editScheduleId, setEditScheduleId] = useState<number | null>(null);
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://roomdental.com';

  const handleDeleteScheduleItem = (id: number) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این برنامه را حذف کنید؟')) {
      setWeeklySchedule(weeklySchedule.filter((item) => item.id !== id));
      showNotification('برنامه با موفقیت حذف شد!', 'success');
    }
  };

  const handleEditSchedule = (id: number) => {
    setEditScheduleId(id);
    setOpenEditScheduleDialog(true);
  };

  return (
    <Box className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        مدیریت برنامه‌ها
      </Typography>
      <Button
        variant="contained"
        className={styles.createButton}
        onClick={() => setOpenScheduleDialog(true)}
      >
        ایجاد برنامه جدید
      </Button>
      {weeklySchedule.length === 0 ? (
        <Typography className={styles.emptyMessage}>هیچ برنامه‌ای یافت نشد.</Typography>
      ) : (
        <Table className={styles.table}>
          <TableHead>
            <TableRow className={styles.tableHeader}>
              <TableCell className={styles.tableCell}>روز</TableCell>
              <TableCell className={styles.tableCell}>ساعت</TableCell>
              <TableCell className={styles.tableCell}>دوره</TableCell>
              <TableCell className={styles.tableCell}>استاد</TableCell>
              <TableCell className={styles.tableCell}>اقدامات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {weeklySchedule.map((item: ScheduleItem) => (
              <TableRow key={item.id} className={styles.tableRow}>
                <TableCell className={styles.tableCell}>{item.day}</TableCell>
                <TableCell className={styles.tableCell}>{item.time}</TableCell>
                <TableCell className={styles.tableCell}>{item.course}</TableCell>
                <TableCell className={styles.tableCell}>{item.instructor}</TableCell>
                <TableCell className={styles.tableCell}>
                  <IconButton
                    className={styles.editButton}
                    component={Link}
                    to={`${baseUrl}/schedule/${item.id}/edit`}
                    aria-label={`ویرایش برنامه ${item.id}`}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    className={styles.deleteButton}
                    onClick={() => handleDeleteScheduleItem(item.id)}
                    aria-label={`حذف برنامه ${item.id}`}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ScheduleDialog
        open={openScheduleDialog}
        onClose={() => setOpenScheduleDialog(false)}
      />
      <EditScheduleDialog
        open={openEditScheduleDialog}
        onClose={() => {
          setOpenEditScheduleDialog(false);
          setEditScheduleId(null);
        }}
        scheduleId={editScheduleId}
      />
    </Box>
  );
};

export default ScheduleManagement;