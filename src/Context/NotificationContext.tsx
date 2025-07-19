import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface Notification {
  id: number;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  type: 'snackbar';
  userId: string;
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info',
    type?: 'snackbar',
    targetUserId?: string
  ) => void;
  markAsRead: (notificationId: number, userId: string) => void;
  getUserNotifications: (userId: string) => Notification[];
  clearNotifications: (userId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const MAX_NOTIFICATIONS = 100;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const storedNotifications = localStorage.getItem('notifications');
    return storedNotifications ? JSON.parse(storedNotifications).slice(-MAX_NOTIFICATIONS) : [];
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        setNotifications((prev) => prev.slice(-50));
        console.error('محدودیت فضای ذخیره‌سازی! فقط ۵۰ اعلان آخر نگه داشته شد.');
      } else {
        console.error('خطا در ذخیره‌سازی اعلان‌ها!');
      }
    }
  }, [notifications]);

  const showNotification = useCallback(
    (
      message: string,
      severity: 'success' | 'error' | 'warning' | 'info',
      type: 'snackbar' = 'snackbar',
      targetUserId: string = 'all'
    ) => {
      if (type === 'snackbar') {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);
      }

      const newNotification: Notification = {
        id: notifications.length > 0 ? Math.max(...notifications.map((n) => n.id)) + 1 : 1,
        message,
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

      setNotifications((prev) => [...prev, newNotification].slice(-MAX_NOTIFICATIONS));
    },
    [notifications]
  );

  const markAsRead = useCallback((notificationId: number, userId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId && (n.userId === userId || n.userId === 'all') ? { ...n, read: true } : n
      )
    );
  }, []);

  const getUserNotifications = useCallback((userId: string): Notification[] => {
    return notifications.filter((n) => n.userId === userId || n.userId === 'all');
  }, [notifications]);

  const clearNotifications = useCallback((userId: string) => {
    setNotifications((prev) => prev.filter((n) => n.userId !== userId && n.userId !== 'all'));
    setOpenSnackbar(false);
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setOpenSnackbar(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      notifications,
      showNotification,
      markAsRead,
      getUserNotifications,
      clearNotifications,
    }),
    [notifications, showNotification, markAsRead, getUserNotifications, clearNotifications]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
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
  return context;
};