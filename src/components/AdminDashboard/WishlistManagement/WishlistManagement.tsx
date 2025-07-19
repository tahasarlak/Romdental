import React, { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useWishlistContext } from '../../../Context/WishlistContext';
import { useAuthContext } from '../../../Context/Auth/UserAuthContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import { WishlistItem } from '../../../types/types';
import WishlistDialog from './WishlistDialog/WishlistDialog';
import EditWishlistDialog from './EditWishlistDialog/EditWishlistDialog';
import DOMPurify from 'dompurify';
import styles from './WishlistManagement.module.css';

const WishlistManagement: React.FC = () => {
  const { wishlistItems, toggleWishlist } = useWishlistContext();
  const { users } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const [openWishlistDialog, setOpenWishlistDialog] = useState(false);
  const [openEditWishlistDialog, setOpenEditWishlistDialog] = useState(false);
  const [editWishlistItem, setEditWishlistItem] = useState<WishlistItem | null>(null);

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

  const handleEditWishlist = (item: WishlistItem) => {
    setEditWishlistItem(item);
    setOpenEditWishlistDialog(true);
  };

  const wishlistWithUsers = wishlistItems.map((item: WishlistItem) => {
    const user = users.find((u) => u.wishlist.some((w) => w.id === item.id && w.type === item.type));
    return { ...item, userEmail: user?.email || 'نامشخص' };
  });

  return (
    <Box className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        مدیریت لیست علاقه‌مندی‌ها
      </Typography>
      <Button
        variant="contained"
        className={styles.createButton}
        onClick={() => setOpenWishlistDialog(true)}
      >
        افزودن مورد جدید
      </Button>
      {wishlistWithUsers.length === 0 ? (
        <Typography className={styles.emptyMessage}>هیچ موردی در لیست علاقه‌مندی‌ها یافت نشد.</Typography>
      ) : (
        <Table className={styles.table}>
          <TableHead>
            <TableRow className={styles.tableHeader}>
              <TableCell className={styles.tableCell}>کاربر</TableCell>
              <TableCell className={styles.tableCell}>شناسه مورد</TableCell>
              <TableCell className={styles.tableCell}>نوع</TableCell>
              <TableCell className={styles.tableCell}>اقدامات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wishlistWithUsers.map((item: WishlistItem & { userEmail: string }) => (
              <TableRow key={`${item.userEmail}-${item.id}-${item.type}`} className={styles.tableRow}>
                <TableCell className={styles.tableCell}>{item.userEmail}</TableCell>
                <TableCell className={styles.tableCell}>{item.id}</TableCell>
                <TableCell className={styles.tableCell}>
                  {item.type === 'course' ? 'دوره' : item.type === 'instructor' ? 'استاد' : 'وبلاگ'}
                </TableCell>
                <TableCell className={styles.tableCell}>
                  <IconButton
                    className={styles.editButton}
                    onClick={() => handleEditWishlist(item)}
                    aria-label={`ویرایش مورد ${item.id}`}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    className={styles.deleteButton}
                    onClick={() => handleRemoveFromWishlist(item.id, item.type, `آیتم ${item.id}`)}
                    aria-label={`حذف مورد ${item.id}`}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <WishlistDialog
        open={openWishlistDialog}
        onClose={() => setOpenWishlistDialog(false)}
      />
      <EditWishlistDialog
        open={openEditWishlistDialog}
        onClose={() => {
          setOpenEditWishlistDialog(false);
          setEditWishlistItem(null);
        }}
        wishlistItem={editWishlistItem}
      />
    </Box>
  );
};

export default WishlistManagement;