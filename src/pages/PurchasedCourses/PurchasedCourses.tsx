import React from 'react';
import styles from './PurchasedCourses.module.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../Context/AuthContext';
import { useCourseContext } from '../../Context/CourseContext';
import { Course, SyllabusItem } from '../../types/types';

const PurchasedCourses: React.FC = () => {
  const { user } = useAuthContext();
  const { courses } = useCourseContext();

  const getCourseDetails = (courseId: number): Course => {
    return (
      courses.find((course) => course.id === courseId) || {
        slug: `course-${courseId}`,
        id: courseId,
        title: `دوره ${courseId}`,
        instructor: 'نامشخص',
        description: 'بدون توضیحات',
        duration: 'نامشخص',
        courseNumber: 'نامشخص',
        category: 'عمومی' as const,
        image: '/assets/courses/default.jpg',
        price: '۰ تومان',
        startDate: 'نامشخص',
        isOpen: false,
        isFeatured: false,
        enrollmentCount: 0,
        syllabus: [],
        faqs: [],
        tags: [],
        prerequisites: [],
        courseType: 'Online' as const,
        university: 'نامشخص',
        currency: "IRR",
      }
    );
  };

  const calculateCompletionPercentage = (syllabus: SyllabusItem[]): number => {
    if (!syllabus || syllabus.length === 0) return 0;
    const completedItems = syllabus.filter((item) => item.completed).length;
    return Math.round((completedItems / syllabus.length) * 100);
  };

  const activeCourses = user?.enrolledCourses
    ?.map((courseId) => getCourseDetails(courseId))
    .filter((course) => course.isOpen) || [];

  const completedCourses = user?.enrolledCourses
    ?.map((courseId) => getCourseDetails(courseId))
    .filter((course) => !course.isOpen) || [];

  return (
    <div className={styles.purchasedCoursesContainer}>
      <Card className={styles.purchasedCoursesCard} role="region" aria-labelledby="purchased-courses-title">
        <CardContent>
          <Typography id="purchased-courses-title" variant="h5" className={styles.purchasedCoursesTitle}>
            دوره‌های خریداری‌شده
          </Typography>

          {/* دوره‌های در حال انجام */}
          <Typography variant="h6" className={styles.sectionTitle} sx={{ mt: 2, mb: 1 }}>
            دوره‌های در حال انجام
          </Typography>
          <List>
            {activeCourses.length > 0 ? (
              activeCourses.map((course) => {
                const completionPercentage = calculateCompletionPercentage(course.syllabus);
                return (
                  <ListItem key={course.id} className={styles.purchasedCourseItem}>
                    <ListItemAvatar>
                      <Avatar src={course.image} alt={course.title} sx={{ width: 60, height: 60 }} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Link to={`/courses/${course.id}`} className={styles.courseLink}>
                          {course.title}
                        </Link>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">{course.description}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            مدرس: {course.instructor} | مدت: {course.duration} | شروع: {course.startDate}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              پیشرفت: {completionPercentage}%
                            </Typography>
                            <Box sx={{ width: '100%', bgcolor: 'grey.300', borderRadius: 1, mt: 0.5 }}>
                              <Box
                                sx={{
                                  width: `${completionPercentage}%`,
                                  bgcolor: 'primary.main',
                                  height: 8,
                                  borderRadius: 1,
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                    <Button
                      variant="contained"
                      size="small"
                      component={Link}
                      to={`/courses/${course.id}/content`}
                      className={styles.viewButton}
                    >
                      مشاهده محتوا
                    </Button>
                  </ListItem>
                );
              })
            ) : (
              <Typography variant="body2" color="text.secondary">
                هیچ دوره در حال اجرایی وجود ندارد.
              </Typography>
            )}
          </List>

          {/* دوره‌های تکمیل‌شده */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" className={styles.sectionTitle} sx={{ mb: 1 }}>
            دوره‌های تکمیل‌شده
          </Typography>
          <List>
            {completedCourses.length > 0 ? (
              completedCourses.map((course) => {
                const completionPercentage = calculateCompletionPercentage(course.syllabus);
                return (
                  <ListItem key={course.id} className={styles.purchasedCourseItem}>
                    <ListItemAvatar>
                      <Avatar src={course.image} alt={course.title} sx={{ width: 60, height: 60 }} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Link to={`/courses/${course.id}`} className={styles.courseLink}>
                            {course.title}
                          </Link>
                          <Chip label="تکمیل‌شده" color="success" size="small" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">{course.description}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            مدرس: {course.instructor} | مدت: {course.duration} | شروع: {course.startDate}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              پیشرفت: {completionPercentage}%
                            </Typography>
                            <Box sx={{ width: '100%', bgcolor: 'grey.300', borderRadius: 1, mt: 0.5 }}>
                              <Box
                                sx={{
                                  width: `${completionPercentage}%`,
                                  bgcolor: 'success.main',
                                  height: 8,
                                  borderRadius: 1,
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      component={Link}
                      to={`/courses/${course.id}/certificate`}
                      className={styles.viewButton}
                    >
                      مشاهده گواهینامه
                    </Button>
                  </ListItem>
                );
              })
            ) : (
              <Typography variant="body2" color="text.secondary">
                هیچ دوره تکمیل‌شده‌ای وجود ندارد.
              </Typography>
            )}
          </List>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component={Link}
              to="/profile"
              className={styles.backButton}
            >
              بازگشت به پروفایل
            </Button>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchasedCourses;