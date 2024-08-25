import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box, Paper, Divider, CssBaseline } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google'; // Import Google icon from Material-UI
import { ThemeProvider } from '@mui/material/styles'; // Import ThemeProvider
import { darkTheme } from '../styles/theme'; // Import your dark theme

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle } = useAuth() ?? {}; // Ensure loginWithGoogle is available in useAuth
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (login) {
      try {
        await login(email, password);
        navigate('/dashboard');
      } catch (error) {
        console.error('Login failed:', error);
      }
    } else {
      console.error('Login function is undefined.');
    }
  };

  const handleGoogleSignIn = async () => {
    if (loginWithGoogle) {
      try {
        await loginWithGoogle();
        navigate('/dashboard');
      } catch (error) {
        console.error('Google Sign-In failed:', error);
      }
    } else {
      console.error('Google login function is undefined.');
    }
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
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)', // Soft shadow for a modern look
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
                  borderRadius: '12px', // More rounded corners
                  padding: '10px', // Extra padding for input fields
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent', // Remove the default border
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main', // Change on hover
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main', // Focus color
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
                  borderRadius: '12px', // More rounded corners
                  padding: '10px', // Extra padding for input fields
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent', // Remove the default border
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main', // Change on hover
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main', // Focus color
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
            <Box textAlign="right" mt={1}>
              <Button 
                variant="text" 
                color="primary" 
                onClick={() => navigate('/forgotpassword')} // Ensure correct path
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
                borderRadius: '12px', // Rounded corners for the button
                padding: '12px 0', // Increase padding for a more substantial button
                fontSize: '1rem', // Slightly larger font size
                fontWeight: 'bold', // Bold text for better emphasis
                '&:focus': {
                  outline: 'none', // Remove default outline
                  boxShadow: '0 0 0 4px rgba(57, 255, 20, 0.5)', // Custom focus shadow
                },
              }}
            >
              Sign In
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
                borderRadius: '12px', // Circular button
                padding: '12px', // Extra padding for a sleek look
                fontSize: '1rem', // Slightly larger font
                textTransform: 'none', // Keep text capitalization normal
                fontWeight: 'bold',
                '&:focus': {
                  outline: 'none', // Remove default outline
                  boxShadow: '0 0 0 4px rgba(57, 255, 20, 0.5)', // Custom focus shadow
                },
              }}
            >
              Sign in with Google
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
      </Container>
    </ThemeProvider>
  );
};

export default SignIn;
