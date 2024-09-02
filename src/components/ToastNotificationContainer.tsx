// src/components/ToastNotificationContainer.tsx
import React from 'react';
import { useToastNotification } from '../contexts/NotificationContext';
import ToastNotification from './ToastNotification';

const ToastNotificationContainer: React.FC = () => {
  const { open, message, severity, handleClose } = useToastNotification();

  return (
    <ToastNotification
      open={open}
      message={message}
      severity={severity}
      handleClose={handleClose}
    />
  );
};

export default ToastNotificationContainer;
