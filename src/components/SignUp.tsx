import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, Auth } from 'firebase/auth';
import { Container, TextField, Button, Typography, Box, Paper, Snackbar, Alert, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles'; // Import ThemeProvider
import { darkTheme } from '../styles/theme'; // Import your dark theme

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);  // Clear any existing errors
    try {
      // Explicitly cast `auth` to type `Auth`
      const userCredential = await createUserWithEmailAndPassword(auth as Auth, email, password);
      console.log('User signed up:', userCredential.user);
      setOpenSnackbar(true);  // Show success notification
    } catch (error: any) {
      setError(error.message);
      console.error('Error signing up:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <ThemeProvider theme={darkTheme}> {/* Apply dark theme */}
      <CssBaseline /> {/* Ensure baseline styles are applied */}
      <Container 
        maxWidth="xs" 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          minHeight: '100vh', // Vertically center the content
        }}
      >
        <Paper 
          elevation={6} 
          sx={{ 
            padding: 4, 
            backgroundColor: 'background.paper', 
            borderRadius: 6, 
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)', // Soft shadow for a modern look
          }}
        >
          <Box textAlign="center">
            <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
              Create Account
            </Typography>
          </Box>
          <form onSubmit={handleSignUp}>
          <TextField
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  fullWidth
  required
  margin="normal"
  variant="outlined"
  InputProps={{
    sx: {
      color: 'text.primary',
      backgroundColor: 'background.default',
      borderRadius: '12px', // More rounded corners
      padding: '10px', // Extra padding for input fields
      '&:focus-within fieldset': {
        borderColor: 'primary.main', // Customize focus border color
      },
    },
  }}
  InputLabelProps={{
    sx: {
      color: 'text.secondary',
      fontSize: '1rem', // Slightly larger font size for the label
    },
  }}
/>

<Button
  type="submit"
  variant="contained"
  color="primary"
  fullWidth
  sx={{
    marginTop: 2,
    borderRadius: '12px',
    padding: '12px 0',
    fontSize: '1rem',
    fontWeight: 'bold',
    '&:focus': {
      outline: 'none', // Remove default outline
      boxShadow: '0 0 0 4px rgba(57, 255, 20, 0.5)', // Custom focus shadow
    },
  }}
>
  Sign Up
</Button>

          </form>
          <Box textAlign="center" mt={2}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Button 
                variant="text" 
                color="primary" 
                onClick={() => navigate('/signin')}
                sx={{ textTransform: 'none', fontSize: '0.9rem' }}
              >
                Sign In
              </Button>
            </Typography>
          </Box>
        </Paper>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            You have successfully signed up!
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default SignUp;
