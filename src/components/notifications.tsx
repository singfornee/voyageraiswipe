// src/notifications.tsx
import React, { useMemo } from 'react';
import { ToastContainer, ToastContainerProps, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '@mui/material/styles';

const useToastStyles = () => {
  const theme = useTheme();

  return useMemo(() => ({
    position: 'bottom-center',
    autoClose: 2000,
    hideProgressBar: false,
    newestOnTop: true,
    closeOnClick: true,
    rtl: false,
    pauseOnFocusLoss: false,
    draggable: true,
    pauseOnHover: false,
    style: {
      width: '300px',
      fontSize: '16px',
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderRadius: '8px',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    },
  }), [theme]) as ToastContainerProps;
};

export const useToastNotification = () => {
  const styles = useToastStyles();

  const showSuccessToast = (message: string) => {
    toast.success(message, styles);
  };

  const showErrorToast = (message: string) => {
    toast.error(message, styles);
  };

  const showInfoToast = (message: string) => {
    toast.info(message, styles);
  };

  const showWarningToast = (message: string) => {
    toast.warn(message, styles);
  };

  return {
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    showWarningToast,
  };
};

export const ToastNotificationContainer = () => {
  const styles = useToastStyles();
  return <ToastContainer {...styles} />;
};
