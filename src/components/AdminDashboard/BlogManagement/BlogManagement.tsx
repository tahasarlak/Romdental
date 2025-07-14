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
  TextField,
  IconButton,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { useBlogContext, BlogPost } from '../../../Context/BlogContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import BlogDialog from './BlogDialog/BlogDialog';
import EditBlogDialog from './EditBlogDialog/EditBlogDialog';
import styles from './BlogManagement.module.css';

const BlogManagement: React.FC = () => {
  const { blogPosts, setBlogPosts } = useBlogContext();
  const { showNotification } = useNotificationContext();
  const [openBlogDialog, setOpenBlogDialog] = useState(false);
  const [openEditBlogDialog, setOpenEditBlogDialog] = useState(false);
  const [editPostId, setEditPostId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

  const handleDeleteBlogPost = (id: number) => {
    if (window.confirm('مطمئنی می‌خوای این پست رو حذف کنی؟')) {
      try {
        setBlogPosts(blogPosts.filter((post: BlogPost) => post.id !== id));
        showNotification('پست با موفقیت حذف شد!', 'success');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'حذف پست خطا داد.';
        showNotification(errorMessage, 'error');
      }
    }
  };

  const handleEditBlogPost = (id: number) => {
    setEditPostId(id);
    setOpenEditBlogDialog(true);
  };

  const filteredPosts = blogPosts.filter((post: BlogPost) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        مدیریت وبلاگ
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="contained"
          className={styles.createButton}
          onClick={() => {
            setEditPostId(null);
            setOpenBlogDialog(true);
          }}
        >
          پست جدید بساز
        </Button>
        <TextField
          label="جستجو کن"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchField}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
        />
      </Box>
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
              <TableCell className={styles.tableCell}>{post.title}</TableCell>
              <TableCell className={styles.tableCell}>{post.author}</TableCell>
              <TableCell className={styles.tableCell}>{post.category}</TableCell>
              <TableCell className={styles.tableCell}>{post.date}</TableCell>
              <TableCell className={styles.tableCell}>
                <IconButton
                  className={styles.editButton}
                  onClick={() => handleEditBlogPost(post.id)}
                  aria-label="ویرایش پست"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  className={styles.deleteButton}
                  onClick={() => handleDeleteBlogPost(post.id)}
                  aria-label="حذف پست"
                >
                  <DeleteIcon />
                </IconButton>
                <Link to={`${baseUrl}/blog/${post.id}`} className={styles.viewLink}>
                  ببین
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <BlogDialog
        open={openBlogDialog}
        onClose={() => {
          setOpenBlogDialog(false);
          setEditPostId(null);
        }}
        postId={editPostId}
      />
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