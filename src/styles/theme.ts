import { createTheme, ThemeOptions } from '@mui/material/styles';

// Extend the Palette interface to include custom colors
declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
    highlight: Palette['primary'];
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
    highlight?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    ghost: true;
  }
}

// Now you can safely use `accent` and `highlight` in your theme.
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6A5ACD', // Lighter Soft Purple for better contrast
    },
    secondary: {
      main: '#2E335A', // Deep Blue
    },
    background: {
      default: '#0E0D1F', // Even darker background for strong contrast
      paper: '#1A1A2E',   // Slightly lighter for cards
    },
    text: {
      primary: '#ffffff', // White text
      secondary: '#BBB5E3', // Soft gray text for secondary elements
    },
    accent: {
      main: '#FFA500', // Bright Orange for accent
    },
    highlight: {
      main: '#FFD700', // Bright Yellow for highlights
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A2E',  // Slightly lighter than background
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.7)', // Enhanced shadow for depth
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#3B267B', // Rich Purple for tags
          color: '#ffffff',           // White text for readability
          boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.3)', // Subtle shadow for contrast
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          color: '#ffffff',           // White text on buttons by default
        },
      },
      variants: [
        {
          props: { variant: 'contained' }, // Contained button variant
          style: {
            background: 'linear-gradient(45deg, #FFA500, #FF4500)', // Gradient from Orange to Red-Orange
            boxShadow: '0px 4px 14px rgba(255, 69, 0, 0.5)', // Orange shadow for a soft glow
            '&:hover': {
              backgroundColor: '#FF4500', // Solid Red-Orange on hover
            },
          },
        },
        {
          props: { variant: 'ghost' }, // Custom ghost variant
          style: {
            backgroundColor: 'transparent', // Transparent background
            border: '1px solid currentColor', // Use current text color for border
            color: 'currentColor', // Text color matches currentColor
            '&:hover': {
              backgroundColor: 'rgba(106, 90, 205, 0.1)', // Slight background on hover
              borderColor: '#6A5ACD', // Primary color for border on hover
            },
          },
        },
      ],
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#BBB5E3', // Soft gray for unselected icons
          '&.Mui-selected': {
            color: '#FFD700', // Bright Yellow for selected icons
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0E0D1F', // Match the dark background of the app
          color: '#ffffff', // White text on AppBar
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFA500', // Bright Orange FAB
          color: '#ffffff',           // White icon/text on FAB
          '&:hover': {
            backgroundColor: '#FF4500', // Slightly darker on hover
          },
        },
      },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6A5ACD', // Soft Pastel Purple
    },
    secondary: {
      main: '#87CEEB', // Light Sky Blue
    },
    background: {
      default: '#f5f5f5', // Very light gray background
      paper: '#ffffff',   // Pure white for cards
    },
    text: {
      primary: '#333333', // Darker gray for primary text
      secondary: '#4A4A4A', // Slightly darker gray for better contrast
    },
    accent: {
      main: '#FFA500', // Bright Orange for accent
    },
    highlight: {
      main: '#FFD700', // Bright Yellow for highlights
    },
  },
  typography: {
    h5: {
      fontWeight: 600, // Increase font weight for headers
      color: '#333333', // Ensure dark, crisp text for headers
    },
    body1: {
      fontSize: '1rem',
      color: '#4A4A4A', // Darker gray for body text
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', // Maintain subtle shadow for depth
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#E8E8F9', // Lighter background for tags
          color: '#6A5ACD',           // Maintain soft purple text
          borderColor: '#6A5ACD',     // Optional: Add a border for contrast
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
        },
      },
      variants: [
        {
          props: { variant: 'contained' }, // Contained button variant
          style: {
            background: 'linear-gradient(45deg, #FFA500, #FF4500)', // Gradient from Orange to Red-Orange
            boxShadow: '0px 4px 14px rgba(255, 69, 0, 0.3)', // Softer shadow for buttons
            '&:hover': {
              backgroundColor: '#FF4500', // Solid Red-Orange on hover
            },
          },
        },
        {
          props: { variant: 'ghost' }, // Custom ghost variant
          style: {
            backgroundColor: 'transparent',
            border: '1px solid currentColor', // Use current text color for border
            color: '#6A5ACD', // Primary color as the default text color
            '&:hover': {
              backgroundColor: 'rgba(106, 90, 205, 0.1)', // Slight background on hover
              borderColor: '#6A5ACD',
            },
          },
        },
      ],
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#666666', // Medium gray for unselected icons
          '&.Mui-selected': {
            color: '#FFD700', // Bright Yellow for selected icons
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff', // White AppBar for a clean look
          color: '#333333', // Dark gray text on AppBar
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFA500', // Bright Orange FAB
          color: '#ffffff',           // White icon/text on FAB
          '&:hover': {
            backgroundColor: '#FF4500', // Slightly darker on hover
          },
        },
      },
    },
  },
});
