import React, { createContext, useContext, ReactNode } from 'react';
import DOMPurify from 'dompurify';
import { useNotificationContext } from '../NotificationContext';
import { useAuthContext } from './UserAuthContext';
import { Instructor, BankAccount } from '../../types/types';

interface InstructorRegistrationData {
  name: string;
  specialty: string;
  bio: string;
  experience: string;
  image?: string;
  whatsappLink?: string;
  telegramLink?: string;
  instagramLink?: string;
  bankAccounts: BankAccount[];
  email: string;
  phone: string;
  university: string;
  gender: 'مرد' | 'زن';
  password: string;
}

interface InstructorAuthContextType {
  registerInstructor: (instructorData: InstructorRegistrationData) => Promise<void>;
}

const InstructorAuthContext = createContext<InstructorAuthContextType | undefined>(undefined);

const validateBankAccount = (accountNumber: string): boolean => {
  const regex = /^\d{16}$/;
  return regex.test(accountNumber.replace(/\D/g, ''));
};

export const InstructorAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showNotification } = useNotificationContext();
  const { signup } = useAuthContext();

  const registerInstructor = async (instructorData: InstructorRegistrationData) => {
    try {
      if (!instructorData.specialty.trim()) throw new Error('تخصص نمی‌تواند خالی باشد.');
      if (!instructorData.bio.trim()) throw new Error('بیوگرافی نمی‌تواند خالی باشد.');
      if (!instructorData.experience.trim()) throw new Error('تجربه نمی‌تواند خالی باشد.');
      if (!instructorData.bankAccounts || instructorData.bankAccounts.length === 0) {
        throw new Error('حداقل یک شماره حساب بانکی لازم است.');
      }
      if (instructorData.bankAccounts.some((account) => !validateBankAccount(account.accountNumber))) {
        throw new Error('شماره حساب بانکی نامعتبر است.');
      }

      await signup(
        instructorData.name,
        instructorData.email,
        instructorData.password,
        instructorData.phone,
        instructorData.university,
        instructorData.gender,
        '',
        'Instructor'
      );

      const instructorId = Math.floor(Math.random() * 1000000) + 1;

      const instructorDetails: Instructor = {
        id: instructorId,
        name: DOMPurify.sanitize(instructorData.name),
        specialty: DOMPurify.sanitize(instructorData.specialty),
        bio: DOMPurify.sanitize(instructorData.bio),
        experience: DOMPurify.sanitize(instructorData.experience),
        image: instructorData.image || '/assets/Profile/default-instructor.jpg',
        bankAccounts: instructorData.bankAccounts.map((account) => ({
          bankName: DOMPurify.sanitize(account.bankName),
          accountHolder: DOMPurify.sanitize(account.accountHolder),
          accountNumber: DOMPurify.sanitize(account.accountNumber),
        })),
        coursesTaught: [],
        averageRating: '0.0',
        totalStudents: 0,
        reviewCount: 0,
        email: DOMPurify.sanitize(instructorData.email),
        phone: DOMPurify.sanitize(instructorData.phone),
        university: DOMPurify.sanitize(instructorData.university),
        gender: instructorData.gender,
        password: DOMPurify.sanitize(instructorData.password),
      };

      showNotification('استاد با موفقیت ثبت شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در ثبت استاد', 'error');
      throw error;
    }
  };

  return (
    <InstructorAuthContext.Provider value={{ registerInstructor }}>
      {children}
    </InstructorAuthContext.Provider>
  );
};

export const useInstructorAuthContext = () => {
  const context = useContext(InstructorAuthContext);
  if (!context) throw new Error('useInstructorAuthContext must be used within an InstructorAuthProvider');
  return context;
};