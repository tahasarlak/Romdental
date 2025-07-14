import React, { useEffect, useState } from 'react';
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
import { useSubscriptionContext } from '../../../Context/SubscriptionContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import SubscriptionDialog from './SubscriptionDialog/SubscriptionDialog';
import EditSubscriptionDialog from './EditSubscriptionDialog/EditSubscriptionDialog';
import styles from './SubscriptionManagement.module.css';

const SubscriptionManagement: React.FC = () => {
  const { email, setEmail, status } = useSubscriptionContext();
  const { showNotification } = useNotificationContext();
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [openSubscriptionDialog, setOpenSubscriptionDialog] = useState(false);
  const [openEditSubscriptionDialog, setOpenEditSubscriptionDialog] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const handleDeleteSubscription = (email: string) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این اشتراک را حذف کنید؟')) {
      setSubscriptions(subscriptions.filter((sub) => sub !== email));
      if (email === email) setEmail('');
      showNotification('اشتراک با موفقیت حذف شد!', 'success');
    }
  };

  const handleEditSubscription = (email: string) => {
    setSelectedEmail(email);
    setOpenEditSubscriptionDialog(true);
  };

  const addSubscription = (email: string) => {
    if (!subscriptions.includes(email)) {
      setSubscriptions([...subscriptions, email]);
    }
  };

  useEffect(() => {
    if (status === 'success' && email) {
      addSubscription(email);
    }
  }, [status, email]);

  return (
    <Box className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        مدیریت اشتراک‌ها
      </Typography>
      <Button
        variant="contained"
        className={styles.createButton}
        onClick={() => setOpenSubscriptionDialog(true)}
      >
        افزودن اشتراک جدید
      </Button>
      {subscriptions.length === 0 ? (
        <Typography className={styles.emptyMessage}>هیچ اشتراکی یافت نشد.</Typography>
      ) : (
        <Table className={styles.table}>
          <TableHead>
            <TableRow className={styles.tableHeader}>
              <TableCell className={styles.tableCell}>ایمیل</TableCell>
              <TableCell className={styles.tableCell}>وضعیت</TableCell>
              <TableCell className={styles.tableCell}>اقدامات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub} className={styles.tableRow}>
                <TableCell className={styles.tableCell}>{sub}</TableCell>
                <TableCell className={styles.tableCell}>فعال</TableCell>
                <TableCell className={styles.tableCell}>
                  <IconButton
                    className={styles.editButton}
                    onClick={() => handleEditSubscription(sub)}
                    aria-label="ویرایش اشتراک"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    className={styles.deleteButton}
                    onClick={() => handleDeleteSubscription(sub)}
                    aria-label="حذف اشتراک"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <SubscriptionDialog
        open={openSubscriptionDialog}
        onClose={() => setOpenSubscriptionDialog(false)}
      />
      {selectedEmail && (
        <EditSubscriptionDialog
          open={openEditSubscriptionDialog}
          onClose={() => {
            setOpenEditSubscriptionDialog(false);
            setSelectedEmail(null);
          }}
          email={selectedEmail}
        />
      )}
    </Box>
  );
};

export default SubscriptionManagement;