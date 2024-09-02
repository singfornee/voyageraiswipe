// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ToastNotificationContextProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
  showSuccessToast: (msg: string) => void;
  showErrorToast: (msg: string) => void;
  showInfoToast: (msg: string) => void;
  handleClose: () => void;
}

// Create the context
const ToastNotificationContext = createContext<ToastNotificationContextProps | undefined>(undefined);

export const ToastNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'info',
  });

  const showSuccessToast = (msg: string) => {
    setToast({ open: true, message: msg, severity: 'success' });
  };

  const showErrorToast = (msg: string) => {
    setToast({ open: true, message: msg, severity: 'error' });
  };

  const showInfoToast = (msg: string) => {
    setToast({ open: true, message: msg, severity: 'info' });
  };

  const handleClose = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  return (
    <ToastNotificationContext.Provider value={{ 
      open: toast.open, 
      message: toast.message, 
      severity: toast.severity, 
      showSuccessToast, 
      showErrorToast, 
      showInfoToast, 
      handleClose 
    }}>
      {children}
    </ToastNotificationContext.Provider>
  );
};

// Custom hook for using the toast notification context
export const useToastNotification = () => {
  const context = useContext(ToastNotificationContext);
  if (!context) {
    throw new Error('useToastNotification must be used within a ToastNotificationProvider');
  }
  return context;
};
