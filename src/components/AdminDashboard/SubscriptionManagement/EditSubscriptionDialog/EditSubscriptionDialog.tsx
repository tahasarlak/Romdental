import React, { useState, useEffect } from 'react';
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
import styles from './EditSubscriptionDialog.module.css';

interface EditSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
}

const EditSubscriptionDialog: React.FC<EditSubscriptionDialogProps> = ({ open, onClose, email }) => {
  const { setEmail, setStatus } = useSubscriptionContext();
  const { showNotification } = useNotificationContext();
  const [formData, setFormData] = useState<string>(email);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(email);
  }, [email]);

  const validateEmail = (email: string): string => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'ایمیل باید معتبر باشد';
    }
    return '';
  };

  const handleSubmit = () => {
    const emailError = validateEmail(formData);
    if (emailError) {
      setError(emailError);
      showNotification('لطفاً ایمیل معتبر وارد کنید!', 'error');
      return;
    }

    try {
      setEmail(formData);
      setStatus('success');
      showNotification('اشتراک با موفقیت ویرایش شد!', 'success');
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'خطایی در ویرایش اشتراک رخ داد!';
      showNotification(errorMessage, 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className={styles.dialog}>
      <DialogTitle className={styles.dialogTitle}>ویرایش اشتراک</DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="ایمیل"
            value={formData}
            onChange={(e) => {
              setFormData(e.target.value);
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
          به‌روزرسانی
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditSubscriptionDialog;