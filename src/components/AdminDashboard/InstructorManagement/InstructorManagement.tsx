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
import { useInstructorContext } from '../../../Context/InstructorContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import InstructorDialog from './InstructorDialog/InstructorDialog';
import EditInstructorDialog from './EditInstructorDialog/EditInstructorDialog';
import styles from './InstructorManagement.module.css';

const InstructorManagement: React.FC = () => {
  const { instructors, setInstructors } = useInstructorContext();
  const { showNotification } = useNotificationContext();
  const [openInstructorDialog, setOpenInstructorDialog] = useState(false);
  const [openEditInstructorDialog, setOpenEditInstructorDialog] = useState(false);
  const [editInstructorId, setEditInstructorId] = useState<number | null>(null);
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://roomdental.com';

  const handleDeleteInstructor = (id: number) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این استاد را حذف کنید؟')) {
      setInstructors(instructors.filter((instructor) => instructor.id !== id));
      showNotification('استاد با موفقیت حذف شد!', 'success');
    }
  };

  const handleEditInstructor = (id: number) => {
    setEditInstructorId(id);
    setOpenEditInstructorDialog(true);
  };

  return (
    <Box className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        مدیریت اساتید
      </Typography>
      <Button
        variant="contained"
        className={styles.createButton}
        onClick={() => setOpenInstructorDialog(true)}
      >
        ایجاد استاد جدید
      </Button>
      {instructors.length === 0 ? (
        <Typography className={styles.emptyMessage}>هیچ استادی یافت نشد.</Typography>
      ) : (
        <Table className={styles.table}>
          <TableHead>
            <TableRow className={styles.tableHeader}>
              <TableCell className={styles.tableCell}>نام</TableCell>
              <TableCell className={styles.tableCell}>تخصص</TableCell>
              <TableCell className={styles.tableCell}>تجربه</TableCell>
              <TableCell className={styles.tableCell}>تعداد دانشجویان</TableCell>
              <TableCell className={styles.tableCell}>اقدامات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {instructors.map((instructor) => (
              <TableRow key={instructor.id} className={styles.tableRow}>
                <TableCell className={styles.tableCell}>{instructor.name}</TableCell>
                <TableCell className={styles.tableCell}>{instructor.specialty}</TableCell>
                <TableCell className={styles.tableCell}>{instructor.experience}</TableCell>
                <TableCell className={styles.tableCell}>{instructor.totalStudents}</TableCell>
                <TableCell className={styles.tableCell}>
                  <IconButton
                    className={styles.editButton}
                    onClick={() => handleEditInstructor(instructor.id)}
                    aria-label="ویرایش استاد"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    className={styles.deleteButton}
                    onClick={() => handleDeleteInstructor(instructor.id)}
                    aria-label="حذف استاد"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Link
                    to={`${baseUrl}/instructors/${instructor.id}`}
                    className={styles.viewLink}
                  >
                    مشاهده
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <InstructorDialog
        open={openInstructorDialog}
        onClose={() => setOpenInstructorDialog(false)}
      />
      <EditInstructorDialog
        open={openEditInstructorDialog}
        onClose={() => {
          setOpenEditInstructorDialog(false);
          setEditInstructorId(null);
        }}
        instructorId={editInstructorId}
      />
    </Box>
  );
};

export default InstructorManagement;