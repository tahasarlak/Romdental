// src/context/ContactContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
}

interface ContactContextType {
  messages: ContactMessage[];
  addMessage: (message: Omit<ContactMessage, 'id' | 'date'>) => void;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const ContactProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const addMessage = (message: Omit<ContactMessage, 'id' | 'date'>) => {
    const newMessage: ContactMessage = {
      id: messages.length + 1,
      ...message,
      date: new Date().toLocaleDateString('fa-IR'),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <ContactContext.Provider value={{ messages, addMessage }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContactContext = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContactContext must be used within a ContactProvider');
  }
  return context;
};