import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { useSubscriptionContext } from '../../../../Context/SubscriptionContext';
import { useNotificationContext } from '../../../../Context/NotificationContext';
import styles from './SubscriptionDialog.module.css';

interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({ open, onClose }) => {
  const { setEmail, setStatus } = useSubscriptionContext();
  const { showNotification } = useNotificationContext();
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string): string => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'ایمیل باید معتبر باشد';
    }
    return '';
  };

  const handleSubmit = () => {
    const emailError = validateEmail(newEmail);
    if (emailError) {
      setError(emailError);
      showNotification('لطفاً ایمیل معتبر وارد کنید!', 'error');
      return;
    }

    try {
      setEmail(newEmail);
      setStatus('success');
      showNotification('اشتراک با موفقیت اضافه شد!', 'success');
      setNewEmail('');
      setError('');
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'خطایی در افزودن اشتراک رخ داد!';
      showNotification(errorMessage, 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className={styles.dialog}>
      <DialogTitle className={styles.dialogTitle}>افزودن اشتراک جدید</DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="ایمیل"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              setError(validateEmail(e.target.value));
            }}
            fullWidth
            required
            className={styles.textField}
            error={!!error}
            helperText={error}
          />
        </Box>
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelButton}>
          بی‌خیال
        </Button>
        <Button onClick={handleSubmit} variant="contained" className={styles.submitButton}>
          بساز
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionDialog;