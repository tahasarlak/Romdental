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
import BlogDialog from '../BlogDialog/BlogDialog';

const BlogManagement: React.FC = () => {
  const { blogPosts, setBlogPosts } = useBlogContext();
  const { showNotification } = useNotificationContext();
  const [openBlogDialog, setOpenBlogDialog] = useState(false);
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
    setOpenBlogDialog(true);
  };

  const filteredPosts = blogPosts.filter((post: BlogPost) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ mt: 2, p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        مدیریت وبلاگ
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
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
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
        />
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>عنوان</TableCell>
            <TableCell>نویسنده</TableCell>
            <TableCell>دسته‌بندی</TableCell>
            <TableCell>تاریخ</TableCell>
            <TableCell>اقدامات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredPosts.map((post: BlogPost) => (
            <TableRow key={post.id}>
              <TableCell>{post.title}</TableCell>
              <TableCell>{post.author}</TableCell>
              <TableCell>{post.category}</TableCell>
              <TableCell>{post.date}</TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  onClick={() => handleEditBlogPost(post.id)}
                  aria-label="ویرایش پست"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteBlogPost(post.id)}
                  aria-label="حذف پست"
                >
                  <DeleteIcon />
                </IconButton>
                <Link to={`${baseUrl}/blog/${post.id}`} className="text-blue-500 ml-2">
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
    </Box>
  );
};

export default BlogManagement;