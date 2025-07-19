import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useInstructorContext } from '../../../../Context/InstructorContext';
import { useNotificationContext } from '../../../../Context/NotificationContext';
import { Instructor, BankAccount } from '../../../../types/types';
import styles from './InstructorDialog.module.css';

interface InstructorDialogProps {
  open: boolean;
  onClose: () => void;
  instructor?: Instructor | null;
}

const InstructorDialog: React.FC<InstructorDialogProps> = ({ open, onClose, instructor }) => {
  const { addInstructor, updateInstructor } = useInstructorContext();
  const { showNotification } = useNotificationContext();
  const [newInstructor, setNewInstructor] = useState<Partial<Instructor>>({
    name: '',
    specialty: '',
    bio: '',
    image: '',
    experience: '',
    coursesTaught: [],
    averageRating: '0',
    totalStudents: 0,
    reviewCount: 0,
    whatsappLink: '',
    telegramLink: '',
    instagramLink: '',
    bankAccounts: [],
  });
  const [newBankAccount, setNewBankAccount] = useState<BankAccount>({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
  });

  useEffect(() => {
    if (instructor) {
      setNewInstructor(instructor);
    } else {
      setNewInstructor({
        name: '',
        specialty: '',
        bio: '',
        image: '',
        experience: '',
        coursesTaught: [],
        averageRating: '0',
        totalStudents: 0,
        reviewCount: 0,
        whatsappLink: '',
        telegramLink: '',
        instagramLink: '',
        bankAccounts: [],
      });
    }
  }, [instructor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewInstructor((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBankAccount((prev) => ({ ...prev, [name]: value }));
  };

  const addBankAccount = () => {
    if (newBankAccount.bankName && newBankAccount.accountHolder && newBankAccount.accountNumber) {
      setNewInstructor((prev) => ({
        ...prev,
        bankAccounts: [...(prev.bankAccounts || []), newBankAccount],
      }));
      setNewBankAccount({ bankName: '', accountHolder: '', accountNumber: '' });
    } else {
      showNotification('لطفاً تمام فیلدهای حساب بانکی را پر کنید.', 'error');
    }
  };

  const removeBankAccount = (index: number) => {
    setNewInstructor((prev) => ({
      ...prev,
      bankAccounts: (prev.bankAccounts || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!newInstructor.name || !newInstructor.specialty || !newInstructor.bio) {
      showNotification('لطفاً تمام فیلدهای الزامی را پر کنید.', 'error');
      return;
    }

    try {
   // src/components/AdminDashboard/InstructorManagement/InstructorDialog/InstructorDialog.tsx
// ... سایر کدها ...

const instructorData: Omit<Instructor, 'id'> = {
  name: newInstructor.name!,
  specialty: newInstructor.specialty!,
  bio: newInstructor.bio!,
  image: newInstructor.image || '/assets/Profile/default-instructor.jpg',
  experience: newInstructor.experience!,
  coursesTaught: newInstructor.coursesTaught || [],
  averageRating: newInstructor.averageRating || '0.0',
  totalStudents: newInstructor.totalStudents || 0,
  reviewCount: newInstructor.reviewCount || 0,
  whatsappLink: newInstructor.whatsappLink,
  telegramLink: newInstructor.telegramLink,
  instagramLink: newInstructor.instagramLink,
  bankAccounts: newInstructor.bankAccounts || [],
  email: newInstructor.email || '', // اضافه کردن
  phone: newInstructor.phone || '', // اضافه کردن
  university: newInstructor.university || '', // اضافه کردن
  gender: newInstructor.gender || 'مرد', // مقدار پیش‌فرض
  password: newInstructor.password || '', // اضافه کردن
};

// ... ادامه کد ...

      if (instructor) {
        await updateInstructor(instructor.id, instructorData);
        showNotification('استاد با موفقیت به‌روزرسانی شد.', 'success');
      } else {
        await addInstructor(instructorData);
        showNotification('استاد با موفقیت اضافه شد.', 'success');
      }
      onClose();
    } catch (error: any) {
      showNotification(error.message || 'خطایی در ذخیره استاد رخ داد.', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{instructor ? 'ویرایش استاد' : 'اضافه کردن استاد جدید'}</DialogTitle>
      <DialogContent>
        <TextField
          label="نام"
          name="name"
          value={newInstructor.name || ''}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="تخصص"
          name="specialty"
          value={newInstructor.specialty || ''}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="بیوگرافی"
          name="bio"
          value={newInstructor.bio || ''}
          onChange={handleInputChange}
          fullWidth
          required
          multiline
          rows={4}
          margin="normal"
        />
        <TextField
          label="لینک تصویر"
          name="image"
          value={newInstructor.image || ''}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="تجربه"
          name="experience"
          value={newInstructor.experience || ''}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="میانگین امتیاز"
          name="averageRating"
          value={newInstructor.averageRating || ''}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="تعداد دانشجویان"
          name="totalStudents"
          type="number"
          value={newInstructor.totalStudents || 0}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="تعداد نظرات"
          name="reviewCount"
          type="number"
          value={newInstructor.reviewCount || 0}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="لینک واتساپ"
          name="whatsappLink"
          value={newInstructor.whatsappLink || ''}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="لینک تلگرام"
          name="telegramLink"
          value={newInstructor.telegramLink || ''}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="لینک اینستاگرام"
          name="instagramLink"
          value={newInstructor.instagramLink || ''}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <div className={styles.bankAccountSection}>
          <h3>حساب‌های بانکی</h3>
          <TextField
            label="نام بانک"
            name="bankName"
            value={newBankAccount.bankName}
            onChange={handleBankAccountChange}
            margin="normal"
          />
          <TextField
            label="نام صاحب حساب"
            name="accountHolder"
            value={newBankAccount.accountHolder}
            onChange={handleBankAccountChange}
            margin="normal"
          />
          <TextField
            label="شماره حساب"
            name="accountNumber"
            value={newBankAccount.accountNumber}
            onChange={handleBankAccountChange}
            margin="normal"
          />
          <IconButton onClick={addBankAccount} color="primary">
            <AddIcon />
          </IconButton>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>نام بانک</TableCell>
                <TableCell>نام صاحب حساب</TableCell>
                <TableCell>شماره حساب</TableCell>
                <TableCell>حذف</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(newInstructor.bankAccounts || []).map((account, index) => (
                <TableRow key={index}>
                  <TableCell>{account.bankName}</TableCell>
                  <TableCell>{account.accountHolder}</TableCell>
                  <TableCell>{account.accountNumber}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => removeBankAccount(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>لغو</Button>
        <Button onClick={handleSubmit} color="primary">
          {instructor ? 'به‌روزرسانی' : 'اضافه کردن'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstructorDialog;