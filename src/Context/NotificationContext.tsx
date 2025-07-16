import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useAuthContext } from './AuthContext';
import DOMPurify from 'dompurify';

interface Notification {
  id: number;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  type: 'snackbar' | 'email' | 'sms' | 'push';
  userId: string;
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info',
    type?: 'snackbar' | 'email' | 'sms' | 'push',
    targetUserId?: string
  ) => void;
  markAsRead: (notificationId: number) => void;
  getUserNotifications: (userId: string) => Notification[];
  clearNotifications: (userId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const MAX_NOTIFICATIONS = 100;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Load notifications from localStorage on mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      try {
        const parsed = JSON.parse(storedNotifications);
        setNotifications(parsed.slice(-MAX_NOTIFICATIONS)); // Keep only the last 100
      } catch (error) {
        console.error('Error parsing notifications from localStorage:', error);
      }
    }
  }, []);

  // Save notifications to localStorage with error handling
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, keeping last 50 notifications');
        setNotifications((prev) => prev.slice(-50)); // Keep last 50 if quota exceeded
      } else {
        console.error('Error saving notifications to localStorage:', error);
      }
    }
  }, [notifications]);

  const showNotification = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info',
    type: 'snackbar' | 'email' | 'sms' | 'push' = 'snackbar',
    targetUserId: string = user?.email || 'all'
  ) => {
    const sanitizedMessage = DOMPurify.sanitize(message);
    if (type === 'snackbar') {
      setSnackbarMessage(sanitizedMessage);
      setSnackbarSeverity(severity);
      setOpenSnackbar(true);
    }

    const newNotification: Notification = {
      id: Math.max(...notifications.map((n) => n.id), 0) + 1,
      message: sanitizedMessage,
      severity,
      type,
      userId: targetUserId,
      timestamp: new Date().toLocaleString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      read: false,
    };

    setNotifications((prev) => {
      const updated = [...prev, newNotification];
      return updated.slice(-MAX_NOTIFICATIONS); // Keep only the last 100
    });

    if (type === 'email') {
      console.log(`Sending email to ${targetUserId}: ${sanitizedMessage}`);
    } else if (type === 'sms') {
      console.log(`Sending SMS to ${targetUserId}: ${sanitizedMessage}`);
    } else if (type === 'push') {
      console.log(`Sending push notification to ${targetUserId}: ${sanitizedMessage}`);
    }
  };

  const markAsRead = (notificationId: number) => {
    if (!isAuthenticated || !user) {
      throw new Error('برای علامت‌گذاری اعلان باید وارد حساب کاربری شوید.');
    }
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId && n.userId === user.email ? { ...n, read: true } : n
      )
    );
  };

  const getUserNotifications = (userId: string): Notification[] => {
    return notifications.filter((n) => n.userId === userId || n.userId === 'all');
  };

  const clearNotifications = (userId: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('برای پاک کردن اعلان‌ها باید وارد حساب کاربری شوید.');
    }
    setNotifications((prev) => prev.filter((n) => n.userId !== userId && n.userId !== 'all'));
    setOpenSnackbar(false);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        markAsRead,
        getUserNotifications,
        clearNotifications,
      }}
    >
      {children}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiAlert-root': {
            fontFamily: 'Vazir, sans-serif',
            backgroundColor: 'var(--background-color)',
            color: 'var(--text-color)',
          },
        }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context; // Fixed: Changed 'quiso' to 'context'
};