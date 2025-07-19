import React, { useState, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DOMPurify from 'dompurify';
import { useAuthContext } from '../../../Context/Auth/UserAuthContext';
import { useBlogContext, BlogPost } from '../../../Context/BlogContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import BlogDialog from '../BlogDialog/BlogDialog';
import EditBlogDialog from '../EditBlogDialog/EditBlogDialog';
import styles from './BlogManagement.module.css';

const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

const BlogManagement: React.FC = () => {
  const { isAuthenticated, user } = useAuthContext();
  const { blogPosts, loading, deleteBlogPost } = useBlogContext();
  const { showNotification } = useNotificationContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [openBlogDialog, setOpenBlogDialog] = useState(false);
  const [openEditBlogDialog, setOpenEditBlogDialog] = useState(false);
  const [editPostId, setEditPostId] = useState<number | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletePost, setDeletePost] = useState<{ id: number; title: string } | null>(null);
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://roomdental.com';

  const filteredPosts = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    const normalizedPosts = blogPosts.filter(
      (post: BlogPost) =>
        typeof post.id === 'number' &&
        typeof post.title === 'string' &&
        post.title.trim() !== '' &&
        typeof post.author === 'string' &&
        post.author.trim() !== '' &&
        typeof post.category === 'string' &&
        post.category.trim() !== '' &&
        typeof post.date === 'string' &&
        post.date.trim() !== '',
    );

    return user.role === 'SuperAdmin'
      ? normalizedPosts.filter(
          (post: BlogPost) =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.category.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : normalizedPosts.filter(
          (post: BlogPost) =>
            post.author === user.name &&
            (post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.category.toLowerCase().includes(searchQuery.toLowerCase())),
        );
  }, [blogPosts, searchQuery, user, isAuthenticated]);

  const handleOpenDeleteDialog = (id: number, title: string) => {
    setDeletePost({ id, title });
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (deletePost) {
      try {
        await deleteBlogPost(deletePost.id);
        showNotification(`پست "${sanitizeText(deletePost.title)}" با موفقیت حذف شد!`, 'success');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'خطایی در حذف پست رخ داد.';
        showNotification(errorMessage, 'error');
      }
      setOpenDeleteDialog(false);
      setDeletePost(null);
    }
  };

  const handleEditBlogPost = (id: number) => {
    setEditPostId(id);
    setOpenEditBlogDialog(true);
  };

  if (!isAuthenticated || !user || (user.role !== 'SuperAdmin' && user.role !== 'Instructor')) {
    showNotification('شما به این صفحه دسترسی ندارید!', 'error');
    return <Navigate to="/login" />;
  }

  return (
    <Box className={styles.container}>
      <Typography variant="h5" className={styles.title}>
        مدیریت وبلاگ
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="contained"
          className={styles.createButton}
          component={Link}
          to={`${baseUrl}/blog/new`}
          aria-label="ایجاد پست جدید"
        >
          ایجاد پست جدید
        </Button>
        <TextField
          label="جستجوی پست"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(sanitizeText(e.target.value))}
          className={styles.searchField}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
          aria-describedby="search-description"
        />
        <Typography id="search-description" sx={{ display: 'none' }}>
          جستجوی عنوان، نویسنده یا دسته‌بندی پست
        </Typography>
      </Box>
      {loading && (
        <Box className={styles.loadingContainer}>
          <CircularProgress aria-label="در حال بارگذاری پست‌ها" />
        </Box>
      )}
      {!loading && filteredPosts.length === 0 ? (
        <Typography className={styles.emptyMessage}>
          هیچ پستی یافت نشد. لطفاً فیلترها را تغییر دهید یا پست جدیدی ایجاد کنید.
        </Typography>
      ) : (
        <Table className={styles.table}>
          <TableHead>
            <TableRow className={styles.tableHeader}>
              <TableCell className={styles.tableCell}>عنوان</TableCell>
              <TableCell className={styles.tableCell}>نویسنده</TableCell>
              <TableCell className={styles.tableCell}>دسته‌بندی</TableCell>
              <TableCell className={styles.tableCell}>تاریخ</TableCell>
              <TableCell className={styles.tableCell}>اقدامات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPosts.map((post: BlogPost) => (
              <TableRow key={post.id} className={styles.tableRow}>
                <TableCell className={styles.tableCell}>{sanitizeText(post.title)}</TableCell>
                <TableCell className={styles.tableCell}>{sanitizeText(post.author)}</TableCell>
                <TableCell className={styles.tableCell}>{sanitizeText(post.category)}</TableCell>
                <TableCell className={styles.tableCell}>{sanitizeText(post.date)}</TableCell>
                <TableCell className={styles.tableCell}>
                  <Box className={styles.actionButtons}>
                    <Link
                      to={`${baseUrl}/blog/${post.id}`}
                      title="مشاهده پست"
                      aria-label={`مشاهده پست ${sanitizeText(post.title)}`}
                    >
                      <IconButton className={styles.viewButton}>
                        <VisibilityIcon />
                      </IconButton>
                    </Link>
                    <IconButton
                      className={styles.editButton}
                      onClick={() => handleEditBlogPost(post.id)}
                      title="ویرایش پست"
                      aria-label={`ویرایش پست ${sanitizeText(post.title)}`}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      className={styles.deleteButton}
                      onClick={() => handleOpenDeleteDialog(post.id, post.title)}
                      title="حذف پست"
                      aria-label={`حذف پست ${sanitizeText(post.title)}`}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>تأیید حذف</DialogTitle>
        <DialogContent>
          <Typography>
            آیا مطمئن هستید که می‌خواهید پست "{deletePost ? sanitizeText(deletePost.title) : ''}" را حذف کنید؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>لغو</Button>
          <Button onClick={handleConfirmDelete} color="error">حذف</Button>
        </DialogActions>
      </Dialog>
      <BlogDialog open={openBlogDialog} onClose={() => setOpenBlogDialog(false)} postId={null} />
      <EditBlogDialog
        open={openEditBlogDialog}
        onClose={() => {
          setOpenEditBlogDialog(false);
          setEditPostId(null);
        }}
        postId={editPostId}
      />
    </Box>
  );
};

export default BlogManagement;