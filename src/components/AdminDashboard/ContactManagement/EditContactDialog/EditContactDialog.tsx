import React, { useState, useEffect, useCallback } from 'react';
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
import styles from './EditContactDialog.module.css';

interface EditContactDialogProps {
  open: boolean;
  onClose: () => void;
  messageId: string | null;
}

const EditContactDialog: React.FC<EditContactDialogProps> = ({ open, onClose, messageId }) => {
  const { messages, setMessages } = useContactContext();
  const { showNotification } = useNotificationContext();
  const message = messages.find((m) => m.id === messageId);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    date: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (message && messageId) {
      setFormData({
        name: message.name,
        email: message.email,
        subject: message.subject,
        message: message.message,
        date: message.date,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [message, messageId]);

  const validateInputs = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'نام الزامی است.';
    if (!formData.email.trim()) newErrors.email = 'ایمیل الزامی است.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'ایمیل نامعتبر است.';
    }
    if (!formData.subject.trim()) newErrors.subject = 'موضوع الزامی است.';
    if (!formData.message.trim()) newErrors.message = 'پیام الزامی است.';
    if (!formData.date) newErrors.date = 'تاریخ الزامی است.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateInputs()) {
      showNotification('لطفاً تمام خطاها را برطرف کنید!', 'error');
      return;
    }

    try {
      if (messageId) {
        setMessages(
          messages.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  name: formData.name,
                  email: formData.email,
                  subject: formData.subject,
                  message: formData.message,
                  date: formData.date,
                }
              : m
          )
        );
        showNotification('پیام با موفقیت ویرایش شد!', 'success');
      }
      onClose();
    } catch (error: any) {
      showNotification(error.message || 'خطا در ویرایش پیام', 'error');
    }
  }, [formData, messageId, setMessages, showNotification, onClose, validateInputs]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={styles.dialog}
      aria-labelledby="edit-contact-dialog-title"
      aria-describedby="edit-contact-dialog-description"
    >
      <DialogTitle id="edit-contact-dialog-title" className={styles.dialogTitle}>
        ویرایش پیام
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="نام"
          type="text"
          fullWidth
          value={formData.name}
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
          value={formData.email}
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
          value={formData.subject}
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
          value={formData.message}
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
          value={formData.date}
          onChange={handleInputChange}
          required
          error={!!errors.date}
          helperText={errors.date}
          className={styles.textField}
          inputProps={{ 'aria-required': true }}
        />
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelButton} aria-label="لغو ویرایش پیام">
          لغو
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className={styles.submitButton}
          aria-label="به‌روزرسانی پیام"
        >
          به‌روزرسانی
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditContactDialog;