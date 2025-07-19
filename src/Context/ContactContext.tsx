import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import DOMPurify from 'dompurify';
import { v4 as uuidv4 } from 'uuid';
import { useNotificationContext } from './NotificationContext';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
}

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  socialLinks: {
    instagram: string;
    telegram: string;
    whatsapp: string;
    linkedin: string;
  };
}

interface ContactContextType {
  messages: ContactMessage[];
  addMessage: (message: Omit<ContactMessage, 'id' | 'date'>) => Promise<boolean>;
  deleteMessage: (id: string) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
  contactInfo: ContactInfo;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const ContactProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showNotification } = useNotificationContext();
  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    const savedMessages = localStorage.getItem('contactMessages');
    let initialMessages: ContactMessage[] = [];

    if (savedMessages) {
      try {
        initialMessages = JSON.parse(savedMessages);
      } catch (error) {
        showNotification('خطا در بارگذاری پیام‌ها از localStorage!', 'error');
      }
    }

    if (!initialMessages.length) {
      initialMessages = [
        {
          id: uuidv4(),
          name: DOMPurify.sanitize('علی'),
          email: DOMPurify.sanitize('ali@example.com'),
          subject: DOMPurify.sanitize('سوال درباره خدمات'),
          message: DOMPurify.sanitize('لطفاً اطلاعات بیشتری درباره خدمات دندانپزشکی ارائه دهید.'),
          date: new Date().toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
        {
          id: uuidv4(),
          name: DOMPurify.sanitize('مریم'),
          email: DOMPurify.sanitize('maryam@example.com'),
          subject: DOMPurify.sanitize('وقت ملاقات'),
          message: DOMPurify.sanitize('می‌خواهم وقت ملاقاتی برای هفته آینده رزرو کنم.'),
          date: new Date().toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
      ];
    }

    return initialMessages;
  });

  const contactInfo: ContactInfo = {
    phone: '۰۲۱-۱۲۳۴۵۶۷۸',
    email: 'info@roomdental.com',
    address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
    socialLinks: {
      instagram: 'https://instagram.com/roomdental',
      telegram: 'https://t.me/roomdental',
      whatsapp: 'https://wa.me/989123456789',
      linkedin: 'https://linkedin.com/company/roomdental',
    },
  };

  useEffect(() => {
    try {
      localStorage.setItem('contactMessages', JSON.stringify(messages));
    } catch (error) {
      showNotification('خطا در ذخیره‌سازی پیام‌ها!', 'error');
    }
  }, [messages, showNotification]);

  const addMessage = async (message: Omit<ContactMessage, 'id' | 'date'>): Promise<boolean> => {
    try {
      if (!message.name.trim()) throw new Error('نام نمی‌تواند خالی باشد.');
      if (!message.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) throw new Error('ایمیل نامعتبر است.');
      if (!message.subject.trim()) throw new Error('موضوع نمی‌تواند خالی باشد.');
      if (!message.message.trim() || message.message.length > 500) throw new Error('پیام نمی‌تواند خالی باشد یا بیش از ۵۰۰ کاراکتر باشد.');

      const sanitizedMessage: ContactMessage = {
        id: uuidv4(),
        name: DOMPurify.sanitize(message.name),
        email: DOMPurify.sanitize(message.email),
        subject: DOMPurify.sanitize(message.subject),
        message: DOMPurify.sanitize(message.message),
        date: new Date().toLocaleDateString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      };

      setMessages((prev) => [...prev, sanitizedMessage]);
      showNotification('پیام با موفقیت ارسال شد.', 'success');
      return true;
    } catch (error: any) {
      showNotification(error.message || 'خطا در ارسال پیام!', 'error');
      return false;
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      showNotification('پیام با موفقیت حذف شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در حذف پیام!', 'error');
      throw error;
    }
  };

  return (
    <ContactContext.Provider value={{ messages, addMessage, deleteMessage, setMessages, contactInfo }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContactContext = (): ContactContextType => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContactContext must be used within a ContactProvider');
  }
  return context;
};