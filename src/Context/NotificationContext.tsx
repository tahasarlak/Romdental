import React, { createContext, useContext, useState, ReactNode } from 'react';
    import Snackbar from '@mui/material/Snackbar';
    import Alert from '@mui/material/Alert';

    interface NotificationContextType {
      showNotification: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void;
    }

    const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

    export const NotificationProvider = ({ children }: { children: ReactNode }) => {
      const [open, setOpen] = useState(false);
      const [message, setMessage] = useState('');
      const [severity, setSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

      const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
        setMessage(message);
        setSeverity(severity);
        setOpen(true);
      };

      const handleClose = () => {
        setOpen(false);
      };

      return (
        <NotificationContext.Provider value={{ showNotification }}>
          {children}
         <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{
        '& .MuiAlert-root': {
          fontFamily: 'Vazir, sans-serif',
          backgroundColor: 'var(--background-color)',
          color: 'var(--text-color)',
        },
      }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
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