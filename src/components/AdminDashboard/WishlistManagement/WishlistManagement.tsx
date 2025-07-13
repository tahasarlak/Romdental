import React from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Box } from '@mui/material';
import { useWishlistContext } from '../../../Context/WishlistContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import { useAuthContext } from '../../../Context/AuthContext';
import { WishlistItem } from '../../../types/types';
import DOMPurify from 'dompurify';

const WishlistManagement: React.FC = () => {
  const { wishlistItems, toggleWishlist } = useWishlistContext();
  const { users } = useAuthContext();
  const { showNotification } = useNotificationContext();

  const handleRemoveFromWishlist = async (id: number, type: 'course' | 'instructor' | 'blog', name: string) => {
    if (window.confirm(`آیا مطمئن هستید که می‌خواهید "${DOMPurify.sanitize(name)}" را از لیست علاقه‌مندی‌ها حذف کنید؟`)) {
      try {
        await toggleWishlist(id, type, DOMPurify.sanitize(name));
        showNotification('مورد با موفقیت از لیست علاقه‌مندی‌ها حذف شد!', 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در حذف از علاقه‌مندی‌ها', 'error');
      }
    }
  };

  // Map wishlist items to include user email
  const wishlistWithUsers = wishlistItems.map((item: WishlistItem) => {
    const user = users.find((u) => u.wishlist.some((w) => w.id === item.id && w.type === item.type));
    return { ...item, userEmail: user?.email || 'نامشخص' };
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>کاربر</TableCell>
            <TableCell>شناسه مورد</TableCell>
            <TableCell>نوع</TableCell>
            <TableCell>اقدامات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {wishlistWithUsers.map((item: WishlistItem & { userEmail: string }) => (
            <TableRow key={`${item.userEmail}-${item.id}-${item.type}`}>
              <TableCell>{item.userEmail}</TableCell>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.type === 'course' ? 'دوره' : item.type === 'instructor' ? 'استاد' : 'وبلاگ'}</TableCell>
              <TableCell>
                <Button
                  color="error"
                  onClick={() => handleRemoveFromWishlist(item.id, item.type, `آیتم ${item.id}`)}
                >
                  حذف
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default WishlistManagement;