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
import { useNotificationContext } from '../../../../Context/NotificationContext';
import { Enrollment } from '../../../../types/types';
import DOMPurify from 'dompurify';
import styles from './EditStudentGroupDialog.module.css';

interface EditStudentGroupDialogProps {
  open: boolean;
  onClose: () => void;
  enrollment: Enrollment | null;
  onUpdateGroup: (enrollment: Enrollment) => Promise<void>;
}

const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i'],
    ALLOWED_ATTR: [],
  });
};

const EditStudentGroupDialog: React.FC<EditStudentGroupDialogProps> = ({ open, onClose, enrollment, onUpdateGroup }) => {
  const { showNotification } = useNotificationContext();
  const [group, setGroup] = useState<string>('');

  useEffect(() => {
    if (enrollment) {
      setGroup(enrollment.group || 'Default');
    }
  }, [enrollment]);

  const handleSubmit = async () => {
    if (!group) {
      showNotification('لطفاً یک گروه انتخاب کنید.', 'error');
      return;
    }
    if (enrollment) {
      try {
        await onUpdateGroup({ ...enrollment, group });
        onClose();
      } catch (error) {
        showNotification('خطایی در به‌روزرسانی گروه رخ داد.', 'error');
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className={styles.dialog}>
      <DialogTitle className={styles.dialogTitle}>ویرایش گروه دانشجو</DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="نام گروه"
            value={group}
            onChange={(e) => setGroup(sanitizeText(e.target.value))}
            fullWidth
            required
            className={styles.textField}
            error={!group}
            helperText={!group ? 'نام گروه الزامی است' : ''}
            placeholder="مثال: گروه A"
          />
        </Box>
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelButton} aria-label="لغو ویرایش گروه">
          لغو
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className={styles.submitButton}
          aria-label="به‌روزرسانی گروه"
        >
          به‌روزرسانی
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditStudentGroupDialog;