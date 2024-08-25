import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box, Paper, Divider, CssBaseline, Snackbar, CircularProgress } from '@mui/material';
import { Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from '../styles/theme';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { login, loginWithGoogle } = useAuth() ?? {};
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!login) {
      console.error('Login function is undefined.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Failed to sign in. Please check your credentials and try again.');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!loginWithGoogle) {
      console.error('Google login function is undefined.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      setError('Google Sign-In failed. Please try again.');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default SignIn;
