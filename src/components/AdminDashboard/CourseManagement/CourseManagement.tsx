import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Box } from '@mui/material';
import { useCourseContext } from '../../../Context/CourseContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import CourseDialog from '../CourseDialog/CourseDialog';

type Course = ReturnType<typeof useCourseContext>['courses'][number];

const CourseManagement: React.FC = () => {
  const { courses, setCourses } = useCourseContext();
  const { showNotification } = useNotificationContext();
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://roomdental.com';

  const handleDeleteCourse = (id: number) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این دوره را حذف کنید؟')) {
      setCourses(courses.filter(course => course.id !== id));
      showNotification('دوره با موفقیت حذف شد!', 'success');
    }
  };

  const handleCreateCourse = (course: Course) => {
    setCourses([...courses, course]);
    showNotification('دوره با موفقیت ایجاد شد!', 'success');
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button variant="contained" color="primary" onClick={() => setOpenCourseDialog(true)} className="mb-4">
        ایجاد دوره جدید
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>عنوان</TableCell>
            <TableCell>استاد</TableCell>
            <TableCell>نوع</TableCell>
            <TableCell>دانشگاه</TableCell>
            <TableCell>اقدامات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {courses.map(course => (
            <TableRow key={course.id}>
              <TableCell>{course.title}</TableCell>
              <TableCell>{course.instructor}</TableCell>
              <TableCell>{course.courseType}</TableCell>
              <TableCell>{course.university}</TableCell>
              <TableCell>
                <Link to={`${baseUrl}/courses/${course.id}/edit`} className="text-blue-500 mr-2">ویرایش</Link>
                <Button color="error" onClick={() => handleDeleteCourse(course.id)}>حذف</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CourseDialog
        open={openCourseDialog}
        onClose={() => setOpenCourseDialog(false)}
        onCreate={handleCreateCourse}
      />
    </Box>
  );
};

export default CourseManagement;