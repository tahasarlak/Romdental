import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Box } from '@mui/material';
import { useInstructorContext } from '../../../Context/InstructorContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import InstructorDialog from '../InstructorDialog/InstructorDialog';

const InstructorManagement: React.FC = () => {
  const { instructors, setInstructors } = useInstructorContext();
  const { showNotification } = useNotificationContext();
  const [openInstructorDialog, setOpenInstructorDialog] = useState(false);
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://roomdental.com';

  const handleDeleteInstructor = (id: number) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این استاد را حذف کنید؟')) {
      setInstructors(instructors.filter(instructor => instructor.id !== id));
      showNotification('استاد با موفقیت حذف شد!', 'success');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button variant="contained" color="primary" onClick={() => setOpenInstructorDialog(true)} className="mb-4">
        ایجاد استاد جدید
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>نام</TableCell>
            <TableCell>تخصص</TableCell>
            <TableCell>تجربه</TableCell>
            <TableCell>تعداد دانشجویان</TableCell>
            <TableCell>اقدامات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {instructors.map(instructor => (
            <TableRow key={instructor.id}>
              <TableCell>{instructor.name}</TableCell>
              <TableCell>{instructor.specialty}</TableCell>
              <TableCell>{instructor.experience}</TableCell>
              <TableCell>{instructor.totalStudents}</TableCell>
              <TableCell>
                <Link to={`${baseUrl}/instructors/${instructor.id}/edit`} className="text-blue-500 mr-2">ویرایش</Link>
                <Button color="error" onClick={() => handleDeleteInstructor(instructor.id)}>حذف</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <InstructorDialog
        open={openInstructorDialog}
        onClose={() => setOpenInstructorDialog(false)}
      />
    </Box>
  );
};

export default InstructorManagement;