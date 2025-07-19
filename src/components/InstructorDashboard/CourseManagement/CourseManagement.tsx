import React, { useState, useCallback, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import DOMPurify from 'dompurify';
import { useAuthContext } from '../../../Context/Auth/UserAuthContext';
import { useCourseContext } from '../../../Context/CourseContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import { Course, SyllabusItem, ContentItem, User } from '../../../types/types';

import styles from './CourseManagement.module.css';
import CourseEnrollmentsDialog from './CourseEnrollmentsDialog/CourseEnrollmentsDialog';
import CreateCourseDialog from './CreateCourseDialog/CreateCourseDialog';
import EditCourseDialog from './EditCourseDialog/EditCourseDialog';

const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i'],
    ALLOWED_ATTR: [],
  });
};

const validateCourses = (courses: Course[]): Course[] => {
  return courses.filter((course) => {
    const isValidSyllabus = course.syllabus.every(
      (item: SyllabusItem) =>
        typeof item.id === 'number' &&
        typeof item.title === 'string' &&
        item.title.trim() !== '' &&
        typeof item.duration === 'string' &&
        item.duration.trim() !== '' &&
        typeof item.completed === 'boolean' &&
        typeof item.isLocked === 'boolean' &&
        (item.previewContent === undefined || (typeof item.previewContent === 'string' && item.previewContent.length <= 500)) &&
        Array.isArray(item.contents) &&
        item.contents.every(
          (content: ContentItem) =>
            ['video', 'image', 'text', 'quiz'].includes(content.type) &&
            (content.url === undefined || (typeof content.url === 'string' && /^https?:\/\/.*/.test(content.url))) &&
            (content.text === undefined || (typeof content.text === 'string' && content.text.length <= 500)) &&
            (content.title === undefined || (typeof content.title === 'string' && content.title.length <= 100))
        ) &&
        (item.isNew === undefined || typeof item.isNew === 'boolean')
    );
    return (
      typeof course.id === 'number' &&
      typeof course.title === 'string' &&
      course.title.trim() !== '' &&
      typeof course.instructor === 'string' &&
      course.instructor.trim() !== '' &&
      ['Online', 'Offline', 'In-Person', 'Hybrid'].includes(course.courseType) &&
      typeof course.university === 'string' &&
      course.university.trim() !== '' &&
      typeof course.slug === 'string' &&
      course.slug.trim() !== '' &&
      isValidSyllabus
    );
  });
};

const CourseManagement: React.FC = () => {
  const { isAuthenticated, user, users } = useAuthContext();
  const { courses, loading, deleteCourse } = useCourseContext();
  const { showNotification } = useNotificationContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editCourseId, setEditCourseId] = useState<number | null>(null);
  const [openEnrollmentsDialog, setOpenEnrollmentsDialog] = useState(false);
  const [enrollmentsCourseId, setEnrollmentsCourseId] = useState<number | null>(null);

  const instructorCourses = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    const validatedCourses = validateCourses(courses);
    return user?.role === 'SuperAdmin'
      ? validatedCourses
      : validatedCourses.filter((course) => {
          const normalizeName = (name: string) => name.replace(/دکتر\s*/g, '').trim();
          const courseInstructor = normalizeName(course.instructor);
          const userName = normalizeName(user?.name || '');
          return courseInstructor === userName;
        });
  }, [courses, user, isAuthenticated]);

  const filteredCourses = useMemo(() => {
    return instructorCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterType === 'All' || course.courseType === filterType)
    );
  }, [instructorCourses, searchTerm, filterType]);

  const handleDeleteCourse = useCallback(
    async (course: Course) => {
      try {
        await deleteCourse(course.id);
        showNotification(`دوره "${sanitizeText(course.title)}" با موفقیت حذف شد.`, 'success');
      } catch (error) {
        showNotification('خطایی در حذف دوره رخ داد. لطفاً دوباره تلاش کنید.', 'error');
      } finally {
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
      }
    },
    [deleteCourse, showNotification]
  );

  const handleEditCourse = (id: number) => {
    setEditCourseId(id);
    setOpenEditDialog(true);
  };

  const handleViewEnrollments = (id: number) => {
    setEnrollmentsCourseId(id);
    setOpenEnrollmentsDialog(true);
  };

  if (!isAuthenticated || !user || (user.role !== 'SuperAdmin' && user.role !== 'Instructor')) {
    showNotification('شما به این صفحه دسترسی ندارید!', 'error');
    return <Navigate to="/login" />;
  }

  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://roomdental.com';

  return (
    <Box className={styles.container}>
      <Typography variant="h5" className={styles.title}>
        مدیریت دوره‌ها
      </Typography>
      <Box className={styles.filterContainer}>
        <TextField
          label="جستجوی دوره"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(sanitizeText(e.target.value))}
          className={styles.searchField}
          aria-label="جستجوی عنوان دوره"
        />
        <FormControl variant="outlined" className={styles.selectField}>
          <InputLabel>نوع دوره</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as string)}
            label="نوع دوره"
          >
            <MenuItem value="All">همه</MenuItem>
            <MenuItem value="Online">آنلاین</MenuItem>
            <MenuItem value="Offline">آفلاین</MenuItem>
            <MenuItem value="In-Person">حضوری</MenuItem>
            <MenuItem value="Hybrid">ترکیبی</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {loading && (
        <Box className={styles.loadingContainer}>
          <CircularProgress aria-label="در حال بارگذاری دوره‌ها" />
        </Box>
      )}
      {!loading && filteredCourses.length === 0 ? (
        <Typography className={styles.emptyMessage}>
          هیچ دوره‌ای یافت نشد. لطفاً فیلترها را تغییر دهید یا دوره جدیدی ایجاد کنید.
        </Typography>
      ) : (
        <Table className={styles.table}>
          <TableHead>
            <TableRow className={styles.tableHeader}>
              <TableCell className={styles.tableCell}>عنوان</TableCell>
              <TableCell className={styles.tableCell}>نوع</TableCell>
              <TableCell className={styles.tableCell}>دانشگاه</TableCell>
              <TableCell className={styles.tableCell}>تعداد ثبت‌نام</TableCell>
              <TableCell className={styles.tableCell}>استاد</TableCell>
              <TableCell className={styles.tableCell}>اقدامات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCourses.map((course: Course) => (
              <TableRow key={course.id} className={styles.tableRow}>
                <TableCell className={styles.tableCell}>{sanitizeText(course.title)}</TableCell>
                <TableCell className={styles.tableCell}>{sanitizeText(course.courseType)}</TableCell>
                <TableCell className={styles.tableCell}>{sanitizeText(course.university)}</TableCell>
                <TableCell className={styles.tableCell}>
                  {users.filter((u: User) => u.enrolledCourses.includes(course.id)).length}
                </TableCell>
                <TableCell className={styles.tableCell}>{sanitizeText(course.instructor)}</TableCell>
                <TableCell className={styles.tableCell}>
                  <Box className={styles.actionButtons}>
                    <Link
                      to={`${baseUrl}/courses/${course.slug}`}
                      title="مشاهده دوره"
                      aria-label={`مشاهده دوره ${sanitizeText(course.title)}`}
                    >
                      <IconButton className={styles.viewButton}>
                        <VisibilityIcon />
                      </IconButton>
                    </Link>
                    <IconButton
                      className={styles.editButton}
                      onClick={() => handleEditCourse(course.id)}
                      title="ویرایش دوره"
                      aria-label={`ویرایش دوره ${sanitizeText(course.title)}`}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      className={styles.deleteButton}
                      onClick={() => {
                        setCourseToDelete(course);
                        setDeleteDialogOpen(true);
                      }}
                      title="حذف دوره"
                      aria-label={`حذف دوره ${sanitizeText(course.title)}`}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      className={styles.enrollmentsButton}
                      onClick={() => handleViewEnrollments(course.id)}
                      title="مشاهده ثبت‌نام‌ها"
                      aria-label={`مشاهده ثبت‌نام‌های دوره ${sanitizeText(course.title)}`}
                    >
                      <PeopleIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        className={styles.dialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title" className={styles.dialogTitle}>
          تأیید حذف دوره
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <DialogContentText>
            آیا مطمئن هستید که می‌خواهید دوره{' '}
            <strong>{courseToDelete ? sanitizeText(courseToDelete.title) : ''}</strong> را حذف کنید؟ این عملیات قابل بازگشت نیست.
          </DialogContentText>
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            className={styles.cancelButton}
            aria-label="لغو حذف دوره"
          >
            لغو
          </Button>
          <Button
            onClick={() => courseToDelete && handleDeleteCourse(courseToDelete)}
            className={styles.deleteButton}
            aria-label="تأیید حذف دوره"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
      <CreateCourseDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
      />
      <EditCourseDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setEditCourseId(null);
        }}
        courseId={editCourseId}
      />
      <CourseEnrollmentsDialog
        open={openEnrollmentsDialog}
        onClose={() => {
          setOpenEnrollmentsDialog(false);
          setEnrollmentsCourseId(null);
        }}
        courseId={enrollmentsCourseId}
      />
      <Box className={styles.createButtonContainer}>
        <Button
          variant="contained"
          className={styles.createButton}
          onClick={() => setOpenCreateDialog(true)}
          aria-label="ایجاد دوره جدید"
        >
          ایجاد دوره جدید
        </Button>
      </Box>
    </Box>
  );
};

export default CourseManagement;