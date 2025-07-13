import React, { useState, useCallback, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
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
  Box,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DOMPurify from 'dompurify';
import { useAuthContext } from '../../Context/AuthContext';
import { useCourseContext } from '../../Context/CourseContext';
import { useNotificationContext } from '../../Context/NotificationContext';
import { Helmet } from 'react-helmet-async';
import { Course, SyllabusItem, ContentItem } from '../../types/types';

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

const InstructorDashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuthContext();
  const { courses, loading, deleteCourse } = useCourseContext();
  const { showNotification } = useNotificationContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  
  const instructorCourses = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    const validatedCourses = validateCourses(courses);
    return user?.role === 'SuperAdmin'
      ? validatedCourses
      : validatedCourses.filter((course) => {
          const normalizeName = (name: string) => name.replace(/دکتر\s*/g, '').trim();
          const courseInstructor = normalizeName(course.instructor);
          const userName = normalizeName(user?.name || '');
          const matches = courseInstructor === userName;
       
          return matches;
        });
  }, [courses, user, isAuthenticated]);

  const filteredCourses = useMemo(() => {
    const filtered = instructorCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterType === 'All' || course.courseType === filterType)
    );
    return filtered;
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

  if (!isAuthenticated || !user || (user.role !== 'SuperAdmin' && user.role !== 'Instructor')) {
    showNotification('شما به این صفحه دسترسی ندارید!', 'error');
    return <Navigate to="/login" />;
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'داشبورد مدیریت دوره‌ها - روم دنتال',
    description: user?.role === 'SuperAdmin'
      ? 'صفحه داشبورد سوپر ادمین برای مدیریت همه دوره‌های آموزشی دندانپزشکی'
      : 'صفحه داشبورد استاد برای مدیریت دوره‌های آموزشی دندانپزشکی',
  };

  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://roomdental.com';

  return (
    <>
      <Helmet>
        <title>داشبورد {user?.role === 'SuperAdmin' ? 'سوپر ادمین' : 'استاد'} - روم دنتال</title>
        <meta
          name="description"
          content={sanitizeText(
            user?.role === 'SuperAdmin'
              ? 'مدیریت همه دوره‌های آموزشی دندانپزشکی توسط سوپر ادمین'
              : 'مدیریت دوره‌های آموزشی دندانپزشکی توسط استاد'
          )}
        />
        <meta
          name="keywords"
          content={sanitizeText(
            user?.role === 'SuperAdmin'
              ? 'داشبورد سوپر ادمین, دوره‌های دندانپزشکی, روم دنتال'
              : 'داشبورد استاد, دوره‌های دندانپزشکی, روم دنتال'
          )}
        />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 6, color: 'text.primary' }}>
          داشبورد {user?.role === 'SuperAdmin' ? 'سوپر ادمین' : 'استاد'}: {sanitizeText(user?.name || '')}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 6 }}>
          <TextField
            label="جستجوی دوره"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(sanitizeText(e.target.value))}
            sx={{ flex: 1 }}
            aria-label="جستجوی عنوان دوره"
          />
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
            <CircularProgress aria-label="در حال بارگذاری دوره‌ها" />
          </Box>
        )}

        {!loading && filteredCourses.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
            هیچ دوره‌ای یافت نشد. لطفاً فیلترها را تغییر دهید یا دوره جدیدی ایجاد کنید.
          </Typography>
        ) : (
          <Table sx={{ minWidth: 650, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>عنوان</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>نوع</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>دانشگاه</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>تعداد ثبت‌نام</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>استاد</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>اقدامات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell>{sanitizeText(course.title)}</TableCell>
                  <TableCell>{sanitizeText(course.courseType)}</TableCell>
                  <TableCell>{sanitizeText(course.university)}</TableCell>
                  <TableCell>{course.enrollmentCount}</TableCell>
                  <TableCell>{sanitizeText(course.instructor)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Link
                        to={`${baseUrl}/courses/${course.slug}`}
                        title="مشاهده دوره"
                        aria-label={`مشاهده دوره ${sanitizeText(course.title)}`}
                      >
                        <IconButton>
                          <VisibilityIcon sx={{ color: 'primary.main' }} />
                        </IconButton>
                      </Link>
                      <Link
                        to={`${baseUrl}/courses/${course.slug}/edit`}
                        title="ویرایش دوره"
                        aria-label={`ویرایش دوره ${sanitizeText(course.title)}`}
                      >
                        <IconButton>
                          <EditIcon sx={{ color: 'success.main' }} />
                        </IconButton>
                      </Link>
                      <IconButton
                        onClick={() => {
                          setCourseToDelete(course);
                          setDeleteDialogOpen(true);
                        }}
                        title="حذف دوره"
                        aria-label={`حذف دوره ${sanitizeText(course.title)}`}
                      >
                        <DeleteIcon sx={{ color: 'error.main' }} />
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
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">تأیید حذف دوره</DialogTitle>
          <DialogContent>
            <DialogContentText>
              آیا مطمئن هستید که می‌خواهید دوره{' '}
              <strong>{courseToDelete ? sanitizeText(courseToDelete.title) : ''}</strong> را حذف کنید؟ این عملیات قابل بازگشت نیست.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              لغو
            </Button>
            <Button
              onClick={() => courseToDelete && handleDeleteCourse(courseToDelete)}
              color="error"
              autoFocus
            >
              حذف
            </Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ mt: 6 }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={`${baseUrl}/courses/new`}
            aria-label="ایجاد دوره جدید"
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            ایجاد دوره جدید
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default InstructorDashboard;