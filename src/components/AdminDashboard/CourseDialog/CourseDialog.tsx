import React, { useState } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNotificationContext } from '../../../Context/NotificationContext';
import { useCourseContext } from '../../../Context/CourseContext';


type Course = ReturnType<typeof useCourseContext>['courses'][number];

interface CourseDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (course: Course) => void;
}

const CourseDialog: React.FC<CourseDialogProps> = ({ open, onClose, onCreate }) => {
  const { showNotification } = useNotificationContext();
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: '',
    instructor: '',
    description: '',
    duration: '',
    courseNumber: 'Course 1',
    category: 'عمومی',
    image: '',
    price: '',
    startDate: '',
    isOpen: true,
    isFeatured: false,
    enrollmentCount: 0,
    syllabus: [],
    faqs: [],
    courseType: 'Online',
    university: 'Sechenov',
  });

  const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    if (!newCourse.title || !newCourse.instructor || !newCourse.description || !newCourse.price || !newCourse.startDate) {
      showNotification('لطفاً تمام فیلدهای الزامی را پر کنید!', 'error');
      return;
    }

    const course: Course = {
      ...newCourse,
      id: Date.now(), // Temporary ID generation
      slug: newCourse.title?.replace(/\s+/g, '-').toLowerCase(),
      enrollmentCount: 0,
      syllabus: [],
      faqs: [],
      tags: newCourse.tags || [],
      prerequisites: newCourse.prerequisites || [],
      courseType: newCourse.courseType || 'Online',
      university: newCourse.university || 'Sechenov',
      courseNumber: newCourse.courseNumber || 'Course 1',
      category: newCourse.category || 'عمومی',
    } as Course;

    onCreate(course);
    setNewCourse({
      title: '',
      instructor: '',
      description: '',
      duration: '',
      courseNumber: 'Course 1',
      category: 'عمومی',
      image: '',
      price: '',
      startDate: '',
      isOpen: true,
      isFeatured: false,
      enrollmentCount: 0,
      syllabus: [],
      faqs: [],
      courseType: 'Online',
      university: 'Sechenov',
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>ایجاد دوره جدید</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="title"
          label="عنوان دوره"
          type="text"
          fullWidth
          value={newCourse.title}
          onChange={handleCourseInputChange}
          required
        />
        <TextField
          margin="dense"
          name="instructor"
          label="نام استاد"
          type="text"
          fullWidth
          value={newCourse.instructor}
          onChange={handleCourseInputChange}
          required
        />
        <TextField
          margin="dense"
          name="description"
          label="توضیحات"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={newCourse.description}
          onChange={handleCourseInputChange}
          required
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>نوع دوره</InputLabel>
          <Select
            name="courseType"
            value={newCourse.courseType}
            onChange={handleCourseInputChange}
            label="نوع دوره"
          >
            <MenuItem value="Online">آنلاین</MenuItem>
            <MenuItem value="Offline">آفلاین</MenuItem>
            <MenuItem value="In-Person">حضوری</MenuItem>
            <MenuItem value="Hybrid">ترکیبی</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>دسته‌بندی</InputLabel>
          <Select
            name="category"
            value={newCourse.category}
            onChange={handleCourseInputChange}
            label="دسته‌بندی"
          >
            <MenuItem value="آناتومی">آناتومی</MenuItem>
            <MenuItem value="پروتز">پروتز</MenuItem>
            <MenuItem value="ترمیمی">ترمیمی</MenuItem>
            <MenuItem value="عمومی">عمومی</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>دانشگاه</InputLabel>
          <Select
            name="university"
            value={newCourse.university}
            onChange={handleCourseInputChange}
            label="دانشگاه"
          >
            <MenuItem value="Smashko">سماشکو</MenuItem>
            <MenuItem value="Piragova">پیراگوا</MenuItem>
            <MenuItem value="RUDN">رودن</MenuItem>
            <MenuItem value="Sechenov">سچینوا</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          name="price"
          label="قیمت (تومان)"
          type="text"
          fullWidth
          value={newCourse.price}
          onChange={handleCourseInputChange}
          required
        />
        <TextField
          margin="dense"
          name="image"
          label="لینک تصویر"
          type="text"
          fullWidth
          value={newCourse.image}
          onChange={handleCourseInputChange}
        />
        <TextField
          margin="dense"
          name="startDate"
          label="تاریخ شروع"
          type="text"
          fullWidth
          value={newCourse.startDate}
          onChange={handleCourseInputChange}
          required
        />
        <TextField
          margin="dense"
          name="duration"
          label="مدت زمان"
          type="text"
          fullWidth
          value={newCourse.duration}
          onChange={handleCourseInputChange}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>شماره کورس</InputLabel>
          <Select
            name="courseNumber"
            value={newCourse.courseNumber}
            onChange={handleCourseInputChange}
            label="شماره کورس"
          >
            <MenuItem value="Course 1">Course 1</MenuItem>
            <MenuItem value="Course 2">Course 2</MenuItem>
            <MenuItem value="Course 3">Course 3</MenuItem>
            <MenuItem value="Course 4">Course 4</MenuItem>
            <MenuItem value="Course 5">Course 5</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>لغو</Button>
        <Button onClick={handleCreate} variant="contained">ایجاد</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseDialog;