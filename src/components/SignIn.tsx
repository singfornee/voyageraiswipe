import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box, Paper, Divider, CssBaseline, Snackbar, CircularProgress } from '@mui/material';
import { Alert, AlertColor } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import GoogleIcon from '@mui/icons-material/Google';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from '../styles/theme';

const SignIn: React.FC = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor }>({
    open: false,
    message: '',
    severity: 'error',
  });

  const { login, loginWithGoogle } = useAuth() ?? {};
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!login) return console.error('Login function is undefined.');

    setLoading(true);
    try {
      await login(credentials.email, credentials.password);
      await handleEmailVerification();
    } catch (err) {
      console.error('Login failed:', err);
      setSnackbar({ open: true, message: 'Failed to sign in. Please check your credentials and try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!loginWithGoogle) return console.error('Google login function is undefined.');
  
    setLoading(true);
    try {
      // Sign in with Google
      const userCredential = await loginWithGoogle();
  
      // Force reload user data to ensure we have the latest info
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        // After reloading, check email verification and onboarding status
        await handleEmailVerification();
      }
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      setSnackbar({ open: true, message: 'Google Sign-In failed. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  

  const handleEmailVerification = async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload(); // Reload user data to get the latest verification status
      if (user.emailVerified) {
        const isFirstTimeUser = localStorage.getItem('isFirstTimeUser');
        if (isFirstTimeUser) {
          localStorage.removeItem('isFirstTimeUser');
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/email-verification-pending');
      }
    }
  };  

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container 
        maxWidth="xs" 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper 
          elevation={6} 
          sx={{ 
            padding: 4,
            backgroundColor: 'background.paper', 
            borderRadius: 6,
            width: '100%',
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
            pointerEvents: loading ? 'none' : 'auto',
          }}
        >
          <Box textAlign="center" sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Please sign in to continue
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
              variant="outlined"
              InputProps={{
                sx: {
                  color: 'text.primary',
                  backgroundColor: 'background.default',
                  borderRadius: '12px',
                  padding: '10px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color: 'text.secondary',
                  fontSize: '1rem',
                },
              }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
              variant="outlined"
              InputProps={{
                sx: {
                  color: 'text.primary',
                  backgroundColor: 'background.default',
                  borderRadius: '12px',
                  padding: '10px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color: 'text.secondary',
                  fontSize: '1rem',
                },
              }}
            />
            <Box textAlign="right" mt={1}>
              <Button 
                variant="text" 
                color="primary" 
                onClick={() => navigate('/forgotpassword')}
                sx={{ textTransform: 'none', fontSize: '0.9rem' }}
              >
                Forgot Password?
              </Button>
            </Box>
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
                  outline: 'none',
                  boxShadow: '0 0 0 4px rgba(57, 255, 20, 0.5)',
                },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </form>
          <Divider sx={{ my: 3 }}>or</Divider>
          <Box textAlign="center" mt={2}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              sx={{
                borderRadius: '12px',
                padding: '12px',
                fontSize: '1rem',
                textTransform: 'none',
                fontWeight: 'bold',
                '&:focus': {
                  outline: 'none',
                  boxShadow: '0 0 0 4px rgba(57, 255, 20, 0.5)',
                },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign in with Google'}
            </Button>
          </Box>
          <Box textAlign="center" mt={3}>
            <Typography variant="body2">
              Don’t have an account?{' '}
              <Button 
                variant="text" 
                color="primary" 
                onClick={() => navigate('/signup')}
                sx={{ textTransform: 'none', fontSize: '0.9rem' }}
              >
                Sign Up
              </Button>
            </Typography>
          </Box>
        </Paper>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default SignIn;
