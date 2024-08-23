import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth() ?? {};
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

  return (
    <Container 
      maxWidth="xs" 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh', // Vertically center the content
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          padding: 4, // Increase padding for more space inside the form
          backgroundColor: 'background.paper', 
          borderRadius: 4, 
          width: '100%',
        }}
      >
        <Box textAlign="center" sx={{ mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Sign In
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
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
          <Box textAlign="right" mt={1}>
            <Button 
              variant="text" 
              color="primary" 
              onClick={() => navigate('/forgotpassword')} // Ensure correct path
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
              borderRadius: '50px',
            }}
          >
            Sign In
          </Button>
        </form>
        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            Don’t have an account?{' '}
            <Button 
              variant="text" 
              color="primary" 
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignIn;
