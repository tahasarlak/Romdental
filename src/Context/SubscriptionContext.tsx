import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SubscriptionContextType {
  email: string;
  setEmail: (email: string) => void;
  status: 'idle' | 'loading' | 'success' | 'error';
  setStatus: (status: 'idle' | 'loading' | 'success' | 'error') => void;
  message: string;
  subscribe: (email: string) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const subscribe = async (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('لطفاً یک ایمیل معتبر وارد کنید');
      return;
    }
    setStatus('loading');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus('success');
      setMessage('با موفقیت ثبت‌نام شدید!');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('خطایی رخ داد. لطفاً دوباره امتحان کنید.');
    }
  };

  return (
    <SubscriptionContext.Provider value={{ email, setEmail, status, setStatus, message, subscribe }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  return context;
};