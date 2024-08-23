import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#39FF14', // Neon Green
    },
    secondary: {
      main: '#FF1493', // Neon Pink
    },
    background: {
      default: '#121212', // Very dark background
      paper: '#1d1d1d',   // Slightly lighter for cards
    },
    text: {
      primary: '#ffffff', // White text
      secondary: '#b0b0b0', // Light gray text
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1d1d1d',  // Ensure solid dark background
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1d1d1d',
          color: '#ffffff',
        },
      },
    },
  },
});



export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#39FF14', // Neon Green
    },
    secondary: {
      main: '#FF1493', // Neon Pink
    },
    background: {
      default: '#f4f4f4', // Light background
      paper: '#ffffff',   // White background for cards
    },
    text: {
      primary: '#121212', // Dark text for readability
      secondary: '#757575', // Gray for secondary text
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#121212',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          textTransform: 'none',
          color: '#ffffff',
          backgroundColor: '#FF1493', // Neon Pink button background
          '&:hover': {
            backgroundColor: '#e0137d', // Slightly darker pink on hover
          },
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#757575',
          '&.Mui-selected': {
            color: '#FF1493', // Neon Pink for selected
          },
        },
      },
    },
  },
});
