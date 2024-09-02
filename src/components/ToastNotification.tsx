import React, { useEffect } from 'react';
import { Snackbar, SnackbarContent, IconButton, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';

interface ToastNotificationProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
  handleClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ open, message, severity, handleClose }) => {
  const theme = useTheme();

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000); // Auto-hide duration

      return () => {
        clearTimeout(timer);
      };
    }
  }, [open, handleClose]);

  const severityStyles = {
    success: {
      backgroundColor: theme.palette.accent.main,
      color: 'black', // Set text color to black
    },
    error: {
      backgroundColor: theme.palette.error.main,
      color: 'black', // Set text color to black
    },
    info: {
      backgroundColor: theme.palette.info.main,
      color: 'black', // Set text color to black
    },
  };

  const renderIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircleIcon sx={{ marginRight: '8px' }} />;
      case 'error':
        return <ErrorIcon sx={{ marginRight: '8px' }} />;
      case 'info':
        return <InfoIcon sx={{ marginRight: '8px' }} />;
      default:
        return null;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Positioning for larger views
    >
      <SnackbarContent
        sx={{
          borderRadius: '8px',
          padding: '12px', // Reduced padding for a smaller box
          margin: '10px',
          width: '300px', // Set a fixed width for consistency
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between', // Space between icon, message, and close button
          boxShadow: 3,
          ...severityStyles[severity],
          transition: 'transform 0.3s ease, opacity 0.3s ease', // Smooth animation
        }}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', color: severityStyles[severity].color }}>
            {renderIcon()}
            <Box sx={{ flexGrow: 1, marginLeft: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}> {/* Adjusted font size */}
              {message}
            </Box>
          </Box>
        }
        action={
          <IconButton
            onClick={handleClose}
            sx={{ color: 'black' }} // Close icon color
          >
            <CloseIcon />
          </IconButton>
        }
      />
    </Snackbar>
  );
};

export default ToastNotification;
