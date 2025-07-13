import React, { useState } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Box } from '@mui/material';
import { useScheduleContext } from '../../../Context/ScheduleContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import { Link } from 'react-router-dom';

interface ScheduleItem {
  id: number;
  day: string;
  time: string;
  course: string;
  instructor: string;
  image: string;
}

const ScheduleManagement: React.FC = () => {
  const { weeklySchedule, setWeeklySchedule } = useScheduleContext();
  const { showNotification } = useNotificationContext();
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://roomdental.com';

  const handleDeleteScheduleItem = (id: number) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این برنامه را حذف کنید؟')) {
      setWeeklySchedule(weeklySchedule.filter(item => item.id !== id));
      showNotification('برنامه با موفقیت حذف شد!', 'success');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`${baseUrl}/schedule/create`}
        className="mb-4"
      >
        ایجاد برنامه جدید
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>روز</TableCell>
            <TableCell>ساعت</TableCell>
            <TableCell>دوره</TableCell>
            <TableCell>استاد</TableCell>
            <TableCell>اقدامات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {weeklySchedule.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.day}</TableCell>
              <TableCell>{item.time}</TableCell>
              <TableCell>{item.course}</TableCell>
              <TableCell>{item.instructor}</TableCell>
              <TableCell>
                <Link to={`${baseUrl}/schedule/${item.id}/edit`} className="text-blue-500 mr-2">ویرایش</Link>
                <Button color="error" onClick={() => handleDeleteScheduleItem(item.id)}>حذف</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ScheduleManagement;