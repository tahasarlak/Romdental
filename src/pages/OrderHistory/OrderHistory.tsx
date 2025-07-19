import React from 'react';
import { useOrderContext } from '../../Context/OrderContext';
import { useNotificationContext } from '../../Context/NotificationContext';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuthContext } from '../../Context/Auth/UserAuthContext';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  direction: 'rtl',
  fontFamily: 'Vazir, sans-serif',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontFamily: 'Vazir, sans-serif',
  color: 'var(--text-color)',
  padding: theme.spacing(1.5),
}));

const StyledTableHeadCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: 'var(--primary-color)',
  color: '#fff',
  fontWeight: 'bold',
}));

const OrderHistory: React.FC = () => {
  const { user } = useAuthContext();
  const { orders, getUserOrders, cancelOrder } = useOrderContext();
  const { showNotification } = useNotificationContext();

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h5" fontFamily="Vazir, sans-serif">
          لطفاً برای مشاهده تاریخچه سفارش‌ها وارد حساب کاربری شوید.
        </Typography>
      </Box>
    );
  }

  const userOrders = getUserOrders(user.email);

  const handleCancelOrder = async (orderId: number) => {
    try {
      await cancelOrder(orderId);
    } catch (error: any) {
      // Error is already handled in OrderContext via showNotification
    }
  };

  if (!userOrders.length) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h5" fontFamily="Vazir, sans-serif">
          هیچ سفارشی یافت نشد.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" fontFamily="Vazir, sans-serif" gutterBottom>
        تاریخچه سفارش‌ها
      </Typography>
      <StyledTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>شناسه سفارش</StyledTableHeadCell>
              <StyledTableHeadCell>تاریخ سفارش</StyledTableHeadCell>
              <StyledTableHeadCell>مجموع مبلغ</StyledTableHeadCell>
              <StyledTableHeadCell>وضعیت</StyledTableHeadCell>
              <StyledTableHeadCell>دوره‌ها</StyledTableHeadCell>
              <StyledTableHeadCell>عملیات</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userOrders.map((order) => (
              <TableRow key={order.id}>
                <StyledTableCell>{order.id}</StyledTableCell>
                <StyledTableCell>{order.orderDate}</StyledTableCell>
                <StyledTableCell>{order.totalAmount}</StyledTableCell>
                <StyledTableCell>
                  {order.status === 'pending' && 'در انتظار'}
                  {order.status === 'completed' && 'تکمیل شده'}
                  {order.status === 'canceled' && 'لغو شده'}
                </StyledTableCell>
                <StyledTableCell>
                  {order.items.map((item) => (
                    <Typography key={item.courseId} fontFamily="Vazir, sans-serif">
                      {item.courseTitle} ({item.price})
                    </Typography>
                  ))}
                </StyledTableCell>
                <StyledTableCell>
                  {order.status === 'pending' && (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleCancelOrder(order.id)}
                      sx={{ fontFamily: 'Vazir, sans-serif' }}
                    >
                      لغو سفارش
                    </Button>
                  )}
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Box>
  );
};

export default OrderHistory;