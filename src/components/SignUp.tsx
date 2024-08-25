import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, Auth } from 'firebase/auth';
import { Container, TextField, Button, Typography, Box, Paper, Snackbar, Alert, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from '../styles/theme';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth as Auth, email, password);
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user);

      // Show success notification
      setOpenSuccessSnackbar(true);

      // Optionally, navigate to a different page (e.g., a page informing the user to check their email)
      navigate('/email-verification-pending');  // You would need to create this route
    } catch (error: any) {
      setError(error.message);
      setOpenSnackbar(true);
      console.error('Error signing up:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setOpenSuccessSnackbar(false);
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
          minHeight: '100vh', 
        }}
      >
        <Paper 
          elevation={6} 
          sx={{ 
            padding: 4, 
            backgroundColor: 'background.paper', 
            borderRadius: 6, 
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
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
                  borderRadius: '12px',
                  padding: '10px',
                  '&:focus-within fieldset': {
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
                  '&:focus-within fieldset': {
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

        {/* Error Snackbar */}
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

        {/* Success Snackbar */}
        <Snackbar
          open={openSuccessSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            Sign up successful! Please check your email to verify your account.
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default SignUp;
