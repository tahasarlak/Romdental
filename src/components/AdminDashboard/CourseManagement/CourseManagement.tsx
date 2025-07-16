import React, { useState } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Box, CircularProgress, Typography } from '@mui/material';
import { useCourseContext } from '../../../Context/CourseContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import CourseDialog from './CourseDialog/CourseDialog';
import EditCourseDialog from './EditCourseDialog/EditCourseDialog';
import styles from './CourseManagement.module.css';

type Course = ReturnType<typeof useCourseContext>['courses'][number];

const CourseManagement: React.FC = () => {
  const { courses, deleteCourse, setCourses, addCourse, loading } = useCourseContext();
  const { showNotification } = useNotificationContext();
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleDeleteCourse = async (id: number) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این دوره را حذف کنید؟')) {
      try {
        await deleteCourse(id);
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const handleCreateCourse = async (course: Omit<Course, 'id'>) => {
    try {
      await addCourse(course); // Call addCourse from CourseContext
      setOpenCourseDialog(false);
      showNotification('دوره با موفقیت ایجاد شد', 'success');
    } catch (error) {
      console.error('Error creating course:', error);
      showNotification('خطایی در ایجاد دوره رخ داد', 'error');
    }
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setOpenEditDialog(true);
  };

  const handleUpdateCourse = async (updatedCourse: Course) => {
    try {
      setCourses((prev) => prev.map((course) => (course.id === updatedCourse.id ? updatedCourse : course)));
      showNotification('دوره با موفقیت به‌روزرسانی شد', 'success');
      setOpenEditDialog(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error updating course:', error);
      showNotification('خطایی در به‌روزرسانی دوره رخ داد', 'error');
    }
  };

  return (
    <Box sx={{ mt: 4, px: 2 }} className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        مدیریت دوره‌ها
      </Typography>
      <Button
        variant="contained"
        onClick={() => setOpenCourseDialog(true)}
        className={styles.createButton}
        disabled={loading}
      >
        ایجاد دوره جدید
      </Button>
      {loading ? (
        <Box className={styles.loader}>
          <CircularProgress />
        </Box>
      ) : courses.length === 0 ? (
        <Typography className={styles.emptyMessage}>هیچ دوره‌ای یافت نشد.</Typography>
      ) : (
        <Table className={styles.table}>
          <TableHead>
            <TableRow className={styles.tableHeader}>
              <TableCell className={styles.tableCell}>شناسه</TableCell>
              <TableCell className={styles.tableCell}>عنوان</TableCell>
              <TableCell className={styles.tableCell}>استاد</TableCell>
              <TableCell className={styles.tableCell}>نوع</TableCell>
              <TableCell className={styles.tableCell}>دانشگاه</TableCell>
              <TableCell className={styles.tableCell}>مدت زمان</TableCell>
              <TableCell className={styles.tableCell}>قیمت</TableCell>
              <TableCell className={styles.tableCell}>قیمت با تخفیف</TableCell>
              <TableCell className={styles.tableCell}>درصد تخفیف</TableCell>
              <TableCell className={styles.tableCell}>تاریخ شروع</TableCell>
              <TableCell className={styles.tableCell}>دسته‌بندی</TableCell>
              <TableCell className={styles.tableCell}>تعداد ثبت‌نام</TableCell>
              <TableCell className={styles.tableCell}>وضعیت</TableCell>
              <TableCell className={styles.tableCell}>ویژه</TableCell>
              <TableCell className={styles.tableCell}>تصویر</TableCell>
              <TableCell className={styles.tableCell}>اقدامات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id} className={styles.tableRow}>
                <TableCell>{course.id}</TableCell>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.instructor}</TableCell>
                <TableCell>{course.courseType}</TableCell>
                <TableCell>{course.university}</TableCell>
                <TableCell>{course.duration}</TableCell>
                <TableCell>{course.price}</TableCell>
                <TableCell>{course.discountPrice || '-'}</TableCell>
                <TableCell>{course.discountPercentage ? `${course.discountPercentage}%` : '-'}</TableCell>
                <TableCell>{course.startDateJalali}</TableCell>
                <TableCell>{course.category}</TableCell>
                <TableCell>{course.enrollmentCount}</TableCell>
                <TableCell>{course.isOpen ? 'باز' : 'بسته'}</TableCell>
                <TableCell>{course.isFeatured ? 'بله' : 'خیر'}</TableCell>
                <TableCell>
                  {course.image ? (
                    <img src={course.image} alt={course.title} className={styles.courseImage} />
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleEditCourse(course)}
                    className={styles.editButton}
                  >
                    ویرایش
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDeleteCourse(course.id)}
                    className={styles.deleteButton}
                    disabled={loading}
                  >
                    حذف
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <CourseDialog
        open={openCourseDialog}
        onClose={() => setOpenCourseDialog(false)}
        onCreate={handleCreateCourse}
      />
      {selectedCourse && (
        <EditCourseDialog
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setSelectedCourse(null);
          }}
          course={selectedCourse}
          onUpdate={handleUpdateCourse}
        />
      )}
    </Box>
  );
};

export default CourseManagement;