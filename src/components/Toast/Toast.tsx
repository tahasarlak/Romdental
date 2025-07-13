import React, { useEffect } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.toast} role="alert" aria-live="assertive">
      <p>{message}</p>
      <button onClick={onClose} aria-label="بستن اعلان">
        ×
      </button>
    </div>
  );
};

export default Toast;