import React, { useMemo } from 'react';
import { ToastContainer, ToastContainerProps, toast, TypeOptions } from 'react-toastify';
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
    progressStyle: {
      backgroundColor: theme.palette.primary.main, // Progress bar color
    },
  }), [theme]) as ToastContainerProps;
};

const getToastStyle = (theme: any, type: TypeOptions) => {
  switch (type) {
    case 'success':
      return {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.success.contrastText,
        iconColor: theme.palette.success.contrastText,
      };
    case 'error':
      return {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
        iconColor: theme.palette.error.contrastText,
      };
    case 'info':
      return {
        backgroundColor: theme.palette.info.main,
        color: theme.palette.info.contrastText,
        iconColor: theme.palette.info.contrastText,
      };
    case 'warning':
      return {
        backgroundColor: theme.palette.warning.main,
        color: theme.palette.warning.contrastText,
        iconColor: theme.palette.warning.contrastText,
      };
    default:
      return {};
  }
};

export const useToastNotification = () => {
  const theme = useTheme();
  const styles = useToastStyles();

  const showToast = (message: string, type: TypeOptions) => {
    const toastStyle = getToastStyle(theme, type);
    toast(message, {
      ...styles,
      type,
      style: {
        ...styles.style,
        backgroundColor: toastStyle.backgroundColor,
        color: toastStyle.color,
      },
      icon: <span style={{ color: toastStyle.iconColor }}>🔔</span>,
    });
  };

  const showSuccessToast = (message: string) => showToast(message, 'success');
  const showErrorToast = (message: string) => showToast(message, 'error');
  const showInfoToast = (message: string) => showToast(message, 'info');
  const showWarningToast = (message: string) => showToast(message, 'warning');

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
