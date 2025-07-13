import React from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Box } from '@mui/material';
import { useSubscriptionContext } from '../../../Context/SubscriptionContext';
import { useNotificationContext } from '../../../Context/NotificationContext';

const SubscriptionManagement: React.FC = () => {
  const { email, setEmail, status, message } = useSubscriptionContext();
  const { showNotification } = useNotificationContext();
  const [subscriptions, setSubscriptions] = React.useState<string[]>([]); // Mock subscription list

  const handleDeleteSubscription = (email: string) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این اشتراک را حذف کنید؟')) {
      setSubscriptions(subscriptions.filter(sub => sub !== email));
      if (email === email) setEmail(''); // Reset context email if deleted
      showNotification('اشتراک با موفقیت حذف شد!', 'success');
    }
  };

  // Mock function to add subscription to list (since context only handles single email)
  const addSubscription = (email: string) => {
    if (!subscriptions.includes(email)) {
      setSubscriptions([...subscriptions, email]);
    }
  };

  // Simulate adding current email to subscriptions for demo
  React.useEffect(() => {
    if (status === 'success' && email) {
      addSubscription(email);
    }
  }, [status, email]);

  return (
    <Box sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ایمیل</TableCell>
            <TableCell>وضعیت</TableCell>
            <TableCell>اقدامات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subscriptions.map(sub => (
            <TableRow key={sub}>
              <TableCell>{sub}</TableCell>
              <TableCell>فعال</TableCell>
              <TableCell>
                <Button color="error" onClick={() => handleDeleteSubscription(sub)}>حذف</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default SubscriptionManagement;