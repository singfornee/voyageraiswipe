import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, Auth } from 'firebase/auth';
import { Container, TextField, Button, Typography, Box, Paper, Snackbar, Alert } from '@mui/material';

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
    <Container 
      maxWidth="xs" 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        minHeight: '100vh' // Vertically center the content
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          padding: 3, 
          backgroundColor: 'background.paper', 
          borderRadius: 4, 
        }}
      >
        <Box textAlign="center">
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Sign Up
          </Typography>
        </Box>
        <form onSubmit={handleSignUp}>
          <TextField
            label="Email"
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
                backgroundColor: 'background.paper',
                borderRadius: '50px', 
              },
            }}
            InputLabelProps={{
              sx: {
                color: 'text.secondary',
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
                backgroundColor: 'background.paper',
                borderRadius: '50px', 
              },
            }}
            InputLabelProps={{
              sx: {
                color: 'text.secondary',
              },
            }}
          />
          {error && (
            <Typography color="error" variant="body2" align="center">
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ 
              marginTop: 2, 
              borderRadius: '50px', 
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
  );
};

export default SignUp;
