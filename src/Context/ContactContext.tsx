import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for a contact message
 */
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
}

/**
 * Interface for contact information
 */
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

/**
 * Interface for ContactContext
 */
interface ContactContextType {
  messages: ContactMessage[];
  addMessage: (message: Omit<ContactMessage, 'id' | 'date'>) => boolean;
  setMessages: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
  contactInfo: ContactInfo;
}

/**
 * Create Context
 */
const ContactContext = createContext<ContactContextType | undefined>(undefined);

/**
 * ContactProvider Component
 * Manages contact messages and provides contact information
 */
export const ContactProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    // Load messages from localStorage on mount
    const savedMessages = localStorage.getItem('contactMessages');
    let initialMessages: ContactMessage[] = [];
    
    if (savedMessages) {
      try {
        initialMessages = JSON.parse(savedMessages);
        console.log('Loaded messages from localStorage:', initialMessages);
      } catch (error) {
        console.error('Error parsing localStorage messages:', error);
      }
    }
    
    // If no valid messages in localStorage, use sample data
    if (!initialMessages.length) {
      initialMessages = [
        {
          id: uuidv4(),
          name: 'علی',
          email: 'ali@example.com',
          subject: 'سوال درباره خدمات',
          message: 'لطفاً اطلاعات بیشتری درباره خدمات دندانپزشکی ارائه دهید.',
          date: new Date().toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
        {
          id: uuidv4(),
          name: 'مریم',
          email: 'maryam@example.com',
          subject: 'وقت ملاقات',
          message: 'می‌خواهم وقت ملاقاتی برای هفته آینده رزرو کنم.',
          date: new Date().toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
      ];
      console.log('Initialized with sample messages:', initialMessages);
    }
    
    return initialMessages;
  });

  // Contact information
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

  // Save messages to localStorage whenever they change
  useEffect(() => {
    console.log('Saving messages to localStorage:', messages);
    localStorage.setItem('contactMessages', JSON.stringify(messages));
  }, [messages]);

  /**
   * Validates and adds a new message to the context
   * @param message - The message to add
   * @returns {boolean} - True if the message was added successfully
   */
  const addMessage = (message: Omit<ContactMessage, 'id' | 'date'>): boolean => {
    // Validate inputs
    if (!message.name.trim()) {
      console.log('Validation failed: Name is empty');
      return false;
    }
    if (!message.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      console.log('Validation failed: Invalid email');
      return false;
    }
    if (!message.subject.trim()) {
      console.log('Validation failed: Subject is empty');
      return false;
    }
    if (!message.message.trim() || message.message.length > 500) {
      console.log('Validation failed: Message is empty or too long');
      return false;
    }

    // Sanitize inputs
    const sanitizedMessage = {
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

    console.log('Adding new message:', sanitizedMessage);
    setMessages((prev) => [...prev, sanitizedMessage]);
    return true;
  };

  return (
    <ContactContext.Provider value={{ messages, addMessage, setMessages, contactInfo }}>
      {children}
    </ContactContext.Provider>
  );
};

/**
 * Custom hook to access ContactContext
 */
export const useContactContext = (): ContactContextType => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContactContext must be used within a ContactProvider');
  }
  console.log('Current context messages:', context.messages);
  return context;
};