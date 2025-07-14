import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { useContactContext } from '../../../../Context/ContactContext';
import { useNotificationContext } from '../../../../Context/NotificationContext';
import styles from './ContactDialog.module.css';

interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
}

const ContactDialog: React.FC<ContactDialogProps> = ({ open, onClose }) => {
  const { addMessage } = useContactContext();
  const { showNotification } = useNotificationContext();
  const [newMessage, setNewMessage] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateInputs = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!newMessage.name.trim()) newErrors.name = 'نام الزامی است.';
    if (!newMessage.email.trim()) newErrors.email = 'ایمیل الزامی است.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMessage.email)) {
      newErrors.email = 'ایمیل نامعتبر است.';
    }
    if (!newMessage.subject.trim()) newErrors.subject = 'موضوع الزامی است.';
    if (!newMessage.message.trim()) newErrors.message = 'پیام الزامی است.';
    if (!newMessage.date) newErrors.date = 'تاریخ الزامی است.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newMessage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMessage((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!validateInputs()) {
      showNotification('لطفاً تمام خطاها را برطرف کنید!', 'error');
      return;
    }

    try {
      addMessage({
        name: newMessage.name,
        email: newMessage.email,
        subject: newMessage.subject,
        message: newMessage.message,
      });
      setNewMessage({
        name: '',
        email: '',
        subject: '',
        message: '',
        date: new Date().toISOString().split('T')[0],
      });
      showNotification('پیام با موفقیت ایجاد شد!', 'success');
      onClose();
    } catch (error: any) {
      showNotification(error.message || 'خطا در ایجاد پیام', 'error');
    }
  }, [newMessage, addMessage, showNotification, onClose, validateInputs]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={styles.dialog}
      aria-labelledby="contact-dialog-title"
      aria-describedby="contact-dialog-description"
    >
      <DialogTitle id="contact-dialog-title" className={styles.dialogTitle}>
        افزودن پیام جدید
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="نام"
          type="text"
          fullWidth
          value={newMessage.name}
          onChange={handleInputChange}
          required
          error={!!errors.name}
          helperText={errors.name}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="email"
          label="ایمیل"
          type="email"
          fullWidth
          value={newMessage.email}
          onChange={handleInputChange}
          required
          error={!!errors.email}
          helperText={errors.email}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="subject"
          label="موضوع"
          type="text"
          fullWidth
          value={newMessage.subject}
          onChange={handleInputChange}
          required
          error={!!errors.subject}
          helperText={errors.subject}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="message"
          label="پیام"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={newMessage.message}
          onChange={handleInputChange}
          required
          error={!!errors.message}
          helperText={errors.message}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          margin="dense"
          name="date"
          label="تاریخ"
          type="date"
          fullWidth
          value={newMessage.date}
          onChange={handleInputChange}
          required
          error={!!errors.date}
          helperText={errors.date}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelButton} aria-label="لغو افزودن پیام">
          لغو
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          className={styles.submitButton}
          aria-label="ایجاد پیام جدید"
        >
          ایجاد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactDialog;