import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useBlogContext, BlogPost } from '../../../Context/BlogContext';
import { useNotificationContext } from '../../../Context/NotificationContext';

interface BlogDialogProps {
  open: boolean;
  onClose: () => void;
  postId?: number | null;
}

const BlogDialog: React.FC<BlogDialogProps> = ({ open, onClose, postId }) => {
  const { blogPosts, addBlogPost, setBlogPosts } = useBlogContext();
  const { showNotification } = useNotificationContext();
  const post = blogPosts.find((p: BlogPost) => p.id === postId);

  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: post?.title || '',
    category: post?.category || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    images: post?.images || [],
    videos: post?.videos || [],
    tags: post?.tags || [],
  });

  const [newTag, setNewTag] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newVideo, setNewVideo] = useState('');

  useEffect(() => {
    if (post && postId) {
      setFormData({
        title: post.title,
        category: post.category,
        excerpt: post.excerpt,
        content: post.content,
        images: post.images,
        videos: post.videos || [],
        tags: post.tags,
      });
    } else {
      setFormData({
        title: '',
        category: '',
        excerpt: '',
        content: '',
        images: [],
        videos: [],
        tags: [],
      });
    }
  }, [post, postId]);

  const handleAddTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData({ ...formData, tags: [...(formData.tags || []), newTag] });
      setNewTag('');
    }
  };

  const handleDeleteTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter((t) => t !== tag) || [] });
  };

  const handleAddImage = () => {
    if (newImage) {
      setFormData({ ...formData, images: [...(formData.images || []), newImage] });
      setNewImage('');
    }
  };

  const handleAddVideo = () => {
    if (newVideo) {
      setFormData({ ...formData, videos: [...(formData.videos || []), newVideo] });
      setNewVideo('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (field === 'image') {
        setFormData({ ...formData, images: [...(formData.images || []), url] });
      } else {
        setFormData({ ...formData, videos: [...(formData.videos || []), url] });
      }
      showNotification(`${field === 'image' ? 'عکس' : 'ویدئو'} با موفقیت انتخاب شد!`, 'success');
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.category || !formData.excerpt || !formData.content || !formData.images?.length) {
      showNotification('لطفاً همه فیلدهای لازم رو پر کن!', 'error');
      return;
    }

    try {
      if (postId) {
        setBlogPosts(
          blogPosts.map((p: BlogPost) =>
            p.id === postId
              ? { ...formData, id: postId, author: post!.author, date: post!.date } as BlogPost
              : p
          )
        );
        showNotification('پست با موفقیت ویرایش شد!', 'success');
      } else {
        addBlogPost(formData as Omit<BlogPost, 'id' | 'author' | 'date'>);
      }
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'یه خطایی پیش اومد!';
      showNotification(errorMessage, 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{postId ? 'ویرایش پست' : 'پست جدید'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="عنوان"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
          />
          <FormControl fullWidth>
            <InputLabel>دسته‌بندی</InputLabel>
            <Select
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              label="دسته‌بندی"
            >
              <MenuItem value="بهداشت دهان">بهداشت دهان</MenuItem>
              <MenuItem value="تکنولوژی دندانپزشکی">تکنولوژی دندانپزشکی</MenuItem>
              <MenuItem value="ترمیم دندان">ترمیم دندان</MenuItem>
              <MenuItem value="ابزارها">ابزارها</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="چکیده"
            value={formData.excerpt || ''}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            fullWidth
            multiline
            rows={2}
            required
          />
          <ReactQuill
            value={formData.content || ''}
            onChange={(content) => setFormData({ ...formData, content })}
            theme="snow"
            style={{ minHeight: '200px', marginBottom: '1rem' }}
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              label="برچسب جدید"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              fullWidth
            />
            <Button onClick={handleAddTag}>اضافه کن</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {(formData.tags || []).map((tag: string, index: number) => (
              <Chip key={index} label={tag} onDelete={() => handleDeleteTag(tag)} />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              label="لینک عکس"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              fullWidth
            />
            <Button onClick={handleAddImage}>اضافه کن</Button>
          </Box>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'image')}
            style={{ margin: '1rem 0' }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {(formData.images || []).map((img: string, index: number) => (
              <Chip
                key={index}
                label={img}
                onDelete={() => setFormData({ ...formData, images: (formData.images || []).filter((i) => i !== img) })}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              label="لینک ویدئو (اختیاری)"
              value={newVideo}
              onChange={(e) => setNewVideo(e.target.value)}
              fullWidth
            />
            <Button onClick={handleAddVideo}>اضافه کن</Button>
          </Box>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => handleFileUpload(e, 'video')}
            style={{ margin: '1rem 0' }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {(formData.videos || []).map((video: string, index: number) => (
              <Chip
                key={index}
                label={video}
                onDelete={() => setFormData({ ...formData, videos: (formData.videos || []).filter((v) => v !== video) })}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>بی‌خیال</Button>
        <Button onClick={handleSubmit} variant="contained">
          {postId ? 'به‌روزرسانی' : 'بساز'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlogDialog;