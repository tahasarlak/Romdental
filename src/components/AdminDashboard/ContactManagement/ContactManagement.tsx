import { Button, Table, TableBody, TableCell, TableHead, TableRow, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useContactContext } from '../../../Context/ContactContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import { useState } from 'react';

const ContactManagement: React.FC = () => {
  const { messages, setMessages } = useContactContext();
  const { showNotification } = useNotificationContext();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  console.log('ContactManagement rendering with messages:', messages);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedId) {
      setMessages(messages.filter(message => message.id !== selectedId));
      showNotification('پیام با موفقیت حذف شد!', 'success');
    }
    setOpen(false);
    setSelectedId(null);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedId(null);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>نام</TableCell>
            <TableCell>ایمیل</TableCell>
            <TableCell>موضوع</TableCell>
            <TableCell>پیام</TableCell>
            <TableCell>تاریخ</TableCell>
            <TableCell>اقدامات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {messages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                هیچ پیامی موجود نیست
              </TableCell>
            </TableRow>
          ) : (
            messages.map(message => (
              <TableRow key={message.id}>
                <TableCell>{message.name}</TableCell>
                <TableCell>{message.email}</TableCell>
                <TableCell>{message.subject}</TableCell>
                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {message.message}
                </TableCell>
                <TableCell>{message.date}</TableCell>
                <TableCell>
                  <Button
                    color="error"
                    onClick={() => handleDeleteClick(message.id)}
                    aria-label={`حذف پیام ${message.subject}`}
                  >
                    حذف
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>تأیید حذف</DialogTitle>
        <DialogContent>
          <DialogContentText>آیا مطمئن هستید که می‌خواهید این پیام را حذف کنید؟</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>لغو</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactManagement;