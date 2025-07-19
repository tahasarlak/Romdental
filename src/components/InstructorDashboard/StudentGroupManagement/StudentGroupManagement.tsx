import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuthContext } from '../../../Context/Auth/UserAuthContext';
import { useCourseContext } from '../../../Context/CourseContext';
import { useEnrollmentContext } from '../../../Context/EnrollmentContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import { Course, Enrollment, User } from '../../../types/types';
import DOMPurify from 'dompurify';
import CreateStudentGroupDialog from './CreateStudentGroupDialog/CreateStudentGroupDialog';
import EditStudentGroupDialog from './EditStudentGroupDialog/EditStudentGroupDialog';
import styles from './StudentGroupManagement.module.css';

const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i'],
    ALLOWED_ATTR: [],
  });
};

const StudentGroupManagement: React.FC = () => {
  const { isAuthenticated, user, users } = useAuthContext();
  const { courses, loading: courseLoading } = useCourseContext();
  const { enrollments, updateEnrollmentGroup, updateEnrollmentStatus } = useEnrollmentContext();
  const { showNotification } = useNotificationContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<number | 'All'>('All');
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [newGroup, setNewGroup] = useState<string>('');

  const instructorCourses = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    return user.role === 'SuperAdmin'
      ? courses
      : courses.filter((course) => {
          const normalizeName = (name: string) => name.replace(/دکتر\s*/g, '').trim();
          return normalizeName(course.instructor) === normalizeName(user.name || '');
        });
  }, [courses, user, isAuthenticated]);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const student = users.find((u) => u.id === enrollment.studentId);
      const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesCourse =
        selectedCourseId === 'All' || enrollment.courseId === selectedCourseId;
      return matchesSearch && matchesCourse && enrollment.status === 'active';
    });
  }, [enrollments, users, searchTerm, selectedCourseId]);

  const handleUpdateGroup = async (enrollment: Enrollment) => {
    if (!newGroup) {
      showNotification('لطفاً یک گروه انتخاب کنید.', 'error');
      return;
    }
    try {
      await updateEnrollmentGroup(enrollment.id, newGroup);
      showNotification(`گروه دانشجو "${users.find((u) => u.id === enrollment.studentId)?.name}" با موفقیت به‌روزرسانی شد.`, 'success');
      setGroupDialogOpen(false);
      setSelectedEnrollment(null);
      setNewGroup('');
    } catch (error) {
      showNotification('خطایی در به‌روزرسانی گروه رخ داد.', 'error');
    }
  };

  const handleUnenroll = async (enrollment: Enrollment) => {
    try {
      await updateEnrollmentStatus(enrollment.id, 'inactive');
      showNotification(`دانشجو "${users.find((u) => u.id === enrollment.studentId)?.name}" با موفقیت از دوره حذف شد.`, 'success');
      setDeleteDialogOpen(false);
      setSelectedEnrollment(null);
    } catch (error) {
      showNotification('خطایی در حذف دانشجو از دوره رخ داد.', 'error');
    }
  };

  if (!isAuthenticated || !user || (user.role !== 'SuperAdmin' && user.role !== 'Instructor')) {
    showNotification('شما به این صفحه دسترسی ندارید!', 'error');
    return <Navigate to="/login" />;
  }

  return (
    <Box className={styles.container}>
      <Typography variant="h5" className={styles.title}>
        مدیریت گروه‌بندی دانشجویان
      </Typography>
      <Box className={styles.filterContainer}>
        <TextField
          label="جستجوی دانشجو"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(sanitizeText(e.target.value))}
          className={styles.searchField}
          aria-label="جستجوی نام دانشجو"
        />
        <FormControl variant="outlined" className={styles.selectField}>
          <InputLabel>دوره</InputLabel>
          <Select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value as number | 'All')}
            label="دوره"
          >
            <MenuItem value="All">همه دوره‌ها</MenuItem>
            {instructorCourses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {sanitizeText(course.title)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box className={styles.createButtonContainer}>
        <Button
          variant="contained"
          className={styles.createButton}
          onClick={() => setCreateDialogOpen(true)}
          aria-label="ایجاد ثبت‌نام جدید"
        >
          ثبت‌نام دانشجوی جدید
        </Button>
      </Box>
      {courseLoading && (
        <Box className={styles.loadingContainer}>
          <CircularProgress aria-label="در حال بارگذاری داده‌ها" />
        </Box>
      )}
      {!courseLoading && filteredEnrollments.length === 0 ? (
        <Typography className={styles.emptyMessage}>
          هیچ دانشجویی یافت نشد. لطفاً فیلترها را تغییر دهید یا دانشجوی جدیدی ثبت‌نام کنید.
        </Typography>
      ) : (
        <Table className={styles.table}>
          <TableHead>
            <TableRow className={styles.tableHeader}>
              <TableCell className={styles.tableCell}>نام دانشجو</TableCell>
              <TableCell className={styles.tableCell}>دوره</TableCell>
              <TableCell className={styles.tableCell}>گروه</TableCell>
              <TableCell className={styles.tableCell}>وضعیت</TableCell>
              <TableCell className={styles.tableCell}>اقدامات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEnrollments.map((enrollment) => {
              const student = users.find((u) => u.id === enrollment.studentId);
              const course = courses.find((c) => c.id === enrollment.courseId);
              return (
                <TableRow key={enrollment.id} className={styles.tableRow}>
                  <TableCell className={styles.tableCell}>
                    {student ? sanitizeText(student.name) : 'دانشجوی نامشخص'}
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    {course ? sanitizeText(course.title) : 'دوره نامشخص'}
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    {sanitizeText(enrollment.group || 'بدون گروه')}
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    {enrollment.status === 'active' ? 'فعال' : 'غیرفعال'}
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    <Box className={styles.actionButtons}>
                      <IconButton
                        className={styles.editButton}
                        onClick={() => {
                          setSelectedEnrollment(enrollment);
                          setNewGroup(enrollment.group || '');
                          setGroupDialogOpen(true);
                        }}
                        title="ویرایش گروه"
                        aria-label={`ویرایش گروه برای ${student?.name}`}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        className={styles.deleteButton}
                        onClick={() => {
                          setSelectedEnrollment(enrollment);
                          setDeleteDialogOpen(true);
                        }}
                        title="حذف از دوره"
                        aria-label={`حذف ${student?.name} از دوره`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      <EditStudentGroupDialog
        open={groupDialogOpen}
        onClose={() => {
          setGroupDialogOpen(false);
          setSelectedEnrollment(null);
          setNewGroup('');
        }}
        enrollment={selectedEnrollment}
        onUpdateGroup={handleUpdateGroup}
      />
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        className={styles.dialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title" className={styles.dialogTitle}>
          تأیید حذف دانشجو از دوره
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <DialogContentText>
            آیا مطمئن هستید که می‌خواهید دانشجو{' '}
            <strong>{selectedEnrollment ? users.find((u) => u.id === selectedEnrollment.studentId)?.name : ''}</strong> را از دوره حذف کنید؟
          </DialogContentText>
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            className={styles.cancelButton}
            aria-label="لغو حذف دانشجو"
          >
            لغو
          </Button>
          <Button
            onClick={() => selectedEnrollment && handleUnenroll(selectedEnrollment)}
            className={styles.deleteButton}
            aria-label="تأیید حذف دانشجو"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
      <CreateStudentGroupDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        instructorCourses={instructorCourses}
      />
    </Box>
  );
};

export default StudentGroupManagement;