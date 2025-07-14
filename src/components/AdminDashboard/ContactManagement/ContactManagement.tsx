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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useContactContext } from '../../../Context/ContactContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import ContactDialog from './ContactDialog/ContactDialog';
import EditContactDialog from './EditContactDialog/EditContactDialog';
import styles from './ContactManagement.module.css';

const ContactManagement: React.FC = () => {
  const { messages, setMessages } = useContactContext();
  const { showNotification } = useNotificationContext();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [openEditContactDialog, setOpenEditContactDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setOpenConfirmDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedId) {
      setMessages(messages.filter((message) => message.id !== selectedId));
      showNotification('پیام با موفقیت حذف شد!', 'success');
    }
    setOpenConfirmDialog(false);
    setSelectedId(null);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setSelectedId(null);
  };

  const handleEditContact = (id: string) => {
    setSelectedId(id);
    setOpenEditContactDialog(true);
  };

  return (
    <Box className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        مدیریت پیام‌ها
      </Typography>
      <Button
        variant="contained"
        className={styles.createButton}
        onClick={() => setOpenContactDialog(true)}
      >
        افزودن پیام جدید
      </Button>
      {messages.length === 0 ? (
        <Typography className={styles.emptyMessage}>هیچ پیامی یافت نشد.</Typography>
      ) : (
        <Table className={styles.table}>
          <TableHead>
            <TableRow className={styles.tableHeader}>
              <TableCell className={styles.tableCell}>نام</TableCell>
              <TableCell className={styles.tableCell}>ایمیل</TableCell>
              <TableCell className={styles.tableCell}>موضوع</TableCell>
              <TableCell className={styles.tableCell}>پیام</TableCell>
              <TableCell className={styles.tableCell}>تاریخ</TableCell>
              <TableCell className={styles.tableCell}>اقدامات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id} className={styles.tableRow}>
                <TableCell className={styles.tableCell}>{message.name}</TableCell>
                <TableCell className={styles.tableCell}>{message.email}</TableCell>
                <TableCell className={styles.tableCell}>{message.subject}</TableCell>
                <TableCell
                  className={styles.tableCell}
                  sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {message.message}
                </TableCell>
                <TableCell className={styles.tableCell}>{message.date}</TableCell>
                <TableCell className={styles.tableCell}>
                  <IconButton
                    className={styles.editButton}
                    onClick={() => handleEditContact(message.id)}
                    aria-label={`ویرایش پیام ${message.subject}`}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    className={styles.deleteButton}
                    onClick={() => handleDeleteClick(message.id)}
                    aria-label={`حذف پیام ${message.subject}`}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        className={styles.dialog}
        aria-labelledby="confirm-delete-dialog-title"
        aria-describedby="confirm-delete-dialog-description"
      >
        <DialogTitle id="confirm-delete-dialog-title" className={styles.dialogTitle}>
          تأیید حذف
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <DialogContentText>آیا مطمئن هستید که می‌خواهید این پیام را حذف کنید؟</DialogContentText>
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button
            onClick={handleCloseConfirmDialog}
            className={styles.cancelButton}
            aria-label="لغو حذف پیام"
          >
            لغو
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            className={styles.deleteButton}
            aria-label="تأیید حذف پیام"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
      <ContactDialog
        open={openContactDialog}
        onClose={() => setOpenContactDialog(false)}
      />
      <EditContactDialog
        open={openEditContactDialog}
        onClose={() => {
          setOpenEditContactDialog(false);
          setSelectedId(null);
        }}
        messageId={selectedId}
      />
    </Box>
  );
};

export default ContactManagement;