import React from 'react';
import styles from './Wishlist.module.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import { Link } from 'react-router-dom';
import { useCourseContext } from '../../Context/CourseContext';
import { useReviewContext } from '../../Context/ReviewContext';
import { useWishlistContext } from '../../Context/WishlistContext';
import { Button } from '@mui/material';

const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlistContext();
  const { courses } = useCourseContext();
  const { reviews } = useReviewContext();

  const getCourseDetails = (courseId: number) => {
    return courses.find((course) => course.id === courseId) || { id: courseId, title: `دوره ${courseId}`, description: 'بدون توضیحات' };
  };

  const getCourseReviews = (courseId: number) => {
    return reviews.filter((review) => review.courseId === courseId);
  };

  return (
    <div className={styles.wishlistContainer}>
      <Card className={styles.wishlistCard} role="region" aria-labelledby="wishlist-title">
        <CardContent>
          <Typography id="wishlist-title" variant="h5" className={styles.wishlistTitle}>
            لیست علاقه‌مندی‌ها
          </Typography>
          <List>
            {wishlist.length ? (
              wishlist.map((item) => {
                if (item.type === 'course') {
                  const course = getCourseDetails(item.id);
                  const courseReviews = getCourseReviews(item.id);
                  const averageRating = courseReviews.length
                    ? courseReviews.reduce((sum, review) => sum + review.rating, 0) / courseReviews.length
                    : 0;

                  return (
                    <ListItem
                      key={item.id}
                      className={styles.wishlistItem}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => removeFromWishlist(item.id, item.type)}
                          aria-label={`حذف ${course.title} از لیست علاقه‌مندی‌ها`}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={
                          <Link to={`/courses/${item.id}`} className={styles.courseLink}>
                            {course.title}
                          </Link>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">{course.description}</Typography>
                            <Rating value={averageRating} readOnly precision={0.5} />
                            <Typography variant="caption">
                              ({courseReviews.length} نقد)
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                }
                return null; // Handle instructor type if needed
              })
            ) : (
              <Typography variant="body2">لیست علاقه‌مندی‌ها خالی است</Typography>
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

export default Wishlist;