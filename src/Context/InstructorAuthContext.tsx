import React, { createContext, useContext, ReactNode } from 'react';
import DOMPurify from 'dompurify';
import { useNotificationContext } from './NotificationContext';
import { useInstructorContext } from './InstructorContext';
import { Instructor, BankAccount, User } from '../types/types';
import { useAuthContext } from './AuthContext';

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
}

interface InstructorAuthContextType {
  registerInstructor: (instructorData: InstructorRegistrationData) => Promise<void>;
}

const InstructorAuthContext = createContext<InstructorAuthContextType | undefined>(undefined);

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^09[0-9]{9}$/;
  return phoneRegex.test(phone);
};

const validateBankAccount = (accountNumber: string): boolean => {
  const regex = /^\d{16}$/;
  return regex.test(accountNumber.replace(/\D/g, ''));
};

export const InstructorAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showNotification } = useNotificationContext();
  const { addInstructor } = useInstructorContext();
  const { setUser } = useAuthContext();

  const registerInstructor = async (instructorData: InstructorRegistrationData) => {
    try {
      if (!instructorData.name.trim()) throw new Error('نام نمی‌تواند خالی باشد.');
      if (!validateEmail(instructorData.email)) throw new Error('ایمیل نامعتبر است.');
      if (!validatePhone(instructorData.phone)) throw new Error('شماره تلفن باید با فرمت ۰۹xxxxxxxxx باشد.');
      if (!instructorData.university.trim()) throw new Error('دانشگاه نمی‌تواند خالی باشد.');
      if (!['مرد', 'زن'].includes(instructorData.gender)) throw new Error('جنسیت باید "مرد" یا "زن" باشد.');
      if (!instructorData.bankAccounts || instructorData.bankAccounts.length === 0) {
        throw new Error('حداقل یک شماره حساب بانکی لازم است');
      }
      if (instructorData.bankAccounts.some((account) => !validateBankAccount(account.accountNumber))) {
        throw new Error('شماره حساب بانکی نامعتبر است');
      }

      const response = await fetch('/api/instructors/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: instructorData.email, phone: instructorData.phone }),
      });
      if (response.status === 409) throw new Error('ایمیل یا شماره تلفن قبلاً ثبت شده است');

      const newUser: User = {
        id: Math.floor(Math.random() * 10000) + 1,
        name: DOMPurify.sanitize(instructorData.name),
        email: DOMPurify.sanitize(instructorData.email),
        phone: DOMPurify.sanitize(instructorData.phone),
        university: DOMPurify.sanitize(instructorData.university),
        gender: instructorData.gender,
        profilePicture: instructorData.image || '/assets/Profile/default-instructor.jpg',
        wishlist: [],
        enrolledCourses: [],
        cart: [],
        password: `hashed_${Math.random().toString(36).substring(2)}`,
        token: `instructor-token-${Date.now()}`,
        role: 'Instructor',
      };

      await addInstructor({
        ...instructorData,
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
      });

      setUser(newUser);

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