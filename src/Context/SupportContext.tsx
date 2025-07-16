import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { useNotificationContext } from './NotificationContext';
import { v4 as uuidv4 } from 'uuid';
import DOMPurify from 'dompurify';

interface SupportMessage {
  id: string;
  ticketId: string;
  userId: number;
  userName: string;
  message: string;
  timestamp: string;
  isFromSupport: boolean; // پیام از تیم پشتیبانی یا کاربر
}

interface SupportTicket {
  id: string;
  userId: number;
  userName: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  createdAt: string;
  messages: SupportMessage[];
}

interface SupportContextType {
  tickets: SupportTicket[];
  createTicket: (subject: string, message: string) => Promise<void>;
  sendMessage: (ticketId: string, message: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: 'open' | 'in-progress' | 'closed') => Promise<void>;
  getUserTickets: (userId: number) => SupportTicket[];
  getTicketMessages: (ticketId: string) => SupportMessage[];
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export const SupportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Load tickets from localStorage on mount
  useEffect(() => {
    const storedTickets = localStorage.getItem('supportTickets');
    if (storedTickets) {
      try {
        setTickets(JSON.parse(storedTickets));
      } catch (error) {
        console.error('Error parsing support tickets from localStorage:', error);
      }
    }
  }, []);

  // Save tickets to localStorage on change
  useEffect(() => {
    localStorage.setItem('supportTickets', JSON.stringify(tickets));
  }, [tickets]);

  const createTicket = async (subject: string, message: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('برای ایجاد تیکت باید وارد حساب کاربری شوید.');
    }
    if (!subject.trim() || !message.trim()) {
      throw new Error('موضوع و پیام نمی‌توانند خالی باشند.');
    }

    try {
      const newTicket: SupportTicket = {
        id: uuidv4(),
        userId: user.id,
        userName: user.name,
        subject: DOMPurify.sanitize(subject),
        status: 'open',
        createdAt: new Date().toLocaleString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        messages: [
          {
            id: uuidv4(),
            ticketId: uuidv4(),
            userId: user.id,
            userName: user.name,
            message: DOMPurify.sanitize(message),
            timestamp: new Date().toLocaleString('fa-IR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            isFromSupport: false,
          },
        ],
      };

      setTickets((prev) => [...prev, newTicket]);
      showNotification('تیکت پشتیبانی با موفقیت ایجاد شد.', 'success');
      // Notify support team (simulated)
      console.log(`New ticket created: ${newTicket.subject} by ${newTicket.userName}`);
    } catch (error: any) {
      showNotification(error.message || 'خطا در ایجاد تیکت پشتیبانی.', 'error');
      throw error;
    }
  };

  const sendMessage = async (ticketId: string, message: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('برای ارسال پیام باید وارد حساب کاربری شوید.');
    }
    if (!message.trim()) {
      throw new Error('پیام نمی‌تواند خالی باشد.');
    }

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      throw new Error('تیکت یافت نشد.');
    }
    if (ticket.userId !== user.id && !['SuperAdmin', 'Admin'].includes(user.role)) {
      throw new Error('شما اجازه ارسال پیام در این تیکت را ندارید.');
    }

    try {
      const newMessage: SupportMessage = {
        id: uuidv4(),
        ticketId,
        userId: user.id,
        userName: user.name,
        message: DOMPurify.sanitize(message),
        timestamp: new Date().toLocaleString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        isFromSupport: ['SuperAdmin', 'Admin'].includes(user.role),
      };

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, messages: [...t.messages, newMessage] }
            : t
        )
      );

      showNotification('پیام با موفقیت ارسال شد.', 'success');
      // Notify other party (simulated)
      console.log(`New message in ticket ${ticketId}: ${message} by ${user.name}`);
    } catch (error: any) {
      showNotification(error.message || 'خطا در ارسال پیام.', 'error');
      throw error;
    }
  };

  const updateTicketStatus = async (ticketId: string, status: 'open' | 'in-progress' | 'closed') => {
    if (!isAuthenticated || !user || !['SuperAdmin', 'Admin'].includes(user.role)) {
      throw new Error('فقط ادمین‌ها می‌توانند وضعیت تیکت را تغییر دهند.');
    }

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      throw new Error('تیکت یافت نشد.');
    }

    try {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status } : t
        )
      );
      showNotification(`وضعیت تیکت به "${status}" تغییر کرد.`, 'success');
      // Notify user (simulated)
      console.log(`Ticket ${ticketId} status updated to ${status}`);
    } catch (error: any) {
      showNotification(error.message || 'خطا در تغییر وضعیت تیکت.', 'error');
      throw error;
    }
  };

  const getUserTickets = (userId: number): SupportTicket[] => {
    if (!isAuthenticated || !user) {
      return [];
    }
    if (['SuperAdmin', 'Admin'].includes(user.role)) {
      return tickets; // Admins can see all tickets
    }
    return tickets.filter((t) => t.userId === userId);
  };

  const getTicketMessages = (ticketId: string): SupportMessage[] => {
    const ticket = tickets.find((t) => t.id === ticketId);
    return ticket ? ticket.messages : [];
  };

  return (
    <SupportContext.Provider
      value={{
        tickets,
        createTicket,
        sendMessage,
        updateTicketStatus,
        getUserTickets,
        getTicketMessages,
      }}
    >
      {children}
    </SupportContext.Provider>
  );
};

export const useSupportContext = () => {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error('useSupportContext must be used within a SupportProvider');
  }
  return context;
};